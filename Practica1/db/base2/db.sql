CREATE DATABASE IF NOT EXISTS delivereats_db;
USE delivereats_db;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  logo_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  opening_time TIME,
  closing_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  preparation_time INT, -- en minutos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  status ENUM('CREADA', 'EN_PROCESO', 'LISTA', 'EN_CAMINO', 'ENTREGADA', 'CANCELADA', 'RECHAZADA') NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,
  payment_method VARCHAR(50),
  payment_status ENUM('PENDIENTE', 'PAGADO', 'RECHAZADO', 'REEMBOLSADO') DEFAULT 'PENDIENTE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  courier_id INT NOT NULL,
  status ENUM('ASIGNADA', 'EN_CAMINO_A_RESTAURANTE', 'RECOGIDA', 'EN_CAMINO', 'EN_DESTINO', 'ENTREGADA', 'CANCELADA', 'FALLIDA') NOT NULL,
  estimated_delivery_time TIMESTAMP NULL,
  actual_delivery_time TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (courier_id) REFERENCES users(id)
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  delivery_rating INT CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_deliveries_courier_id ON deliveries(courier_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

INSERT INTO roles (name) VALUES 
  ('ADMIN'),
  ('CLIENTE'),
  ('RESTAURANTE'),
  ('REPARTIDOR');

INSERT INTO users (name, email, password, role_id, phone, address) VALUES
  ('Ana Admin', 'admin@delivereats.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '5555-1234', 'Oficina Central, Zona 10'),
  ('Carlos Cliente', 'carlos@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, '5555-1111', 'Calle Principal 123, Zona 1'),
  ('María López', 'maria@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, '5555-2222', 'Avenida Siempre Viva 456, Zona 2'),
  ('Pedro Gómez', 'pedro@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, '5555-3333', 'Diagonal 6, Zona 10'),
  ('Pizza GT', 'pizzagt@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, '5555-4444', 'Zona 10, Ciudad'),
  ('Hamburguesas Don Juan', 'donjuan@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, '5555-5555', 'Zona 1, Ciudad'),
  ('Sushi Express', 'sushi@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, '5555-6666', 'Zona 14, Ciudad'),
  ('Luis Repartidor', 'luis@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, '5555-7777', 'Zona 5, Ciudad'),
  ('Ana Delivery', 'ana.d@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, '5555-8888', 'Zona 7, Ciudad'),
  ('Carlos Mensajero', 'carlos.m@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, '5555-9999', 'Zona 9, Ciudad');

INSERT INTO restaurants (owner_id, name, description, address, phone, email, opening_time, closing_time) VALUES
  (5, 'Pizza GT', 'Las mejores pizzas artesanales de la ciudad', 'Zona 10, Ciudad de Guatemala', '2200-0001', 'contacto@pizzagt.com', '10:00:00', '22:00:00'),
  (6, 'Hamburguesas Don Juan', 'Hamburguesas gourmet con ingredientes frescos', 'Zona 1, Ciudad de Guatemala', '2200-0002', 'info@donjuan.com', '11:00:00', '23:00:00'),
  (7, 'Sushi Express', 'Sushi fresco preparado al momento', 'Zona 14, Ciudad de Guatemala', '2200-0003', 'pedidos@sushiexpress.com', '12:00:00', '21:00:00');

INSERT INTO menu_items (restaurant_id, name, description, price, category, preparation_time) VALUES
  (1, 'Pizza Pepperoni Mediana', 'Pizza de pepperoni con salsa de tomate y queso mozzarella', 75.00, 'Pizzas', 20),
  (1, 'Pizza Pepperoni Grande', 'Pizza grande de pepperoni', 95.00, 'Pizzas', 25),
  (1, 'Pizza Hawaiana Mediana', 'Pizza con piña y jamón', 80.00, 'Pizzas', 20),
  (1, 'Pizza Hawaiana Grande', 'Pizza grande hawaiana', 100.00, 'Pizzas', 25),
  (1, 'Refresco 500ml', 'Refresco de cola, naranja o limón', 12.00, 'Bebidas', 2),
  (1, 'Agua 600ml', 'Agua purificada', 8.00, 'Bebidas', 2),
  (1, 'Alitas BBQ', '8 alitas de pollo con salsa BBQ', 45.00, 'Acompañamientos', 15),
  (2, 'Hamburguesa Clásica', 'Carne de res, lechuga, tomate, queso y salsa especial', 45.00, 'Hamburguesas', 15),
  (2, 'Hamburguesa BBQ', 'Carne de res con salsa BBQ, cebolla caramelizada y queso cheddar', 55.00, 'Hamburguesas', 18),
  (2, 'Hamburguesa Vegetariana', 'Hamburguesa de garbanzos con vegetales frescos', 40.00, 'Hamburguesas', 12),
  (2, 'Papas Fritas', 'Porción de papas fritas', 15.00, 'Acompañamientos', 10),
  (2, 'Aros de Cebolla', 'Aros de cebolla empanizados', 18.00, 'Acompañamientos', 12),
  (2, 'Refresco 500ml', 'Refresco de cola, naranja o limón', 12.00, 'Bebidas', 2),
  (2, 'Malteada de Chocolate', 'Malteada cremosa de chocolate', 25.00, 'Bebidas', 5),
  (3, 'Roll California (8 piezas)', 'Roll con kanikama, pepino y aguacate', 65.00, 'Sushi', 15),
  (3, 'Roll Tempura (6 piezas)', 'Roll con camarón tempura y aguacate', 70.00, 'Sushi', 18),
  (3, 'Sashimi Mixto (12 piezas)', 'Variedad de sashimi fresco', 120.00, 'Sushi', 20),
  (3, 'Sopa Miso', 'Sopa tradicional japonesa', 25.00, 'Entradas', 8),
  (3, 'Edamame', 'Vainas de soya saladas', 18.00, 'Entradas', 5),
  (3, 'Té Verde', 'Té verde japonés', 10.00, 'Bebidas', 3),
  (3, 'Agua con Gas', 'Agua mineral con gas', 12.00, 'Bebidas', 2);

INSERT INTO orders (order_number, user_id, restaurant_id, status, total, delivery_address, payment_method, payment_status) VALUES
  ('ORD-2026-001', 2, 1, 'ENTREGADA', 167.00, 'Calle Principal 123, Zona 1', 'TARJETA', 'PAGADO'),
  ('ORD-2026-002', 3, 2, 'EN_CAMINO', 82.00, 'Avenida Siempre Viva 456, Zona 2', 'EFECTIVO', 'PAGADO'),
  ('ORD-2026-003', 4, 3, 'EN_PROCESO', 140.00, 'Diagonal 6, Zona 10', 'TARJETA', 'PAGADO'),
  ('ORD-2026-004', 2, 1, 'CREADA', 95.00, 'Calle Principal 123, Zona 1', 'TARJETA', 'PENDIENTE'),
  ('ORD-2026-005', 3, 2, 'CREADA', 113.00, 'Avenida Siempre Viva 456, Zona 2', 'EFECTIVO', 'PENDIENTE');

INSERT INTO order_items (order_id, menu_item_id, name, price, quantity, subtotal) VALUES
  (1, 1, 'Pizza Pepperoni Mediana', 75.00, 2, 150.00),
  (1, 5, 'Refresco 500ml', 12.00, 1, 12.00),
  (1, 6, 'Agua 600ml', 8.00, 1, 8.00),
  (2, 9, 'Hamburguesa BBQ', 55.00, 1, 55.00),
  (2, 12, 'Papas Fritas', 15.00, 1, 15.00),
  (2, 13, 'Refresco 500ml', 12.00, 1, 12.00),
  (3, 15, 'Roll California (8 piezas)', 65.00, 2, 130.00),
  (3, 20, 'Té Verde', 10.00, 1, 10.00),
  (4, 2, 'Pizza Pepperoni Grande', 95.00, 1, 95.00),
  (5, 8, 'Hamburguesa Clásica', 45.00, 1, 45.00),
  (5, 11, 'Hamburguesa Vegetariana', 40.00, 1, 40.00),
  (5, 13, 'Refresco 500ml', 12.00, 1, 12.00),
  (5, 12, 'Papas Fritas', 15.00, 1, 15.00);

INSERT INTO deliveries (order_id, courier_id, status, started_at, delivered_at, estimated_delivery_time, actual_delivery_time) VALUES
  (1, 8, 'ENTREGADA', '2026-01-28 14:30:00', '2026-01-28 15:15:00', '2026-01-28 15:30:00', '2026-01-28 15:15:00'),
  (2, 9, 'EN_CAMINO', '2026-01-28 16:00:00', NULL, '2026-01-28 17:00:00', NULL),
  (3, 10, 'ASIGNADA', NULL, NULL, NULL, NULL);

INSERT INTO reviews (order_id, user_id, restaurant_id, rating, comment, delivery_rating) VALUES
  (1, 2, 1, 5, 'Excelente pizza y entrega rápida. ¡Volveré a ordenar!', 5);

SELECT '=== RESUMEN DE DATOS INSERTADOS ===' as '';
SELECT COUNT(*) as Total_Roles FROM roles;
SELECT COUNT(*) as Total_Usuarios FROM users;
SELECT COUNT(*) as Total_Restaurantes FROM restaurants;
SELECT COUNT(*) as Total_Menu_Items FROM menu_items;
SELECT COUNT(*) as Total_Ordenes FROM orders;
SELECT COUNT(*) as Total_Order_Items FROM order_items;
SELECT COUNT(*) as Total_Entregas FROM deliveries;
SELECT COUNT(*) as Total_Resenas FROM reviews;

SELECT '=== DETALLE DE ROLES Y USUARIOS ===' as '';
SELECT r.name as Rol, COUNT(u.id) as Cantidad_Usuarios
FROM roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.id, r.name;

SELECT '=== ESTADÍSTICAS DE ÓRDENES ===' as '';
SELECT 
  status as Estado,
  COUNT(*) as Cantidad,
  SUM(total) as Total_Ventas
FROM orders
GROUP BY status
ORDER BY Cantidad DESC;

SELECT '=== TOP 3 PRODUCTOS MÁS VENDIDOS ===' as '';
SELECT 
  oi.name as Producto,
  SUM(oi.quantity) as Cantidad_Vendida,
  SUM(oi.subtotal) as Total_Generado
FROM order_items oi
GROUP BY oi.name
ORDER BY Cantidad_Vendida DESC
LIMIT 3;