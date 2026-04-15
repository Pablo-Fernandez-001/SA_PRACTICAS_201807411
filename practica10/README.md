# Practica 10 - CI/CD + Observabilidad

Practica 10 agrega pipeline CI/CD en la raiz del repo y stack de monitoreo sobre K3s.

## Estructura

- `monitoring/prometheus`: configuracion de scrapes
- `monitoring/grafana`: datasource y dashboard
- `monitoring/kibana`: config base de Fluent Bit para logs
- `k8s`: manifiestos para Prometheus, Grafana, ELK y ingress

## Desplegar monitoreo

```bash
kubectl apply -f practica10/k8s/00-namespace.yaml
kubectl apply -f practica10/k8s/10-prometheus.yaml
kubectl apply -f practica10/k8s/11-grafana.yaml
kubectl apply -f practica10/k8s/12-logging.yaml
kubectl apply -f practica10/k8s/30-monitoring-ingress.yaml
```

## Verificacion

```bash
kubectl -n monitoring get pods
kubectl -n monitoring get svc
```

Agregar hosts:

```text
<IP_INGRESS> monitoring.local
```

Accesos:

- `http://monitoring.local/prometheus`
- `http://monitoring.local/grafana` (admin/admin123)
- `http://monitoring.local/kibana`

## Flujo de logs

1. Microservicios de `practica9` escriben logs stdout.
2. Fluent Bit (DaemonSet) lee `/var/log/containers/*.log`.
3. Fluent Bit envia logs a Elasticsearch.
4. Kibana consulta indice `microservices-logs-*`.

## Dashboard esperado

Dashboard en Grafana: `Practica9 - EDA Overview`

- `tickets_total`
- `processed_events_total`
