# MechNow DevOps

This folder and the repo root contain everything to run MechNow in a **production-like, scalable, and maintainable** way.

## Quick links

| Topic | Document |
|-------|----------|
| Deployment architecture | [DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./DEVOPS_DEPLOYMENT_ARCHITECTURE.md) |
| CI/CD (GitHub Actions) | [DEVOPS_CI_CD.md](./DEVOPS_CI_CD.md) |
| Infrastructure & config | [DEVOPS_INFRASTRUCTURE.md](./DEVOPS_INFRASTRUCTURE.md) |
| Monitoring & logging | [DEVOPS_MONITORING.md](./DEVOPS_MONITORING.md) |
| Scaling | [DEVOPS_SCALING.md](./DEVOPS_SCALING.md) |
| Security | [DEVOPS_SECURITY.md](./DEVOPS_SECURITY.md) |
| Backup & restore | [DEVOPS_BACKUP_RESTORE.md](./DEVOPS_BACKUP_RESTORE.md) |
| Folder structure | [DEVOPS_FOLDER_STRUCTURE.md](./DEVOPS_FOLDER_STRUCTURE.md) |

## Architecture (summary)

```
[ Internet ] → [ Nginx :80/:443 ] → /api/* → [ Backend :4000 ]
                                    → /     → [ Frontend (SPA) ]
              (optional) → [ PostgreSQL ] [ Redis ]
```

## Environments

- **Development** – Local: `npm run dev` (backend), `npx expo start --web` (frontend). See `config/README.md`.
- **Staging** – Docker: `docker compose up -d`. Use `config/env/staging.env.example`.
- **Production** – Same stack; HTTPS and secrets from vault/GitHub.

## Run with Docker

```bash
cp backend/.env.example backend/.env   # set JWT_SECRET, JWT_REFRESH_SECRET
mkdir -p deploy/nginx/ssl deploy/nginx/conf.d   # optional: for HTTPS later
docker compose up -d
# App: http://localhost (Nginx). API: http://localhost/api/health
```

Optional DB and Redis:

```bash
docker compose --profile with-db --profile with-redis up -d
```

Optional monitoring (Prometheus + Grafana):

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml --profile monitoring up -d
```

## Health checks

- **Liveness:** `GET /health` (or `GET /api/health` behind Nginx).
- **Readiness:** `GET /health/ready` – includes optional DB/Redis when configured.

All changes are **backward compatible**: the app still runs without Docker or DB/Redis.
