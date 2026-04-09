# Frontend Login - Guía Actualizada (v2)

## 🎯 Acceder al Frontend

```
http://localhost:3000
```

---

## 👥 Usuarios Predefinidos

| Rol | Email | Contraseña | Rol |
|-----|-------|-----------|-----|
| 🔴 Admin | admin@helpdesk.local | admin123! | admin |
| 🔵 Agent 1 | agent@helpdesk.local | agent123! | agent |
| 🔵 Agent 2 | agent2@helpdesk.local | agent123! | agent |
| 🟣 Requester | user@helpdesk.local | user123! | requester |
| 🟣 Cliente | customer@helpdesk.local | customer123! | requester |

---

## 🆕 Nuevas Características (v2.0)

### 1️⃣ Sistema de Tabs (Login / Registro)

La pantalla de login ahora tiene **2 pestañas**:

**Pestaña 1: "🔐 Inicia Sesión"**
- Formulario manual (email + contraseña)
- 5 usuarios predefinidos con credenciales visibles
- Botones rápidos "Entrar como [Nombre]"
- ¡De un click accedes!

**Pestaña 2: "✍️ Registrate"**
- Formulario para crear cuenta nueva:
  - Nombre completo
  - Email
  - Contraseña
  - Rol: Usuario / Agente / Administrador
- Crea el nuevo usuario en la BD backend
- Después de registrarse, vuelve automat. a Login para acceder

### 2️⃣ Enlaces de Servicios (Abre en nueva pestaña)

Debajo del formulario de login hay **5 botones de acceso rápido**:

| Icono | Servicio | URL | Descripción |
|-------|----------|-----|-------------|
| 🐰 | RabbitMQ Management | http://localhost:15672 | Monitorear colas, exchanges, eventos |
| 💚 | Users Service Health | http://localhost:3101/health | Estado del servicio de usuarios |
| 🎫 | Tickets Service Health | http://localhost:3102/health | Estado del servicio de tickets |
| 👥 | Assignments Service Health | http://localhost:3103/health | Estado del servicio de asignaciones |
| 📋 | Audit Events | http://localhost:3104/api/events | Ver buffer de eventos registrados |

**📌 Tip:** Click derecho en cualquier botón → "Abrir en nueva pestaña" para no salir del login

#### Credenciales RabbitMQ
```
Usuario: helpdesk
Contraseña: helpdesk123
```

---

## 📋 Flujo Completo: De 0 a Funcional

### Paso 1: Acceder
```
1. Abre http://localhost:3000
2. Ves la pantalla de login con 2 pestañas
```

### Paso 2: Verificar RabbitMQ
```
1. Click en botón "🐰 RabbitMQ Management"
2. Nueva pestaña abre http://localhost:15672
3. Login: helpdesk / helpdesk123
4. Verifica: "Queues" debe mostrar 3 colas (audit, notif, tickets)
```

### Paso 3: Login Rápido
```
1. En pestaña del login, pestaña "🔐 Inicia Sesión"
2. Click en botón "Entrar como Administrador"
3. ¡Listo! Acceso al dashboard
```

### Paso 4: Crear Usuario
```
En el dashboard:
1. Sección "Crear Usuario"
2. Nombre: "test_user"
3. Email: test@example.com
4. Rol: "Requester"
5. Click "Guardar usuario"
→ Nuevo usuario aparece en lista
→ Evento se publica a RabbitMQ
```

### Paso 5: Ver Eventos en RabbitMQ
```
1. Click en botón "📋 Audit Events"
2. Nueva pestaña abre http://localhost:3104/api/events
3. Verifica JSON con eventos "user.created"
```

### Paso 6: Crear Ticket
```
En el dashboard:
1. Sección "Crear Ticket"
2. Requester: (elige el usuario creado)
3. Titulo: "Email no funciona"
4. Descripción: "No recibo correos"
5. Prioridad: HIGH
6. Categoria: General
7. Click "Guardar ticket"
→ Ticket creado con status OPEN
→ Evento ticket.created publicado
```

### Paso 7: Asignar Ticket
```
En el dashboard:
1. Sección "Asignar Ticket"
2. Ticket: #{ticket_id} Email no funciona
3. Agente: agent@helpdesk.local
4. Asignado por: admin@helpdesk.local
5. Motivo: "Escalación nivel 2"
6. Click "Crear asignacion"
→ Ticket pasa a status ASSIGNED
→ Evento ticket.assigned publicado
```

### Paso 8: Ver Historial
```
En el dashboard:
1. Lista "Tickets"
2. Click botón "Historial" del ticket
3. Aparece sección "Historial de Ticket"
4. Ves cambios de estado:
   - Created → OPEN
   - Assigned → ASSIGNED
   (con timestamps)
```

### Paso 9: Cambiar Estado
```
En el dashboard:
1. Lista "Tickets"
2. Dropdown de status (muestra "ASSIGNED")
3. Selecciona "IN_PROGRESS"
4. Evento ticket.status.changed publicado
5. Historial se actualiza
```

### Paso 10: Verificar Auditoría Completa
```
1. Click en botón "📋 Audit Events"
2. Verifica JSON con múltiples eventos:
   - user.created
   - ticket.created
   - assignment.created
   - ticket.assigned
   - ticket.status.changed
```

---

## 🛑 Solución de Problemas

| Problema | Solución |
|----------|----------|
| "Email o contraseña incorrectos" | Verifica que escribas exactamente email + contraseña |
| Botones de servicios no abren | Verifica que `docker ps` muestra todos los servicios Healthy |
| RabbitMQ no carga | Usuario: `helpdesk`, Contraseña: `helpdesk123` (sin comillas) |
| Registro no funciona | Verifica que users-service esté corriendo: `http://localhost:3101/health` |
| Datos no cargan en dashboard | Click "Recargar datos" o recarga la página (F5) |
| Sesión se pierde | localStorage borrada: Login nuevamente |

---

## 🏗️ Arquitectura de Fondo

```
┌── FRONTEND (React + Vite)
│   └─ Login Tabs + Service Buttons
│   └─ Dashboard (después de login)
│
├── HTTP Calls (JSON)
│   ↓
├── 4 MICROSERVICIOS (Node.js/Express)
│   ├─ Users Service (3101)
│   ├─ Tickets Service (3102)
│   ├─ Assignments Service (3103)
│   └─ Audit Service (3104)
│
├── MySQL (3 Databases)
│   ├─ users_db
│   ├─ tickets_db
│   └─ assignments_db
│
└── RabbitMQ (Port 5672, UI 15672)
    └─ Exchange: helpdesk.events
    │  ├─ Queue: audit
    │  ├─ Queue: notifications
    │  └─ Queue: tickets
    └─ Events: ticket.created, ticket.assigned, ticket.status.changed
```

---

## 📊 Estados del Sistema

### Verificar Salud de Servicios
```bash
# Health checks (abre URLs en navegador)
http://localhost:3101/health    # Users
http://localhost:3102/health    # Tickets
http://localhost:3103/health    # Assignments
http://localhost:3104/health    # Audit
```

### Ver Eventos en RabbitMQ
```bash
# Management UI
http://localhost:15672

# API de Audit
http://localhost:3104/api/events?limit=200
```

---

## 💡 Consejos de Testing

1. **Abre múltiples pestañas:**
   - Pestaña 1: Dashboard (http://localhost:3000)
   - Pestaña 2: RabbitMQ (http://localhost:15672)
   - Pestaña 3: Audit Events (http://localhost:3104/api/events)
   - Mientras cambias datos en dashboard, ve los eventos aparecer en RabbitMQ + Audit

2. **Prueba roles diferentes:**
   - Login como admin → gestionas usuarios
   - Login como agent → asignas tickets
   - Login como requester → creas tickets

3. **Simula fallo de servicio:**
   - `docker compose stop tickets-service`
   - Intenta crear ticket → verás error 503 (service unavailable)
   - `docker compose start tickets-service`
   - Intentar de nuevo → funciona

---

## 📝 Cambios en v2.0

✅ Agregado sistema de tabs (Login / Registro)
✅ Agregado formulario de registro en frontend
✅ Agregados 5 botones para abrir servicios en nuevas pestañas
✅ Mejorados estilos CSS de tabs
✅ Documentación actualizada con flujo completo
