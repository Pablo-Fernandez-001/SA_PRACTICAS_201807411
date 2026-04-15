# Practica 9 - EDA + K3s

Practica 9 reutiliza el enfoque de `proyecto8` (microservicios Node + RabbitMQ + frontend React), pero en una estructura separada y orientada a despliegue en K3s.

## Estructura

- `backend/tickets-service`: API para crear/listar tickets y publicar `ticket.created`
- `backend/processor-service`: consumidor RabbitMQ y API de eventos procesados
- `frontend`: SPA React
- `k8s`: manifiestos de namespace, deployments, services e ingress
- `terraform`: VM y red base para nodo K3s

## Ejecutar local (Docker)

```bash
cd practica9/backend
docker compose up --build -d
```

```bash
cd ../frontend
npm install
npm run dev
```

## Endpoints

- `POST /api/tickets` (tickets-service)
- `GET /api/tickets` (tickets-service)
- `GET /api/processed-events` (processor-service)
- `GET /health` (ambos servicios)
- `GET /metrics` (ambos servicios)

Payload para crear ticket:

```json
{
  "title": "Error login",
  "description": "No puedo entrar",
  "requester": "user@helpdesk.local"
}
```

## Despliegue K3s

```bash
kubectl apply -f practica9/k8s/00-namespace.yaml
kubectl apply -f practica9/k8s/10-rabbitmq.yaml
kubectl apply -f practica9/k8s/20-tickets-service.yaml
kubectl apply -f practica9/k8s/21-processor-service.yaml
kubectl apply -f practica9/k8s/22-frontend.yaml
kubectl apply -f practica9/k8s/30-ingress.yaml
```

Agregar hosts local para pruebas:

```text
<IP_INGRESS> practica9.local
```

## Terraform

```bash
cd practica9/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

## Flujo completo

1. Usuario crea ticket desde frontend.
2. `tickets-service` persiste en memoria y publica `ticket.created` a RabbitMQ.
3. `processor-service` consume evento y lo registra en memoria.
4. Frontend refresca y muestra ticket + evento procesado.
