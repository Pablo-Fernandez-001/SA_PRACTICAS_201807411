# Práctica 3 - Integración Completa con Validación gRPC

## 📋 Resumen de Implementación

Este proyecto integra todas las funcionalidades de la Práctica 2 en la Práctica 3, añadiendo la validación gRPC entre Order-Service y Restaurant-Catalog-Service según los requerimientos del PDF.

## ✅ Características Implementadas

### 1. Validación gRPC (Requerimiento Principal)

#### **Restaurant-Catalog-Service (Servidor gRPC)**
- ✅ **Archivo**: `catalog-service/src/grpc/catalogGrpcServer.js`
- ✅ **Contrato**: `protos/catalog.proto`
- ✅ **Funcionalidad Implementada**:
  - Procedimiento `ValidateOrderItems` que recibe lista de IDs de productos y ID de restaurante
  - Validación de existencia de productos en la base de datos
  - Validación de que los productos pertenecen al restaurante indicado
  - Validación de que los precios actuales coinciden con los solicitados
  - Validación de disponibilidad de productos (campo `is_available`)
  - Cálculo del total en el servidor (fuente confiable)
  - Mensajes de error detallados por ítem

#### **Order-Service (Cliente gRPC)**
- ✅ **Archivo**: `orders-service/src/grpc/catalogClient.js`
- ✅ **Controlador**: `orders-service/src/controllers/orderController.js`
- ✅ **Funcionalidad Implementada**:
  - Llamada gRPC a catalog-service ANTES de guardar orden
  - Manejo de estados de error:
    - Si precio incorrecto → rechaza la orden
    - Si producto no existe → rechaza la orden
    - Si producto no pertenece al restaurante → rechaza la orden
    - Si producto no disponible → rechaza la orden
  - Notificación al frontend con detalles de errores
  - Persistencia solo si validación exitosa

#### **Contrato de Comunicación**
- ✅ **Archivo**: `protos/catalog.proto`
- ✅ **Mensajes Definidos**:
  - `ValidationRequest`: IDs de productos, precios solicitados, ID restaurante
  - `ValidationResponse`: Resultado de validación, lista de errores, total calculado
  - `OrderItemRequest`: Item individual con ID, precio, cantidad
  - `ItemValidationResult`: Resultado por ítem con flags de validación

### 2. Dashboards de Práctica 2 Migrados

#### **AdminDashboard**
- ✅ **Archivo**: `frontend/src/pages/AdminDashboard.jsx`
- ✅ **Funcionalidades**:
  - CRUD completo de usuarios (sin mockdata)
  - Estadísticas en tiempo real desde base de datos
  - Registro de nuevos usuarios (todos los roles)
  - Edición de usuarios (nombre, email, rol)
  - Activación/Desactivación de usuarios
  - Eliminación permanente de usuarios
  - Tabla con filtros por rol
  - Gestión de roles: ADMIN, CLIENTE, RESTAURANTE, REPARTIDOR

#### **ClientDashboard**
- ✅ **Archivo**: `frontend/src/pages/ClientDashboard.jsx`
- ✅ **Funcionalidades**:
  - Estadísticas personales del cliente desde base de datos
  - Pedidos totales
  - Pedidos del mes actual
  - Dinero total gastado
  - Entregas pendientes
  - Lista de pedidos recientes
  - Accesos rápidos a funcionalidades

### 3. Componentes de Usuario

#### **RegisterUserForm**
- ✅ **Archivo**: `frontend/src/components/RegisterUserForm.jsx`
- ✅ **Funcionalidades**:
  - Modal para registro de usuarios por admin
  - Validación de campos
  - Selector de roles
  - Feedback de éxito/error
  - Integración con endpoint `/api/auth/admin/register`

### 4. Rutas y Navegación

#### **App.jsx**
- ✅ Rutas añadidas:
  - `/admin/users` → AdminDashboard (solo ADMIN)
  - `/dashboard` → ClientDashboard (solo CLIENTE)
  - Protección de rutas por rol

#### **Navbar**
- ✅ Navegación actualizada:
  - Enlaces a dashboards según rol
  - Acceso a gestión de usuarios (ADMIN)
  - Menú desplegable con opciones
  - Panel Admin separado de Gestión de Usuarios

### 5. API Gateway - Endpoints REST

#### **Auth Routes** (`api-gateway/src/routes/auth.js`)
- ✅ `POST /api/auth/admin/register` - Registro por admin (protegido)
- ✅ `GET /api/auth/users` - Listar usuarios (solo ADMIN)
- ✅ `PUT /api/auth/users/:id` - Actualizar usuario (solo ADMIN)
- ✅ `PUT /api/auth/users/:id/role` - Cambiar rol (solo ADMIN)
- ✅ `DELETE /api/auth/users/:id` - Eliminar usuario (solo ADMIN)

### 6. Auth Service - Controladores gRPC

#### **authController.js**
- ✅ `register` - Registro de usuarios
- ✅ `login` - Autenticación
- ✅ `validateToken` - Validación de JWT
- ✅ `getUserById` - Obtener usuario por ID
- ✅ `updateUser` - Actualizar datos de usuario
- ✅ `updateUserRole` - Cambiar rol de usuario
- ✅ `deleteUser` - Eliminación permanente
- ✅ `getAllUsers` - Listar todos los usuarios

## 🔧 Bases de Datos Utilizadas

### **auth_db** (Auth Service)
- Tablas: `users`, `roles`
- Sin mockdata, todo gestionado por MySQL

### **catalog_db** (Catalog Service)
- Tablas: `restaurants`, `menu_items`
- Validación de precios y disponibilidad

### **orders_db** (Orders Service)
- Tablas: `orders`, `order_items`
- Creación solo después de validación gRPC

### **delivery_db** (Delivery Service)
- Tablas: `deliveries`
- Gestión de entregas

## 🚀 Flujo de Creación de Orden (Con Validación gRPC)

1. **Cliente**: Envía orden desde frontend
2. **API Gateway**: Recibe request → Forward a Orders-Service
3. **Orders-Service**: 
   - Construye `ValidationRequest`
   - **Llamada gRPC** → Catalog-Service
4. **Catalog-Service**:
   - Verifica existencia de productos
   - Verifica pertenencia al restaurante
   - Verifica precios actuales
   - Verifica disponibilidad
   - Retorna `ValidationResponse`
5. **Orders-Service**:
   - ✅ Si válido: Persiste orden en `orders_db`
   - ❌ Si inválido: Rechaza y notifica errores al frontend
6. **Frontend**: Muestra resultado al usuario

## 📁 Estructura de Archivos Principales

```
Practica3/
├── protos/
│   ├── auth.proto              ✅ Contrato Auth Service
│   └── catalog.proto           ✅ Contrato Catalog Service (ValidationRequest/Response)
│
├── catalog-service/
│   └── src/
│       ├── grpc/
│       │   └── catalogGrpcServer.js  ✅ Servidor gRPC de validación
│       └── index.js            ✅ Inicia REST + gRPC
│
├── orders-service/
│   └── src/
│       ├── grpc/
│       │   └── catalogClient.js      ✅ Cliente gRPC
│       └── controllers/
│           └── orderController.js    ✅ Validación pre-orden
│
├── auth-service/
│   └── src/
│       └── controllers/
│           └── authController.js     ✅ CRUD usuarios completo
│
├── api-gateway/
│   └── src/
│       └── routes/
│           └── auth.js         ✅ Endpoints REST usuarios
│
└── frontend/
    └── src/
        ├── components/
        │   └── RegisterUserForm.jsx  ✅ Modal registro
        ├── pages/
        │   ├── AdminDashboard.jsx    ✅ CRUD usuarios
        │   ├── ClientDashboard.jsx   ✅ Dashboard cliente
        │   └── AdminPanel.jsx        ✅ Panel admin con tab usuarios
        └── App.jsx              ✅ Rutas actualizadas
```

## 🎯 Validaciones Implementadas (según PDF)

### ✅ Restaurant-Catalog-Service
- [x] Procedimiento de verificación de lista de IDs
- [x] Validación de existencia en base de datos
- [x] Validación de pertenencia al restaurante
- [x] Validación de precios coincidentes
- [x] Base de datos con menús y precios actualizados

### ✅ Order-Service
- [x] Flujo modificado con llamada remota
- [x] Validación ANTES de guardar
- [x] Manejo de estados de error
- [x] Notificación al frontend de errores

### ✅ Contrato de Comunicación
- [x] `ValidationRequest` con productos y restaurante
- [x] `ValidationResponse` con resultados detallados
- [x] Intercambio estructurado y eficiente

## 🔐 Roles y Permisos

- **ADMIN**: Acceso a todos los dashboards y CRUD de usuarios
- **CLIENTE**: Dashboard personal con estadísticas
- **RESTAURANTE**: (por implementar según necesidad)
- **REPARTIDOR**: (por implementar según necesidad)

## 📊 Estadísticas y Datos Reales

- ❌ **SIN MOCKDATA** - Todo desde base de datos
- ✅ Conteo dinámico de usuarios por rol
- ✅ Cálculo de totales de pedidos
- ✅ Estadísticas de gastos del cliente
- ✅ Estado de entregas en tiempo real

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express
- **gRPC**: @grpc/grpc-js, @grpc/proto-loader
- **Base de Datos**: MySQL/MariaDB
- **Frontend**: React, Vite, TailwindCSS
- **Icons**: Heroicons
- **Autenticación**: JWT
- **Orquestación**: Docker Compose

## 🚦 Cómo Ejecutar

```bash
# En Practica3/
docker-compose up --build

# Servicios disponibles:
# - Frontend: http://localhost:5173
# - API Gateway: http://localhost:8080
# - Catalog REST: http://localhost:3002
# - Orders REST: http://localhost:3003
# - Auth gRPC: 50051
# - Catalog gRPC: 50052
```

## 🧪 Casos de Prueba de Validación gRPC

### ✅ Caso 1: Orden válida
```json
{
  "userId": 1,
  "restaurantId": 1,
  "items": [
    { "menu_item_id": 1, "requested_price": 45.50, "quantity": 2 }
  ]
}
```
**Resultado**: Orden creada exitosamente

### ❌ Caso 2: Precio incorrecto
```json
{
  "userId": 1,
  "restaurantId": 1,
  "items": [
    { "menu_item_id": 1, "requested_price": 30.00, "quantity": 1 }
  ]
}
```
**Resultado**: Rechazo con mensaje "El precio ha cambiado"

### ❌ Caso 3: Producto de otro restaurante
```json
{
  "userId": 1,
  "restaurantId": 1,
  "items": [
    { "menu_item_id": 5, "requested_price": 20.00, "quantity": 1 }
  ]
}
```
**Resultado**: Rechazo con mensaje "No pertenece al restaurante"

### ❌ Caso 4: Producto no disponible
```json
{
  "userId": 1,
  "restaurantId": 1,
  "items": [
    { "menu_item_id": 3, "requested_price": 60.00, "quantity": 1 }
  ]
}
```
**Resultado**: Rechazo con mensaje "Producto no disponible"

## 📝 Notas Finales

- ✅ Todos los requerimientos del PDF implementados
- ✅ Sin mockdata, todo gestionado por base de datos
- ✅ Validación gRPC funcional entre Order-Service y Catalog-Service  
- ✅ Dashboards de Práctica 2 completamente migrados
- ✅ CRUDs de usuarios funcionales
- ✅ Sistema de roles y permisos implementado

---

**Desarrollado para Software Avanzado - Práctica 3**
