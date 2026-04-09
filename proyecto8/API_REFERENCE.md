# API Reference - Helpdesk Core

Base URLs:

- Users: http://localhost:3101/api
- Tickets: http://localhost:3102/api
- Assignments: http://localhost:3103/api
- Audit: http://localhost:3104/api

## Health

- GET /health
- GET /health/deep

## Users Service

### POST /users
Body:
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "role": "requester",
  "is_active": true
}

### GET /users
### GET /users/:id
### PUT /users/:id
### DELETE /users/:id

## Tickets Service

### POST /tickets
Body:
{
  "requester_id": 3,
  "title": "No abre VPN",
  "description": "La VPN muestra timeout al autenticar",
  "priority": "HIGH",
  "category": "Network"
}

### GET /tickets
Query params opcionales:
- status=OPEN|ASSIGNED|IN_PROGRESS|RESOLVED|CLOSED
- requester_id=number

### GET /tickets/:id
### PUT /tickets/:id
### DELETE /tickets/:id

### GET /tickets/:id/history
Devuelve historial persistente de cambios de estado y acciones clave.

## Assignments Service

### POST /assignments
Body:
{
  "ticket_id": 1,
  "agent_id": 2,
  "assigned_by": 1,
  "reason": "Escalamiento por prioridad"
}

### GET /assignments
Query params opcionales:
- ticket_id=number
- agent_id=number
- is_active=true|false

### GET /assignments/:id
### PUT /assignments/:id
### DELETE /assignments/:id

## Audit Service

### GET /events?limit=200
Devuelve los ultimos eventos consumidos desde RabbitMQ.

## Convencion de errores

Formato estandar:
{
  "message": "descripcion del error"
}

En validaciones de payload:
{
  "errors": ["detalle 1", "detalle 2"]
}

## Eventos de dominio emitidos

- user.created
- user.updated
- user.deleted
- ticket.created
- ticket.updated
- ticket.status.changed
- ticket.deleted
- ticket.assigned
- assignment.updated
- assignment.deleted
