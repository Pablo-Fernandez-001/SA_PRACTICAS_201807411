#!/bin/bash
############################################################################
# DeliverEats — Start/Deploy Script
# Corre esto dentro de la carpeta Proyecto1 en la VM
############################################################################

set -e

echo "========================================="
echo "  🍕 DeliverEats — Deploy en GCP"
echo "========================================="

# Detectar IP pública de la VM
PUBLIC_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null)

if [ -z "$PUBLIC_IP" ]; then
  # Fallback — pedir IP manualmente
  echo "No se pudo detectar la IP pública automáticamente."
  echo -n "Ingresa la IP pública de la VM: "
  read PUBLIC_IP
fi

echo ""
echo "IP pública detectada: $PUBLIC_IP"
echo "API URL: http://$PUBLIC_IP:8080/api"
echo "Frontend URL: http://$PUBLIC_IP:3000"
echo ""

# Actualizar VITE_API_URL en docker-compose.yml
echo "[1/3] Configurando VITE_API_URL para IP pública..."
sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://$PUBLIC_IP:8080/api|g" docker-compose.yml

# Actualizar .env del frontend también
if [ -f frontend/.env ]; then
  sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://$PUBLIC_IP:8080/api|g" frontend/.env
fi

# Build y levantar servicios
echo "[2/3] Construyendo y levantando contenedores (esto puede tardar 5-10 min)..."
docker compose down 2>/dev/null || true
docker compose up -d --build

echo ""
echo "[3/3] Esperando que los servicios estén listos..."
echo "Esto puede tardar 2-3 minutos mientras las DBs inicializan..."

# Esperar a que el API Gateway esté listo
MAX_WAIT=180
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if curl -s http://34.55.27.36:8080/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 5
  WAITED=$((WAITED + 5))
  echo "  Esperando... ($WAITED/$MAX_WAIT seg)"
done

echo ""
echo "========================================="
echo "  ✅ DeliverEats desplegado en GCP"
echo "========================================="
echo ""
echo "  🌐 Frontend:  http://$PUBLIC_IP:3000"
echo "  🔌 API:       http://$PUBLIC_IP:8080/api"
echo "  ❤️  Health:    http://$PUBLIC_IP:8080/api/health"
echo ""
echo "  Usuarios de prueba:"
echo "    admin@delivereats.com / admin123  (ADMIN)"
echo "    cliente@test.com / admin123       (CLIENTE)"
echo "    restaurant@test.com / admin123    (RESTAURANTE)"
echo "    delivery@test.com / admin123      (REPARTIDOR)"
echo ""
echo "  Para ver logs:  docker compose logs -f"
echo "  Para detener:   docker compose down"
echo ""
