# START GUIDE - Guia de Inicio Rapido para DeliverEats

## ERROR RESUELTO: ContainerConfig

El error `KeyError: 'ContainerConfig'` ha sido SOLUCIONADO con los siguientes cambios:

### Soluciones Implementadas

1. **Scripts de Limpieza Automática**:
   - `docker-cleanup.bat` (Windows)
   - `docker-cleanup.sh` (Linux/Mac) 
   - `docker-cleanup.ps1` (PowerShell)

2. **Docker Compose Mejorado**:
   - Health checks para todos los servicios
   - Dependencias corregidas entre servicios
   - Timeouts y reintentos configurados

3. **Dockerfiles Actualizados**:
   - API Gateway: Añadido `curl` para health checks
   - Auth Service: Añadido `netcat-openbsd` para health checks

4. **Scripts de Inicio Completo**:
   - `start.bat` (Windows)
   - `start.sh` (Linux/Mac)

### Opción 1: Inicio completo con Docker (RECOMENDADO)

```bash
# 1. Navegar al directorio del proyecto
cd "c:\Users\pabda\Desktop\lab SA\Practica2"

# 2. Limpiar contenedores previos
docker compose down --remove-orphans

# 3. Construir e iniciar todos los servicios
docker compose up --build -d

# 4. Ver logs en tiempo real (opcional)
docker compose logs -f

# 5. Verificar que todo esté funcionando
# Frontend: http://localhost:3000
# API Gateway: http://localhost:8080/health
# Base de datos: localhost:3306
```

### Opción 2: Desarrollo local (cada servicio por separado)

**Terminal 1 - Base de Datos:**
```bash
docker compose up auth-db -d
```

**Terminal 2 - Auth Service:**
```bash
cd auth-service
npm install
npm run dev
```

**Terminal 3 - API Gateway:**
```bash
cd api-gateway
npm install
npm run dev
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🛑 Comandos para parar el sistema

```bash
# Parar todos los servicios
docker compose down

# Parar y eliminar volúmenes (limpia la BD)
docker compose down -v

# Parar y limpiar todo (imágenes, contenedores, volúmenes)
docker compose down -v --rmi all
```

## 🔄 Comandos útiles durante desarrollo

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f api-gateway
docker-compose logs -f auth-service

# Reiniciar un servicio específico
docker-compose restart auth-service

# Reconstruir un servicio específico
docker-compose up --build auth-service

# Ejecutar comandos dentro de contenedores
docker-compose exec auth-service sh
docker-compose exec auth-db mysql -u root -p
```

## 📋 Verificación de funcionamiento

Después de ejecutar `docker-compose up --build -d`, verifica:

1. **Frontend funcionando**: http://localhost:3000
2. **API Gateway funcionando**: http://localhost:8080/health
3. **Todos los servicios corriendo**:
   ```bash
   docker-compose ps
   ```
4. **Logs sin errores**:
   ```bash
   docker-compose logs
   ```

## 🎯 Flujo de uso básico

1. **Iniciar sistema**: `docker-compose up --build -d`
2. **Abrir navegador**: http://localhost:3000
3. **Registrar usuario** con rol CLIENTE
4. **Iniciar sesión** con el usuario creado
5. **Explorar la interfaz**

## 🔐 Usuarios predeterminados

- **Admin**: admin@delivereats.com / admin123
- **Cliente**: cliente@test.com / admin123  
- **Restaurant**: restaurant@test.com / admin123
- **Delivery**: delivery@test.com / admin123

*(Todos los usuarios usan la misma contraseña para pruebas)*

## ⚡ Inicio rápido - Un solo comando

```bash
cd "c:\Users\pabda\Desktop\lab SA\Practica2" && docker compose down --remove-orphans && docker compose up --build -d && echo "✅ Sistema iniciado en http://localhost:3000"
```

---
**¡Sistema listo para usar! 🎉**