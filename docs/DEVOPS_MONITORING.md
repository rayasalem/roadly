# Monitoring & Logging

## Stack (optional)

- **Prometheus** – metrics (when backend exposes `/metrics` via `prom-client` or similar).
- **Grafana** – dashboards; add Prometheus as data source `http://prometheus:9090`.
- **Centralized logging** – use ELK/Loki or cloud (e.g. CloudWatch, Datadog). Application logs should be JSON in production (`LOG_FORMAT=json`) and shipped by your platform.

## Run monitoring locally

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml --profile monitoring up -d
```

- Prometheus: http://localhost:9090  
- Grafana: http://localhost:3000 (default admin/admin).

## Application logging strategy

- **Development:** `LOG_LEVEL=debug`, human-readable logs to stdout.
- **Staging/Production:** `LOG_LEVEL=info` or `warn`, `LOG_FORMAT=json` for parsing. Do not log secrets or PII.
- Middleware: log request id, method, path, status, duration. On error, log stack and sanitized context.

## Metrics to monitor

| Metric | Source | Alert if |
|--------|--------|----------|
| CPU / Memory | Node/container | High sustained usage |
| API latency (p50, p95, p99) | Backend / Nginx | p99 > threshold |
| Error rate (4xx, 5xx) | Backend / Nginx | > 1% or spike |
| Request rate | Nginx / Backend | Sudden drop (outage) |
| /health, /health/ready | Backend | Non-200 |
| Database/Redis (when used) | /health/ready | 503 |

## Adding `/metrics` to the backend

Install `prom-client`, expose a GET `/metrics` route (and optionally exclude from rate limiting), then point Prometheus at `backend:4000` as in `deploy/monitoring/prometheus.yml`.
