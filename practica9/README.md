# Practica 9 - Secuencia de Practica 8 sobre K3s

Practica 9 ahora es continuidad directa de `proyecto8`:

- `users-service`
- `tickets-service`
- `assignments-service`
- `audit-service`
- `rabbitmq`
- 3 bases MySQL aisladas (`users_db`, `tickets_db`, `assignments_db`)
- `frontend` de proyecto8 adaptado para consumir rutas por Ingress

## Adaptaciones aplicadas

1. La arquitectura de `proyecto8` se despliega en Kubernetes (`practica9/k8s`).
2. El frontend usa `/api` por Ingress (sin `localhost:310x`).
3. El Ingress permite acceso por IP de la VM y también por hostname local.

## Manifiestos principales

- `00-namespace.yaml`
- `10-rabbitmq.yaml`
- `11-db-init-configmaps.yaml`
- `12-databases.yaml`
- `20-tickets-service.yaml` (users-service)
- `21-processor-service.yaml` (tickets-service)
- `22-frontend.yaml` (assignments-service)
- `23-audit-service.yaml`
- `24-frontend.yaml`
- `30-ingress.yaml`

## Despliegue en K3s

```bash
kubectl apply -f practica9/k8s/00-namespace.yaml
kubectl apply -f practica9/k8s/10-rabbitmq.yaml
kubectl apply -f practica9/k8s/11-db-init-configmaps.yaml
kubectl apply -f practica9/k8s/12-databases.yaml
kubectl apply -f practica9/k8s/20-tickets-service.yaml
kubectl apply -f practica9/k8s/21-processor-service.yaml
kubectl apply -f practica9/k8s/22-frontend.yaml
kubectl apply -f practica9/k8s/23-audit-service.yaml
kubectl apply -f practica9/k8s/24-frontend.yaml
kubectl apply -f practica9/k8s/30-ingress.yaml
```

## Endpoints esperados

- `GET /api/users`
- `POST /api/auth/login`
- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/assignments`
- `GET /api/events`

## Flujo funcional

1. Crear usuario / login en `users-service`.
2. Crear ticket en `tickets-service`.
3. Asignar ticket en `assignments-service`.
4. Ver eventos en `audit-service` consumidos desde RabbitMQ.
5. Operar todo desde frontend de `proyecto8`.
