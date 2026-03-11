# Infrastructure

## Configuration structure

```
config/
  env/
    development.env.example   # Local dev
    staging.env.example       # Staging
    production.env.example   # Production
  README.md                   # How to load env
```

- Backend reads `backend/.env` (from repo root when running locally; in Docker, use `env_file` or `environment`).
- Frontend build-time vars: `EXPO_PUBLIC_*` in root `.env` or CI env.

## Docker

- **backend/Dockerfile** – Multi-stage; build TypeScript, run `node dist/index.js`.
- **frontend.Dockerfile** – Multi-stage; build Expo web, serve with Nginx.
- **docker-compose.yml** – backend, frontend, nginx, optional db (profile `with-db`), optional redis (profile `with-redis`).

## Nginx

- **deploy/nginx/nginx.conf** – Main config: proxy `/api/` to backend, `/` to frontend.
- **deploy/nginx/conf.d/https.conf.example** – Template for HTTPS; copy to `https.conf` and add certs under `deploy/nginx/ssl/`.
- **deploy/nginx/ssl/README.md** – Where to put certificates.

## Health checks

- **GET /health** – Liveness; returns 200 when process is up.
- **GET /health/ready** – Readiness; returns 200 when app can accept traffic; when `DATABASE_URL`/`REDIS_URL` are set, checks them (currently DB/Redis checks are stubbed; add real pings when you add clients).

## Running per environment

- **Development:** No Docker. Backend: `cd backend && npm run dev`. Frontend: `npx expo start --web --port 8082`. Set `EXPO_PUBLIC_API_URL=http://localhost:4000`.
- **Staging:** `docker compose up -d`. Set env from `config/env/staging.env.example`.
- **Production:** Same as staging on a production host; use production env and HTTPS.
