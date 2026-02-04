#!/bin/bash

# Script de testing para verificar el funcionamiento del sistema
echo "🧪 Iniciando tests de verificación del sistema..."

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir resultados
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# 1. Verificar que Docker esté corriendo
echo -e "${YELLOW}📋 Verificando Docker...${NC}"
docker info > /dev/null 2>&1
print_result $? "Docker está corriendo"

# 2. Verificar que los contenedores estén arriba
echo -e "${YELLOW}📦 Verificando contenedores...${NC}"

containers=("delivereats-auth-db" "delivereats-auth-service" "delivereats-api-gateway" "delivereats-frontend")
for container in "${containers[@]}"; do
    if docker ps | grep -q "$container"; then
        print_result 0 "Contenedor $container está corriendo"
    else
        print_result 1 "Contenedor $container NO está corriendo"
    fi
done

# 3. Test de health checks
echo -e "${YELLOW}🏥 Verificando health checks...${NC}"

# API Gateway health
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health)
if [ "$response" = "200" ]; then
    print_result 0 "API Gateway health check"
else
    print_result 1 "API Gateway health check (HTTP $response)"
fi

# Frontend accessibility
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$response" = "200" ]; then
    print_result 0 "Frontend accesible"
else
    print_result 1 "Frontend accesible (HTTP $response)"
fi

# 4. Test de login
echo -e "${YELLOW}🔐 Probando login...${NC}"
login_response=$(curl -s -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@delivereats.com","password":"admin123"}')

if echo "$login_response" | grep -q "token"; then
    print_result 0 "Login con credenciales de admin"
else
    print_result 1 "Login con credenciales de admin"
    echo "Respuesta: $login_response"
fi

# 5. Test de registro
echo -e "${YELLOW}📝 Probando registro...${NC}"
test_email="test_$(date +%s)@test.com"
register_response=$(curl -s -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test User\",\"email\":\"$test_email\",\"password\":\"password123\",\"role\":\"CLIENTE\"}")

if echo "$register_response" | grep -q "token"; then
    print_result 0 "Registro de nuevo usuario"
else
    print_result 1 "Registro de nuevo usuario"
    echo "Respuesta: $register_response"
fi

# 6. Verificar base de datos
echo -e "${YELLOW}🗄️  Verificando base de datos...${NC}"
db_check=$(docker-compose exec -T auth-db mysql -u root -ppassword -e "USE auth_db; SELECT COUNT(*) as users FROM users;" 2>/dev/null | tail -1)

if [[ "$db_check" =~ ^[0-9]+$ ]] && [ "$db_check" -gt 0 ]; then
    print_result 0 "Base de datos con usuarios ($db_check usuarios)"
else
    print_result 1 "Base de datos accesible"
fi

echo ""
echo -e "${YELLOW}📊 Resumen de verificación completado${NC}"
echo -e "${GREEN}✅ Si todos los checks pasaron, el sistema está funcionando correctamente${NC}"
echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}🔗 API Gateway: http://localhost:8080/api/health${NC}"
echo ""
echo -e "${YELLOW}📝 Credenciales de prueba:${NC}"
echo -e "   Email: admin@delivereats.com"
echo -e "   Password: admin123"