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
kubectl apply -f practica10/k8s/15-kafka.yaml
kubectl apply -f practica10/k8s/30-monitoring-ingress.yaml
```

## Verificacion

```bash
kubectl -n monitoring get pods
kubectl -n monitoring get svc
kubectl -n monitoring rollout status deploy/prometheus
kubectl -n monitoring rollout status deploy/grafana
kubectl -n monitoring rollout status ds/fluent-bit
kubectl -n monitoring rollout status deploy/kibana
```

Agregar hosts:

```text
<IP_INGRESS> prometheus.local
<IP_INGRESS> grafana.local
<IP_INGRESS> kibana.local
<IP_INGRESS> kafka.local
```

Accesos:

- `http://prometheus.local`
- `http://grafana.local` (admin/admin123)
- `http://kibana.local`
- `http://kafka.local/api/kafka`

## Kafka listo sin configuracion manual

El manifiesto `15-kafka.yaml` ahora despliega:

1. Broker compatible con Kafka API (Redpanda) en `kafka.monitoring.svc.cluster.local:9092`.
2. Kafka UI preconfigurada al broker (sin llenar formulario).
3. Productor de demo (`kafka-demo-producer`) que envia eventos cada 5 segundos al topic `practica10-events`.

Validacion rapida:

```bash
kubectl -n monitoring get pods | grep kafka
```

En Kafka UI abre `Topics -> practica10-events -> Messages` y deben aparecer mensajes automaticamente.

## Flujo de logs

1. Microservicios de `practica9` escriben logs stdout.
2. Fluent Bit (DaemonSet) lee `/var/log/containers/*.log` con parser CRI.
3. Fluent Bit envia logs a Elasticsearch 8 sin `_type`.
4. Elasticsearch crea indices diarios `microservices-logs-*`.
5. El Job `kibana-data-view` crea automaticamente el data view `microservices-logs-*`.
6. Kibana muestra los logs desde Discover usando `@timestamp`.

## Dashboard esperado

Dashboard en Grafana: `Practica9 - EDA Overview`

- Totales actuales: `helpdesk_tickets_created_total` y `helpdesk_assignments_created_total`
- Actividad reciente: `increase(...[5m])`
- Salud de targets: `up{job=~"users-service|tickets-service|assignments-service|audit-service"}`

## Validacion rapida de observabilidad

Prometheus:

```bash
kubectl -n monitoring exec deploy/prometheus -- wget -qO- "http://localhost:9090/api/prometheus/api/v1/query?query=up"
kubectl -n monitoring exec deploy/prometheus -- wget -qO- "http://localhost:9090/api/prometheus/api/v1/query?query=helpdesk_tickets_created_total"
kubectl -n monitoring exec deploy/prometheus -- wget -qO- "http://localhost:9090/api/prometheus/api/v1/query?query=helpdesk_assignments_created_total"
```

Grafana:

1. Crear un ticket y una asignacion desde la app.
2. Abrir `Practica9 - EDA Overview`.
3. Confirmar que suben los totales y que los paneles de ultimos 5 minutos muestran actividad.

Kibana y Elasticsearch:

```bash
kubectl -n monitoring logs ds/fluent-bit --tail=80
kubectl -n monitoring exec deploy/elasticsearch -- curl -s "http://localhost:9200/_cat/indices?v"
kubectl -n monitoring logs job/kibana-data-view
```

En Kibana abre Discover con el data view `microservices-logs-*` y rango `Last 15 minutes`.
