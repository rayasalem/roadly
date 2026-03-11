# CI/CD Pipeline

## Overview

- **CI** (on push/PR to `main` or `develop`): install deps, build backend and frontend, run tests, run `npm audit`.
- **CD Staging** (on push to `develop`): build Docker images and deploy to staging (customize deploy step for your host).
- **CD Production** (manual): run workflow "CD Production" with input `confirm=deploy` to deploy to production.

## Workflows

| File | Trigger | Jobs |
|------|---------|------|
| `.github/workflows/ci.yml` | Push/PR to main, develop | backend build/test, frontend test + web export, npm audit |
| `.github/workflows/cd-staging.yml` | Push to develop or manual | Build backend + frontend images, deploy staging |
| `.github/workflows/cd-production.yml` | Manual (workflow_dispatch) | Build images, deploy production (requires `confirm=deploy`) |

## Secrets and variables

- **Staging / Production:** In GitHub → Settings → Environments → staging/production, set:
  - **Secrets:** `JWT_SECRET`, `JWT_REFRESH_SECRET`, `POSTGRES_PASSWORD` (if using DB).
  - **Variables:** `EXPO_PUBLIC_API_URL` (e.g. `https://staging.mechnow.example.com/api`).
- Never commit production secrets; use GitHub Secrets or a vault.

## Customizing deployment

Edit the "Deploy to staging" / "Deploy to production" steps to:

- Push images to a container registry (e.g. GHCR, ECR).
- SSH to a server and run `docker compose pull && docker compose up -d`.
- Or apply Kubernetes manifests (e.g. `kubectl apply -f k8s/`).
