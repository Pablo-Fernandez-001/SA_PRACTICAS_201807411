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