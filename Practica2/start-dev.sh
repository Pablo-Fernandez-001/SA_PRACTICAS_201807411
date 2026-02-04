#!/bin/bash

# Script para desarrollo local
echo "🚀 Iniciando desarrollo local..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Levantar solo la base de datos
echo "📊 Iniciando base de datos..."
docker-compose up auth-db -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 15

# Verificar conexión a la base de datos
while ! docker-compose exec auth-db mysqladmin ping -h"localhost" --silent > /dev/null 2>&1; do
    echo "⏳ Esperando conexión a la base de datos..."
    sleep 5
done

echo "✅ Base de datos lista!"

echo "🎯 Ahora puedes ejecutar los servicios individualmente:"
echo "  cd auth-service && npm run dev"
echo "  cd api-gateway && npm run dev" 
echo "  cd frontend && npm run dev"

echo ""
echo "📝 Credenciales de prueba:"
echo "  Email: admin@delivereats.com"
echo "  Password: admin123"