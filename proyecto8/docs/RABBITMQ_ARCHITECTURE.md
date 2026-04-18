# RabbitMQ: Arquitectura y Flujo de Eventos

## 1. ¿Qué es RabbitMQ?

**Message Broker** (intermediario de mensajes) que implementa comunicación **asincrónica publidor-suscriptor**. Permite que los microservicios se comuniquen sin estar acoplados directamente.

### Sin RabbitMQ (acoplamiento fuerte ❌)
```
tickets-service → HTTP → audit-service
                ↓
        Si audit-service cae, tickets-service falla
```

### Con RabbitMQ (desacoplado ✅)
```
tickets-service → AMQP → RabbitMQ → audit-service
                         (cola)    ↓
                    Si audit-service cae, RabbitMQ retiene mensajes
                    hasta que el servicio se recupere
```

---

## 2. Arquitectura en proyecto8

### 2.1 Topología de RabbitMQ

```
┌─────────────────────────────────────────────────────────────┐
│                        RabbitMQ                             │
│                   (puerto 5672 AMQP)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Exchange: helpdesk.events                           │  │
│  │  Tipo: TOPIC (enrutamiento por patrón)              │  │
│  │                                                      │  │
│  │  Patrones de enrutamiento:                          │  │
│  │  ├─ "ticket.*"      → todos los eventos de ticket   │  │
│  │  ├─ "assignment.*"  → todos los eventos de asig.    │  │
│  │  ├─ "user.*"        → todos los eventos de usuario  │  │
│  │  └─ "#"             → TODOS los eventos             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│              ┌───────────┼───────────┐                     │
│              │           │           │                     │
│  ┌───────────▼──┐ ┌──────▼─────┐ ┌──▼────────────┐         │
│  │ audit.queue  │ │notif.queue │ │ tickets.queue │         │
│  │  (durable)   │ │ (durable)  │ │  (durable)   │         │
│  │              │ │            │ │              │         │
│  │ ♯️ Retiene   │ │ ♯️ Retiene  │ │ ♯️ Retiene    │         │
│  │   eventos    │ │   eventos  │ │   eventos    │         │
│  │   si consumer│ │   si       │ │   si         │         │
│  │   cae        │ │  consumer  │ │  consumer    │         │
│  │              │ │   cae      │ │   cae        │         │
│  └──────────────┘ └────────────┘ └──────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Conexión en Docker Compose

```yaml
rabbitmq:
  image: rabbitmq:3.13-management-alpine
  container_name: helpdesk-rabbitmq
  ports:
    - "5672:5672"       # 🔌 AMQP protocol (lo que usan los apps)
    - "15672:15672"     # 🌐 Management UI (http://localhost:15672)
  environment:
    RABBITMQ_DEFAULT_USER: ${RABBITMQ_DEFAULT_USER:-helpdesk}
    RABBITMQ_DEFAULT_PASS: ${RABBITMQ_DEFAULT_PASS:-helpdesk123}
  volumes:
    - rabbitmq_data:/var/lib/rabbitmq

# Los servicios se conectan así:
users-service:
  environment:
    RABBITMQ_URL: amqp://helpdesk:helpdesk123@rabbitmq:5672
    
tickets-service:
  environment:
    RABBITMQ_URL: amqp://helpdesk:helpdesk123@rabbitmq:5672
```

---

## 3. Flujo de datos completo: Crear un ticket

### Paso a Paso

```
┌─ PASO 1: Solicitud HTTP ─────────────────────────┐
│                                                  │
│  Cliente (frontend React)                       │
│       ↓ POST /api/tickets                       │
│  { title: "Mi problema",                        │
│    description: "No funciona el login",         │
│    requester_id: 5,                            │
│    priority: "HIGH" }                           │
│       ↓                                         │
│  tickets-service (express)                      │
│       ↓ Recibe request HTTP                     │
└──────────────────────────────────────────────────┘

┌─ PASO 2: Validación y Persistencia ──────────────┐
│                                                  │
│  ticketService.createTicket(payload)            │
│       ↓                                         │
│  const created = await ticketRepository.create({│
│    title: "Mi problema",                        │
│    description: "No funciona el login",         │
│    requester_id: 5,                            │
│    status: 'OPEN'                              │
│  });                                           │
│       ↓ INSERT INTO tickets VALUES (...)       │
│  MySQL retorna: { id: 42, status: 'OPEN' }    │
│       ↓                                         │
│  Ticket guardado ✅                            │
└──────────────────────────────────────────────────┘

┌─ PASO 3: Publicar evento en RabbitMQ ───────────┐
│                                                  │
│  await eventBus.publish('ticket.created', {    │
│    ticketId: 42,                               │
│    requesterId: 5,                             │
│    title: "Mi problema",                       │
│    status: 'OPEN',                             │
│    timestamp: '2026-04-09T10:30:00Z'          │
│  });                                           │
│       ↓                                         │
│  eventBus conecta a RabbitMQ                   │
│       ↓                                         │
│  channel.publish(                              │
│    exchange: 'helpdesk.events',                │
│    routingKey: 'ticket.created',               │
│    message: JSON.stringify({...}),             │
│    persistent: true                            │
│  );                                            │
│       ↓ Mensaje enviado a RabbitMQ            │
│  ✅ Persistido en disco de RabbitMQ            │
└──────────────────────────────────────────────────┘

┌─ PASO 4: Enrutamiento en RabbitMQ ──────────────┐
│                                                  │
│  RabbitMQ recibe el mensaje                     │
│       ↓                                         │
│  ¿Qué routing key es? → 'ticket.created'      │
│       ↓                                         │
│  ¿Qué colas están suscritas?                   │
│  • helpdesk.audit.queue   (patrón: #)         │
│  • helpdesk.notif.queue   (patrón: ticket.*)  │
│       ↓                                         │
│  Distribuye COPIAS del mensaje:                │
│  • Copia → audit.queue                        │
│  • Copia → notif.queue                        │
│       ↓                                         │
│  ✅ Enrutado a consumidores                    │
└──────────────────────────────────────────────────┘

┌─ PASO 5: Consumo por audit-service ─────────────┐
│                                                  │
│  audit-service.consumer.js                      │
│       ↓ Está escuchando en audit.queue          │
│  channel.consume('helpdesk.audit.queue', ...)  │
│       ↓                                         │
│  Recibe mensaje:                                │
│  {                                             │
│    type: 'ticket.created',                     │
│    data: {                                     │
│      ticketId: 42,                             │
│      requesterId: 5,                           │
│      title: "Mi problema",                     │
│      status: 'OPEN'                            │
│    }                                           │
│  }                                             │
│       ↓                                         │
│  await auditRepository.create({                │
│    event_type: 'ticket.created',               │
│    event_data: JSON.stringify({...}),          │
│    created_at: new Date()                      │
│  });                                           │
│       ↓ INSERT INTO audit_events VALUES (...)  │
│  ✅ Evento registrado en MySQL                 │
│       ↓                                         │
│  channel.ack(msg);  // Confirma a RabbitMQ    │
│  Mensaje eliminado de la cola                  │
└──────────────────────────────────────────────────┘

┌─ PASO 6: Consumo por notifications-service ────┐
│                                                  │
│  notifications-service.consumer.js              │
│       ↓ Está escuchando en notif.queue         │
│  channel.consume('helpdesk.notif.queue', ...)  │
│       ↓                                         │
│  Recibe el MISMO mensaje                        │
│       ↓                                         │
│  Prepara notificación:                          │
│  {                                             │
│    recipient: 'admin@helpdesk.local',          │
│    subject: 'Nuevo ticket creado',             │
│    body: 'Ticket #42: Mi problema (HIGH)',    │
│    type: 'TICKET_CREATED'                      │
│  }                                             │
│       ↓                                         │
│  Envía por email/SMS (implementación futura)   │
│       ↓                                         │
│  channel.ack(msg);  // Confirma a RabbitMQ    │
│  Mensaje eliminado de la cola                  │
└──────────────────────────────────────────────────┘

┌─ PASO 7: Respuesta HTTP al cliente ─────────────┐
│                                                  │
│  tickets-service responde:                      │
│  HTTP 201 Created                              │
│  {                                             │
│    id: 42,                                     │
│    code: "TKT-2026-0042",                      │
│    title: "Mi problema",                       │
│    status: 'OPEN',                             │
│    created_at: '2026-04-09T10:30:00Z'         │
│  }                                             │
│       ↓                                         │
│  Frontend recibe OK ✅                          │
│  GET /api/tickets para refrescar lista         │
│       ↓                                         │
│  Frontend muestra ticket nuevo en grid          │
└──────────────────────────────────────────────────┘
```

---

## 4. Eventos publicados en el sistema

### 4.1 Eventos de tickets-service

| Evento | Cuándo | Datos |
|--------|--------|-------|
| `ticket.created` | Se crea un ticket | `{ticketId, requesterId, title, priority, status, created_at}` |
| `ticket.status.changed` | Se cambia estado | `{ticketId, oldStatus, newStatus, changedBy, changedAt}` |
| `ticket.assigned` | Se asigna a agente | `{ticketId, agentId, assignedAt}` |

### 4.2 Eventos de assignments-service

| Evento | Cuándo | Datos |
|--------|--------|-------|
| `assignment.created` | Se crea asignación | `{assignmentId, ticketId, agentId, assignedBy}` |
| `assignment.reassigned` | Se reasigna | `{assignmentId, oldAgentId, newAgentId, reason}` |

### 4.3 Eventos de users-service

| Evento | Cuándo | Datos |
|--------|--------|-------|
| `user.created` | Se registra usuario | `{userId, email, role, name, created_at}` |
| `user.role.changed` | Cambia rol de usuario | `{userId, oldRole, newRole, changedBy}` |

---

## 5. Consumidores de eventos

### 5.1 Audit-service (consume TODO)

```javascript
// Patrón: "#" = todos los eventos
await channel.bindQueue('helpdesk.audit.queue', 'helpdesk.events', '#');

// Guarda auditoría de CUALQUIER evento
channel.consume('helpdesk.audit.queue', async (msg) => {
  const event = JSON.parse(msg.content.toString());
  
  // Registra en MySQL
  await auditRepository.create({
    event_type: event.type,
    event_data: JSON.stringify(event.data),
    created_at: new Date()
  });
  
  channel.ack(msg);
});
```

**GET /api/events** devuelve el buffer de auditoría:
```bash
curl http://localhost:3104/api/events?limit=200
[
  {
    "id": 1,
    "event_type": "ticket.created",
    "event_data": {...},
    "created_at": "2026-04-09T10:30:00Z"
  },
  ...
]
```

### 5.2 Notifications-service (consume ticket.* y assignment.*)

```javascript
// Patrón: "ticket.*" = ticket.created, ticket.status.changed, etc.
await channel.bindQueue('helpdesk.notif.queue', 'helpdesk.events', 'ticket.*');
await channel.bindQueue('helpdesk.notif.queue', 'helpdesk.events', 'assignment.*');

channel.consume('helpdesk.notif.queue', async (msg) => {
  const event = JSON.parse(msg.content.toString());
  
  // Prepara notificación según evento
  if (event.type === 'ticket.created') {
    // Email: nuevo ticket
  } else if (event.type === 'assignment.created') {
    // Email: ticket asignado a ti
  }
  
  // Guarda en cola de envío (implementación futura)
  await notificationRepository.create({...});
  
  channel.ack(msg);
});
```

---

## 6. Cómo RabbitMQ detecta cambios

### Cambios se publican desde la lógica de negocio:

```javascript
// tickets-service/src/services/ticketService.js

async updateTicketStatus(ticketId, newStatus) {
  // 1. Valida transición de estado
  ticket = await this.ticketRepository.findById(ticketId);
  this.validateStatusTransition(ticket.status, newStatus);
  
  // 2. Guarda en BD
  const oldStatus = ticket.status;
  await this.ticketRepository.update(ticketId, { status: newStatus });
  
  // 3. PUBLICA EVENTO (aquí detecta el cambio)
  await this.eventBus.publish('ticket.status.changed', {
    ticketId,
    oldStatus,
    newStatus,
    changedBy: 'agent@helpdesk.local',
    changedAt: new Date().toISOString()
  });
  
  return { success: true };
}
```

**El cambio se detecta porque:**
1. ✅ Se cambió en BD (UPDATE)
2. ✅ Se publicó evento inmediatamente después
3. ✅ Otros servicios se enterat casi al instante via RabbitMQ
4. ✅ Auditoría registra qué pasó y cuándo

---

## 7. Durabilidad y tolerancia a fallos

### Caso 1: audit-service cae

```
tickets-service publica evento
       ↓
RabbitMQ lo retiene en helpdesk.audit.queue (durable: true)
       ↓
audit-service está caído ❌
       ↓
3 minutos después, audit-service reinicia ✅
       ↓
Reconnecta a RabbitMQ
       ↓
RabbitMQ: "Hay 47 mensajes sin procesar en tu cola"
       ↓
audit-service consume y procesa todos ✅
```

### Configuración de durabilidad:

```javascript
// En cada servicio, al iniciar consumidor:

// Cola durable (sobrevive reinicio de RabbitMQ)
await channel.assertQueue('helpdesk.audit.queue', { 
  durable: true 
});

// Exchange durable
await channel.assertExchange('helpdesk.events', 'topic', { 
  durable: true 
});

// Mensaje persistente (se guarda en disco)
channel.publish(
  exchange, 
  routingKey, 
  Buffer.from(message),
  { persistent: true }  // ← Clave
);
```

---

## 8. Monitoreo de RabbitMQ

### Acceder al Management UI

```
http://localhost:15672
Usuario: helpdesk
Contraseña: helpdesk123

Opciones:
├─ Queues: Ver mensajes pendientes por cola
├─ Connections: Ver qué servicios están conectados
├─ Channels: Ver canales activos
└─ Admin: Crear usuarios/colas/exchanges
```

### Comandos útiles (dentro del contenedor)

```bash
# Ver estado de colas
docker exec helpdesk-rabbitmq rabbitmqctl list_queues name messages consumers

# Ver exchanges
docker exec helpdesk-rabbitmq rabbitmqctl list_exchanges name type durable

# Ver bindings (qué colas escuchan qué exchange)
docker exec helpdesk-rabbitmq rabbitmqctl list_bindings exchange queue routing_key
```

### Ejemplo de salida:

```
Queues:
helpdesk.audit.queue        12  1  (12 mensajes, 1 consumidor activo)
helpdesk.notif.queue         0  1  (0 mensajes, 1 consumidor)
helpdesk.tickets.queue       0  0  (0 mensajes, 0 consumidores)

Exchanges:
helpdesk.events (type: topic, durable: true)

Bindings:
helpdesk.events → helpdesk.audit.queue (routing key: #)
helpdesk.events → helpdesk.notif.queue (routing key: ticket.*, assignment.*)
```

---

## 9. Flujos de eventos complejos

### Escenario: Asignar ticket a agente

```
┌─ Frontend: Click en asignar ───────────────────────┐
│                                                    │
│  POST /api/assignments                            │
│  { ticketId: 42, agentId: 3, assignedBy: 1 }    │
└────────────────────────┬─────────────────────────┘
                         ↓
        ┌─ assignments-service ─┐
        │                       │
        ├─ Valida              │
        │ ├─ ¿Ticket existe?   │
        │ ├─ ¿Agente activo?   │
        │ └─ ¿Rol es agent?    │
        │                       │
        ├─ Guarda en BD        │
        │ INSERT INTO           │
        │ assignments VALUES    │
        │                       │
        ├─ Publica eventos     │
        │ • assignment.created  │
        │ • ticket.assigned     │
        │                       │
        └─→ RabbitMQ exchange  │
           (helpdesk.events)   │
                         ↓
        ┌────────────────┬────────────────┐
        ↓                ↓                 ↓
   audit.queue    notif.queue      tickets.queue
        ↓                ↓                 ↓
   audit-service  notif-service   (sin consumidor
        ↓                ↓         aún en proyecto8)
   Registra      Prepara email
   auditoria     "Ticket #42
                 asignado a ti"
        ↓                ↓
      ✅           ✅ (implementar
   evento              después)
   guardado        
```

---

## 10. Integración con frontend React

El frontend **NO consume RabbitMQ directamente**. En su lugar:

```javascript
// frontend/src/api.js

export async function assignTicket(ticketId, agentId) {
  // 1. HTTP request a assignments-service
  const response = await fetch(`${ASSIGNMENTS_API}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId, agentId, assignedBy: currentUserId })
  });
  
  // 2. assignments-service internamente:
  //    • Valida
  //    • Guarda en BD
  //    • Publica a RabbitMQ
  //    • Retorna HTTP 201
  
  // 3. Frontend refresca datos con GET
  const tickets = await getTickets();
  setTickets(tickets);  // Muestra ticket con status actualizado
}
```

**El flujo es:**
```
Frontend → HTTP → Service → BD → RabbitMQ → Audit/Notif
                                     ↓
                            Capturan evento
                                     ↓
                            Registran cambio
```

---

## 11. Resumen

| Concepto | Explicación |
|----------|-------------|
| **Exchange** | Router que recibe eventos y los distribuye según routing key |
| **Queue** | Cola durable que retiene mensajes si consumidor no está listo |
| **Routing Key** | Patrón que determina a qué colas va un evento (ej: "ticket.*") |
| **Publisher** | Servicio que publica evento (tickets-service, assignments-service) |
| **Consumer** | Servicio que escucha y procesa eventos (audit-service, notif-service) |
| **ACK** | Confirmación de que mensaje fue procesado (se elimina de cola) |
| **Durability** | Garantía de que evento se guarda en disco hasta ser procesado |
| **Async** | Servicio que publica no espera a consumidor (desacoplado) |

RabbitMQ es el **"sistema nervioso"** del proyecto: eventos viajan por aquí y cada servicio reacciona según su rol.

