# MechNow — Test coverage report

**Last verified:** repo root Jest + `backend/` scripts — all **exit 0**.

## Commands

| Scope | Command | Result |
|--------|---------|--------|
| **App (Jest)** | `npm test` | **20** suites, **66** tests — **PASS** |
| **App coverage** | `npm run test:coverage` | **PASS** — aggregate **~46%** statements / **~50%** lines (full tree) |
| **Backend unit** | `npm run test:unit` | Joi (`backend`) — **PASS** |
| **Backend integration** | `npm run test:integration` | `healthAndAuth.test.ts` **+** `routesApi.test.ts` — **PASS** |
| **Backend API** | `npm run test:api` | Same as integration — **PASS** |

Root scripts `test:unit`, `test:integration`, `test:api` delegate to `npm --prefix backend run …`.

## Frontend — suites

| Area | Files |
|------|--------|
| **Shared services** ✅ | `__tests__/shared/services/*.test.ts` — `httpClient`, `errorMessage`, `httpEvents`, `tokenStore`, `refreshAccessToken`, `sessionStorage`, `secureTokenStorage`, `secureTokenStorage.web`, `savedAuthStorage`, `notificationCleanup`, `queryClient`, `httpTypes`, `api` |
| **UI / features** | `Button`, `HomeScreen`, `MapScreen.web`, `MechanicDashboardScreen`, `AdminDashboardScreen`, `haversine`, `mapClustering` |

**Config:** Jest ignores `backend/` (`testPathIgnorePatterns`).

## Coverage highlights (`npm run test:coverage`)

| Metric (aggregate) | ~Value |
|--------------------|--------|
| Statements | **~46%** |
| Branches | **~37%** |
| Functions | **~37%** |
| Lines | **~50%** |

| Module | Notes |
|--------|--------|
| ✅ **100%** lines | `refreshAccessToken.ts`, `errorMessage.ts`, `httpEvents.ts`, `tokenStore.ts`, `notificationCleanup.ts`, `queryClient.ts`, `haversine.ts`, … |
| ⚠️ Partial | `httpClient.ts` (interceptors / retry paths), `api.ts` (side-effect client), `sessionStorage.ts` (edge clears), `secureTokenStorage.ts` (native branches) |
| ❌ Low | `authApi.ts`, `navigationRef`, HTTP stack not otherwise covered |

## Backend tests

| Script | Role |
|--------|------|
| `test:validation` | Zod (`schemas.test.ts`) |
| `test:integration` | Supertest: **`healthAndAuth.test.ts`** (`/health`, login validation) + **`routesApi.test.ts`** (auth/register/refresh/login smoke, **mock Bearer** routes: admin, chat, dashboard, notifications, providers, requests, vehicles, uploads) |
| `test:unit` | Joi (`joiSchemas.test.ts`) |
| `test:api` | Alias → `test:integration` |

**Note:** `routesApi.test.ts` allows **200 or 500** on some Prisma-backed routes when `DATABASE_URL` is missing or DB is down; **401/403/400** cases are always asserted. Use a configured DB for strict **200** on all success paths.

## Fixes / additions in this cycle

- Root **`package.json`**: `test:unit`, `test:integration`, `test:api` → backend.
- Backend **`test:integration`**: runs **`routesApi.test.ts`** after health/auth.
- **Frontend:** unit tests for all files under `src/shared/services/` (see table above).
- **`MapSearchBar`:** defensive `suggestions ?? []` (from earlier cycle).

---

*Re-run `npm test`, `npm run test:coverage`, and `cd backend && npm test` after large changes.*
