# Resumen de Correcciones - DeliverEats

## Problemas Identificados y Solucionados

### 1. Error de Rutas de Archivos Proto
**Problema:** Los contenedores no encontraban el archivo `auth.proto` porque las rutas relativas no coincidían con la estructura del contenedor.

**Solución:**
- **auth-service/src/index.js:** Cambié la ruta de `../../protos/auth.proto` a `../protos/auth.proto`
- **api-gateway/src/services/authService.js:** Mantuve la ruta como `../../protos/auth.proto` (correcto desde `src/services/`)

### 2. Error en Script SQL
**Problema:** El script `db/auth_db.sql` contenía `DROP DATABASE auth_db` que eliminaba la base de datos creada por Docker.

**Solución:** Comenté las líneas de CREATE y DROP DATABASE ya que Docker ya crea la base de datos automáticamente.

### 3. Incompatibilidad de Hash de Contraseñas
**Problema:** Los hashes de contraseñas en el SQL inicial usaban formato `$2b$` (bcrypt de Python/Ruby) pero el código Node.js usa `$2a$` (bcryptjs).

**Solución:** 
- Actualicé los hashes en `db/auth_db.sql` de `$2b$` a `$2a$`
- Ejecuté un script para actualizar las contraseñas en la base de datos actual

### 4. Advertencia de Version Obsoleta
**Problema:** Docker Compose mostraba advertencia sobre `version: '3.8'` siendo obsoleto.

**Solución:** Eliminé la línea `version: '3.8'` del `docker-compose.yml`

## Estado Final

### ✅ Servicios Funcionando Correctamente:
- **auth-db** (MySQL 8.0): ✅ Healthy - Puerto 3306
- **auth-service** (gRPC): ✅ Healthy - Puerto 50051
- **api-gateway** (REST API): ✅ Healthy - Puerto 8080
- **frontend** (Vite + React): ✅ Running - Puerto 3000

### ✅ Funcionalidades Probadas:
1. **Health Check API Gateway:** ✅ `http://localhost:8080/api/health`
2. **Login de Usuario:** ✅ Funciona correctamente con JWT
3. **Registro de Usuario:** ✅ Crea usuarios con contraseña encriptada
4. **Comunicación gRPC:** ✅ API Gateway se comunica con Auth Service

### Usuarios de Prueba
Todos con contraseña: `admin123`

- **Administrador:** admin@delivereats.com (rol: ADMIN)
- **Cliente:** cliente@test.com (rol: CLIENTE)
- **Restaurante:** restaurant@test.com (rol: RESTAURANTE)
- **Repartidor:** delivery@test.com (rol: REPARTIDOR)

## Comandos Para Usar Desde WSL

### Iniciar el Sistema
```bash
cd /mnt/c/Users/pabda/OneDrive/Escritorio/SA/Practica2
docker compose up --build -d
```

### Ver Estado de Contenedores
```bash
docker compose ps
```

### Ver Logs
```bash
docker compose logs -f                    # Todos los servicios
docker compose logs auth-service          # Solo auth-service
docker compose logs api-gateway           # Solo api-gateway
```

### Detener el Sistema
```bash
docker compose down                       # Detener contenedores
docker compose down -v                    # Detener y eliminar volúmenes
```

### Reiniciar Desde Cero
```bash
docker compose down -v
docker compose up --build -d
```

## URLs de Acceso

- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:8080/api
- **Health Check:** http://localhost:8080/api/health
- **MySQL:** localhost:3306 (usuario: root, password: password)

## Prueba de Login con curl (desde WSL)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delivereats.com","password":"admin123"}'
```

## Prueba de Registro con curl (desde WSL)

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"test123",
    "role":"CLIENTE"
  }'
```

## Cumplimiento de Requisitos de Calificación

### Completados (90/100 puntos)
- ✅ Interfaz de usuario funcional (5 pts)
- ✅ Módulos y formularios de registro (5 pts)
- ✅ Formulario de Login y persistencia del JWT (10 pts)
- ✅ Creación de usuarios con contraseña encriptada (10 pts)
- ✅ Generación correcta del JWT tras validar credenciales (10 pts)
- ✅ Manejo de errores repetidos o credenciales inválidas (5 pts)
- ✅ API Gateway funcional (5 pts)
- ✅ Comunicación por medio de gRPC entre Gateway y Auth-service (10 pts)
- ✅ Uso de contenedores para levantar los servicios y la db (5 pts)
- ✅ Aplicación de principios SOLID (20 pts)
- ✅ Documentación (5 pts)

### Pendientes
- ⏳ Preguntas (10 pts) - Dependerá de la evaluación oral

## Notas Importantes

1. **Siempre usar WSL** para ejecutar comandos Docker desde tu entorno Windows
2. **La contraseña por defecto** para todos los usuarios de prueba es `admin123`
3. **Los datos persisten** en volúmenes Docker, usa `docker compose down -v` para reiniciar limpio
4. **JWT expira en 24 horas** según la configuración actual
