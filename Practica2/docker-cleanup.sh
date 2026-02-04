#!/bin/bash

echo "🧹 Limpiando Docker para resolver errores de ContainerConfig..."

# Detener todos los contenedores del proyecto
echo "Deteniendo contenedores..."
docker-compose down --remove-orphans

# Eliminar contenedores relacionados
echo "Eliminando contenedores existentes..."
docker rm -f delivereats-auth-service delivereats-api-gateway delivereats-frontend delivereats-auth-db 2>/dev/null || true

# Eliminar imágenes del proyecto
echo "Eliminando imágenes del proyecto..."
docker rmi -f practica2_auth-service practica2_api-gateway practica2_frontend 2>/dev/null || true

# Limpiar imágenes colgantes y sin usar
echo "Limpiando imágenes sin usar..."
docker image prune -f

# Limpiar volúmenes no utilizados
echo "Limpiando volúmenes no utilizados..."
docker volume prune -f

# Limpiar redes no utilizadas
echo "Limpiando redes no utilizadas..."
docker network prune -f

# Limpiar cache de build
echo "Limpiando cache de build..."
docker builder prune -f

echo "✅ Limpieza completada. Ahora puedes ejecutar:"
echo "   docker-compose up --build -d"