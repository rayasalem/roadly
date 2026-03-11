# Node.js Backend Audit Report

**Project:** MechNow / Roadly Backend  
**Scope:** Scalability, Security, Performance, Best Practices  
**Date:** March 2025  
**Mode:** Read-only analysis (no code changes)

---

## Executive Summary

The backend is an **Express.js** API with JWT auth, in-memory stores, and Zod validation on selected routes. It is suitable for **development and low-traffic demos** but has **critical limitations for production scale**: no persistent database, no caching, no structured logging, and inconsistent input validation. Security foundations (Helmet, CORS, bcrypt, JWT) are in place; several endpoints accept unvalidated input. The report below details current state, risks, and actionable recommendations.

---

## 1. High-Level Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Client    │────▶│   Express    │────▶│  Middleware │────▶│  Route Handler   │────▶│  In-Memory  │
│  (Bearer)   │     │  (app.ts)    │     │  (stack)    │     │  (routes/*.ts)   │     │  Stores     │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────────┘     └─────────────┘
                            │                     │                      │                     │
                            │  trust proxy        │  helmet               │  authGuard         │  Map<string, T>
                            │  helmet()           │  cors()               │  optionalAuth     │  (users, requests,
                            │  cors()             │  express.json(1mb)    │  requireRole      │   providers,
                            │  express.json()     │  apiLimiter           │  validateBody     │   notifications,
                            │  apiLimiter         │  route-specific       │  (Zod where used) │   ratings, chat)
                            │  /health, /auth,    │  auth/validation      │                   │
                            │  /requests, etc.    │                      │                   │
                            ▼                     ▼                      ▼                   ▼
                     errorHandler (last)    AppError → 4xx/5xx     req.user, req.validated    No DB/Redis
```

**Request path:** HTTP Request → `app.ts` (trust proxy, Helmet, CORS, body parser, global rate limit) → Mounted router → Route-level middleware (auth, role guard, validation) → Handler → In-memory store (Map) → JSON response. Unhandled errors and `next(err)` go to `errorHandler`; stack traces are hidden in production.

---

## 2. Scalability Assessment

| Area | Current State | Details |
|------|---------------|--------|
| **Data persistence** | **Risk** | All data lives in process memory (`Map`s in `authStore`, `requestStore`, `providerStore`, `notificationStore`, `ratingStore`, `chatStore`). Restart = full data loss. No replication, no horizontal scaling of state. |
| **High concurrency** | **Needs Improvement** | Single process, no connection pooling (no DB). Global rate limit 100 req/min. No async/worker offload for heavy work. |
| **Caching** | **Risk** | No Redis or in-memory cache. Every read hits in-memory Maps; no cache layer for external or expensive operations. |
| **Pagination** | **OK** | `GET /providers/nearby` supports `page` and `limit`; list endpoints return `items` + `total`. Other list endpoints (`/requests/provider`, `/requests/customer`, `/admin/users`, `/admin/providers`) return **full lists** with no pagination—will not scale. |
| **Lazy loading** | **Needs Improvement** | No cursor/offset patterns; admin and dashboard load all users/providers/requests in one response. |
| **Database / indexes** | **N/A (Risk)** | No database. When migrating to PostgreSQL/MongoDB, indexes will be needed on: `users.email`, `requests.customerId`/`providerId`/`status`, `providers` by location (e.g. PostGIS or lat/lng index), `refresh_tokens.userId`. |
| **Modularity** | **OK** | Clear split: `routes/`, `middleware/`, `store/`, `services/`, `validation/`. Easy to swap stores for DB adapters. |

**Critical scalability issues:**

1. **In-memory only** – Not suitable for production; any restart or second instance loses or duplicates data.
2. **No pagination on admin/list endpoints** – `GET /admin/users`, `GET /admin/providers`, `GET /admin/dashboard`, `GET /requests/provider`, `GET /requests/customer` return full arrays.
3. **Rate limit is process-local** – With multiple instances, each has its own 100/min limit; no distributed rate limiting.

---

## 3. Security Assessment

### 3.1 Authentication

| Item | Status | Notes |
|------|--------|--------|
| **JWT access tokens** | **OK** | `jsonwebtoken`, short expiry (15m), verified in `authGuard`. |
| **Refresh tokens** | **OK** | Separate secret, 30d expiry, stored in memory and consumed on use (one-time). |
| **Session management** | **OK** | Stateless JWT; refresh rotation on `/auth/refresh`. Logout revokes all refresh tokens for user. |
| **OAuth** | **Not present** | No social login; can be added later. |
| **Mock tokens (dev)** | **Needs Improvement** | `tryMockUser` accepts `mock-access-<role>` in non-production. Ensure `NODE_ENV=production` in production so this is disabled. |

### 3.2 Input Validation and Sanitization

| Area | Status | Notes |
|------|--------|--------|
| **Zod schemas** | **OK** | Used for: register, login, refresh, createRequest, updateRequestStatus, rateRequest, updateLocation (PATCH `/providers/me/location`). |
| **Unvalidated inputs** | **Risk** | **PATCH /providers/me** – raw `req.body` (name, phone, photo, services). **POST /providers/location** – lat/lng from body, no schema. **GET /providers/nearby** – query params (lat, lng, radius, page, limit, role, etc.) only parsed with `parseFloat`/`parseInt`, no Zod. **PATCH /admin/users/:id/block** – `blocked` boolean from body. **PATCH /admin/providers/:id/verify** – `verified` boolean. **POST /chat/conversations/:id/messages** – `text` string only. **POST /notifications/register** – `token` only. |
| **Sanitization** | **Needs Improvement** | `lib/sanitize.ts` provides `escapeHtml` and `truncate` but they are **not used** in routes. User-controlled strings (e.g. name, comment, chat text) are not sanitized before storage or response. |
| **SQL injection** | **N/A** | No SQL; in-memory only. When adding a DB, use parameterized queries only. |

### 3.3 Sensitive Data and Encryption

| Item | Status | Notes |
|------|--------|--------|
| **Passwords** | **OK** | `bcryptjs` with configurable rounds (default 12). |
| **Secrets** | **OK** | `JWT_SECRET`, `JWT_REFRESH_SECRET` from env; required at startup. |
| **Data at rest** | **Risk** | No encryption of in-memory data; if moving to DB, sensitive fields (e.g. tokens) should be encrypted at rest where required. |
| **Data in transit** | **Needs Improvement** | No TLS termination in app; must be done by reverse proxy (e.g. Nginx). Document HTTPS requirement for production. |

### 3.4 Common Attacks

| Attack | Status | Notes |
|--------|--------|--------|
| **XSS** | **Needs Improvement** | Responses are JSON (no HTML rendering). If any payload is later embedded in HTML by the client, use `escapeHtml` (or equivalent) on the client or sanitize before sending. Sanitization library exists but is unused. |
| **SQL injection** | **N/A** | No SQL. |
| **CSRF** | **OK** | Auth is Bearer in `Authorization` header; no cookie-based session. CSRF risk is low for this API. |
| **Rate limiting** | **OK** | Global `apiLimiter` (100/min), `authLimiter` on auth routes (20/15min). No per-user or per-IP distinction. |

### 3.5 Dependencies

| Item | Status | Notes |
|------|--------|--------|
| **npm audit** | **Not run in audit** | Run `npm audit` (and `npm audit fix` where safe) in `backend/` regularly. Add to CI. |
| **Libraries** | **OK** | `helmet`, `cors`, `bcryptjs`, `jsonwebtoken`, `express-rate-limit`, `zod` in use. No known-dangerous patterns observed. |

---

## 4. Performance Assessment

| Area | Current State | Details |
|------|---------------|--------|
| **Response times** | **Not measured** | No APM, no per-route timing. Health and auth are cheap; list endpoints will slow as Maps grow. |
| **Body parser** | **OK** | `express.json({ limit: '1mb' })`; prevents huge payloads. |
| **Logging** | **Risk** | Only `console.info`/`console.error` in a few places. No request logging (e.g. method, path, status, duration). No winston/pino; no log levels or structured logs. |
| **Blocking/sync** | **OK** | No heavy sync work in handlers. Password hashing and JWT are async/crypto. Store operations are sync Map access (fast but not async/IO). |
| **Bottlenecks** | **Needs Improvement** | `findNearby` does full scan + sort of all providers; no spatial index. Admin dashboard fetches all users and all providers then filters in JS. |
| **Memory** | **Needs Improvement** | All data in memory; growth is unbounded (no TTL or eviction). Refresh token store never prunes expired tokens. |

---

## 5. Best-Practice Libraries and Tools

| Category | Expected | Current | Status |
|----------|----------|---------|--------|
| **Framework** | Express or Nest | Express 4.x | **OK** |
| **Logging** | winston, pino | None (console only) | **Risk** |
| **Validation** | Joi, Zod, class-validator | Zod | **OK** |
| **Security** | helmet, cors, bcrypt | helmet, cors, bcryptjs | **OK** |
| **Performance** | compression, caching, rate limit | rate limit only | **Needs Improvement** (no compression, no cache) |
| **Error / monitoring** | Sentry, Prometheus, Grafana | None | **Risk** |
| **Async errors** | Central handler | asyncHandler + errorHandler | **OK** |

---

## 6. Structured Summary

### 6.1 Current State

| Area | Rating | Summary |
|------|--------|--------|
| **Scalability** | **Risk** | In-memory only; no DB, no cache, no pagination on several lists. |
| **Security** | **Needs Improvement** | Auth and secrets OK; several endpoints lack validation; sanitization unused. |
| **Performance** | **Needs Improvement** | No logging/APM, no compression; list/dashboard logic will not scale. |
| **Best practices** | **Needs Improvement** | Good patterns (Zod, helmet, asyncHandler); missing logging, monitoring, compression. |

### 6.2 Critical Issues

1. **Data persistence** – All state in process memory; data loss on restart; no multi-instance support.
2. **Unvalidated input** – PATCH `/providers/me`, POST `/providers/location`, GET `/providers/nearby` (query), admin PATCH body, chat message body, notification token: type/format not validated with Zod (or equivalent).
3. **No request/error logging** – Hard to operate and debug in production; no audit trail.
4. **No pagination** – Admin and request list endpoints return full datasets; will not scale.

### 6.3 Optional Improvements

- Use **compression** middleware for JSON responses.
- Add **Zod (or similar) schemas** for all body/query inputs and use `validateBody`/`validateQuery` everywhere.
- Use **sanitize** (e.g. `escapeHtml`, `truncate`) for user-generated strings before storing or sending.
- Introduce **winston** or **pino** with request ID and structured fields; log method, path, status, duration.
- Add **health/ready** checks that actually connect to DB/Redis when configured (health route has stubs but no real client).
- **Distributed rate limiting** (e.g. Redis) when running multiple instances.

### 6.4 Recommendations for Future-Proofing and Scaling

1. **Introduce a database** – PostgreSQL (or similar) for users, requests, providers, notifications, ratings, chat; add migrations and connection pooling.
2. **Add Redis** – For refresh tokens, rate limit state, and optional response caching.
3. **Validate all inputs** – One Zod schema per route (body/query); reuse `validateBody`/`validateQuery`; validate path params (e.g. UUID) where relevant.
4. **Paginate all list endpoints** – Cursor or offset + limit; consistent response shape (`items`, `total`, `page`, `limit` or `nextCursor`).
5. **Logging and monitoring** – Structured logging (winston/pino); error tracking (e.g. Sentry); metrics (e.g. Prometheus) and dashboards (e.g. Grafana).
6. **TLS and env** – Enforce HTTPS at reverse proxy; document required env vars; ensure `NODE_ENV=production` and mock auth disabled in prod.
7. **CI** – Run `npm audit`, unit tests, and integration tests on every PR; run dependency audit regularly.

---

## 7. Blockers for New Features and Third-Party Integrations

| Blocker | Impact |
|--------|--------|
| **No persistent storage** | Any feature requiring durable data (payments, audit logs, analytics) needs a DB first. |
| **No background jobs** | No job queue; scheduled or async tasks (emails, cleanup, reports) cannot be implemented cleanly. |
| **No event/pub-sub** | Real-time features (e.g. live tracking, chat) rely on polling unless WebSockets or a message bus are added. |
| **Health/ready stubs** | Orchestrators (K8s, ECS) cannot rely on `/health/ready` for DB/Redis until real checks are implemented. |
| **No webhook or idempotency** | Third-party payment or webhook integrations need idempotency keys and signature verification; not present. |
| **Mock auth in dev** | Any integration that assumes “real” JWT only must account for mock tokens when `NODE_ENV !== 'production'`. |

---

## 8. Appendix: Endpoints and Validation Overview

| Method | Path | Auth | Body/Query validation | Pagination |
|--------|------|------|------------------------|------------|
| GET | /health | No | - | - |
| GET | /health/ready | No | - | - |
| POST | /auth/register | No | Zod | - |
| POST | /auth/login | No | Zod | - |
| POST | /auth/refresh | No | Zod | - |
| POST | /auth/logout | Optional | - | - |
| GET | /auth/me | Bearer | - | - |
| POST | /requests | Bearer | Zod | - |
| GET | /requests/provider | Bearer | - | No |
| GET | /requests/customer | Bearer | - | No |
| GET | /requests/:id | Bearer | - | - |
| PATCH | /requests/:id/status | Bearer | Zod | - |
| POST | /requests/:id/rate | Bearer | Zod | - |
| GET | /providers/me | Bearer | - | - |
| PATCH | /providers/me | Bearer | **None** | - |
| GET | /providers/nearby | Optional | **Query not Zod** | Yes (page/limit) |
| GET | /providers/:id | Bearer | - | - |
| GET | /providers/:id/ratings | Bearer | - | No |
| PATCH | /providers/me/location | Bearer | Zod | - |
| POST | /providers/location | Bearer | **None** | - |
| GET | /notifications | Bearer | - | - |
| PATCH | /notifications/:id/read | Bearer | - | - |
| POST | /notifications/register | Bearer | **None** (token) | - |
| POST | /notifications/unregister | Optional | - | - |
| GET | /dashboard/mechanic | Bearer + role | - | - |
| GET | /dashboard/tow | Bearer + role | - | - |
| GET | /dashboard/rental | Bearer + role | - | - |
| GET | /admin/dashboard | Bearer + admin | - | - |
| GET | /admin/users | Bearer + admin | - | No |
| PATCH | /admin/users/:id/block | Bearer + admin | **None** (body) | - |
| GET | /admin/providers | Bearer + admin | - | No |
| PATCH | /admin/providers/:id/verify | Bearer + admin | **None** (body) | - |
| GET | /chat/conversations | Bearer | - | - |
| GET | /chat/conversations/:id/messages | Bearer | - | - |
| POST | /chat/conversations/:id/messages | Bearer | **None** (text) | - |

---

*End of report. No code was modified; this document is for assessment and planning only.*
