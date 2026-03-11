# Production Readiness Checklist

Senior software architect view: everything needed to make this project production-ready. Use as a living checklist; tick items as they are done.

---

## 1. Backend improvements

| # | Item | Status | Notes |
|---|------|--------|--------|
| 1.1 | **Replace in-memory stores with a database** | ☐ | `authStore`, `requestStore`, `providerStore` are all `Map()` in memory. Data is lost on restart. Use PostgreSQL, MongoDB, or another persistent store. |
| 1.2 | **Structured user and session persistence** | ☐ | Users, refresh tokens, and provider/request data must survive restarts and scale across instances. |
| 1.3 | **Request ID per request** | ☐ | Add middleware that sets `X-Request-ID` (and attaches to `res.locals`) for tracing and support. |
| 1.4 | **Async route handlers** | ☐ | Wrap route handlers so unhandled rejections are passed to `next(err)`. Use a wrapper or express-async-errors so `async (req, res) => { ... }` rejections are caught. |
| 1.5 | **Health check with dependencies** | ☐ | Extend `/health` to check DB connectivity (and optionally Redis/cache). Return 503 if dependencies are down. |
| 1.6 | **Graceful shutdown** | ☐ | On SIGTERM/SIGINT, stop accepting new requests, finish in-flight, then exit. |
| 1.7 | **Config validation at startup** | ☐ | Validate all required env vars (and optional ones with defaults) in one place; fail fast with clear errors. |
| 1.8 | **Refresh token storage** | ☐ | Store refresh tokens in DB (or Redis) with expiry and user id; support revoke-all and rotation. |

---

## 2. API validation

| # | Item | Status | Notes |
|---|------|--------|--------|
| 2.1 | **Use a validation library** | ☐ | Add Zod, Joi, or express-validator. Validate all request bodies and query params with schemas. |
| 2.2 | **Auth: register body** | ☐ | Validate `name` (length, charset), `email` (format), `password` (strength, length), `role` (enum). Reject invalid with 422 and clear messages. |
| 2.3 | **Auth: login body** | ☐ | Validate `email`, `password` (presence and type). |
| 2.4 | **Auth: refresh body** | ☐ | Validate `refreshToken` (presence, string). |
| 2.5 | **Providers: nearby query** | ☐ | Validate `lat`, `lng` (numbers in range), `radius`, `page`, `limit` (positive ints), `role` (enum if present). |
| 2.6 | **Providers: PATCH me/location body** | ☐ | Validate `latitude`, `longitude` (numbers in valid geo range). |
| 2.7 | **Requests: POST body** | ☐ | Validate `serviceType` (enum), `origin` (object with latitude/longitude), optional `destination`. |
| 2.8 | **Requests: PATCH status body** | ☐ | Validate `status` (enum). |
| 2.9 | **Consistent error response shape** | ☐ | Use one format, e.g. `{ message: string, code?: string, errors?: ValidationError[] }`. |
| 2.10 | **Sanitize / limit string inputs** | ☐ | Max lengths and trim for names, emails, and any free text to avoid abuse and storage issues. |

---

## 3. Database design suggestions

| # | Item | Status | Notes |
|---|------|--------|--------|
| 3.1 | **Users table** | ☐ | `id` (PK), `name`, `email` (unique), `password_hash`, `role`, `status`, `created_at`, `updated_at`. Index on `email`. |
| 3.2 | **Refresh tokens table (or key-value)** | ☐ | `id`, `user_id`, `token_hash` (or store hashed), `expires_at`, `revoked`, `created_at`. Index on `user_id`, TTL/cleanup for expiry. |
| 3.3 | **Providers / locations** | ☐ | Table (or embedded): `user_id` (FK to users), `latitude`, `longitude`, `last_updated`, `is_available`, `role`, optional metadata. Geo index (PostGIS or 2d index) for nearby queries. |
| 3.4 | **Service requests table** | ☐ | `id`, `customer_id`, `provider_id` (nullable), `service_type`, `origin` (JSON or lat/lng columns), `destination` (optional), `status`, `created_at`, `updated_at`. Indexes on `customer_id`, `provider_id`, `status`. |
| 3.5 | **Notifications / device tokens** | ☐ | Table: `user_id`, `device_token`, `platform`, `created_at`. Unique on (user_id, device_token) or similar for upsert. |
| 3.6 | **Migrations** | ☐ | Use a migration tool (e.g. node-pg-migrate, Prisma migrate, Knex) and version all schema changes. |
| 3.7 | **Connection pooling** | ☐ | Use a connection pool for DB; configure min/max and timeouts. |

---

## 4. Logging

| # | Item | Status | Notes |
|---|------|--------|--------|
| 4.1 | **Structured logging** | ☐ | Use pino or winston with JSON output. Log level from env (e.g. LOG_LEVEL=info in prod). |
| 4.2 | **Request logging middleware** | ☐ | Log method, path, status, duration, requestId (and optionally user id). Do not log body (may contain passwords). |
| 4.3 | **Error logging** | ☐ | In error handler, log stack and requestId. In production do not send stack to client. |
| 4.4 | **No secrets in logs** | ☐ | Never log tokens, passwords, or full request bodies of auth endpoints. |
| 4.5 | **Audit-sensitive actions** | ☐ | Log login success/failure, logout, password change, and other security-relevant events (user id, timestamp, outcome). |

---

## 5. Monitoring

| # | Item | Status | Notes |
|---|------|--------|--------|
| 5.1 | **Health endpoint** | ☐ | Already have `/health`. Extend with DB/Redis checks and version or build id. |
| 5.2 | **Metrics endpoint (optional)** | ☐ | Expose Prometheus-style or simple JSON metrics: request count by route/status, latency percentiles, active connections. Protect by auth or network. |
| 5.3 | **Uptime / heartbeat** | ☐ | Use an external uptime checker (e.g. UptimeRobot, Pingdom) hitting `/health`. |
| 5.4 | **Resource alerts** | ☐ | Alert on high CPU, memory, or disk; configure for the host/container. |
| 5.5 | **Rate limit metrics** | ☐ | Optionally log or expose count of rate-limited requests. |

---

## 6. Error tracking

| # | Item | Status | Notes |
|---|------|--------|--------|
| 6.1 | **Backend: Sentry (or equivalent)** | ☐ | Install @sentry/node. Init in bootstrap with DSN from env. Capture unhandled errors and rejections. Set environment (production/staging). |
| 6.2 | **Frontend: Sentry** | ☐ | Install @sentry/react-native (or Expo Sentry). Capture JS errors and optionally native crashes. Do not send in development if desired. |
| 6.3 | **Attach context** | ☐ | Add requestId, user id (if authenticated) to Sentry scope so issues are traceable. |
| 6.4 | **PII and secrets** | ☐ | Configure Sentry to scrub tokens, passwords, and PII from payloads. |
| 6.5 | **Error handler integration** | ☐ | In Express error handler, report to Sentry then respond with generic message to client. |

---

## 7. Performance optimization

| # | Item | Status | Notes |
|---|------|--------|--------|
| 7.1 | **Backend: response compression** | ☐ | Use compression middleware (e.g. express compression) for JSON responses. |
| 7.2 | **Backend: DB query optimization** | ☐ | Add indexes for frequent queries (nearby providers, requests by user/status). Use pagination with stable ordering. |
| 7.3 | **Backend: rate limit store** | ☐ | Use a shared store (Redis) for rate limits when running multiple instances. express-rate-limit has a Redis store. |
| 7.4 | **Frontend: list virtualization** | ☐ | Use FlatList/SectionList for long lists; avoid mapping over large arrays in ScrollView. |
| 7.5 | **Frontend: memoization** | ☐ | Memoize expensive computations and callbacks passed to list items; use React.memo where it reduces re-renders. |
| 7.6 | **Frontend: image optimization** | ☐ | Use appropriate sizes and lazy load images; consider placeholders. |
| 7.7 | **Frontend: bundle size** | ☐ | Analyze bundle; code-split or lazy-load heavy screens if needed. |
| 7.8 | **API: pagination and limits** | ☐ | Enforce max page size (e.g. 50) for list endpoints; return next cursor or page. |

---

## 8. Security improvements

| # | Item | Status | Notes |
|---|------|--------|--------|
| 8.1 | **HTTPS only** | ☐ | Serve backend over HTTPS in production; redirect HTTP to HTTPS if needed. |
| 8.2 | **Secure cookies (if used)** | ☐ | If moving to cookie-based auth for web, set secure, httpOnly, sameSite. |
| 8.3 | **CORS** | ☐ | Already using env CLIENT_URL. Ensure production URL is exact; avoid wildcard in production. |
| 8.4 | **Helmet** | ☐ | Already using helmet(). Review defaults (CSP, HSTS, etc.) and tune if needed. |
| 8.5 | **JWT: short-lived access token** | ☐ | Keep access token expiry short (e.g. 15 min); rely on refresh for long sessions. |
| 8.6 | **Refresh token rotation** | ☐ | Already rotating on refresh. Ensure old refresh is invalidated and one-time use. |
| 8.7 | **Password policy** | ☐ | Enforce min length and complexity in validation; consider breach check (e.g. Have I Been Pwned). |
| 8.8 | **RBAC** | ☐ | Enforce role checks on sensitive routes (e.g. admin-only, provider-only PATCH me/location). |
| 8.9 | **Input sanitization** | ☐ | Validate and sanitize all inputs; prevent injection (SQL, NoSQL, XSS in stored content). |
| 8.10 | **Frontend: token storage** | ☐ | Document that tokens in AsyncStorage/localStorage are vulnerable to XSS; mitigate XSS and consider httpOnly cookies for web. |

---

## 9. Deployment recommendations

| # | Item | Status | Notes |
|---|------|--------|--------|
| 9.1 | **Backend: host** | ☐ | Deploy Node process on a PaaS (Render, Railway, Fly.io) or VM/container (Docker on EC2, GCP, etc.). |
| 9.2 | **Backend: process manager** | ☐ | Use PM2 or the platform’s process manager so the app restarts on crash. |
| 9.3 | **Backend: env in production** | ☐ | Set NODE_ENV=production, PORT, CLIENT_URL, JWT_SECRET, JWT_REFRESH_SECRET, DB_URL (or equivalent), and any Redis URL in the host’s env (no .env file in repo). |
| 9.4 | **Backend: secrets** | ☐ | Store secrets in a vault or the platform’s secret manager; never commit. Rotate JWT secrets periodically. |
| 9.5 | **Database** | ☐ | Use a managed DB (e.g. Supabase, Neon, RDS). Back up and plan restore. |
| 9.6 | **Frontend: build** | ☐ | Use EAS Build for iOS/Android; set EXPO_PUBLIC_API_URL (and other env) in EAS secrets or build profile. |
| 9.7 | **Frontend: app stores** | ☐ | Prepare store listings, privacy policy, and required assets; use EAS Submit for builds. |
| 9.8 | **Web app (if applicable)** | ☐ | Build web (expo export:web or equivalent) and host on Vercel/Netlify or CDN; set env at build time. |
| 9.9 | **CI/CD** | ☐ | Run tests and lint on push/PR; optionally run E2E. Deploy backend from main/release branch or tag. |
| 9.10 | **Documentation** | ☐ | Document env vars, deployment steps, and runbook for common issues. |

---

## Summary by priority

**P0 (block production)**  
- 1.1, 1.2 Replace in-memory with DB and persist users/sessions.  
- 2.1–2.8 API validation on all inputs.  
- 8.1 HTTPS.  
- 9.2, 9.3, 9.5 Backend process manager, production env, and managed DB.

**P1 (high)**  
- 1.4 Async error handling in routes.  
- 1.6 Graceful shutdown.  
- 3.x Database design and migrations.  
- 4.x Structured logging.  
- 6.1, 6.2 Error tracking (Sentry) backend + frontend.  
- 7.2, 7.3 DB indexes and Redis rate limit store for multi-instance.  
- 8.5, 8.6, 8.8 JWT expiry, refresh rotation, RBAC.

**P2 (medium)**  
- 1.3 Request ID; 1.5 Health with deps; 1.7 Config validation; 1.8 Refresh token in DB.  
- 2.9, 2.10 Error shape and input limits.  
- 5.x Monitoring and health.  
- 7.1, 7.4–7.8 Compression, frontend perf, pagination.  
- 8.2, 8.7, 8.9, 8.10 Cookies, password policy, sanitization, token storage doc.  
- 9.1, 9.4, 9.6–9.10 Host, secrets, EAS, CI/CD, docs.

Use this checklist in order (P0 → P1 → P2) and tick items as they are implemented.
