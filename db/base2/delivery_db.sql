CREATE DATABASE delivery_db;

USE delivery_db;

CREATE TABLE deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_external_id INT NOT NULL,  -- REFERENCIA A ORDEN EN ORDERS SERVICE
  courier_id INT NOT NULL,  -- REFERENCIA A USUARIO EN AUTH SERVICE
  status ENUM('ASIGNADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO') NOT NULL,
  started_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  INDEX idx_order_id (order_external_id),
  INDEX idx_courier_id (courier_id)
);