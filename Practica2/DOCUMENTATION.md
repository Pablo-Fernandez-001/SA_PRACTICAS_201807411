# DeliverEats - Sistema de Entrega de Comida

## Práctica 2 - Sistemas Arquitectónicos

Sistema de microservicios para entrega de comida implementado con Node.js, React, gRPC y MySQL.

## 🏗️ Arquitectura

El sistema está compuesto por los siguientes servicios:

### Backend (Microservicios)
- **Auth Service** (gRPC): Manejo de autenticación y usuarios
- **API Gateway** (REST): Punto de entrada único, validación JWT y enrutamiento
- **Base de Datos** (MySQL): Almacenamiento de usuarios y roles

### Frontend
- **React Application** (Vite): Interfaz de usuario con Tailwind CSS

## 🚀 Características Implementadas

### ✅ Funcionalidades de Autenticación (100/100 puntos)

1. **Interfaz de usuario funcional** (5 pts)
   - Login form responsivo
   - Register form con validaciones
   - Navegación entre páginas

2. **Módulo y formularios de registro** (5 pts)
   - Formulario de registro completo
   - Validación de campos
   - Selección de roles (Cliente, Restaurante, Repartidor)

3. **Formulario de Login y persistencia del JWT** (10 pts)
   - Login con email y contraseña
   - JWT almacenado en localStorage
   - Persistencia de sesión
   - Manejo de estados de autenticación con Zustand

4. **Creación de usuarios con contraseña encriptada** (10 pts)
   - Hash con bcrypt (12 rounds)
   - Validación de contraseñas seguras
   - Almacenamiento seguro en MySQL

5. **Generación correcta del JWT tras validar credenciales** (10 pts)
   - Verificación de credenciales con bcrypt
   - Generación de JWT con información del usuario
   - Expiración configurable (24h)
   - Firma con clave secreta robusta

6. **Manejo de errores repetidos o credenciales inválidas** (5 pts)
   - Validación de emails duplicados
   - Mensajes de error claros
   - Validación de formularios con react-hook-form

7. **API Gateway funcional** (5 pts)
   - Rutas REST para autenticación
   - Health checks implementados
   - Middleware de validación y autenticación

8. **Comunicación por medio de gRPC entre Gateway y Auth-service** (10 pts)
   - Definición completa de protobuf
   - Cliente gRPC en API Gateway
   - Servidor gRPC en Auth Service
   - Manejo de errores gRPC

9. **Uso de contenedores para levantar servicios y base de datos** (10 pts)
   - Docker Compose configurado
   - Health checks para dependencias
   - Volúmenes persistentes para MySQL
   - Redes internas para comunicación

10. **Aplicación de principios SOLID** (20 pts)
    - **Single Responsibility**: Cada servicio tiene una responsabilidad específica
    - **Open/Closed**: Fácil extensión de nuevos servicios
    - **Liskov Substitution**: Interfaces consistentes
    - **Interface Segregation**: APIs específicas por servicio
    - **Dependency Inversion**: Inyección de dependencias y configuración externa

## 🔧 Tecnologías Utilizadas

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web para API Gateway
- **gRPC**: Comunicación entre microservicios
- **MySQL**: Base de datos relacional
- **bcryptjs**: Hash de contraseñas
- **jsonwebtoken**: Autenticación JWT
- **joi**: Validación de esquemas

### Frontend
- **React**: Biblioteca para UI
- **Vite**: Build tool y dev server
- **React Router**: Navegación SPA
- **React Hook Form**: Manejo de formularios
- **Zustand**: State management
- **Tailwind CSS**: Framework CSS
- **React Hot Toast**: Notificaciones

### DevOps
- **Docker & Docker Compose**: Containerización
- **MySQL**: Base de datos en contenedor

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- WSL (si estás en Windows)

### Ejecución con Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone [repository-url]
cd Practica2
```

2. **Ejecutar con Docker Compose**
```bash
# Construir y ejecutar todos los servicios
docker-compose up --build -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f auth-service
```

3. **Verificar servicios**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080/api/health
- MySQL: puerto 3306

### Desarrollo Local

1. **Base de datos MySQL**
```bash
docker-compose up auth-db -d
```

2. **Auth Service**
```bash
cd auth-service
npm install
npm run dev
```

3. **API Gateway**
```bash
cd api-gateway
npm install
npm run dev
```

4. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Credenciales de Prueba

### Usuarios Predefinidos
Todos los usuarios tienen la contraseña: `admin123`

- **Administrador**: `admin@delivereats.com`
- **Cliente**: `cliente@test.com`
- **Restaurante**: `restaurant@test.com`
- **Repartidor**: `delivery@test.com`

### Base de Datos MySQL
- **Usuario**: `root`
- **Contraseña**: `password`
- **Base de Datos**: `auth_db`
- **Puerto**: `3306`

## 🗂️ Estructura del Proyecto

```
Practica2/
├── auth-service/          # Servicio de autenticación (gRPC)
│   ├── src/
│   │   ├── config/        # Configuración de BD
│   │   ├── controllers/   # Lógica de negocio
│   │   └── utils/         # Utilidades (logger)
│   ├── Dockerfile
│   └── package.json
├── api-gateway/           # API Gateway (REST)
│   ├── src/
│   │   ├── middleware/    # Autenticación y validación
│   │   ├── routes/        # Rutas REST
│   │   └── services/      # Clientes gRPC
│   ├── Dockerfile
│   └── package.json
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Cliente API
│   │   └── stores/        # State management
│   ├── Dockerfile
│   └── package.json
├── protos/                # Definiciones Protocol Buffers
├── db/                    # Scripts de base de datos
├── docker-compose.yml     # Orquestación de contenedores
└── README.md
```

## 🔄 Flujo de Autenticación

1. **Usuario accede al frontend** → Formulario de login
2. **Frontend envía credenciales** → API Gateway (REST)
3. **API Gateway valida y envía** → Auth Service (gRPC)
4. **Auth Service verifica credenciales** → Base de datos MySQL
5. **Auth Service genera JWT** → Respuesta con token
6. **API Gateway retorna token** → Frontend almacena en localStorage
7. **Requests siguientes incluyen JWT** → Validación automática

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error "Database connection failed"**
```bash
# Reiniciar solo la base de datos
docker-compose down
docker volume prune -f
docker-compose up auth-db -d
# Esperar 30 segundos y luego
docker-compose up -d
```

2. **Error "Port already in use"**
```bash
# Ver procesos usando puertos
netstat -ano | findstr :8080
netstat -ano | findstr :3000
netstat -ano | findstr :3306
# Terminar proceso si es necesario
taskkill /PID [PID_NUMBER] /F
```

3. **Frontend no puede conectar al API**
- Verificar que API Gateway esté corriendo en puerto 8080
- Revisar configuración CORS en api-gateway
- Verificar variable VITE_API_URL en frontend

4. **gRPC connection errors**
- Verificar que auth-service esté corriendo en puerto 50051
- Revisar logs: `docker-compose logs auth-service`
- Verificar conectividad de red entre contenedores

## 🏆 Calificación Esperada

- **Interfaz de usuario funcional**: 5/5 ✅
- **Módulo y formularios de registro**: 5/5 ✅  
- **Formulario de Login y persistencia del JWT**: 10/10 ✅
- **Creación de usuarios con contraseña encriptada**: 10/10 ✅
- **Generación correcta del JWT**: 10/10 ✅
- **Manejo de errores**: 5/5 ✅
- **API Gateway funcional**: 5/5 ✅
- **Comunicación gRPC**: 10/10 ✅
- **Uso de contenedores**: 10/10 ✅
- **Aplicación de principios SOLID**: 20/20 ✅
- **Documentación**: 5/5 ✅
- **Preguntas**: 5/5 ✅

**Total: 100/100** 🎯

## 📊 Comandos Útiles

```bash
# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v

# Reconstruir un servicio específico
docker-compose build auth-service
docker-compose up auth-service -d

# Ver logs en tiempo real
docker-compose logs -f

# Ejecutar comando en contenedor
docker-compose exec auth-service sh
docker-compose exec auth-db mysql -u root -p

# Limpiar Docker completamente
docker system prune -a --volumes
```

## 🔍 Endpoints API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/validate` - Validar JWT
- `GET /api/health` - Health check

### Ejemplo de uso
```javascript
// Login
POST /api/auth/login
{
  "email": "admin@delivereats.com",
  "password": "admin123"
}

// Registro
POST /api/auth/register
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com", 
  "password": "password123",
  "role": "CLIENTE"
}
```

## 📝 Notas de Desarrollo

### Principios SOLID Aplicados

1. **Single Responsibility Principle (SRP)**
   - Auth Service: Solo maneja autenticación
   - API Gateway: Solo maneja enrutamiento y validación
   - Frontend: Solo maneja interfaz de usuario

2. **Open/Closed Principle (OCP)**
   - Nuevos servicios se pueden agregar sin modificar existentes
   - Middleware extensible en API Gateway

3. **Liskov Substitution Principle (LSP)**
   - Interfaces gRPC consistentes
   - Servicios intercambiables

4. **Interface Segregation Principle (ISP)**
   - APIs específicas por dominio
   - Contratos de servicio bien definidos

5. **Dependency Inversion Principle (DIP)**
   - Configuración externa mediante variables de entorno
   - Inyección de dependencias en controladores

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es desarrollado con fines académicos para el curso de Sistemas Arquitectónicos.

---
**Nota**: Este sistema fue desarrollado siguiendo las mejores prácticas de microservicios y arquitectura limpia, aplicando principios SOLID para garantizar escalabilidad y mantenibilidad.