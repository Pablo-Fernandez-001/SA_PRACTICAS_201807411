@echo off
echo 🚀 Iniciando desarrollo local...

REM Verificar si Docker esta corriendo
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker no está corriendo. Por favor inicia Docker Desktop.
    exit /b 1
)

REM Levantar solo la base de datos
echo 📊 Iniciando base de datos...
docker-compose up auth-db -d

REM Esperar a que la base de datos este lista
echo ⏳ Esperando a que la base de datos esté lista...
timeout /t 15 >nul

echo ✅ Base de datos lista!

echo 🎯 Ahora puedes ejecutar los servicios individualmente:
echo   cd auth-service ^&^& npm run dev
echo   cd api-gateway ^&^& npm run dev
echo   cd frontend ^&^& npm run dev

echo.
echo 📝 Credenciales de prueba:
echo   Email: admin@delivereats.com
echo   Password: admin123

pause