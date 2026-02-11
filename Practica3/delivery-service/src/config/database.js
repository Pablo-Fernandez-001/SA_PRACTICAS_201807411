const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

let pool = null;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'delivery_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000
};

async function waitForDatabase() {
  const maxRetries = 30;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const tmp = mysql.createPool({ ...dbConfig, database: undefined });
      await tmp.execute('SELECT 1');
      await tmp.end();
      logger.info('[delivery-db] Database server is available');
      return;
    } catch (err) {
      retries++;
      logger.info(`[delivery-db] Not ready (attempt ${retries}/${maxRetries}). Waiting 2 s ...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('[delivery-db] Database not available after maximum retries');
}

async function initDatabase() {
  await waitForDatabase();

  const tmp = mysql.createPool({ ...dbConfig, database: undefined });
  await tmp.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  await tmp.end();

  pool = mysql.createPool(dbConfig);
  await pool.execute('SELECT 1');
  logger.info('[delivery-db] Connected successfully');

  await createTables();
}

async function createTables() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id                 INT AUTO_INCREMENT PRIMARY KEY,
      order_id           INT          NOT NULL,
      courier_id         INT,
      status             ENUM('PENDING','ASSIGNED','PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED') DEFAULT 'PENDING',
      pickup_address     VARCHAR(500),
      delivery_address   VARCHAR(500),
      estimated_delivery TIMESTAMP NULL,
      actual_delivery    TIMESTAMP NULL,
      notes              TEXT,
      created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_order   (order_id),
      INDEX idx_courier (courier_id),
      INDEX idx_status  (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  logger.info('[delivery-db] Tables verified / created');
}

function getPool() {
  if (!pool) throw new Error('Database not initialised');
  return pool;
}

module.exports = { initDatabase, getPool };
