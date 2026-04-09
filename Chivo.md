# Comandos Docker - DeliverEats Databases

## 📋 Información General de las Bases de Datos

| Base de Datos | Contenedor | Puerto Host | Usuario | Password |
|---------------|------------|-------------|---------|----------|
| auth_db | delivereats-auth-db | 3306 | root | password |
| catalog_db | delivereats-catalog-db | 3307 | root | password |
| orders_db | delivereats-orders-db | 3308 | root | password |
| delivery_db | delivereats-delivery-db | 3309 | root | password |

fffgafg


---

## 🔌 Comandos para Conectarse a cada Base de Datos

### 1️⃣ Base de Datos de Autenticación (auth_db)
```bash
docker exec -it delivereats-auth-db mysql -u root -ppassword auth_db
```

### 2️⃣ Base de Datos de Catálogo (catalog_db)
```bash
docker exec -it delivereats-catalog-db mysql -u root -ppassword catalog_db
```

### 3️⃣ Base de Datos de Órdenes (orders_db)
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db
```

### 4️⃣ Base de Datos de Entregas (delivery_db)
```bash
docker exec -it delivereats-delivery-db mysql -u root -ppassword delivery_db
```

---

## 📊 Consultas SELECT por Base de Datos

### 🔐 AUTH_DB - Autenticación y Usuarios

#### Ver todos los roles
```bash
docker exec -it delivereats-auth-db mysql -u root -ppassword auth_db -e "SELECT * FROM roles;"
```

#### Ver todos los usuarios
```bash
docker exec -it delivereats-auth-db mysql -u root -ppassword auth_db -e "SELECT * FROM users;"
```

#### Ver usuarios con sus roles (JOIN)
```bash
docker exec -it delivereats-auth-db mysql -u root -ppassword auth_db -e "
SELECT u.id, u.name, u.email, r.name as role, u.is_active, u.created_at 
FROM users u 
INNER JOIN roles r ON u.role_id = r.id;"
```

#### Ver usuarios activos solamente
```bash
docker exec -it delivereats-auth-db mysql -u root -ppassword auth_db -e "
SELECT u.id, u.name, u.email, r.name as role 
FROM users u 
INNER JOIN roles r ON u.role_id = r.id 
WHERE u.is_active = TRUE;"
```

#### Ver usuarios por rol específico (ejemplo: CLIENTE)
```bash
docker exec -it delivereats-auth-db mysql -u root -ppassword auth_db -e "
SELECT u.id, u.name, u.email, u.created_at 
FROM users u 
INNER JOIN roles r ON u.role_id = r.id 
WHERE r.name = 'CLIENTE';"
```

---

### 🍔 CATALOG_DB - Restaurantes y Menús

#### Ver todos los restaurantes
```bash
docker exec -it delivereats-catalog-db mysql -u root -ppassword catalog_db -e "SELECT * FROM restaurants;"
```

#### Ver restaurantes activos
```bash
docker exec -it delivereats-catalog-db mysql -u root -ppassword catalog_db -e "
SELECT id, owner_id, name, description, address, phone 
FROM restaurants 
WHERE is_active = TRUE;"
```

#### Ver todos los items del menú
```bash
docker exec -it delivereats-catalog-db mysql -u root -ppassword catalog_db -e "SELECT * FROM menu_items;"
```

#### Ver items del menú con nombre del restaurante
```bash
docker exec -it delivereats-catalog-db mysql -u root -ppassword catalog_db -e "
SELECT m.id, r.name as restaurant, m.name, m.description, m.price, m.category, m.stock, m.is_available 
FROM menu_items m 
INNER JOIN restaurants r ON m.restaurant_id = r.id;"
```

#### Ver items disponibles solamente
```bash
docker exec -it delivereats-catalog-db mysql -u root -ppassword catalog_db -e "
SELECT m.id, r.name as restaurant, m.name, m.price, m.stock 
FROM menu_items m 
INNER JOIN restaurants r ON m.restaurant_id = r.id 
WHERE m.is_available = TRUE 
ORDER BY r.name, m.category;"
```

#### Ver items por restaurante específico (ejemplo: restaurante ID 1)
```bash
docker exec -it delivereats-catalog-db mysql -u root -ppassword catalog_db -e "
SELECT m.id, m.name, m.description, m.price, m.category, m.stock 
FROM menu_items m 
WHERE m.restaurant_id = 1 AND m.is_available = TRUE;"
```

#### Ver items por categoría
```bash
docker exec -it delivereats-catalog-db mysql -u root -ppassword catalog_db -e "
SELECT m.category, COUNT(*) as total_items, AVG(m.price) as precio_promedio 
FROM menu_items m 
WHERE m.is_available = TRUE 
GROUP BY m.category;"
```

---

### 📦 ORDERS_DB - Órdenes y Items de Órdenes

#### Ver todas las órdenes
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db -e "SELECT * FROM orders;"
```

#### Ver órdenes con detalles formateados
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db -e "
SELECT id, order_number, user_id, restaurant_name, status, total, delivery_address, created_at 
FROM orders 
ORDER BY created_at DESC;"
```

#### Ver órdenes por estado
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db -e "
SELECT order_number, restaurant_name, status, total, created_at 
FROM orders 
WHERE status = 'CREADA';"
```

#### Ver órdenes de un usuario específico (ejemplo: user_id = 2)
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db -e "
SELECT order_number, restaurant_name, status, total, created_at 
FROM orders 
WHERE user_id = 2 
ORDER BY created_at DESC;"
```

#### Ver todos los items de órdenes
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db -e "SELECT * FROM order_items;"
```

#### Ver items de órdenes con número de orden
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db -e "
SELECT o.order_number, oi.name, oi.price, oi.quantity, oi.subtotal 
FROM order_items oi 
INNER JOIN orders o ON oi.order_id = o.id;"
```

#### Ver detalle completo de una orden específica (ejemplo: order_id = 1)
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db -e "
SELECT o.order_number, o.restaurant_name, o.status, o.total, oi.name, oi.quantity, oi.price, oi.subtotal 
FROM orders o 
INNER JOIN order_items oi ON o.id = oi.order_id 
WHERE o.id = 1;"
```

#### Resumen de órdenes por estado
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db -e "
SELECT status, COUNT(*) as cantidad, SUM(total) as total_ventas 
FROM orders 
GROUP BY status;"
```

#### Ver órdenes recientes (últimas 10)
```bash
docker exec -it delivereats-orders-db mysql -u root -ppassword orders_db -e "
SELECT order_number, restaurant_name, status, total, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;"
```

---

### 🚚 DELIVERY_DB - Entregas

#### Ver todas las entregas
```bash
docker exec -it delivereats-delivery-db mysql -u root -ppassword delivery_db -e "SELECT * FROM deliveries;"
```

#### Ver entregas con detalles formateados
```bash
docker exec -it delivereats-delivery-db mysql -u root -ppassword delivery_db -e "
SELECT id, order_external_id, courier_id, status, delivery_address, started_at, delivered_at, created_at 
FROM deliveries 
ORDER BY created_at DESC;"
```

#### Ver entregas por estado
```bash
docker exec -it delivereats-delivery-db mysql -u root -ppassword delivery_db -e "
SELECT id, order_external_id, courier_id, status, delivery_address, created_at 
FROM deliveries 
WHERE status = 'EN_CAMINO';"
```

#### Ver entregas de un repartidor específico (ejemplo: courier_id = 4)
```bash
docker exec -it delivereats-delivery-db mysql -u root -ppassword delivery_db -e "
SELECT id, order_external_id, status, delivery_address, started_at, delivered_at 
FROM deliveries 
WHERE courier_id = 4 
ORDER BY created_at DESC;"
```

#### Ver entregas completadas
```bash
docker exec -it delivereats-delivery-db mysql -u root -ppassword delivery_db -e "
SELECT id, order_external_id, courier_id, delivery_address, delivered_at 
FROM deliveries 
WHERE status = 'ENTREGADO' 
ORDER BY delivered_at DESC;"
```

#### Resumen de entregas por estado
```bash
docker exec -it delivereats-delivery-db mysql -u root -ppassword delivery_db -e "
SELECT status, COUNT(*) as cantidad 
FROM deliveries 
GROUP BY status;"
```

---

## 🔄 Comandos de Gestión de Contenedores

### Ver estado de todos los contenedores
```bash
docker ps -a | findstr delivereats
```

### Ver logs de cada base de datos
```bash
# Auth DB
docker logs delivereats-auth-db

# Catalog DB
docker logs delivereats-catalog-db

# Orders DB
docker logs delivereats-orders-db

# Delivery DB
docker logs delivereats-delivery-db
```

### Reiniciar una base de datos específica
```bash
# Ejemplo: Auth DB
docker restart delivereats-auth-db
```

### Detener todas las bases de datos
```bash
docker stop delivereats-auth-db delivereats-catalog-db delivereats-orders-db delivereats-delivery-db
```

### Iniciar todas las bases de datos
```bash
docker start delivereats-auth-db delivereats-catalog-db delivereats-orders-db delivereats-delivery-db
```

---

## 🔍 Consulta Interactiva (Modo MySQL Shell)

Para entrar en modo interactivo y ejecutar múltiples consultas:

```bash
# Ejemplo con auth_db
docker exec -it delivereats-auth-db mysql -u root -ppassword auth_db
```

Una vez dentro, puedes ejecutar cualquier SQL:
```sql
SHOW TABLES;
DESCRIBE users;
SELECT * FROM users;
EXIT;
```

---

## 💾 Backup y Restore

### Hacer backup de una base de datos
```bash
# Auth DB
docker exec delivereats-auth-db mysqldump -u root -ppassword auth_db > backup_auth_db.sql

# Catalog DB
docker exec delivereats-catalog-db mysqldump -u root -ppassword catalog_db > backup_catalog_db.sql

# Orders DB
docker exec delivereats-orders-db mysqldump -u root -ppassword orders_db > backup_orders_db.sql

# Delivery DB
docker exec delivereats-delivery-db mysqldump -u root -ppassword delivery_db > backup_delivery_db.sql
```

### Restaurar una base de datos
```bash
# Ejemplo: Auth DB
docker exec -i delivereats-auth-db mysql -u root -ppassword auth_db < backup_auth_db.sql
```

---

## 📌 Notas Importantes

1. **Password Warning**: Los comandos incluyen `-ppassword` (password sin espacio). Esto genera un warning de seguridad pero funciona correctamente.

2. **Formato alternativo sin warning**:
   ```bash
   docker exec -it delivereats-auth-db mysql -u root --password=password auth_db
   ```

3. **Ejecutar desde PowerShell**: Todos los comandos funcionan en PowerShell de Windows.

4. **Formato de salida**: Para mejor legibilidad, puedes agregar `-t` para formato tabular:
   ```bash
   docker exec -it delivereats-auth-db mysql -u root -ppassword auth_db -t -e "SELECT * FROM users;"
   ```

5. **Exportar a archivo**: Puedes redirigir la salida a un archivo:
   ```bash
   docker exec -it delivereats-auth-db mysql -u root -ppassword auth_db -e "SELECT * FROM users;" > users_export.txt
   ```
