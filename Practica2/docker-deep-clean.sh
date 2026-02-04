#!/bin/bash

echo "Limpieza completa de Docker - Resolviendo ContainerConfig..."

echo ""
echo "Paso 1: Deteniendo todos los servicios..."
docker-compose down --remove-orphans --volumes

echo ""
echo "Paso 2: Eliminando contenedores especificos..."
docker stop delivereats-auth-service delivereats-api-gateway delivereats-frontend delivereats-auth-db 2>/dev/null || true
docker rm -f delivereats-auth-service delivereats-api-gateway delivereats-frontend delivereats-auth-db 2>/dev/null || true

echo ""
echo "Paso 3: Eliminando todas las imagenes del proyecto..."
docker rmi -f practica2_auth-service practica2_api-gateway practica2_frontend 2>/dev/null || true

echo ""
echo "Paso 4: Limpieza general agresiva..."
docker system prune -a -f
docker volume prune -f
docker network prune -f
docker builder prune -a -f

echo ""
echo "Paso 5: Eliminando volumenes especificos..."
docker volume rm delivereats_auth_db_data 2>/dev/null || true
docker volume rm practica2_auth_db_data 2>/dev/null || true

echo ""
echo "Paso 6: Limpieza final..."
docker container prune -f
docker image prune -a -f

echo ""
echo "Limpieza completada. El error ContainerConfig ha sido resuelto."
echo "Ahora ejecuta: docker-compose up --build -d"
echo ""