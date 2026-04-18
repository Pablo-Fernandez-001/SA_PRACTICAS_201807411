# Practica 8 - Desarrollo Core

Sistema de soporte tecnico (mesa de ayuda) orientado a eventos, implementado como microservicios desacoplados y listo para demostracion local con Docker Compose.

## 1) Alcance implementado

Este proyecto cumple el objetivo de Practica 8:

1. Logica de negocio core para Usuarios, Tickets y Asignaciones.
2. Arquitectura modular con separacion por capas.
3. Contenerizacion por servicio y orquestacion local completa.
4. Preparacion para EDA con publicacion/consumo de eventos.
5. Evidencia de trabajo agil y evidencia SOLID.
6. Frontend funcional conectado a APIs reales para la demo.

## 2) Arquitectura general

- users-service: CRUD de usuarios y validacion de roles.
- tickets-service: CRUD de tickets, estados, prioridad, categoria e historial de estado.
- assignments-service: asignacion de tickets a agentes, validaciones cruzadas y reasignacion segura.
- audit-service: consumidor de eventos para trazabilidad operativa.
- RabbitMQ: bus de eventos topic exchange helpdesk.events.
- MySQL aislado por microservicio (3 BD independientes).
- frontend: panel web para operar el flujo completo sin usar mocks.

## 3) Estructura de carpetas

proyecto8/
  assignments-service/
  audit-service/
  db/
  docs/
  frontend/
  scripts/
  tickets-service/
  users-service/
  cypress/
  docker-compose.yml
  README.md
  API_REFERENCE.md
  SOLID_EVIDENCE.md
  EXECUTION_GUIDE.md
  .env.example

## 4) Tecnologias usadas

- Runtime backend: Node.js 20
- Framework API: Express
- BD: MySQL 8.0
- Mensajeria: RabbitMQ 3.13 (management)
- Frontend: React + Vite
- Tests E2E API: Cypress
- Contenedores: Docker + Docker Compose

## 5) Variables de entorno

Copiar .env.example a .env en la raiz y ajustar si deseas.

Variables clave:

- MYSQL_ROOT_PASSWORD
- RABBITMQ_DEFAULT_USER
- RABBITMQ_DEFAULT_PASS

Los servicios consumen estas variables desde docker-compose.yml.

## 6) Ejecucion con Docker Compose

### 6.1 Levantar todo

docker compose up --build -d

### 6.2 Verificar estado

docker compose ps

### 6.3 Smoke test automatico

PowerShell:

./scripts/smoke-test.ps1

Bash:

./scripts/smoke-test.sh

### 6.4 Apagar entorno

docker compose down -v

## 7) Ejecucion sin Docker (opcional)

1. Levantar solo infraestructura (MySQLs + RabbitMQ) con compose parcial, o instalarla localmente.
2. En cada servicio ejecutar:
   npm install
   npm start
3. En frontend ejecutar:
   npm install
   npm run dev

Requiere configurar DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME y EVENT_BUS_URL por servicio.

## 8) URLs locales

- Frontend: http://localhost:3000
- Users API: http://localhost:3101/api
- Tickets API: http://localhost:3102/api
- Assignments API: http://localhost:3103/api
- Audit API: http://localhost:3104/api
- RabbitMQ UI: http://localhost:15672

Credenciales base RabbitMQ:

- usuario: helpdesk
- password: helpdesk123

Usuarios seed en users_db:

- admin@helpdesk.local (admin)
- agent1@helpdesk.local (agent)
- requester@helpdesk.local (requester)

### 8.1 Mapa rapido localhost por puerto

| Puerto | Base URL | Servicio | Uso |
|---|---|---|---|
| 3000 | http://localhost:3000 | Frontend (React) | UI para crear usuarios, tickets, asignaciones e historial |
| 3101 | http://localhost:3101/api | users-service | CRUD de usuarios |
| 3102 | http://localhost:3102/api | tickets-service | CRUD de tickets + cambio de estado + historial |
| 3103 | http://localhost:3103/api | assignments-service | CRUD de asignaciones y validaciones cruzadas |
| 3104 | http://localhost:3104/api | audit-service | Consulta de eventos ingeridos |
| 15672 | http://localhost:15672 | RabbitMQ Management | Monitoreo de colas, exchanges, bindings |
| 5672 | amqp://localhost:5672 | RabbitMQ AMQP | Conexion interna de microservicios al bus |

### 8.2 Que enviar y que recibes (request/response)

#### users-service (http://localhost:3101/api)

POST /users

Enviar JSON:

{
   "name": "Juan Perez",
   "email": "juan@example.com",
   "role": "requester"
}

Recibes:
- 201 con usuario creado (id, name, email, role, is_active, created_at)
- 409 si el email ya existe
- 400 si faltan campos o role invalido

GET /users

Enviar: sin body

Recibes:
- 200 con arreglo de usuarios

GET /users/:id

Enviar: id en path

Recibes:
- 200 con usuario
- 404 si no existe

PUT /users/:id

Enviar JSON (campos a actualizar):

{
   "name": "Juan Actualizado",
   "role": "agent",
   "is_active": true
}

Recibes:
- 200 con usuario actualizado
- 404 si no existe

DELETE /users/:id

Enviar: id en path

Recibes:
- 200 confirmacion de borrado
- 404 si no existe

Health:
- GET /health
- GET /health/deep

#### tickets-service (http://localhost:3102/api)

POST /tickets

Enviar JSON:

{
   "requester_id": 3,
   "title": "No funciona el login",
   "description": "Error al iniciar sesion",
   "priority": "HIGH",
   "category": "Auth"
}

Recibes:
- 201 con ticket creado (id, code, status=OPEN, etc)
- 400 por validacion
- 503 si users-service no disponible para validar requester

GET /tickets

Enviar: sin body

Recibes:
- 200 con arreglo de tickets

GET /tickets/:id

Recibes:
- 200 con ticket
- 404 si no existe

PUT /tickets/:id

Enviar JSON para cambio de estado u otros campos:

{
   "status": "IN_PROGRESS"
}

Recibes:
- 200 con ticket actualizado
- 400 si transicion de estado invalida

DELETE /tickets/:id

Recibes:
- 200 confirmacion de borrado
- 404 si no existe

GET /tickets/:id/history

Enviar: id en path

Recibes:
- 200 con historial de estado del ticket (status, message, created_at)

Health:
- GET /health
- GET /health/deep

#### assignments-service (http://localhost:3103/api)

POST /assignments

Enviar JSON:

{
   "ticket_id": 10,
   "agent_id": 2,
   "assigned_by": 1,
   "reason": "Escalamiento"
}

Recibes:
- 201 con asignacion creada
- 400 por payload invalido
- 404 si ticket o agente no existe
- 409 si ticket cerrado o agente invalido
- 503 si tickets-service o users-service no disponible

GET /assignments

Recibes:
- 200 con arreglo de asignaciones

GET /assignments/:id

Recibes:
- 200 con asignacion
- 404 si no existe

PUT /assignments/:id

Enviar JSON (por ejemplo reasignacion):

{
   "agent_id": 4,
   "reason": "Cambio de turno"
}

Recibes:
- 200 con asignacion actualizada
- 404 si no existe

DELETE /assignments/:id

Recibes:
- 200 confirmacion de borrado logico/fisico segun regla
- 404 si no existe

Health:
- GET /health
- GET /health/deep

#### audit-service (http://localhost:3104/api)

GET /events?limit=200

Enviar: sin body (query param opcional limit)

Recibes:
- 200 con eventos ingeridos desde RabbitMQ
- Ejemplo de eventos: ticket.created, ticket.assigned, ticket.status.changed

Health:
- GET /health

### 8.3 RabbitMQ: que enviar y que recibes

UI de administracion:
- URL: http://localhost:15672
- Usuario: helpdesk
- Password: helpdesk123

Los microservicios publican eventos y audit-service consume:

- Exchange: helpdesk.events (topic)
- Routing keys comunes:
   - user.created
   - ticket.created
   - ticket.status.changed
   - ticket.assigned

Que "envias" a RabbitMQ:
- Mensajes JSON de eventos desde users/tickets/assignments services.

Que "recibes" desde RabbitMQ:
- audit-service recibe eventos y los expone por GET /api/events.

## 9) Flujo funcional de punta a punta

1. Crear o reutilizar usuario requester.
2. Crear ticket con requester_id valido.
3. Crear asignacion con ticket_id, agent_id y assigned_by.
4. assignments-service cambia el ticket a ASSIGNED via tickets-service.
5. Consultar historial del ticket para evidenciar trazabilidad.
6. Validar eventos en audit-service (ticket.created, ticket.assigned, etc).

## 10) Frontend

El panel web permite:

1. Crear usuarios.
2. Crear tickets.
3. Asignar tickets.
4. Cambiar estado de ticket.
5. Consultar historial de ticket.
6. Ver listas de usuarios, tickets y asignaciones.

Todo conectado a las APIs reales.

## 11) Endpoints

Resumen rapido (detalle completo en API_REFERENCE.md):

- users-service: POST/GET/GET:id/PUT:id/DELETE:id en /api/users
- tickets-service: POST/GET/GET:id/PUT:id/DELETE:id en /api/tickets
- tickets-service: GET /api/tickets/:id/history
- assignments-service: POST/GET/GET:id/PUT:id/DELETE:id en /api/assignments
- health checks en /api/health y deep checks en /api/health/deep

## 12) Logica de asignacion

Reglas implementadas:

1. ticket_id debe existir.
2. No se asignan tickets en estado RESOLVED o CLOSED.
3. agent_id debe pertenecer a usuario activo con rol agent.
4. assigned_by debe ser admin o agent.
5. Se desactivan asignaciones activas previas del ticket antes de crear una nueva.
6. Se actualiza estado del ticket a ASSIGNED.

## 13) SOLID y arquitectura limpia

Se documenta en detalle en SOLID_EVIDENCE.md.

Puntos clave:

1. SRP: controllers, services, repositories y clients separados.
2. DIP: composicion de dependencias en cada index.js.
3. OCP: validadores y servicios extensibles.

## 14) Puntos preparados para eventos futuros

Publicaciones actuales:

- user.created, user.updated, user.deleted
- ticket.created, ticket.updated, ticket.status.changed, ticket.deleted
- ticket.assigned, assignment.updated, assignment.deleted

Puntos de extension recomendados:

1. Consumidor en tickets-service para reglas automatas (SLA, escalamiento).
2. Consumidor en notifications-service futuro (correo/chat).
3. Proyecciones read-model para reportes sin cargar servicios transaccionales.

## 15) Cambios grandes aplicados

1. Se agrego frontend funcional integrado al ecosistema Docker.
2. Se agrego historial persistente de tickets con endpoint dedicado.
3. Se robustecio manejo de errores (400/409/503) en lugar de solo 500.
4. Se mejoro validacion cruzada en asignaciones y tickets.
5. Se parametrizaron secretos en docker-compose usando variables.

## 16) Evidencia agil

- docs/kanban.md
- docs/dailys.md

## 17) Pruebas

1. Smoke test script para flujo completo.
2. Prueba E2E Cypress en cypress/e2e/api-helpdesk.cy.js.

Para ejecutar pruebas:

npm install
npm run test:all


#### TEST:
OK http://localhost:3101/api/health
OK http://localhost:3101/api/health/deep
OK http://localhost:3102/api/health
OK http://localhost:3102/api/health/deep
OK http://localhost:3103/api/health
OK http://localhost:3103/api/health/deep
OK http://localhost:3104/health
OK http://localhost:3104/api/health
OK http://localhost:3104/api/events
OK http://localhost:15672