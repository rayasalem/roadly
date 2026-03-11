# DevOps Folder Structure

```
mechnow/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, test, build, audit
│       ├── cd-staging.yml     # Deploy to staging (develop)
│       └── cd-production.yml  # Deploy to production (manual)
├── config/
│   ├── env/
│   │   ├── development.env.example
│   │   ├── staging.env.example
│   │   └── production.env.example
│   └── README.md
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── src/
├── deploy/
│   ├── nginx/
│   │   ├── nginx.conf         # Reverse proxy (API + frontend)
│   │   ├── conf.d/
│   │   │   └── https.conf.example
│   │   └── ssl/
│   │       └── README.md      # Where to put certs
│   └── monitoring/
│       └── prometheus.yml
├── docs/
│   ├── DEVOPS_README.md
│   ├── DEVOPS_DEPLOYMENT_ARCHITECTURE.md
│   ├── DEVOPS_CI_CD.md
│   ├── DEVOPS_INFRASTRUCTURE.md
│   ├── DEVOPS_MONITORING.md
│   ├── DEVOPS_SCALING.md
│   ├── DEVOPS_SECURITY.md
│   ├── DEVOPS_BACKUP_RESTORE.md
│   └── DEVOPS_FOLDER_STRUCTURE.md  (this file)
├── scripts/
│   └── backup-db.sh           # PostgreSQL backup (when DB in use)
├── docker-compose.yml        # Backend, frontend, nginx, optional db/redis
├── docker-compose.monitoring.yml  # Prometheus + Grafana (profile: monitoring)
├── frontend.Dockerfile       # Expo web build + nginx serve
├── .dockerignore
└── .env.example              # Frontend build env
```

## Purpose

- **.github/workflows** – CI/CD pipelines (test, build, deploy).
- **config/env** – Per-environment env examples; never commit real secrets.
- **deploy/nginx** – Nginx config and HTTPS template.
- **deploy/monitoring** – Prometheus scrape config.
- **scripts** – Operational scripts (backup, etc.).
- **docs/DEVOPS_*** – Deployment, monitoring, security, and scaling documentation.
