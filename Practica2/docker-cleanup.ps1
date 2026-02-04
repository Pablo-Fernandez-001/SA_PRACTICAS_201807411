# Docker Cleanup Script for DeliverEats Project
Write-Host "🧹 Iniciando limpieza de Docker..." -ForegroundColor Yellow

# Function to run command with error handling
function Run-Command {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "  ➤ $Description" -ForegroundColor Cyan
    try {
        Invoke-Expression $Command
        Write-Host "    ✓ Completado" -ForegroundColor Green
    }
    catch {
        Write-Host "    ⚠️ $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Stop all containers
Run-Command "docker-compose down --remove-orphans" "Deteniendo contenedores"

# Remove specific containers
$containers = @("delivereats-auth-service", "delivereats-api-gateway", "delivereats-frontend", "delivereats-auth-db")
foreach ($container in $containers) {
    Run-Command "docker rm -f $container" "Eliminando contenedor: $container"
}

# Remove project images
$images = @("practica2_auth-service", "practica2_api-gateway", "practica2_frontend")
foreach ($image in $images) {
    Run-Command "docker rmi -f $image" "Eliminando imagen: $image"
}

# General cleanup
Run-Command "docker image prune -f" "Limpiando imágenes sin usar"
Run-Command "docker volume prune -f" "Limpiando volúmenes sin usar"
Run-Command "docker network prune -f" "Limpiando redes sin usar"
Run-Command "docker builder prune -f" "Limpiando cache de build"

Write-Host ""
Write-Host "✅ Limpieza completada exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ahora ejecuta:" -ForegroundColor Blue
Write-Host "   docker-compose up --build -d" -ForegroundColor White
Write-Host ""
Write-Host "📊 Para monitorear:" -ForegroundColor Blue  
Write-Host "   docker-compose logs -f" -ForegroundColor White
Write-Host ""

# Wait for user input
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")