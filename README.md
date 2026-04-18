# SA - Practicas 9 y 10

Este repositorio ya queda preparado para despliegue automático sobre la VM K3s en Google Cloud.

## Estructura relevante

- [practica9](practica9): EDA con RabbitMQ, frontend React y manifiestos K8s
- [practica10](practica10): monitoreo con Prometheus, Grafana, Kibana y Fluent Bit
- [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml): CI/CD automático en cada push a `main`

## Flujo CI/CD actual

1. Un `push` a `main` dispara GitHub Actions.
2. Se ejecutan `lint` y `test` para los tres componentes de practica9.
3. GitHub Actions se autentica en GCP por OIDC usando Workload Identity Federation.
4. Cloud Build compila y publica las imágenes en Artifact Registry.
5. El workflow obtiene el kubeconfig de la VM K3s en GCP.
6. `kubectl` aplica manifiestos de practica9 y practica10 en la VM.
7. Se verifican los rollouts de los despliegues.

## Entorno cloud

- Proyecto GCP: `saproject201807411`
- VM K3s: `delivereats-k3s-1`
- Zona: `us-central1-a`
- Artifact Registry: `us-central1-docker.pkg.dev/saproject201807411/delivereats`

## URLs de acceso

- `http://practica9.local`
- `http://prometheus.local`
- `http://grafana.local`
- `http://kibana.local`

## Notas

- `k3s.yaml` se ignora en Git.
- El workflow ya no depende de secretos manuales para deploy.
