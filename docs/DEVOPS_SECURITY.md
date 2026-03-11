# Security

## Current measures

- **Helmet** – Security headers (X-Content-Type-Options, X-Frame-Options, etc.).
- **CORS** – Restricted to `CLIENT_URL` in production; dev allows localhost.
- **Rate limiting** – Global API: 100 req/min; auth routes can use stricter limits (see `authLimiter`).
- **Trust proxy** – Set to 1 when behind Nginx so `X-Forwarded-*` and client IP are trusted.
- **Secrets** – JWT and DB credentials from env; never committed.

## Recommendations

1. **Environment variables:** Use a secrets manager or vault in production; inject at runtime.
2. **Rate limiting:** Tune `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` via env if needed; keep auth stricter.
3. **Security headers:** Helmet defaults are sane; add CSP if required.
4. **API validation:** Validate and sanitize all inputs; use schema validation (e.g. Zod) on body/query.
5. **Sensitive routes:** Auth-only routes are protected by `authGuard`; admin routes should require role checks (already in place where applicable).
6. **HTTPS:** Always in production; use `deploy/nginx/ssl` and redirect HTTP → HTTPS in Nginx.

## Audit

- Run `npm audit` in CI; fix high/critical. Optional: `npm audit fix`.
- Keep dependencies updated; review CVE advisories for Node and Express.
