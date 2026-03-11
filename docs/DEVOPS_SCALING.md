# Scalability

## Horizontal scaling

- **Backend:** Run multiple replicas behind Nginx. Nginx already uses `upstream backend { server backend:4000; keepalive 32; }`. With Compose: scale with `docker compose up -d --scale backend=3` and use a load balancer in front, or switch to Kubernetes and use a Service.
- **Stateless:** Backend is stateless (in-memory store is per process). For multi-instance, introduce a shared store (PostgreSQL, Redis) and use them in the app.

## Load balancing

- Nginx acts as reverse proxy; add more `server` entries in `upstream backend` when you have multiple backend replicas (e.g. in K8s, use service name and let K8s load-balance).
- For TLS termination at a load balancer (e.g. cloud LB), keep Nginx or terminate at the LB and use X-Forwarded-Proto.

## Caching

- **Redis (optional):** Enable with `docker compose --profile with-redis up`. Use for session store, rate-limit counters, or response cache. Backend can connect via `REDIS_URL`.
- **Static assets:** Frontend is static; serve with cache headers (e.g. `expires 1y` for hashed assets). CDN in front of Nginx for production.

## CDN

- Put a CDN (CloudFront, Cloudflare, etc.) in front of your domain. Cache static paths (`/assets/*`, `*.js`, `*.css`); bypass `/api/*` and `/health*`.
