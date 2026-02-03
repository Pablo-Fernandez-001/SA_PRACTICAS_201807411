CREATE DATABASE orders_db;

USE orders_db;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,  -- Para referencia entre servicios
  user_id INT NOT NULL,  -- REFERENCIA A USUARIO EN AUTH SERVICE
  restaurant_id INT NOT NULL,  -- REFERENCIA A RESTAURANTE EN CATÁLOGO SERVICE
  status ENUM('CREADA', 'EN_PROCESO', 'FINALIZADA', 'RECHAZADA') NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_restaurant_id (restaurant_id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_external_id INT NOT NULL,  -- ID del ítem en catálogo service
  name VARCHAR(100) NOT NULL,  -- Denormalizado para evitar joins entre servicios
  price DECIMAL(10,2) NOT NULL,  -- Precio al momento de la orden
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);