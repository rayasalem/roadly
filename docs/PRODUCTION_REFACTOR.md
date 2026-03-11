# MechNow – Production Refactor Summary

This document summarizes the production-ready refactor applied to the project (performance, auth, validation, security, clean code, map feature, testing).

---

## 1. Performance Optimization

### Map & provider markers
- **OSMMapView (Web):** Wrapped with `React.memo` and custom `arePropsEqual` so the map re-renders only when `providers` (ids/length), `center`, or `userLocation` change. Reduces redundant Leaflet marker updates.
- **useSortedNearbyProviders:** Uses `useMemo` for `nearbyParams`, `sortedProviders`, and `getDistanceKm`. Stable references limit unnecessary refetches and re-renders.
- **React Query (useNearbyProviders):** `staleTime: 2 * 60 * 1000` (2 min) for nearby providers; fallback on API failure so the map always has data.

### Clustering (Native)
- **mapClustering.ts:** Exported `CLUSTER_THRESHOLD_DEFAULT = 20`. Native map clusters only when provider count **exceeds 20**; below that, every provider is shown individually at exact coordinates.
- **Web:** No clustering; all providers shown as individual markers (as required).

---

## 2. Authentication & Authorization

- **JWT:** Access and refresh tokens (signAccess, signRefresh, verifyAccess, verifyRefresh). Stored in auth store; frontend sends `Authorization: Bearer <accessToken>`.
- **authGuard:** Protects routes; rejects with 401 if missing or invalid token. In development, mock tokens (`mock-access-<role>`) are accepted for testing.
- **optionalAuth:** Used on `/providers/nearby` so the map works without login; other routes require auth.
- **RBAC (roleGuard):** `requireRole(...roles)` used on dashboard: `/dashboard/mechanic` → mechanic only, `/dashboard/tow` → mechanic_tow, `/dashboard/rental` → car_rental. Admin routes use `requireAdmin` (admin only).
- **Sensitive endpoints:** All of `/requests`, `/notifications`, `/dashboard`, `/admin`, `/providers/me`, `/providers/me/location` are behind authGuard (and role where applicable).

---

## 3. Data Validation & Error Handling

- **Zod schemas (backend):** Centralized in `backend/src/validation/schemas.ts`: registerSchema, loginSchema, refreshSchema, createRequestSchema, updateRequestStatusSchema, rateRequestSchema, updateLocationSchema. All validate types and ranges (e.g. coordinates -90..90, -180..180).
- **validateBody / validateQuery:** Middleware in `validateRequest.ts` runs `schema.safeParse(req.body)` or `req.query` and returns **400** with a consistent `{ message, errors }` shape on failure.
- **Applied to:** POST /auth/register, POST /auth/login, POST /auth/refresh, POST /requests, PATCH /requests/:id/status, POST /requests/:id/rate, PATCH /providers/me/location.
- **AppError:** `errorHandler` recognizes `AppError` and sends the given status code and message. In production, stack traces are never sent; only a generic "Internal server error" for 500.
- **Async handlers:** `asyncHandler` wraps async route handlers so unhandled rejections are passed to `next(err)` and handled by the global error handler.

---

## 4. Security

- **Helmet:** Enabled for secure headers (X-Content-Type-Options, X-Frame-Options, etc.).
- **CORS:** Restricted to `CLIENT_URL` in production; development allows localhost origins.
- **Rate limiting:** Global API limiter plus auth-specific limiter on login/register.
- **Trust proxy:** Set to 1 for correct client IP and X-Forwarded-* when behind Nginx.
- **Secrets:** JWT and env vars loaded from `backend/.env`; not committed. Production should use a secrets manager or vault.
- **Sanitization:** `backend/src/lib/sanitize.ts` provides `escapeHtml` and `truncate` for safe embedding or logging. Popup HTML on the web already escapes name/phone/photo in `buildPopupHtml`.
- **Input validation:** Zod prevents invalid types and ranges; no raw body/query used without validation on protected routes.

---

## 5. Clean Code & Maintainability

- **Backend structure:** `app.ts` exports the Express app for reuse (e.g. tests); `index.ts` only starts the server. Routes use middleware chains (authGuard → requireRole → validateBody → handler).
- **Constants:** Cluster threshold and grid size live in `mapClustering.ts`; map styling in `silverMapStyle.ts`.
- **Typing:** TypeScript throughout; Zod infers types (RegisterInput, LoginInput, etc.) for validated payloads.
- **Comments:** JSDoc on hooks, validation schemas, and middleware where useful.

---

## 6. Map Feature Integration

- **Provider display:** Each provider on the map has **photo** (or placeholder), **name**, **phone**, and **exact location** (latitude/longitude). Data comes from the Provider type and API/fallback.
- **Web:** One marker per provider; **no clustering**. Click opens a **popup** with photo, name, phone, and "طلب خدمة / اتصل".
- **Native:** One marker per provider; **clustering only when count > 20** via `clusterProviders(..., CLUSTER_THRESHOLD_DEFAULT)`. Tap opens **ProviderBottomSheet** (avatar, name, role, phone, distance, status, rating, Open Map, Request Service) and **LocationInfoCard** for the nearest provider (image, title, rating, Directions).
- **Hooks/utils:** useSortedNearbyProviders, useMapFilters, usePlacesSearch; haversine (distance, sortByNearest); mapClustering (clusterProviders).

---

## 7. Testing

- **Validation (backend):** `npm run test:validation` runs Zod schema tests (register, login, createRequest, updateRequestStatus, rate).
- **Integration (backend):** `npm run test:integration` runs health and auth validation tests (GET /health 200, POST /auth/login 400 for empty body and invalid email) using the Express app and supertest.
- **Frontend unit:** Jest tests for `haversine` (distance, sortByNearest) and `clusterProviders` (threshold, no cluster when ≤20, filter invalid location).
- **E2E:** Optional; Cypress or similar can cover map interactions and provider selection (see existing cypress config if present).

---

## Quick Commands

- **Backend:** `cd backend && npm run dev` (development), `npm run build && npm start` (production), `npm test` (validation + integration).
- **Frontend:** `npx expo start --web` (dev), unit tests via Jest for map/location.

All changes are backward compatible; existing features (map, auth, requests, dashboards, admin) continue to work with the new validation, RBAC, and error handling in place.
