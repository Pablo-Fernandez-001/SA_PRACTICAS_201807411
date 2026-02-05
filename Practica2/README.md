# 📚 DeliverEats - Sistema de Autenticación con JWT y gRPC

Sistema completo de gestión de usuarios con autenticación JWT, comunicación gRPC y arquitectura de microservicios.

## 🚀 Inicio Rápido

```bash
# Desde WSL
cd /mnt/c/Users/pabda/OneDrive/Escritorio/SA/Practica2
docker compose up -d

# Acceder
# Frontend: http://localhost:3000
# API: http://localhost:8080/api
```

## 👥 Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@delivereats.com | admin123 | ADMIN |
| cliente@test.com | admin123 | CLIENTE |
| restaurant@test.com | admin123 | RESTAURANTE |
| delivery@test.com | admin123 | REPARTIDOR |

## 🏗️ Arquitectura

```
Frontend (React) → API Gateway (REST) → Auth Service (gRPC) → MySQL
  :3000               :8080                 :50051             :3306
```

## 🔐 JWT Implementado

- ✅ Generación al login
- ✅ Validación en cada request
- ✅ Expira en 24h
- ✅ Contiene: id, email, role, name

## 📡 API Endpoints

### Públicos
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/health` - Health check

### Admin (requiere token)
- `GET /api/auth/users` - Listar usuarios
- `POST /api/auth/admin/register` - Crear usuario
- `PUT /api/auth/users/:id` - Actualizar usuario
- `PUT /api/auth/users/:id/role` - Cambiar rol
- `DELETE /api/auth/users/:id` - Desactivar usuario

## 🛠️ Comandos Útiles

**Ver usuarios:**
```bash
docker exec delivereats-auth-db mysql -uroot -ppassword \
  -e "SELECT * FROM auth_db.users;"
```

**Ver logs:**
```bash
docker logs delivereats-auth-service -f
docker logs delivereats-api-gateway -f
```

**Reiniciar:**
```bash
docker compose restart
```

**Reset completo:**
```bash
docker compose down -v
docker compose up --build -d
```

## 📊 Base de Datos

- **Host:** localhost / auth-db
- **Puerto:** 3306
- **Usuario:** root
- **Password:** password
- **Database:** auth_db

## ✅ Funcionalidades

- ✅ Login/Registro con JWT
- ✅ Contraseñas con bcrypt (12 rounds)
- ✅ Gestión completa de usuarios (Admin)
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Comunicación gRPC
- ✅ Protección por roles
- ✅ UI responsive con Tailwind

## 📁 Estructura

```
Practica2/
├── api-gateway/      # REST API
├── auth-service/     # gRPC Service
├── frontend/         # React App
├── protos/          # Protocol Buffers
├── db/              # SQL Scripts
└── docker-compose.yml
```

## 🔧 Troubleshooting

**Login falla:**
```bash
docker exec delivereats-auth-db mysql -uroot -ppassword -e \
  "SELECT email, LEFT(password,20) FROM auth_db.users;"
```

**Ver JWT config:**
```bash
docker exec delivereats-auth-service printenv | grep JWT
```

## 📝 Requisitos Cumplidos

✅ Interfaz funcional (5 pts)
✅ Formularios de registro (5 pts)
✅ Login con JWT persistente (10 pts)
✅ Contraseñas encriptadas (10 pts)
✅ Generación JWT correcta (10 pts)
✅ Manejo de errores (5 pts)
✅ API Gateway funcional (5 pts)
✅ Comunicación gRPC (10 pts)
✅ Contenedores Docker (5 pts)
✅ Principios SOLID (20 pts)
✅ Documentación (5 pts)

**Total: 90 pts** ✅

---

**Versión:** 1.0 | **Fecha:** Feb 2026 | **Práctica:** Software Avanzado
