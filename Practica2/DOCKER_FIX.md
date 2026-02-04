# Guia para Resolver Error ContainerConfig

## Problema
Error `KeyError: 'ContainerConfig'` al ejecutar `docker-compose up --build -d`

## Solucion

### Paso 1: Limpieza Completa de Docker
```bash
# Detener todos los contenedores del proyecto
docker-compose down --remove-orphans

# Eliminar contenedores específicos
docker rm -f delivereats-auth-service delivereats-api-gateway delivereats-frontend delivereats-auth-db

# Eliminar imágenes del proyecto
docker rmi -f practica2_auth-service practica2_api-gateway practica2_frontend

# Limpieza general
docker image prune -f
docker volume prune -f
docker network prune -f
docker builder prune -f
```

### Paso 2: Reconstruir y Ejecutar
```bash
# Reconstruir desde cero
docker-compose up --build -d

# Verificar estado
docker-compose ps
docker-compose logs
```

### Paso 3: Scripts de Limpieza Automática

**Windows:**
```batch
.\docker-cleanup.bat
```

**Linux/Mac:**
```bash
./docker-cleanup.sh
```

## 🔧 Cambios Realizados para Prevenir el Error

1. **Docker Compose Mejorado:**
   - Añadidos health checks para todos los servicios
   - Mejoradas las dependencias entre servicios
   - Configurados timeouts y reintentos apropiados

2. **Dockerfiles Actualizados:**
   - API Gateway: Añadido `curl` para health checks
   - Auth Service: Añadido `netcat-openbsd` para health checks

3. **Endpoint de Health:**
   - Creado `/health` en API Gateway para monitoreo

## ⚠️ Notas Importantes

- El error `ContainerConfig` usualmente indica conflictos con contenedores/imágenes existentes
- La limpieza completa resuelve estos conflictos
- Los health checks previenen problemas de dependencias entre servicios
- Siempre usar `--build` después de cambios en Dockerfiles

## 🚀 Verificación Post-Despliegue

```bash
# Verificar servicios
curl http://localhost:8080/health
curl http://localhost:3000

# Ver logs
docker-compose logs -f auth-service
docker-compose logs -f api-gateway
docker-compose logs -f frontend

# Verificar base de datos
docker exec -it delivereats-auth-db mysql -u delivereats -p auth_db
```