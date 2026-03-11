-- ============================================================================
-- ORDERS DATABASE - DeliverEats
-- Aislamiento de persistencia: BD exclusiva del Order-Service
-- ============================================================================

CREATE DATABASE IF NOT EXISTS orders_db;
USE orders_db;

-- ─── Orders ──────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(50) UNIQUE NOT NULL,
  user_id         INT            NOT NULL,
  restaurant_id   INT            NOT NULL,
  restaurant_name VARCHAR(255),
  status          ENUM('CREADA','PAGADO','EN_PROCESO','FINALIZADA','EN_CAMINO','ENTREGADO','CANCELADO','RECHAZADA','REEMBOLSADO') DEFAULT 'CREADA',
  total           DECIMAL(10,2)  NOT NULL DEFAULT 0,
  coupon_code     VARCHAR(50),
  discount_amount DECIMAL(10,2)  DEFAULT 0,
  delivery_address VARCHAR(500),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user       (user_id),
  INDEX idx_restaurant (restaurant_id),
  INDEX idx_status     (status),
  INDEX idx_order_num  (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Order Items ─────────────────────────────────────────────────────────────
CREATE TABLE order_items (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  order_id              INT            NOT NULL,
  menu_item_external_id INT            NOT NULL,
  name                  VARCHAR(255)   NOT NULL,
  price                 DECIMAL(10,2)  NOT NULL,
  quantity              INT            NOT NULL DEFAULT 1,
  subtotal              DECIMAL(10,2)  NOT NULL,
  notes                 TEXT,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ═══════════════════════════════════════════════════════════════════════════
-- PRACTICA 6: Ratings / Calificaciones
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS ratings;

CREATE TABLE ratings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT            NOT NULL,
  order_id    INT            NOT NULL,
  target_type ENUM('RESTAURANTE', 'REPARTIDOR', 'PRODUCTO') NOT NULL,
  target_id   INT            NOT NULL,
  score       INT            NOT NULL,
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating (user_id, order_id, target_type, target_id),
  INDEX idx_target (target_type, target_id),
  INDEX idx_user   (user_id),
  INDEX idx_order  (order_id),
  CHECK (score >= 1 AND score <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
