# Configuration

## Environments

| Environment   | Purpose                    | How it runs |
|---------------|----------------------------|-------------|
| **development** | Local dev, hot reload       | `npm run dev` (backend), `npx expo start --web` (frontend). Uses `.env` in backend and root. |
| **staging**     | Pre-production, CI deploy  | Docker Compose or K8s. Uses staging env vars from secrets. |
| **production**  | Live traffic               | Docker/K8s, Nginx, HTTPS. Env from vault or secrets manager. |

## Structure

- `config/env/*.env.example` – Example env files per environment. Copy and fill; never commit real secrets.
- Backend reads `backend/.env` (from `dotenv`). In Docker, pass env via `environment` or `env_file`.
- Frontend build-time vars: `EXPO_PUBLIC_*` in root `.env`; set in CI for staging/production builds.

## Loading order

1. System env (e.g. Docker, K8s)
2. `backend/.env` (backend only)
3. App defaults in code

Secrets must be injected at runtime (e.g. GitHub Secrets, Vault). Do not put production secrets in repo.
