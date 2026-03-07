require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const { initDatabase } = require('./config/database');
const { startGrpcServer } = require('./grpc/catalogGrpcServer');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check (used by Docker & API Gateway)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'catalog-service', timestamp: new Date().toISOString() });
});

// Routes
const restaurantRoutes = require('./routes/restaurants');
const menuItemRoutes = require('./routes/menuItems');

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu-items', menuItemRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ─── Bootstrap: DB → REST → gRPC ────────────────────────────────────────────
async function start() {
  try {
    await initDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Catalog REST API running on port ${PORT}`);
    });

    // Start gRPC server for order validation (key deliverable)
    startGrpcServer();
  } catch (error) {
    logger.error('Failed to start catalog service:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
