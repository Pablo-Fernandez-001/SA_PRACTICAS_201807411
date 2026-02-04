# DeliverEats - Sistema de Delivery de Comida

Sistema completo de delivery de comida desarrollado con arquitectura de microservicios usando Docker, Node.js, React con Vite, gRPC y MySQL.

## 🏗️ Arquitectura

- **Frontend**: React + Vite + TailwindCSS
- **API Gateway**: Express.js + gRPC client
- **Auth Service**: Node.js + gRPC server + JWT
- **Base de Datos**: MySQL 8.0

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Git

### 1. Clonar e instalar

```bash
git clone <repository-url>
cd Practica2
```

### 2. Levantar todos los servicios

```bash
# Construir e iniciar todos los servicios
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f auth-db
```

### 3. Verificar que todo esté funcionando

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080/health
- **Base de datos**: localhost:3306

### 4. Usuarios por defecto

- **Admin**: admin@delivereats.com / admin123

## 🛠️ Desarrollo Local

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

### API Gateway

```bash
cd api-gateway
npm install
npm run dev
```

### Auth Service

```bash
cd auth-service
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
Practica2/
├── frontend/                 # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Servicios API
│   │   ├── stores/         # Estado global (Zustand)
│   │   └── styles.css      # Estilos principales
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── api-gateway/             # Gateway REST + gRPC client
│   ├── src/
│   │   ├── routes/         # Rutas REST
│   │   ├── services/       # Clientes gRPC
│   │   ├── middleware/     # Middlewares Express
│   │   └── utils/          # Utilidades
│   ├── package.json
│   └── Dockerfile
├── auth-service/           # Servicio de autenticación gRPC
│   ├── src/
│   │   ├── controllers/    # Controladores gRPC
│   │   ├── config/         # Configuración DB
│   │   └── utils/          # Utilidades
│   ├── package.json
│   └── Dockerfile
├── protos/                 # Definiciones Protocol Buffers
│   └── auth.proto
├── db/                     # Scripts SQL
│   └── auth_db.sql
├── docker-compose.yml      # Orquestación completa
└── README.md
```

## 🔧 Comandos Útiles

### Docker

```bash
# Iniciar servicios
docker-compose up -d

# Parar servicios
docker-compose down

# Reconstruir servicios
docker-compose up --build

# Ver logs
docker-compose logs -f [servicio]

# Ejecutar comando en contenedor
docker-compose exec auth-service sh
docker-compose exec auth-db mysql -u root -p

# Limpiar todo (incluye volúmenes)
docker-compose down -v --rmi all
```

### Base de Datos

```bash
# Conectar a MySQL
docker-compose exec auth-db mysql -u root -p

# Backup de base de datos
docker-compose exec auth-db mysqldump -u root -p auth_db > backup.sql

# Restaurar base de datos
docker-compose exec -i auth-db mysql -u root -p auth_db < backup.sql
```

## 🌐 Endpoints API

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/validate` - Validar token

### Catálogo (Próximamente)

- `GET /api/catalog/restaurants` - Listar restaurantes
- `GET /api/catalog/restaurants/:id/menu` - Menú de restaurante

### Pedidos (Próximamente)

- `GET /api/orders` - Mis pedidos
- `POST /api/orders` - Crear pedido

### Entregas (Próximamente)

- `GET /api/delivery` - Entregas disponibles
- `PATCH /api/delivery/:id/status` - Actualizar estado

## 🎨 Características del Frontend

- **Responsive Design** con TailwindCSS
- **Estado Global** con Zustand
- **Gestión de formularios** con React Hook Form
- **Notificaciones** con React Hot Toast
- **Routing** con React Router DOM
- **Autenticación persistente** con LocalStorage

## 🔐 Seguridad

- **JWT Tokens** para autenticación
- **Bcrypt** para hash de contraseñas
- **Rate Limiting** en API Gateway
- **Helmet** para headers de seguridad
- **CORS** configurado
- **Input validation** con Joi

## 📊 Roles de Usuario

1. **ADMIN** - Administrador del sistema
2. **CLIENTE** - Usuario que hace pedidos
3. **RESTAURANTE** - Dueño de restaurante
4. **REPARTIDOR** - Repartidor de pedidos

## 🚦 Estados de Desarrollo

✅ **Completado**:
- Autenticación y registro de usuarios
- API Gateway con gRPC
- Frontend base con React + Vite
- Configuración Docker completa
- Base de datos MySQL

🔄 **En desarrollo**:
- Servicio de catálogo de restaurantes
- Servicio de pedidos
- Servicio de entregas
- Dashboard para diferentes roles

## 🐛 Troubleshooting

### Error: Puerto ocupado

```bash
# Verificar puertos en uso
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Matar proceso
taskkill /PID <pid> /F
```

### Error: Base de datos no conecta

```bash
# Verificar logs de MySQL
docker-compose logs auth-db

# Reiniciar solo la base de datos
docker-compose restart auth-db

# Recrear volumen de base de datos
docker-compose down -v
docker-compose up auth-db
```

### Error: Servicios no se comunican

```bash
# Verificar red
docker network ls
docker network inspect delivereats-network

# Verificar conectividad entre servicios
docker-compose exec api-gateway ping auth-service
```

## 📝 Logs

Los logs se guardan en:
- `api-gateway/logs/`
- `auth-service/logs/`

Para desarrollo en tiempo real:
```bash
docker-compose logs -f
```

## 🔄 Actualizaciones

Para actualizar el sistema:

```bash
# Parar servicios
docker-compose down

# Obtener últimos cambios
git pull

# Reconstruir e iniciar
docker-compose up --build -d
```

## 📞 Soporte

Para reportar problemas o sugerir mejoras, crear un issue en el repositorio.

---

**Desarrollado con ❤️ para el curso de Sistemas Avanzados**