# SA - Practicas 9 y 10 (Base en proyecto8)

Estructura objetivo implementada:

- `proyecto8/` (referencia, sin modificar)
- `practica9/` (EDA + K3s + Terraform)
- `practica10/` (Monitoreo + Logging + K8s)
- `.github/workflows/ci-cd.yml` (pipeline unico en raiz)
- `docker-compose.yml` (desarrollo local)

## Comandos Git para ramas (exactos)

> Ejecutar desde raiz del repo con working tree limpio.

```bash
git checkout -b legacy-practicas
git push -u origin legacy-practicas

git checkout main

git rm -r Chivo.md ejemplo-fx-service exit Practica1 Practica2 Practica3 Practica4 Practica5 Practica6 PracticaFinal Proyecto1 Proyecto2 proyecto7

# conservar proyecto8, practica9, practica10, .github/workflows/ci-cd.yml, docker-compose.yml, README.md
git add practica9 practica10 proyecto8 .github/workflows/ci-cd.yml docker-compose.yml README.md
git commit -m "chore: clean main for practicas 9-10 with proyecto8 base"
git push origin main
```

Si prefieres mover en lugar de borrar historial en `main`, usa `git mv` hacia una carpeta `legacy/` en `legacy-practicas` y luego limpia en `main`.

## Levantar K3s (VM nueva)

```bash
curl -sfL https://get.k3s.io | sh -
sudo kubectl get nodes
sudo cat /etc/rancher/k3s/k3s.yaml
```

Copiar kubeconfig local y cambiar `127.0.0.1` por IP de la VM.

## Practica9 - Deploy K3s

```bash
kubectl apply -f practica9/k8s/00-namespace.yaml
kubectl apply -f practica9/k8s/10-rabbitmq.yaml
kubectl apply -f practica9/k8s/20-tickets-service.yaml
kubectl apply -f practica9/k8s/21-processor-service.yaml
kubectl apply -f practica9/k8s/22-frontend.yaml
kubectl apply -f practica9/k8s/30-ingress.yaml
```

Hosts local:

```text
<IP_INGRESS> practica9.local
```

## Practica10 - Deploy monitoreo

```bash
kubectl apply -f practica10/k8s/00-namespace.yaml
kubectl apply -f practica10/k8s/10-prometheus.yaml
kubectl apply -f practica10/k8s/11-grafana.yaml
kubectl apply -f practica10/k8s/12-logging.yaml
kubectl apply -f practica10/k8s/30-monitoring-ingress.yaml
```

Hosts local:

```text
<IP_INGRESS> monitoring.local
```

Accesos:

- `http://monitoring.local/prometheus`
- `http://monitoring.local/grafana`
- `http://monitoring.local/kibana`

## CI/CD en GitHub Actions

Archivo: `.github/workflows/ci-cd.yml`

Pipeline:

1. lint/test de servicios practica9
2. build Docker images
3. push opcional a GHCR (si `GHCR_TOKEN` existe)
4. deploy a K3s (si `KUBECONFIG_B64` existe)

Secrets esperados:

- `GHCR_TOKEN` (opcional para push)
- `KUBECONFIG_B64` (obligatorio para deploy)

## Flujo completo E2E (ticket -> evento -> procesamiento -> visualizacion)

1. Abre `http://practica9.local`
2. Crea ticket en el formulario.
3. Frontend llama `POST /api/tickets`.
4. `tickets-service` publica `ticket.created` en RabbitMQ.
5. `processor-service` consume y guarda evento procesado.
6. Frontend consulta `GET /api/processed-events` y muestra resultado.
7. Prometheus scrapea `/metrics`; Grafana muestra dashboard.
8. Logs de ambos servicios se ven en Kibana (`microservices-logs-*`).
