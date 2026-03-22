# MechNow — Test coverage report

**Last verified:** automated run (repo root + `backend/`) — all commands exited **0**.

## Commands

| Scope | Command | Result |
|--------|---------|--------|
| **App (Jest)** | `npm test` | 7 suites, **21** tests — **PASS** |
| **App coverage** | `npm run test:coverage` | Same tests — **PASS** (summary below) |
| **Backend** | `cd backend && npm test` | `test:validation` + `test:integration` + `test:unit` — **PASS** |
| **Backend API alias** | `cd backend && npm run test:api` | Same as `test:integration` |

## Frontend (Jest) — suites

| File | Notes |
|------|--------|
| `__tests__/shared/Button.test.tsx` | Button / loading |
| `__tests__/features/home/HomeScreen.test.tsx` | Header (`app.name`), nearby section, map preview press |
| `__tests__/features/map/MapScreen.web.test.tsx` | Search placeholder `map.searchHerePlaceholder`, filters |
| `__tests__/features/mechanic/MechanicDashboardScreen.test.tsx` | Dashboard title (duplicate-safe), filters |
| `__tests__/features/admin/AdminDashboardScreen.test.tsx` | Admin screen smoke |
| `__tests__/features/location/haversine.test.ts` | Haversine math |
| `__tests__/features/map/mapClustering.test.ts` | Clustering helpers |

**Config:** Root Jest ignores `backend/` (`testPathIgnorePatterns`) so backend `tsx` scripts are not executed by the app test runner.

## Jest coverage snapshot (`npm run test:coverage`)

Aggregates for the instrumented tree (not the whole monorepo):

| Metric | Value |
|--------|--------|
| **Statements** | ~36.4% |
| **Branches** | ~27.9% |
| **Functions** | ~28.8% |
| **Lines** | ~39.1% |

**100% lines (examples):** `src/features/location/data/haversine.ts`, `src/mock/mockProviders.ts`, `src/mock/mockLocations.ts`, parts of `WebMapView.tsx` / `MapLegend.tsx` as exercised by tests.

**Low / not covered by unit tests:** navigation ref, HTTP client stack, auth token refresh, many data-layer APIs — intended for integration/E2E or future tests.

## Backend tests

| Script | Role |
|--------|------|
| `test:validation` | Zod/schema checks (`src/test/validation/schemas.test.ts`) |
| `test:integration` | Supertest: `GET /health`, `POST /auth/login` validation (`src/test/integration/healthAndAuth.test.ts`) |
| `test:unit` | Joi schemas (`src/test/validation/joiSchemas.test.ts`) |

No live Supabase/Redis/payment calls in these scripts; they target the local app instance used in the integration file.

## Fixes applied in this verification cycle (summary)

- **HomeScreen tests:** Assertions aligned with `AppHeader` (`centerLogo` → visible title is `app.name`) and copy keys (`home.nearbyServicesTitle`, map preview subtitle for press).
- **MapScreen.web tests:** Placeholder key `map.searchHerePlaceholder`; `usePlacesSearch` mock includes `suggestions: []` (and optional chaining in `MapSearchBar` for robustness).
- **MechanicDashboard test:** Duplicate title text handled via `getAllByText`.
- **Navigation mock:** `canGoBack` provided where screens call it.

---

*Regenerate this section after meaningful test changes: run the commands above and paste new counts/coverage.*
