const mysql = require('mysql2/promise')
const logger = require('../utils/logger')

let connection = null

const dbConfig = {
  host: process.env.DB_HOST || 'auth-db',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'auth_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

async function initDatabase() {
  try {
    connection = mysql.createPool(dbConfig)
    
    // Test connection
    await connection.execute('SELECT 1')
    logger.info('Database connected successfully')
    
    // Create tables if not exist
    await createTables()
    await seedData()
    
  } catch (error) {
    logger.error('Database connection failed:', error)
    throw error
  }
}

async function createTables() {
  try {
    // Create roles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id),
        INDEX idx_email (email),
        INDEX idx_role_id (role_id)
      )
    `)

    logger.info('Database tables created/verified successfully')
  } catch (error) {
    logger.error('Error creating tables:', error)
    throw error
  }
}

async function seedData() {
  try {
    // Check if roles exist
    const [roles] = await connection.execute('SELECT COUNT(*) as count FROM roles')
    
    if (roles[0].count === 0) {
      // Insert default roles
      await connection.execute(`
        INSERT INTO roles (name) VALUES 
        ('ADMIN'), 
        ('CLIENTE'), 
        ('RESTAURANTE'), 
        ('REPARTIDOR')
      `)
      
      logger.info('Default roles seeded successfully')
    }
  } catch (error) {
    logger.error('Error seeding data:', error)
    throw error
  }
}

function getConnection() {
  if (!connection) {
    throw new Error('Database not initialized')
  }
  return connection
}

async function closeConnection() {
  if (connection) {
    await connection.end()
    connection = null
    logger.info('Database connection closed')
  }
}

module.exports = {
  initDatabase,
  getConnection,
  closeConnection
}