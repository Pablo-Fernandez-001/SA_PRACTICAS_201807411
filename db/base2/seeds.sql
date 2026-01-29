USE auth_db;

-- Roles base
INSERT INTO roles (name) VALUES 
  ('ADMIN'),
  ('CLIENTE'),
  ('RESTAURANTE'),
  ('REPARTIDOR');

-- Usuarios de ejemplo
INSERT INTO users (name, email, password, role_id) VALUES
  -- Admin
  ('Ana Admin', 'ana@delivereats.com', 'hash_admin', 1),
  
  -- Clientes
  ('Carlos Cliente', 'carlos@mail.com', 'hash_cliente1', 2),
  ('María López', 'maria@mail.com', 'hash_cliente2', 2),
  ('Pedro Gómez', 'pedro@mail.com', 'hash_cliente3', 2),
  
  -- Restaurantes (dueños)
  ('Pizza GT', 'pizzagt@mail.com', 'hash_rest1', 3),
  ('Hamburguesas Don Juan', 'donjuan@mail.com', 'hash_rest2', 3),
  ('Sushi Express', 'sushi@mail.com', 'hash_rest3', 3),
  
  -- Repartidores
  ('Luis Repartidor', 'luis@mail.com', 'hash_rep1', 4),
  ('Ana Delivery', 'ana.d@mail.com', 'hash_rep2', 4),
  ('Carlos Mensajero', 'carlos.m@mail.com', 'hash_rep3', 4);

USE catalogo_db;

-- Restaurantes (owner_id referencia a users.id en auth_db)
INSERT INTO restaurants (owner_id, name, address) VALUES
  (4, 'Pizza GT', 'Zona 10, Ciudad de Guatemala'),
  (5, 'Hamburguesas Don Juan', 'Zona 1, Ciudad de Guatemala'),
  (6, 'Sushi Express', 'Zona 14, Ciudad de Guatemala');

-- Ítems del menú para Pizza GT
INSERT INTO menu_items (restaurant_id, name, price) VALUES
  (1, 'Pizza Pepperoni Mediana', 75.00),
  (1, 'Pizza Pepperoni Grande', 95.00),
  (1, 'Pizza Hawaiana Mediana', 80.00),
  (1, 'Pizza Hawaiana Grande', 100.00),
  (1, 'Refresco 500ml', 12.00),
  (1, 'Agua 600ml', 8.00);

-- Ítems del menú para Hamburguesas Don Juan
INSERT INTO menu_items (restaurant_id, name, price) VALUES
  (2, 'Hamburguesa Clásica', 45.00),
  (2, 'Hamburguesa BBQ', 55.00),
  (2, 'Papas Fritas', 15.00),
  (2, 'Aros de Cebolla', 18.00),
  (2, 'Refresco 500ml', 12.00);

-- Ítems del menú para Sushi Express
INSERT INTO menu_items (restaurant_id, name, price) VALUES
  (3, 'Roll California (8 piezas)', 65.00),
  (3, 'Roll Tempura (6 piezas)', 70.00),
  (3, 'Sashimi Mixto (12 piezas)', 120.00),
  (3, 'Sopa Miso', 25.00),
  (3, 'Té Verde', 10.00);

USE orders_db;

-- Orden 1: Carlos Cliente ordena de Pizza GT
INSERT INTO orders (order_number, user_id, restaurant_id, status, total) VALUES
  ('ORD-2026-001', 2, 1, 'FINALIZADA', 167.00);

-- Ítems de la orden 1
INSERT INTO order_items (order_id, menu_item_external_id, name, price, quantity, subtotal) VALUES
  (1, 1, 'Pizza Pepperoni Mediana', 75.00, 2, 150.00),
  (1, 5, 'Refresco 500ml', 12.00, 1, 12.00),
  (1, 6, 'Agua 600ml', 8.00, 1, 8.00);

-- Orden 2: María López ordena de Hamburguesas Don Juan
INSERT INTO orders (order_number, user_id, restaurant_id, status, total) VALUES
  ('ORD-2026-002', 3, 2, 'EN_PROCESO', 82.00);

-- Ítems de la orden 2
INSERT INTO order_items (order_id, menu_item_external_id, name, price, quantity, subtotal) VALUES
  (2, 7, 'Hamburguesa BBQ', 55.00, 1, 55.00),
  (2, 9, 'Papas Fritas', 15.00, 1, 15.00),
  (2, 11, 'Refresco 500ml', 12.00, 1, 12.00);

-- Orden 3: Pedro Gómez ordena de Sushi Express
INSERT INTO orders (order_number, user_id, restaurant_id, status, total) VALUES
  ('ORD-2026-003', 4, 3, 'CREADA', 140.00);

-- Ítems de la orden 3
INSERT INTO order_items (order_id, menu_item_external_id, name, price, quantity, subtotal) VALUES
  (3, 12, 'Roll California (8 piezas)', 65.00, 2, 130.00),
  (3, 16, 'Té Verde', 10.00, 1, 10.00);

USE delivery_db;

-- Entrega para orden 1 (ya entregada)
INSERT INTO deliveries (order_external_id, courier_id, status, started_at, delivered_at) VALUES
  (1, 7, 'ENTREGADO', '2026-01-28 14:30:00', '2026-01-28 15:15:00');

-- Entrega para orden 2 (en camino)
INSERT INTO deliveries (order_external_id, courier_id, status, started_at) VALUES
  (2, 8, 'EN_CAMINO', '2026-01-28 16:00:00');

-- Orden 3 aún no tiene asignación de delivery


