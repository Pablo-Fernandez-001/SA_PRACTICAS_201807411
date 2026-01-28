-- Tabla de roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabla de restaurantes
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Tabla de ítems del menú
CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Tabla de órdenes
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  status ENUM('CREADA', 'EN_PROCESO', 'FINALIZADA', 'RECHAZADA') NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Tabla de ítems por orden
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Tabla de entregas
CREATE TABLE deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  courier_id INT NOT NULL,
  status ENUM('EN_CAMINO', 'ENTREGADO', 'CANCELADO') NOT NULL,
  started_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (courier_id) REFERENCES users(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_deliveries_courier_id ON deliveries(courier_id);

-- Roles base
INSERT INTO roles (name) VALUES 
  ('ADMIN'),
  ('CLIENTE'),
  ('RESTAURANTE'),
  ('REPARTIDOR');

-- Usuarios de ejemplo
INSERT INTO users (name, email, password, role_id) VALUES
  ('Ana Admin', 'ana@delivereats.com', 'hash_admin', 1),
  ('Carlos Cliente', 'carlos@mail.com', 'hash_cliente', 2),
  ('Pizza GT', 'pizzagt@mail.com', 'hash_rest', 3),
  ('Luis Repartidor', 'luis@mail.com', 'hash_rep', 4);

-- Restaurante
INSERT INTO restaurants (name, address) VALUES
  ('Pizza GT', 'Zona 10, Ciudad');

-- Ítems del menú
INSERT INTO menu_items (restaurant_id, name, price) VALUES
  (1, 'Pizza Pepperoni', 75.00),
  (1, 'Pizza Hawaiana', 80.00),
  (1, 'Refresco 500ml', 12.00);

-- Orden de ejemplo
INSERT INTO orders (user_id, restaurant_id, status, total) VALUES
  (2, 1, 'FINALIZADA', 155.00);

-- Ítems de la orden
INSERT INTO order_items (order_id, menu_item_id, quantity, subtotal) VALUES
  (1, 1, 2, 150.00),
  (1, 3, 1, 12.00);

-- Entrega de ejemplo
INSERT INTO deliveries (order_id, courier_id, status, started_at, delivered_at) VALUES
  (1, 4, 'ENTREGADO', '2026-01-28 14:30:00', '2026-01-28 15:15:00');