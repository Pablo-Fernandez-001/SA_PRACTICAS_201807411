@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   DeliverEats - Inicio Automatico
echo ========================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Docker no esta instalado o no esta corriendo
    echo    Por favor instala Docker Desktop y ejecuta este script de nuevo
    pause
    exit /b 1
)

echo ✅ Docker detectado

echo.
echo ⏳ Verificando Docker Compose...
docker-compose --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Docker Compose no esta disponible
    pause
    exit /b 1
)

echo ✅ Docker Compose detectado

echo.
echo 🧹 Limpiando contenedores existentes...
call docker-cleanup.bat

echo.
echo 🔨 Construyendo e iniciando servicios...
docker-compose up --build -d

echo.
echo ⏳ Esperando que los servicios inicien...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Verificando estado de servicios...
docker-compose ps

echo.
echo ========================================
echo   DeliverEats iniciado exitosamente!
echo ========================================
echo.
echo 🌐 Servicios disponibles:
echo    Frontend:     http://localhost:3000
echo    API Gateway:  http://localhost:8080/health
echo    Database:     localhost:3306
echo.
echo 👤 Usuarios de prueba:
echo    Admin:   admin@delivereats.com / password
echo    Cliente: juan@cliente.com / password
echo.
echo 📊 Para ver logs:
echo    docker-compose logs -f
echo.
echo 🛑 Para detener:
echo    docker-compose down
echo.

pause