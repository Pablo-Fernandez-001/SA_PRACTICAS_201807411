# Frontend Login - Guía Rápida

## Acceder al Frontend

```
http://localhost:3000
```

## Usuarios Predefinidos

| Rol | Email | Contraseña | Opción |
|-----|-------|-----------|--------|
| 🔴 Admin | admin@helpdesk.local | admin123! | Click en "Entrar como Administrador" |
| 🔵 Agent 1 | agent@helpdesk.local | agent123! | Click en "Entrar como Agente 1" |
| 🔵 Agent 2 | agent2@helpdesk.local | agent123! | Click en "Entrar como Agente 2" |
| 🟣 Requester | user@helpdesk.local | user123! | Click en "Entrar como Usuario" |
| 🟣 Cliente | customer@helpdesk.local | customer123! | Click en "Entrar como Cliente" |

## Características del Login

✅ **Pantalla de login mejorada** con:
- Formulario manual para ingreso de email/contraseña
- 5 usuarios predefinidos visibles en tarjetas
- Botones rápidos "Entrar como [Usuario]"
- Roles coloreados (admin rojo, agents azul, requesters púrpura)
- Validación visual de errores

✅ **Persistencia de sesión**:
- El usuario se guarda en localStorage
- Al recargar la página, mantienes la sesión
- Botón "Salir" para cerrar sesión

✅ **Dashboard después del login**:
- Muestra nombre del usuario conectado + rol
- Crear usuarios, tickets y asignaciones
- Ver listas de usuarios, tickets y asignaciones
- Cambiar estado de tickets
- Ver historial de cambios

## Pasos para Probar

### 1. Login rápido (recomendado)
```
1. Abre http://localhost:3000
2. Haz click en botón "Entrar como Administrador"
3. ¡Listo! Acceso al dashboard
```

### 2. Login manual
```
1. Ingresa: admin@helpdesk.local
2. Contraseña: admin123!
3. Click en "Entrar"
```

### 3. Crear usuario
```
1. En el dashboard, sección "Crear Usuario"
2. Nombre: "Test User"
3. Email: test@example.com
4. Rol: Requester
5. Click "Guardar usuario"
```

### 4. Crear ticket
```
1. Sección "Crear Ticket"
2. Requester: (selecciona un usuario)
3. Titulo: "Problema con login"
4. Descripción: "No puedo acceder"
5. Prioridad: HIGH
6. Click "Guardar ticket"
→ RabbitMQ publica evento ticket.created
→ audit-service lo registra
```

### 5. Asignar ticket
```
1. Sección "Asignar Ticket"
2. Ticket: (elige uno creado)
3. Agente: (elige agent@helpdesk.local)
4. Asignado por: (elige admin)
5. Click "Crear asignacion"
→ RabbitMQ publica ticket.assigned
→ Estado pasa a ASSIGNED
```

### 6. Ver historial
```
1. En lista "Tickets"
2. Click botón "Historial" de un ticket
3. Aparece sección "Historial de Ticket"
4. Ver todos los cambios de estado con timestamps
```

## Arquitectura de fondo

```
Frontend (React) → HTTP → 4 Microservicios (Node.js)
                              ↓
                          MySQL (3 DBs)
                              ↓
                          RabbitMQ
                              ↓
                      Audit-service + Notif-service
```

**Sin autenticación JWT:** El frontend es para desarrollo. En producción, implementar OAuth2 o JWT con tokens.

## Solución de problemas

| Problema | Solución |
|----------|----------|
| "No puedo logearme" | Verifica que `docker ps` muestra `helpdesk-frontend` en `Healthy` |
| Pantalla en blanco | Abre devtools (F12), revisa Console tab para errores |
| "Email o contraseña incorrectos" | Verifica que escribiste exactamente: `admin@helpdesk.local` y `admin123!` |
| Datos no se cargan en dashboard | Click "Recargar datos" o verifica que microservicios están en puerto 3101-3103 |
| Logout no funciona | Click "Salir" limpia localStorage y vuelve a login |

## Cambios realizados

1. ✅ Agregado estado de autenticación (`isLoggedIn`, `currentUser`)
2. ✅ Creada pantalla de login con 5 usuarios predefinidos
3. ✅ Implementado localStorage para persistencia de sesión
4. ✅ Agregados botones rápidos de login por usuario
5. ✅ Estilos CSS modernos con degradados y animaciones
6. ✅ Validación de email/contraseña
7. ✅ Botón "Salir" en dashboard
8. ✅ Información de usuario logueado en header
