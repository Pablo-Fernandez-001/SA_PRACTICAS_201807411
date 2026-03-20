# Persona 1 — Plan de Infraestructura (Práctica 6)

> Contexto: Práctica 6 se ejecuta localmente (Docker Compose) pero introduce colas, fidelización y calificaciones. Esta guía lista los cambios de infraestructura necesarios dentro de la rama `feature/k8s-infra` ajustada al alcance local.

## 1. Objetivos
- Extender `docker-compose.yml` para soportar **RabbitMQ**, **Redis** y **nuevos microservicios** (payment, fx, ratings) en entorno local.
- Alinear variables de entorno (`.env`, `.env.docker`) para reflejar colas, promociones y caché.
- Generar documentación operativa mínima (cómo levantar, cómo probar conectividad a colas / cache / DB).

## 2. Cambios requeridos
1. **Docker Compose**
   - Añadir servicios:
     - `rabbitmq`: exponer management UI opcional `15672`, cola `orders_events`.
     - `redis`: para cache FX.
     - `payment-service`, `fx-service`, `ratings-service` (si se maneja desde business-core) referenciando imágenes locales.
   - Crear redes necesarias (bridge única `delivereats-net`).
   - Definir dependencias (`depends_on`) para asegurar orden inicial.

2. **Variables de entorno**
   - Consolidar `.env` raíz con:
     - `RABBITMQ_URL`, `RABBITMQ_QUEUE`.
     - `REDIS_URL`, TTL cache.
     - `PAYMENT_PROVIDER`, `CURRENCY_FALLBACK`.
   - Incluir placeholders para llaves externas (API FX) y credenciales.

3. **Volumes**
   - Volumen para evidencia fotográfica: mapear carpeta host `./storage/evidence:/app/evidence` en delivery-service.
   - Volúmenes persistentes para nuevas DB si se crean (p.ej., `payment_db`).

4. **Healthchecks locales**
   - Declarar `healthcheck` en Compose para RabbitMQ y Redis para detectar arranques fallidos.

5. **Documentación**
   - Actualizar `README.md` (sección Práctica 6) con instrucciones:
     1. `docker compose up --build`.
     2. Validación de colas (`docker exec rabbitmq rabbitmqctl list_queues`).
     3. Prueba de Redis (`docker exec redis redis-cli PING`).
   - Agregar tabla de puertos expuestos y dependencias.

6. **Scripts auxiliares**
   - Si aún no existe, crear `scripts/wait-for.sh` reutilizable para servicios que necesiten colas o cache antes de levantar.

7. **Checklist de QA infra**
   - Verificar que `orders-service` publique en RabbitMQ y `catalog-service` consuma (logs visibles vía `docker compose logs`).
   - Confirmar que `fx-service` guarda respuestas en Redis y que TTL expira correctamente.
   - Probar subida de foto desde delivery-service hacia volumen host.

## 3. Salidas esperadas
- `docker-compose.yml` actualizado + nuevos directorios `storage/` versionados.
- `.env` documentado con comentarios para cada variable agregada.
- Sección en `IMPLEMENTATION_SUMMARY.md` describiendo el soporte infra/local.

## 4. Dependencias
- Coordinación con persona 3 para nombres de colas, rutas API y formato de mensajes.
- Acordar con persona 2 (CI/CD) si algún script local se reutilizará en pipeline.

## 5. Riesgos
- Sobrecarga de puertos locales → definir puertos no conflictivos.
- Volúmenes en Windows requieren rutas absolutas/relativas válidas; documentar ejemplos.
- RabbitMQ/Redis consumen memoria; ajustar recursos si se ejecuta en máquinas con 8GB o menos.

## 6. Extras documentales sin bloquear a otras ramas
1. **Prerequisitos locales**
   - Registrar versiones mínimas de Docker (>=24) y Docker Compose (>=2.24) necesarias para levantar todos los servicios.
   - Documentar comandos básicos (`docker compose up -d`, `docker compose logs -f api-gateway`, `docker compose down -v`).

2. **Plantillas de variables sensibles**
   - Añadir archivos `.env.sample` con valores `FAKE_...` para llaves de FX y tokens de terceros; ayudarán a la persona 3 sin compartir secretos reales.

3. **Tabla de puertos expuestos**

| Servicio            | Puerto host | Puerto contenedor | Notas |
| ------------------- | ----------- | ----------------- | ----- |
| frontend            | 3000        | 3000              | Vite + Tailwind |
| api-gateway         | 8080        | 8080              | Proxy REST/gRPC |
| auth-service        | 5001        | 50051             | gRPC |
| catalog-service     | 3002        | 3002/50052        | REST + gRPC |
| orders-service      | 3003        | 3003              | REST |
| delivery-service    | 3004        | 3004              | REST + subida de fotos |
| payment-service     | 3005        | 3005              | REST |
| fx-service          | 4000        | 4000              | API + Redis |
| rabbitmq (mgmt)     | 15672       | 15672             | usuario/clave `guest` por defecto |
| rabbitmq (amqp)     | 5672        | 5672              | conexión de colas |
| redis               | 6379        | 6379              | cache |

4. **Convenciones para imágenes locales**
   - Documentar nombres como `delivereats/<servicio>:practice6` para que la persona 2 pueda mapearlos fácilmente cuando construya el pipeline.

5. **Notas sobre volúmenes host**
   - Explicar en el README cómo inicializar carpetas `storage/evidence` y `storage/db/*` antes de ejecutar Compose y cómo respaldarlas; servirá cuando se migre a PVC en Proyecto 2.

Utiliza este plan como checklist; marca cada tarea al completar y sincroniza los resultados con la rama principal de práctica antes de avanzar a Fase 2.
