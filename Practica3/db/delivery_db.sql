-- ============================================================================
-- DELIVERY DATABASE - DeliverEats
-- Aislamiento de persistencia: BD exclusiva del Delivery-Service
-- ============================================================================

CREATE DATABASE IF NOT EXISTS delivery_db;
USE delivery_db;

-- ─── Deliveries ──────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS deliveries;

CREATE TABLE deliveries (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  order_external_id  INT          NOT NULL,
  courier_id         INT,
  status             ENUM('ASIGNADO','EN_CAMINO','ENTREGADO','CANCELADO') DEFAULT 'ASIGNADO',
  delivery_address   VARCHAR(500),
  started_at         TIMESTAMP NULL,
  delivered_at       TIMESTAMP NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order   (order_external_id),
  INDEX idx_courier (courier_id),
  INDEX idx_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
