# 🔐 Guía de Gestión - JWT, Usuarios y Base de Datos

## ✅ Verificación de JWT

### El JWT está funcionando correctamente:
- ✅ Se genera al hacer login
- ✅ Contiene datos del usuario (id, email, role, name)
- ✅ Expira en 24 horas
- ✅ Se valida en cada petición al API Gateway
- ✅ Protege endpoints de admin

### Estructura del Token JWT
```
Header.Payload.Signature

Ejemplo decodificado:
{
  "id": 1,
  "email": "admin@delivereats.com",
  "role": "ADMIN",
  "name": "Administrator",
  "iat": 1770257462,      // Timestamp de creación
  "exp": 1770343862       // Timestamp de expiración (24h después)
}
```

## 📋 Comandos Útiles para Gestión

### 1. Ver Todos los Usuarios

**Desde WSL/Bash:**
```bash
docker exec delivereats-auth-db mysql -uroot -ppassword \
  -e "SELECT u.id, u.name, u.email, r.name as role, u.is_active 
      FROM auth_db.users u 
      JOIN auth_db.roles r ON u.role_id = r.id 
      ORDER BY u.id;" 2>&1 | grep -v Warning
```

**Desde PowerShell:**
```powershell
wsl bash -c "docker exec delivereats-auth-db mysql -uroot -ppassword -e 'SELECT * FROM auth_db.users;' 2>&1 | grep -v Warning"
```

### 2. Ver Contraseñas Hasheadas (Bcrypt)

```bash
docker exec delivereats-auth-db mysql -uroot -ppassword \
  -e "SELECT id, email, password FROM auth_db.users;"
```

**Nota:** Las contraseñas están hasheadas con **bcrypt rounds=12**
- Formato: `$2a$12$...`
- NO se pueden "desencriptar" (es un hash unidireccional)
- Solo se pueden comparar con bcrypt.compare()

### 3. Ver Configuración JWT

**Ver clave secreta y expiración:**
```bash
docker exec delivereats-auth-service printenv | grep JWT
```

**Resultado:**
- `JWT_SECRET=delivereats_super_secret_jwt_key_2024`
- `JWT_EXPIRES_IN=24h`

### 4. Ver Roles Disponibles

```bash
docker exec delivereats-auth-db mysql -uroot -ppassword \
  -e "SELECT * FROM auth_db.roles;"
```

**Roles:**
1. ADMIN
2. CLIENTE
3. RESTAURANTE
4. REPARTIDOR

## 🔧 Comandos de Gestión

### Agregar Usuario Manualmente (SQL)

```bash
docker exec -it delivereats-auth-db mysql -uroot -ppassword auth_db
```

Luego ejecutar SQL:
```sql
-- Primero genera un hash de contraseña (desde Node.js)
-- Usa el script update-passwords.js o crea uno nuevo

INSERT INTO users (name, email, password, role_id, is_active) 
VALUES ('Nuevo Usuario', 'nuevo@test.com', '$2a$12$hash...', 2, TRUE);
```

### Cambiar Contraseña de Usuario

```bash
# 1. Generar nuevo hash
docker exec delivereats-auth-service node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('nueva_password', 12).then(hash => console.log(hash));
"

# 2. Actualizar en BD
docker exec delivereats-auth-db mysql -uroot -ppassword -e "
UPDATE auth_db.users 
SET password = 'NUEVO_HASH_AQUI' 
WHERE email = 'usuario@test.com';
"
```

### Cambiar Rol de Usuario

```bash
# CLIENTE=2, ADMIN=1, RESTAURANTE=3, REPARTIDOR=4
docker exec delivereats-auth-db mysql -uroot -ppassword -e "
UPDATE auth_db.users 
SET role_id = 1 
WHERE email = 'usuario@test.com';
"
```

### Desactivar/Activar Usuario

```bash
# Desactivar
docker exec delivereats-auth-db mysql -uroot -ppassword -e "
UPDATE auth_db.users 
SET is_active = FALSE 
WHERE email = 'usuario@test.com';
"

# Activar
docker exec delivereats-auth-db mysql -uroot -ppassword -e "
UPDATE auth_db.users 
SET is_active = TRUE 
WHERE email = 'usuario@test.com';
"
```

### Eliminar Usuario (Permanente)

```bash
docker exec delivereats-auth-db mysql -uroot -ppassword -e "
DELETE FROM auth_db.users 
WHERE email = 'usuario@test.com';
"
```

## 🧪 Probar JWT desde PowerShell

### Obtener Token
```powershell
$body = @{email='admin@delivereats.com'; password='admin123'} | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
$token = $response.data.token
Write-Host "Token: $token"
```

### Usar Token para Obtener Usuarios
```powershell
$headers = @{Authorization="Bearer $token"}
$users = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/users' -Method Get -Headers $headers
$users.data | Format-Table
```

### Validar Token
```powershell
$validateBody = @{token=$token} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/validate' -Method Post -Body $validateBody -ContentType 'application/json'
```

## 🔍 Decodificar JWT Manualmente

**Desde PowerShell:**
```powershell
# Obtener el payload (parte 2 del token)
$payload = $token.Split('.')[1]

# Agregar padding si es necesario
$padding = 4 - ($payload.Length % 4)
if ($padding -lt 4) { $payload += '=' * $padding }

# Decodificar de Base64
$decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
$decoded | ConvertFrom-Json | Format-List
```

**Desde Bash:**
```bash
# Separar el token en partes
PAYLOAD=$(echo $TOKEN | cut -d. -f2)

# Decodificar
echo $PAYLOAD | base64 -d | jq .
```

## 📊 Consultas SQL Útiles

### Ver Estadísticas de Usuarios
```sql
SELECT 
    r.name as role, 
    COUNT(*) as total,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activos
FROM users u 
JOIN roles r ON u.role_id = r.id 
GROUP BY r.name;
```

### Usuarios Creados Hoy
```sql
SELECT * FROM users 
WHERE DATE(created_at) = CURDATE();
```

### Usuarios Modificados Recientemente
```sql
SELECT * FROM users 
ORDER BY updated_at DESC 
LIMIT 10;
```

## 🔐 Ubicación de Archivos de Configuración

### JWT Secret
```
Archivo: Practica2/auth-service/.env.docker
Línea: JWT_SECRET=delivereats_super_secret_jwt_key_2024

Archivo: Practica2/api-gateway/.env.docker
Línea: JWT_SECRET=delivereats_super_secret_jwt_key_2024
```

### Base de Datos
```
Host: localhost (desde host) / auth-db (desde containers)
Puerto: 3306
Usuario: root
Password: password
Database: auth_db
```

### Script SQL Inicial
```
Archivo: Practica2/db/auth_db.sql
Contiene: Estructura de tablas, roles, usuarios iniciales
```

## 🚀 Acceso Rápido

### Conectar a MySQL
```bash
docker exec -it delivereats-auth-db mysql -uroot -ppassword auth_db
```

### Ver Logs de Auth Service
```bash
docker logs delivereats-auth-service -f
```

### Ver Logs de API Gateway
```bash
docker logs delivereats-api-gateway -f
```

### Reiniciar Servicios
```bash
cd /mnt/c/Users/pabda/OneDrive/Escritorio/SA/Practica2
docker compose restart auth-service
docker compose restart api-gateway
```

## 📝 Notas Importantes

### Contraseñas por Defecto
- **Todos los usuarios de prueba:** `admin123`
- **Hash actual:** `$2a$12$HuPSgp8cPX1ZRh5R9.nbcuMR63501uwWeVvKPYu.V4kE34vIPr5/S`

### Cambiar JWT Secret (Producción)
1. Editar `.env.docker` en auth-service y api-gateway
2. Cambiar `JWT_SECRET` a un valor más seguro
3. Reiniciar servicios con `docker compose restart`

### Backup de Base de Datos
```bash
docker exec delivereats-auth-db mysqldump -uroot -ppassword auth_db > backup.sql
```

### Restaurar Backup
```bash
docker exec -i delivereats-auth-db mysql -uroot -ppassword auth_db < backup.sql
```

## ✅ Verificación de Seguridad

### El sistema implementa:
- ✅ Contraseñas hasheadas con bcrypt (rounds=12)
- ✅ JWT para autenticación stateless
- ✅ Validación de tokens en cada request
- ✅ Roles y permisos (RBAC)
- ✅ Endpoints protegidos (solo admin)
- ✅ Soft delete (is_active flag)
- ✅ Timestamps de auditoría (created_at, updated_at)

### Recomendaciones:
- ⚠️ Cambiar JWT_SECRET en producción
- ⚠️ Usar HTTPS en producción
- ⚠️ Implementar rate limiting (ya está configurado)
- ⚠️ Rotar secrets periódicamente
