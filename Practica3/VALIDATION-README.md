# DeliverEats - Práctica 3 - gRPC Validation

## 📋 Requisitos Implementados

### ✅ Restaurant-Catalog-Service (Servidor gRPC)

**Lógica de Verificación** implementada en `catalog-service/src/grpc/catalogGrpcServer.js`:
- ✅ Valida que los productos existan en la base de datos
- ✅ Valida que los productos pertenezcan al restaurante indicado
- ✅ Valida que los precios actuales coincidan con los solicitados
- ✅ Valida que los productos estén disponibles (is_available = true)
- ✅ Base de datos de catálogo con menús y precios en `db/catalog_db.sql`

**Puerto**: 
- REST: `3002`
- gRPC: `50052`

### ✅ Order-Service (Cliente gRPC)

**Flujo de Creación de Orden** implementado en `orders-service/src/controllers/orderController.js`:
- ✅ Llama al servidor gRPC ANTES de guardar en base de datos
- ✅ Envía lista de items con precios para validación
- ✅ Solo persiste la orden si la validación es exitosa
- ✅ Manejo de estados de error: rechaza orden si validación falla
- ✅ Notifica al frontend con mensaje descriptivo del error

**Puerto**: `3003`

### ✅ Contrato de Comunicación

**Archivo**: `protos/catalog.proto`

**Mensajes definidos**:
```protobuf
message ValidationRequest {
  int32 restaurant_id = 1;
  repeated OrderItemRequest items = 2;
}

message ValidationResponse {
  bool valid = 1;
  string message = 2;
  repeated ItemValidationResult item_results = 3;
  double total_calculated = 4;
}
```

## 🚀 Instrucciones de Inicio

### 1. Levantar los servicios con Docker

```powershell
cd "c:\Users\pabda\Desktop\lab SA\Practica3"

# Construir e iniciar todos los servicios
docker-compose up --build -d

# Verificar que todos los contenedores estén corriendo
docker ps --filter "name=delivereats"
```

### 2. Verificar conectividad de servicios

```powershell
# Ejecutar script de test
.\test-services.ps1
```

Expected output:
```
✓ API Gateway: OK
✓ Catalog Service: OK
✓ Catalog Restaurants: 5 restaurants found
✓ Orders Service: OK
✓ Delivery Service: OK
```

### 3. Acceder al sistema

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Catalog Service**: http://localhost:3002/health
- **Orders Service**: http://localhost:3003/health

## 🧪 Probar la Validación gRPC

### Flujo Completo

1. **Login**:
   ```
   Email: admin@delivereats.com
   Password: admin123
   ```

2. **Ver Restaurantes**: 
   - Home page → Lista de restaurantes desde `catalog_db`

3. **Ver Menú**:
   - Click en un restaurante → Ver items del menú
   - Todos los datos vienen de la base de datos MySQL

4. **Crear Orden** (esto dispara la validación gRPC):
   - Agregar items al carrito
   - Click en "Realizar Pedido"
   - **El sistema ejecutará**:
     a. Order-Service recibe el request
     b. Order-Service llama a Catalog-Service vía gRPC
     c. Catalog-Service valida TODOS los items:
        - ✓ Existen en BD
        - ✓ Pertenecen al restaurante
        - ✓ Precio coincide
        - ✓ Están disponibles
     d. Si TODO es válido → Orden se crea
     e. Si ALGO falla → Orden se rechaza con mensaje de error

### Casos de Prueba

#### ✅ Caso 1: Orden Válida
```json
POST http://localhost:8080/api/orders
{
  "restaurant_id": 1,
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "unit_price": 45.00
    }
  ],
  "delivery_address": "Zona 10, Guatemala"
}
```
**Resultado**: Orden creada exitosamente ✅

#### ❌ Caso 2: Precio Incorrecto
```json
POST http://localhost:8080/api/orders
{
  "restaurant_id": 1,
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 1,
      "unit_price": 30.00  // Precio real: 45.00
    }
  ],
  "delivery_address": "Zona 10, Guatemala"
}
```
**Resultado**: Error 400 - "El precio del producto ha cambiado" ❌

#### ❌ Caso 3: Item No Pertenece al Restaurante
```json
POST http://localhost:8080/api/orders
{
  "restaurant_id": 1,
  "items": [
    {
      "menu_item_id": 6,  // Este item es del restaurante 2
      "quantity": 1,
      "unit_price": 55.00
    }
  ],
  "delivery_address": "Zona 10, Guatemala"
}
```
**Resultado**: Error 400 - "El producto no pertenece al restaurante seleccionado" ❌

#### ❌ Caso 4: Item No Disponible
```json
POST http://localhost:8080/api/orders
{
  "restaurant_id": 1,
  "items": [
    {
      "menu_item_id": 5,  // is_available = FALSE
      "quantity": 1,
      "unit_price": 25.00
    }
  ],
  "delivery_address": "Zona 10, Guatemala"
}
```
**Resultado**: Error 400 - "El producto no está disponible actualmente" ❌

## 📊 Estructura de Bases de Datos

### catalog_db (Puerto 3307)
```sql
-- 5 Restaurantes seed
SELECT * FROM restaurants;

-- 25 Menu Items seed (5 por restaurante)
SELECT * FROM menu_items;
```

### orders_db (Puerto 3308)
```sql
-- Órdenes validadas
SELECT * FROM orders;

-- Items de cada orden
SELECT * FROM order_items;
```

## 🔍 Logs de Validación gRPC

Para ver los logs de validación en tiempo real:

```powershell
# Logs del Catalog Service (servidor gRPC)
docker logs -f delivereats-catalog-service

# Logs del Orders Service (cliente gRPC)
docker logs -f delivereats-orders-service
```

**Ejemplo de log exitoso**:
```
[gRPC] ValidateOrderItems called — restaurant_id=1, items=2
[gRPC] VALIDATION SUCCESS - restaurant="Burger Palace", items=2, total=Q90.00
[createOrder] gRPC validation passed - total=Q90.00
[createOrder] ORDER CREATED - number=ORD-20260211-001, id=1, total=Q90.00, items=2
```

**Ejemplo de log fallido**:
```
[gRPC] ValidateOrderItems called — restaurant_id=1, items=1
[gRPC] Item 5: NO DISPONIBLE
[gRPC] VALIDATION FAILED - restaurant="Burger Palace", errors=1: El producto no está disponible
[createOrder] ORDER REJECTED - restaurant=1, reason: Validación fallida
```

## 🏗️ Arquitectura gRPC

```
┌─────────────────────┐      gRPC Call        ┌──────────────────────┐
│  Order-Service      │ ──────────────────────>│  Catalog-Service     │
│  (Client)           │  ValidateOrderItems   │  (Server)            │
│  Port: 3003         │                       │  gRPC Port: 50052    │
│                     │<──────────────────────│  REST Port: 3002     │
│  orderController.js │   ValidationResponse  │  catalogGrpcServer.js│
└─────────────────────┘                       └──────────────────────┘
         │                                              │
         │                                              │
         ↓                                              ↓
┌─────────────────────┐                       ┌──────────────────────┐
│   orders_db         │                       │   catalog_db         │
│   MySQL:3308        │                       │   MySQL:3307         │
└─────────────────────┘                       └──────────────────────┘
```

## 🛠️ Gestión CRUD

### Frontend - AdminPanel

**Ruta**: http://localhost:3000/admin/panel

**Funcionalidades**:
- ✅ Restaurantes: Crear, Editar, Eliminar, Activar/Desactivar
- ✅ Menu Items: Crear, Editar, Eliminar, Disponible/No Disponible
- ✅ Pedidos: Ver, Cambiar Estado, Cancelar
- ✅ Entregas: Ver, Iniciar, Completar, Cancelar

Todos los datos son persistidos en MySQL, **sin mockdata**.

## 📝 Notas Importantes

1. **Validación Pre-Persistencia**: La orden NUNCA se guarda en la base de datos si la validación gRPC falla
2. **Atomicidad**: La creación de orden + items es transaccional (rollback si hay error)
3. **Precio Confiable**: El total calculado por gRPC es el que se usa (no el del cliente)
4. **Sin Mockdata**: Todos los datos vienen de MySQL
5. **Logs Profesionales**: Sin emojis en logs de backend

## ⚠️ Troubleshooting

### Error 404 en `/api/catalog/restaurants`

**Causa**: Catalog service no está levantado correctamente

**Solución**:
```powershell
# Verificar el contenedor
docker logs delivereats-catalog-service

# Reiniciar el servicio
docker-compose restart catalog-service

# Verificar conectividad
curl http://localhost:3002/health
```

### Error 400 en menu items

**Causa**: Validación de datos fallando

**Solución**: Verificar que los datos enviados cumplan con el esquema:
- `restaurant_id` debe ser un INT válido
- `price` debe ser DECIMAL positivo
- `name` es requerido

### gRPC Connection Refused

**Causa**: Catalog service gRPC no está escuchando en puerto 50052

**Solución**:
```powershell
# Verificar que el puerto esté expuesto
docker ps | findstr catalog-service

# Debe mostrar: 0.0.0.0:50052->50052/tcp
```

## 📚 Archivos Clave

- `protos/catalog.proto` - Contrato gRPC
- `catalog-service/src/grpc/catalogGrpcServer.js` - Servidor gRPC
- `orders-service/src/grpc/catalogClient.js` - Cliente gRPC
- `orders-service/src/controllers/orderController.js` - Flujo de validación
- `catalog-service/src/controllers/restaurantController.js` - CRUD Restaurantes
- `catalog-service/src/controllers/menuItemController.js` - CRUD Menu Items
- `frontend/src/pages/AdminPanel.jsx` - Interfaz de administración
