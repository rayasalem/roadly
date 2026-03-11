# Full Backend Production Readiness Audit

**Project:** MechNow / Roadly Backend (Node.js, Express)  
**Audit type:** Read-only, production readiness  
**Focus:** Scalability, Security, Performance, Libraries, Risks, Recommendations  

---

## 1. Scalability & Extensibility

### 1.1 In-Memory State and Hard-Coded Data

| Location | Type | Risk |
|----------|------|------|
| `store/authStore.ts` | `Map<string, User>`, `Map<string, string>` (refresh tokens) | All users and refresh tokens in process memory; lost on restart. |
| `store/requestStore.ts` | `Map<string, ServiceRequest>` | All service requests in memory. |
| `store/providerStore.ts` | `Map<string, Provider>` | All providers and locations in memory. |
| `store/notificationStore.ts` | `Map<string, AppNotification>`, `Map<string, string>` (device tokens) | Notifications and FCM/Expo tokens in memory. |
| `store/ratingStore.ts` | `Map<string, Rating>` | All ratings in memory. |
| `store/chatStore.ts` | `Map<string, ChatMessage>` | All chat messages in memory. |
| `middleware/auth.ts` | Mock token prefix `mock-access-` and role list | Hard-coded dev bypass; must be disabled in production via `NODE_ENV`. |
| `app.ts` | CORS origins (localhost ports) in dev | Acceptable; production uses `env.CLIENT_URL` only. |

**Conclusion:** The entire application state is in-memory. There is **no database**. This is a **blocker for production** and for horizontal scaling.

### 1.2 Database Usage

- **Current:** None. No PostgreSQL, MongoDB, or other persistent store.
- **Health check:** `routes/health.ts` has a `/health/ready` stub that checks for `DATABASE_URL` and `REDIS_URL` but **does not open a connection** or run a query (e.g. `SELECT 1`). Ready checks are not reliable for orchestration (K8s, ECS).

### 1.3 Endpoints Returning Full Datasets (No Pagination / Filtering)

| Method | Endpoint | Returns | Issue |
|--------|----------|---------|--------|
| GET | `/requests/provider` | All requests for provider | Full list; no `page`/`limit`. |
| GET | `/requests/customer` | All requests for customer | Full list; no pagination. |
| GET | `/admin/users` | All users | Full list; will not scale. |
| GET | `/admin/providers` | All providers | Full list; will not scale. |
| GET | `/admin/dashboard` | All users + all providers + counts | Loads full datasets then aggregates in JS. |
| GET | `/providers/:id/ratings` | All ratings for provider | Full list; no pagination. |
| GET | `/notifications` | All notifications for user | Full list; no pagination. |
| GET | `/chat/conversations` | Stub list of 3 conversations | Stub data; when real, needs pagination. |
| GET | `/chat/conversations/:id/messages` | All messages for conversation | No pagination; will grow unbounded. |

**Pagination present:** Only `GET /providers/nearby` supports `page` and `limit` (and applies them after in-memory filter/sort).

### 1.4 Blocking Points for Background Jobs, Queues, Webhooks

| Capability | Status | Blocker |
|------------|--------|--------|
| **Background jobs** | Not implemented | No job queue (Bull/BullMQ, SQS, etc.). Cannot run scheduled or async tasks (emails, cleanup, reports). |
| **Message queue** | Not implemented | No Redis/RabbitMQ/SQS. No decoupling of heavy or external operations. |
| **Webhooks** | Not implemented | No signature verification (e.g. Stripe), no idempotency keys, no retry/backoff. |
| **Idempotency** | Not implemented | Duplicate POST (e.g. create request, payment) cannot be detected or deduplicated. |
| **Cron/scheduled tasks** | Not implemented | No cron or scheduler; e.g. token cleanup, analytics aggregation not possible. |

### 1.5 Geo/Map Endpoints and Spatial Queries

| Endpoint / logic | Implementation | Optimization / risk |
|------------------|----------------|----------------------|
| **GET /providers/nearby** | `providerStore.findNearby(lat, lng, options)` | Full scan of all providers; filters by role/available/verified; computes haversine for **every** provider; sorts by distance; then slices for `page`/`limit`. No spatial index. |
| **ETA calculation** | `requestStore.computeEtaMinutes(from, to)` | Haversine + fixed speed (30 km/h). Used when status → `on_the_way`. Fine for single calculation; no caching. |
| **PATCH /providers/me/location**, **POST /providers/location** | Update provider location in memory | No validation of coordinate bounds on POST (only PATCH uses Zod). No rate limit on location updates (could be spammed). |

**Spatial optimization:** With a real DB, use spatial types and indexes (e.g. PostGIS `ST_DWithin`, or geospatial index in MongoDB) and limit radius/result set. Current in-memory approach does not scale beyond hundreds of providers.

---

## 2. Security

### 2.1 Authentication and Authorization

| Item | Implementation | Status |
|------|----------------|--------|
| **JWT access** | `jsonwebtoken`, 15m expiry, verified in `authGuard` | OK |
| **Refresh tokens** | Separate secret, 30d, stored in memory, single-use (consumed on refresh) | OK |
| **Role-based access** | `roleGuard.requireRole`, `requireAdmin` in admin routes | OK |
| **Blocked users** | `authGuard` checks `user.blocked` via `findUserById` | OK |
| **Mock tokens (dev)** | `tryMockUser()` accepts `Bearer mock-access-<role>` when `NODE_ENV !== 'production'` | Must ensure production runs with `NODE_ENV=production` |

### 2.2 Rate Limiting

| Middleware | Applied to | Limit |
|------------|------------|--------|
| `authLimiter` | POST `/auth/register`, `/auth/login` | 20 per 15 minutes |
| `apiLimiter` | All routes (after body parser) | 100 per 1 minute |

Limits are **per process** (in-memory). Multiple instances = multiplied limit. No per-user or per-IP differentiation. No Redis-backed rate limiter.

### 2.3 Input Validation (Body, Query, Params)

**Validated with Zod (via `validateBody` / `validateQuery`):**

- POST `/auth/register` – `registerSchema`
- POST `/auth/login` – `loginSchema`
- POST `/auth/refresh` – `refreshSchema`
- POST `/requests` – `createRequestSchema`
- PATCH `/requests/:id/status` – `updateRequestStatusSchema`
- POST `/requests/:id/rate` – `rateRequestSchema`
- PATCH `/providers/me/location` – `updateLocationSchema`

**Not validated (body or query):**

| Method | Endpoint | Unvalidated input | Risk |
|--------|----------|--------------------|------|
| PATCH | `/providers/me` | `body`: name, phone, photo, services | Type/format/length not enforced; possible injection or oversized payload. |
| POST | `/providers/location` | `body`: lat/lng or latitude/longitude | Only presence check; no Zod, no bounds. |
| GET | `/providers/nearby` | `query`: lat, lng, radius, role, available, verified, page, limit | Parsed with `parseFloat`/`parseInt`; no schema; NaN or huge values can cause odd behavior. |
| PATCH | `/admin/users/:id/block` | `body`: blocked (boolean) | Checked with `typeof blocked !== 'boolean'` only; no Zod. |
| PATCH | `/admin/providers/:id/verify` | `body`: verified (boolean) | Same as above. |
| POST | `/chat/conversations/:id/messages` | `body`: text | Only "text required" and `typeof text === 'string'`; no max length or schema. |
| POST | `/notifications/register` | `body`: token | Only presence; no format or length validation. |

**Path params:** `id` (e.g. request id, provider id, notification id) are not validated (e.g. UUID or alphanumeric). Used as Map keys; could be any string.

### 2.4 Sanitization

- **Present:** `lib/sanitize.ts` – `escapeHtml()`, `truncate()`.
- **Usage:** **Not used** in any route. User-controlled data (name, comment, chat text, etc.) is not sanitized before storage or response.
- **Recommendation:** Use for any string that could be stored and later rendered in HTML or logs; apply to comments, chat, and free-text fields.

### 2.5 Sensitive Data and Encryption

| Data | Handling | Status |
|------|----------|--------|
| Passwords | `bcryptjs.hash()` with `BCRYPT_ROUNDS` (default 12) | OK |
| JWT secrets | From env (`JWT_SECRET`, `JWT_REFRESH_SECRET`); required at startup | OK |
| Tokens in memory | Stored in Maps; no encryption at rest | Acceptable for in-memory; if persisted to DB, consider encrypting refresh tokens. |
| TLS | Not implemented in app | Rely on reverse proxy (e.g. Nginx) for HTTPS; document requirement. |

### 2.6 Middleware (Helmet, CORS)

| Middleware | Usage | Notes |
|------------|--------|--------|
| **Helmet** | `app.use(helmet())` | OK; security headers set. |
| **CORS** | `cors({ origin: ... })` | Production uses single `CLIENT_URL`; dev allows several localhost origins. `credentials: true`. |
| **trust proxy** | `app.set('trust proxy', 1)` | OK for correct client IP behind proxy (e.g. rate limit). |
| **Body size** | `express.json({ limit: '1mb' })` | OK; limits payload size. |

---

## 3. Performance

### 3.1 Expensive Operations

| Operation | Location | Issue |
|-----------|----------|--------|
| **findNearby** | `providerStore.findNearby()` | Iterates all providers; haversine for each; sort; then slice. O(n) with n = total providers. |
| **Admin dashboard** | `routes/admin.ts` GET `/admin/dashboard` | `getAllUsers()`, `getAllProviders()`; then multiple `.filter()` over full arrays. |
| **List requests** | `listRequestsByProvider`, `listRequestsByCustomer` | `Array.from(requests.values()).filter(...)` – full scan each time. |
| **Refresh token revocation** | `authStore.revokeAllRefreshTokensForUser()` | Iterates all refresh token entries. |
| **Ratings** | `getRatingsByProvider`, `getAverageRating` | Full scan of ratings Map per request. |

No indexing; every list/filter is a full scan of the corresponding Map.

### 3.2 Synchronous / Blocking Code

- No heavy CPU sync work in request path. Bcrypt and JWT are async/crypto.
- Store operations are synchronous Map reads/writes (fast but single-threaded). No I/O to DB or cache.

### 3.3 Logging, Monitoring, Compression, APM

| Area | Status | Detail |
|------|--------|--------|
| **Request logging** | Missing | No middleware logging method, URL, status, duration, or request ID. |
| **Error logging** | Minimal | `errorHandler` uses `console.error` in non-production only; no structured fields. |
| **Log levels** | None | No winston/pino; no log level configuration. |
| **Metrics / APM** | Missing | No Prometheus, Grafana, Sentry, or similar. |
| **Compression** | Missing | No `compression` middleware; JSON responses not gzip/brotli. |

### 3.4 Endpoints Likely to Degrade with Large Data

- **GET /providers/nearby** – Linear in number of providers; sort and distance calc for all.
- **GET /admin/dashboard** – Loads all users and all providers.
- **GET /admin/users** – Full user list.
- **GET /admin/providers** – Full provider list.
- **GET /requests/provider**, **GET /requests/customer** – Full request list per user.
- **GET /providers/:id/ratings** – Full ratings for provider.
- **GET /notifications** – Full notification list for user.

---

## 4. Libraries & Best Practices

### 4.1 Essential Libraries in Use

| Purpose | Library | Version (from package.json) | Notes |
|---------|---------|-----------------------------|--------|
| Framework | express | ^4.21.0 | OK |
| Auth (password) | bcryptjs | ^2.4.3 | OK |
| Auth (JWT) | jsonwebtoken | ^9.0.2 | OK |
| Validation | zod | ^3.22.4 | OK |
| Security headers | helmet | ^7.1.0 | OK |
| CORS | cors | ^2.8.5 | OK |
| Rate limiting | express-rate-limit | ^7.1.5 | OK (in-memory only) |
| Config | dotenv | ^16.4.5 | OK |

### 4.2 Missing or Incomplete

| Purpose | Expected | Current |
|---------|----------|---------|
| Logging | winston / pino | Console only |
| Compression | compression | Not used |
| DB client | pg / mongoose / etc. | None |
| Cache | redis / ioredis | None |
| Error tracking | Sentry (or similar) | None |
| Metrics | prom-client / Prometheus | None |
| Request ID | uuid + middleware | None |

### 4.3 Async / Await and Error Handling

- **Async routes:** Auth routes use `asyncHandler`; requests and others use sync handlers or mixed. Unhandled promise rejections in async routes without `asyncHandler` would not reach `errorHandler`.
- **Central error handler:** `errorHandler` catches `AppError` and generic errors; in production hides stack and returns generic message. Pattern is good; coverage of all async paths via `asyncHandler` should be verified (e.g. `requests.ts` POST `/` uses sync handler with try/catch; PATCH and POST rate use sync handlers).

---

## 5. Critical Risks and Blockers for Production

### 5.1 Blockers for Production Deployment

1. **No persistent storage**  
   All state in process memory. Restart or crash loses users, requests, providers, notifications, ratings, chat. Multiple instances do not share state. **Must introduce a database (e.g. PostgreSQL) and migrate stores to it.**

2. **Data loss and no recovery**  
   No backups, no WAL, no replication. **Must add DB backups and recovery procedure before production.**

3. **Health/ready not implemented**  
   `/health/ready` does not actually connect to DB or Redis. **Must implement real checks (e.g. `SELECT 1`, Redis PING) when those dependencies exist.**

4. **Unvalidated input on multiple endpoints**  
   Increases risk of malformed data, DoS (e.g. huge strings), or injection if output is ever rendered. **Must add Zod (or equivalent) for all body/query and enforce on all routes.**

### 5.2 High-Risk Items (Not Blockers but Important)

- **No request/error logging** – Hard to operate and debug; no audit trail.
- **No pagination on list endpoints** – Will not scale as data grows.
- **Rate limit not distributed** – With multiple instances, effective limit is N × 100/min.
- **Mock auth in dev** – Must be disabled in production (`NODE_ENV=production`).
- **Sanitization unused** – User-generated content not sanitized; should be used for any HTML or log embedding.

### 5.3 Summary Table

| Risk | Severity | Blocks production? |
|------|----------|---------------------|
| In-memory only, no DB | Critical | Yes |
| No real health/ready checks | High | Yes (if orchestrator relies on them) |
| Missing validation on several endpoints | High | Recommended before production |
| No request/error logging | Medium | No (but required for ops) |
| No pagination on lists | Medium | No (scalability limit) |
| No compression | Low | No |
| No APM/metrics | Medium | No (recommended for production) |

---

## 6. Recommendations

### 6.1 Security

- **Validation:** Add Zod (or Joi) schemas for every route that accepts body or query; use `validateBody`/`validateQuery` for:
  - PATCH `/providers/me`
  - POST `/providers/location`
  - GET `/providers/nearby` (query schema)
  - PATCH `/admin/users/:id/block`, PATCH `/admin/providers/:id/verify`
  - POST `/chat/conversations/:id/messages`
  - POST `/notifications/register`
- **Sanitization:** Use `sanitize.escapeHtml` and `truncate` for user-controlled strings (e.g. name, comment, chat text) before storing or sending.
- **Path params:** Validate `id` format (e.g. UUID or alphanumeric) where used as resource identifier.
- **Rate limiting:** Add Redis-backed rate limiter when scaling to multiple instances; consider stricter limits on auth and location-update endpoints.
- **Secrets and TLS:** Keep JWT secrets in env; document HTTPS requirement and ensure production runs with `NODE_ENV=production`.

### 6.2 Performance

- **Compression:** Add `compression` middleware for JSON responses.
- **Pagination:** Add `page`/`limit` (or cursor) to all list endpoints: `/requests/provider`, `/requests/customer`, `/admin/users`, `/admin/providers`, `/providers/:id/ratings`, `/notifications`, chat messages.
- **Queries:** When moving to a DB, add indexes (e.g. user id, provider id, status, created_at) and use spatial index for nearby-provider queries (e.g. PostGIS).
- **Caching:** When external or heavy operations exist, add Redis (or similar) for caching and rate-limit state.

### 6.3 Logging and Monitoring

- **Structured logging:** Introduce winston or pino; log method, path, status, duration, request ID; use log levels.
- **Errors:** Send errors to an error-tracking service (e.g. Sentry); include request ID and user id where safe.
- **Metrics:** Expose Prometheus metrics (request count, latency, errors by route) and use Grafana (or similar) for dashboards and alerts.
- **Health:** Implement real DB and Redis checks in `/health/ready` when those dependencies are in use.

### 6.4 Scalable Architecture

- **Database:** Introduce PostgreSQL (or chosen DB); create schema and migrations; replace in-memory stores with repository/service layer using the DB.
- **Redis:** Use for refresh token store (or short-lived session data), rate limiting, and optional response cache.
- **Job queue:** Add Bull/BullMQ (or SQS, etc.) for background jobs (emails, cleanup, reports).
- **Webhooks / idempotency:** For payments or third-party webhooks, add signature verification and idempotency keys (e.g. stored in Redis or DB).

### 6.5 Suggested Libraries and Configuration for Production

| Need | Suggestion |
|------|------------|
| Logging | `pino` + `pino-http` (or `winston`) |
| Compression | `compression` |
| DB | `pg` + `node-pg-migrate` or Prisma / TypeORM |
| Cache / sessions / rate limit | `ioredis` |
| Validation | Keep Zod; extend to all routes |
| Error tracking | Sentry (`@sentry/node`) |
| Metrics | `prom-client` (Prometheus) |
| Config | Keep dotenv; add schema validation for env (e.g. Zod) |
| Process | Use PM2 or run in container with health checks |

---

## 7. Actionable Next Steps for Developers

**Immediate (before any production traffic):**

1. Introduce a database and migrate all stores (users, requests, providers, notifications, ratings, chat) with migrations.
2. Add Zod validation (and `validateBody`/`validateQuery`) to every route that accepts input; validate path params where relevant.
3. Implement real `/health/ready` checks (DB ping, Redis ping if used).
4. Ensure production runs with `NODE_ENV=production` and that mock auth is disabled.
5. Run `npm audit` in `backend/` and fix vulnerabilities; add `npm audit` to CI.

**Short term:**

6. Add structured request/error logging (e.g. pino or winston) with request ID and duration.
7. Add pagination (or cursor) to all list endpoints and document response shape.
8. Use `lib/sanitize` for user-generated strings (comments, chat, name if rendered in HTML).
9. Add `compression` middleware.
10. Document TLS/HTTPS and required env vars for production.

**Medium term:**

11. Add Redis for refresh tokens and rate limiting when running multiple instances.
12. Integrate error tracking (e.g. Sentry) and metrics (e.g. Prometheus + Grafana).
13. Optimize geo queries with spatial index when using a DB.
14. Consider job queue and webhook/idempotency support when adding payments or external integrations.

---

*Audit performed in read-only mode; no code or environment was modified.*
