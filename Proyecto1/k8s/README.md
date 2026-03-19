# DeliverEats Kubernetes Stack

This folder contains the complete infrastructure package for Persona 1. Applying the manifests spins up the full Delivereats platform on a real Kubernetes cluster with isolated databases, messaging middleware, API Gateway, and frontend routing through Ingress + TLS.

## Folder layout

| File | Purpose |
| --- | --- |
| `00-namespace.yaml` | Dedicated `delivereats` namespace |
| `01-secrets.yaml` | Database, JWT, RabbitMQ, and SMTP credentials |
| `02-configmaps.yaml` | Non-sensitive app settings for every microservice + frontend |
| `10-13-*.yaml` | StatefulSets, PVCs, and headless services for the four MySQL databases |
| `20-rabbitmq.yaml`, `21-redis.yaml` | Stateful middleware with persistence and health probes |
| `30-34-*.yaml` | Deployments, Services, and HPAs for backend microservices |
| `40-api-gateway.yaml`, `41-frontend.yaml` | Edge workloads exposed through Ingress |
| `50-ingress.yaml` | HTTPS routing for `delivereats.example.com` and `api.delivereats.example.com` |

## Prerequisites

1. **Cluster add-ons**
   - NGINX Ingress Controller (or update the ingress annotations/class).
   - cert-manager cluster issuer referenced by `cert-manager.io/cluster-issuer: letsencrypt-prod`.
   - Metrics Server for HorizontalPodAutoscaler objects.
2. **Storage classes** named `standard-rwo` (adjust manifests if your cloud provider uses a different name).
3. **Container registry** containing the application images referenced in the Deployments (`gcr.io/PROJECT_ID/...`). Replace with the registry/versions that your CI publishes.

## Applying the stack

```bash
# 1) Update secrets/configs (recommended: keep this file out of source control in real deployments)
vim k8s/01-secrets.yaml
vim k8s/02-configmaps.yaml

# 2) Deploy everything
kubectl apply -f k8s/

# 3) Validate
kubectl get pods,svc,hpa -n delivereats
kubectl get ingress -n delivereats
```

All resources are labeled with `app: delivereats-platform` (namespace label) so you can also use selectors, e.g. `kubectl get all -n delivereats -l app=auth-service`.

### Rollouts & operations

- Rolling updates are the default strategy for every Deployment; rollback is as simple as `kubectl rollout undo deployment/orders-service -n delivereats`.
- Databases, Redis, and RabbitMQ run as StatefulSets with persistent volumes to retain data across pod restarts.
- Every service has readiness/liveness probes aligned with the HTTP or gRPC ports actually exposed by the codebase.
- HorizontalPodAutoscalers are defined for API workloads and frontend to guarantee elasticity once the Metrics Server reports CPU utilization.

### Customization checklist

- Replace placeholder domains `delivereats.example.com` / `api.delivereats.example.com` and the TLS secret name in `50-ingress.yaml`.
- Set the Docker image references to the tags produced by your CI pipeline (Persona 2).
- Keep the `.env.example` in sync so teammates share the same service names and ports when working locally via Docker Compose.

Once these manifests are applied, Persona 2 (CI/CD) can focus on automating image builds + `kubectl apply`, while Persona 3 continues coding locally using Docker Compose without blocking infrastructure work.
