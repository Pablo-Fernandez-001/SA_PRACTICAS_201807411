# Evidencia SOLID - Practica 8

## SRP - Single Responsibility Principle

- users-service/src/controllers/userController.js: solo traduce HTTP a llamadas de negocio.
- users-service/src/services/userService.js: reglas de negocio de usuarios.
- users-service/src/repositories/userRepository.js: acceso a datos SQL.
- assignments-service/src/services/externalClients.js: integracion HTTP entre microservicios.

## OCP - Open/Closed Principle

- tickets-service/src/models/ticketModel.js: validaciones extensibles sin tocar controladores.
- assignments-service/src/services/assignmentService.js: reglas de asignacion se amplian sin romper rutas.

## LSP - Liskov Substitution Principle

- Servicios dependen de metodos de repositorio (create, findById, update, delete), no de detalles de mysql2.
- Se puede sustituir la implementacion de repositorio sin cambiar controladores.

## ISP - Interface Segregation Principle

- tickets-service/src/services/userClient.js expone solo userExists para la necesidad del dominio tickets.
- assignments-service/src/services/externalClients.js separa UsersClient y TicketsClient.

## DIP - Dependency Inversion Principle

- users-service/src/index.js
- tickets-service/src/index.js
- assignments-service/src/index.js

En esos puntos se realiza composicion de dependencias:

1. Se crea repositorio.
2. Se inyecta repositorio en servicio.
3. Se inyecta servicio en controlador.
4. Se inyecta controlador en rutas.

La logica de negocio no crea conexiones ni clientes directamente.
