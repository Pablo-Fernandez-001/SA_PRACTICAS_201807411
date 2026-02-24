-- ============================================================================
-- CATALOG DATABASE - DeliverEats
-- Aislamiento de persistencia: BD exclusiva del Restaurant-Catalog-Service
-- ============================================================================

CREATE DATABASE IF NOT EXISTS catalog_db;
USE catalog_db;

-- ─── Restaurants ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS restaurants;

CREATE TABLE restaurants (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  owner_id    INT          NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  address     VARCHAR(500) NOT NULL,
  phone       VARCHAR(50),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Menu Items ──────────────────────────────────────────────────────────────
CREATE TABLE menu_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT            NOT NULL,
  name          VARCHAR(255)   NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2)  NOT NULL,
  category      VARCHAR(100),
  image_url     VARCHAR(500),
  stock         INT            DEFAULT 100,
  is_available  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurant (restaurant_id),
  INDEX idx_available  (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Seed: Restaurants ───────────────────────────────────────────────────────
INSERT INTO restaurants (id, owner_id, name, description, address, phone) VALUES
  (1, 3, 'Burger Palace',          'The best burgers in town',            '6ta Avenida 12-34, Zona 1',   '2234-5678'),
  (2, 3, 'Pizza Roma',             'Authentic Italian pizza',             '7ma Avenida 8-90, Zona 10',   '2345-6789'),
  (3, 3, 'Sushi Master',           'Fresh sushi and Japanese cuisine',    '4ta Calle 15-20, Zona 14',    '2456-7890'),
  (4, 3, 'Taco Loco',              'Mexican street food',                 '12 Calle 6-78, Zona 1',       '2567-8901'),
  (5, 3, 'Pollo Campero Express',  'Chicken & sides',                     '5ta Avenida 10-11, Zona 9',   '2678-9012');

-- ─── Seed: Menu Items ────────────────────────────────────────────────────────

-- Burger Palace (restaurant_id = 1)
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, stock, is_available) VALUES
  (1,  1, 'Classic Burger',   'Beef patty with lettuce, tomato, and special sauce', 45.00,  'Burgers', 50, TRUE),
  (2,  1, 'Cheese Burger',    'Classic burger with melted cheddar',                 50.00,  'Burgers', 45, TRUE),
  (3,  1, 'Double Burger',    'Two beef patties with cheese',                       65.00,  'Burgers', 30, TRUE),
  (4,  1, 'French Fries',     'Crispy golden fries',                                20.00,  'Sides',   100, TRUE),
  (5,  1, 'Milkshake',        'Chocolate or vanilla milkshake',                     25.00,  'Drinks',  0, FALSE);

-- Pizza Roma (restaurant_id = 2)
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, stock, is_available) VALUES
  (6,  2, 'Margherita Pizza', 'Classic tomato, mozzarella, and basil',              55.00,  'Pizzas',   40, TRUE),
  (7,  2, 'Pepperoni Pizza',  'Loaded with pepperoni and cheese',                   65.00,  'Pizzas',   35, TRUE),
  (8,  2, 'Hawaiian Pizza',   'Ham and pineapple pizza',                            60.00,  'Pizzas',   25, TRUE),
  (9,  2, 'Garlic Bread',     'Toasted garlic bread with butter',                   15.00,  'Sides',    80, TRUE),
  (10, 2, 'Tiramisu',         'Classic Italian dessert',                            35.00,  'Desserts', 0, FALSE);

-- Sushi Master (restaurant_id = 3)
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, stock, is_available) VALUES
  (11, 3, 'California Roll',  '8 pieces — crab, avocado, cucumber',                45.00,  'Rolls',  60, TRUE),
  (12, 3, 'Salmon Nigiri',    '4 pieces of fresh salmon',                          55.00,  'Nigiri', 40, TRUE),
  (13, 3, 'Tempura Roll',     '8 pieces — shrimp tempura roll',                    50.00,  'Rolls',  35, TRUE),
  (14, 3, 'Miso Soup',        'Traditional miso soup',                             15.00,  'Soups',  50, TRUE),
  (15, 3, 'Dragon Roll',      'Special dragon roll with eel',                      70.00,  'Rolls',  0, FALSE);

-- Taco Loco (restaurant_id = 4)
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, stock, is_available) VALUES
  (16, 4, 'Tacos al Pastor',  '3 tacos with marinated pork',                       35.00,  'Tacos',       55, TRUE),
  (17, 4, 'Quesadilla',       'Cheese quesadilla with guacamole',                  30.00,  'Quesadillas', 48, TRUE),
  (18, 4, 'Burrito Supreme',  'Large burrito with beans, rice, and meat',           40.00,  'Burritos',    42, TRUE),
  (19, 4, 'Nachos',           'Nachos with cheese and jalapeños',                   25.00,  'Sides',       70, TRUE),
  (20, 4, 'Horchata',         'Traditional rice drink',                             15.00,  'Drinks',      0, FALSE);

-- Pollo Campero Express (restaurant_id = 5)
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, stock, is_available) VALUES
  (21, 5, 'Pollo Frito 2pc',       '2 pieces fried chicken',           30.00,  'Chicken', 65, TRUE),
  (22, 5, 'Pollo Frito 5pc',       '5 pieces fried chicken',           65.00,  'Chicken', 40, TRUE),
  (23, 5, 'Alitas BBQ',            'BBQ chicken wings (8 pcs)',        45.00,  'Wings',   55, TRUE),
  (24, 5, 'Coleslaw',              'Fresh coleslaw',                   10.00,  'Sides',   90, TRUE),
  (25, 5, 'Papas Fritas Campero',  'Seasoned fries',                   18.00,  'Sides',   0, FALSE);
