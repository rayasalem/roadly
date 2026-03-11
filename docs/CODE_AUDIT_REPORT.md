# Roadly – Complete Code Audit Report

**Project:** React Native + Expo (Web support) + Node.js backend  
**Date:** March 2025  
**Scope:** Architecture, bugs, code quality, performance, security, mock vs API, production readiness, improvements

---

## 1️⃣ Architecture Analysis

### 1.1 Overview

The project follows **Clean Architecture** with a **feature-based folder structure**:

- **Presentation layer:** Screens, shared components, navigation
- **Business logic layer:** Custom hooks (use cases), TanStack Query
- **Data layer:** API clients (`authApi`, `providersApi`, `requestApi`, `placesApi`), session storage

API calls are restricted to the data layer; components and screens use hooks for data and actions.

### 1.2 Data Flow

```
User Action → Screen → Hook → Data API (authApi, providersApi, etc.)
                                    ↓
                            HTTP Client (Axios)
                                    ↓
                            Backend REST API
                                    ↓
                            Zustand / TanStack Query → UI Update
```

- **Auth flow:** Login/Register → `authApi` → backend → `authStore.setSession` → `tokenStore` + `sessionStorage` → RoleNavigator renders role stack
- **401 flow:** API returns 401 → response interceptor → `refreshAccessTokenSafe()` → on failure: `onUnauthorized` → `clearSession` → `navigateToLogin`
- **Provider flow:** MapScreen → `useNearbyProviders` (TanStack Query) → `providersApi.fetchNearbyProviders` → API → UI
- **Request flow:** RequestScreen → `useCreateRequest` / `useRequest` → `requestApi` → API → UI

### 1.3 Layer Mapping

| Layer | Location | Responsibilities |
|-------|----------|------------------|
| **UI** | `features/*/presentation/screens/`, `shared/components/` | Rendering, user input, navigation |
| **Hooks** | `features/*/hooks/` | Business logic, API orchestration, local state |
| **API** | `features/*/data/*Api.ts` | HTTP requests (via shared `api` client) |
| **State** | `store/authStore.ts`, `store/uiStore.ts`, `shared/services/auth/tokenStore.ts` | Global auth, UI (loader, toasts), tokens |

### 1.4 Provider Tree

```
App → AppProviders (ErrorBoundary → FontLoader → QueryClient → SafeArea → BottomSheet → Navigation → HttpEventsBinder, UnauthorizedHandler → AuthBootstrap → RootNavigator)
```

---

## 2️⃣ Bug Report

### Critical

| # | Bug | Location | Description |
|---|-----|----------|-------------|
| 1 | **401 before navigation ready** | `navigationRef.ts` | `navigateToLogin()` runs only when `navigationRef.isReady()`. If 401 occurs before mount (e.g. cold start), user remains stuck with cleared session and no redirect. |
| 2 | **Unvalidated persisted session** | `sessionStorage.ts` | `loadPersistedSession()` checks `parsed.user` and `parsed.accessToken` but not shape of `user` (id, name, email, role). Corrupted storage can lead to crashes or incorrect behavior. |

### High

| # | Bug | Location | Description |
|---|-----|----------|-------------|
| 3 | **useUserLocation setState after unmount** | `useUserLocation.ts` | `fetchLocation` is async; if the component unmounts before completion, `setState` runs on an unmounted component → React warning / potential leak. |
| 4 | **Native MapScreen no fallback for providers** | `MapScreen.tsx` | Uses `providers = data?.items ?? []`. When API fails or returns empty, the map shows no markers. Web uses `MOCK_PROVIDERS` fallback; native does not. |
| 5 | **RequestScreen useEffect deps** | `RequestScreen.tsx` | `useEffect(() => { if (!coords) void fetchLocation(); }, []);` – empty deps; ESLint exhaustive-deps would warn. May cause stale behavior if `fetchLocation` is ever recreated. |

### Medium

| # | Bug | Location | Description |
|---|-----|----------|-------------|
| 6 | **placesApi.fetchPlaceCoordinates stub** | `placesApi.ts` | Always returns `null`. Map search selection never updates map position (lat/lng not available). |
| 7 | **placesApi autocomplete returns lat/lng 0** | `placesApi.ts` | Autocomplete API does not provide coordinates; all suggestions return `latitude: 0, longitude: 0`. |
| 8 | **Refresh token request has no timeout** | `refreshAccessToken.ts` | `axios.post` has no `timeout`. If backend hangs, refresh can block indefinitely. |

### Low

| # | Bug | Location | Description |
|---|-----|----------|-------------|
| 9 | **onUnauthorized clears tokenStore twice** | `api.ts`, `UnauthorizedHandler` | `onUnauthorized` calls `tokenStore.clear()`; `clearSession()` also clears. Redundant but not incorrect. |

---

## 3️⃣ Code Quality Issues

### Dead / Unused Code

| Item | Location | Notes |
|------|----------|-------|
| `savedAuthStorage` | `shared/services/savedAuthStorage.ts` | Exported but never imported anywhere. Dead code. |
| `apiEndpoints.adminUsers`, `adminProviders` | `shared/constants/apiEndpoints.ts` | Endpoints defined but backend has no `/admin/*` routes. |
| `ENDPOINTS.myAvailability` | `apiEndpoints.ts` | Path defined but not used. |

### Inconsistencies

| Issue | Location | Notes |
|-------|----------|-------|
| **App naming** | `sessionStorage.ts` | Uses key `roadly:auth_session`; some comments reference MechNow. |
| **Map fallback** | MapScreen vs MapScreen.web | Native shows empty markers on API failure; web uses mock fallback. Logic should be aligned. |
| **Error handling** | Screens | Many screens lack explicit error UI for API failures; they rely on global HTTP error toasts. |

### Code Smells

| Issue | Location | Suggestion |
|-------|----------|------------|
| `(err.response.data as any)` | `httpClient.ts` | Define an API error type or use a type guard for `response.data`. |
| Inline Arabic comments | Several files | Prefer English for consistency and maintainability. |
| `key={i}` or `key={name}` in lists | MechanicServicesScreen, ProfileScreen, etc. | Prefer stable IDs (`id`) where available to avoid reconciliation issues. |

---

## 4️⃣ Performance Issues

### Re-renders

| Issue | Location | Notes |
|-------|----------|-------|
| **Zustand selectors** | Various screens | Multiple `useAuthStore((s) => s.X)` calls can cause extra re-renders. Consider combining selectors or using shallow compare. |
| **useNearbyProviders params** | MapScreen | `nearbyParams` is memoized with `useMemo(..., [coords, filterRole])`. If a caller ever passed an inline object, query key would change every render and trigger refetches. Document that `params` must be memoized. |

### Unnecessary API Calls

| Issue | Location | Notes |
|-------|----------|-------|
| **useNearbyProviders when coords null** | MapScreen | `enabled: params != null`; when `coords` is null, `nearbyParams` is null, so query is disabled. Correct. |
| **Repeated fetches on filter change** | MapScreen | `filterRole` in `nearbyParams` causes refetch when filter changes. Expected. |

### List Rendering

| Issue | Location | Notes |
|-------|----------|-------|
| **ScrollView with map** | MechanicDashboardScreen, AdminDashboardScreen | Long lists use ScrollView. Consider FlatList for better performance with many items. |
| **No virtualization** | NearbyProvidersList, ChatScreen | If lists grow, use FlatList/SectionList for virtualization. |

---

## 5️⃣ Security Issues

### Critical

| # | Issue | Location | Notes |
|---|-------|----------|-------|
| 1 | **Tokens in AsyncStorage (localStorage on web)** | `sessionStorage.ts` | Access and refresh tokens are stored in AsyncStorage. On web this is `localStorage`, readable by any same-origin script (XSS risk). Mitigate with CSP, input sanitization, and avoid `dangerouslySetInnerHTML`. Consider httpOnly cookies for web. |

### High

| # | Issue | Location | Notes |
|---|-------|----------|-------|
| 2 | **Mock login uses fake tokens** | `LoginScreen.tsx` | `handleMockLogin` sets `accessToken: mock-access-${role}`. Subsequent API calls will send this to backend; backend will reject with 401. Ensure mock login is disabled or isolated in production. |
| 3 | **Google Maps/Places keys in client** | `.env` | `EXPO_PUBLIC_GOOGLE_MAPS_KEY`, `EXPO_PUBLIC_GOOGLE_PLACES_KEY` are bundled in client. Keys can be extracted. Use domain restrictions and quotas in Google Cloud. |

### Medium

| # | Issue | Location | Notes |
|---|-------|----------|-------|
| 4 | **No RBAC on backend** | Backend routes | Routes use `authGuard` but no role checks. A user could call `/providers/me/location` or `/requests/:id/status` regardless of role. Add role-based guards where needed. |
| 5 | **Session persistence fire-and-forget** | `authStore.ts` | `persistSession` is not awaited. If app is killed before write completes, user may appear logged out on next launch. |

---

## 6️⃣ Mock vs API Mapping

### Real API

| Feature | Data Source | Endpoints |
|---------|-------------|-----------|
| **Auth** | `authApi.ts` | POST /auth/login, /auth/register, /auth/logout |
| **Refresh** | `refreshAccessToken.ts` | POST /auth/refresh (bare Axios, not via api client) |
| **Providers** | `providersApi.ts` | GET /providers/nearby, GET /providers/:id |
| **Requests** | `requestApi.ts` | POST /requests, GET /requests/:id, PATCH /requests/:id/status |
| **Places (autocomplete)** | `placesApi.ts` | Google Places Autocomplete (returns empty if no key) |

### Mock / Stub

| Feature | Location | Description |
|---------|----------|-------------|
| **LoginScreen** | `handleMockLogin` | Role chips set mock session (no backend) |
| **useMechanicDashboard** | `useMechanicDashboard.ts` | MOCK_JOBS, MOCK_REQUESTERS |
| **useTowDashboard** | `useTowDashboard.ts` | MOCK_JOBS, MOCK_REQUESTERS |
| **useRentalDashboard** | `useRentalDashboard.ts` | MOCK_VEHICLES, MOCK_BOOKINGS |
| **useAdminDashboard** | `useAdminDashboard.ts` | All panel data mock |
| **useAdminUsers** | `useAdminUsers.ts` | MOCK_USERS, MOCK_SERVICES |
| **useProviderProfile** | `useProviderProfile.ts` | Mock profile and services |
| **MechanicServicesScreen** | — | MOCK_SERVICES |
| **MechanicSkillsScreen** | — | MOCK_SKILLS |
| **TowServicesScreen** | — | MOCK_SERVICES |
| **TowSkillsScreen** | — | MOCK_SKILLS |
| **RentalServicesScreen** | — | MOCK_SERVICES |
| **RentalSkillsScreen** | — | MOCK_SKILLS |
| **ChatScreen** | — | MOCK_CHATS |
| **NotificationsScreen** | — | MOCK_NOTIFICATIONS |
| **MapScreen.web** | `MapScreen.web.tsx` | MOCK_PROVIDERS fallback when API returns empty |
| **placesApi.fetchPlaceCoordinates** | `placesApi.ts` | Returns `null` (stub) |
| **useRealtimeProviders** | `useRealtimeProviders.ts` | Stub; no WebSocket |

### Backend (In-Memory)

- `authStore`, `providerStore`, `requestStore` use `Map()`; data is lost on restart.
- No database; all data is ephemeral.

---

## 7️⃣ Production Readiness Checklist

### P0 – Block Production

| # | Item | Status |
|---|------|--------|
| 1 | Replace backend in-memory stores with database | ☐ |
| 2 | Validate persisted session shape in `loadPersistedSession` | ☐ |
| 3 | Handle 401 when navigation not ready (queue/retry redirect) | ☐ |
| 4 | Disable or gate mock login in production | ☐ |
| 5 | Add backend RBAC where required | ☐ |

### P1 – High Priority

| # | Item | Status |
|---|------|--------|
| 6 | Add mounted guard in `useUserLocation` to avoid setState after unmount | ☐ |
| 7 | Add timeout to refresh token request | ☐ |
| 8 | Add mock provider fallback to native MapScreen when API fails/empty | ☐ |
| 9 | Implement `fetchPlaceCoordinates` or remove map search | ☐ |
| 10 | Add API validation (Zod/Joi) on backend | ☐ |
| 11 | Add structured logging on backend | ☐ |
| 12 | Add error tracking (e.g. Sentry) | ☐ |

### P2 – Medium Priority

| # | Item | Status |
|---|------|--------|
| 13 | Remove dead code (`savedAuthStorage`, unused endpoints) | ☐ |
| 14 | Add health check with DB dependency | ☐ |
| 15 | Document token storage risk (XSS/localStorage) | ☐ |
| 16 | Align native MapScreen error/fallback behavior with web | ☐ |
| 17 | Consider FlatList for long lists | ☐ |
| 18 | Add graceful shutdown to backend | ☐ |

### P3 – Lower Priority

| # | Item | Status |
|---|------|--------|
| 19 | Fix RequestScreen useEffect deps | ☐ |
| 20 | Debounce or gate `onUnauthorized` to avoid redundant calls | ☐ |
| 21 | Remove duplicate `tokenStore.clear()` from `onUnauthorized` | ☐ |
| 22 | Improve type safety in `toHttpError` | ☐ |

---

## 8️⃣ Suggested Improvements

### Architecture

1. **Single source of truth for auth** – Consider `zustand/persist` for auth instead of manual `sessionStorage` + Zustand, or clearly document that AsyncStorage is source of truth on load.
2. **API layer abstraction** – Introduce a thin repository layer if you need to swap implementations (e.g. mock vs real) without touching hooks.
3. **Error boundary per feature** – Add error boundaries around major features so one failure does not take down the whole app.

### Refactoring

1. **Navigation safety** – Implement a redirect queue for `navigateToLogin` when the navigation ref is not ready; retry or subscribe to `isReady`.
2. **Unify MapScreen logic** – Use a shared hook for provider resolution (real API + optional fallback) so native and web behave the same.
3. **Loader usage** – Ensure every `showLoader` is paired with `hideLoader` in `finally`, or introduce a loader wrapper that handles it.
4. **Remove dead code** – Delete `savedAuthStorage` if unused, or wire it into Login/Register for “last used” UX.

### Testing

1. **E2E coverage** – Extend Cypress tests for Request flow, Map (provider selection), and 401 redirect.
2. **Unit tests for stores** – Test `authStore.hydrate`, `clearSession`, and edge cases.
3. **API integration tests** – Test backend routes with a test DB.

### Documentation

1. **Onboarding** – Link to `TECHNICAL_DOCUMENTATION.md` and `PRODUCTION_READINESS_CHECKLIST.md` from README.
2. **Mock vs API** – Document which flows use mock data and how to switch to real API.
3. **Environment variables** – List all required and optional env vars in one place.

---

*Report generated from codebase analysis. Use with `CODE_AUDIT.md`, `UI_INTERACTIONS_CHECKLIST.md`, and `PRODUCTION_READINESS_CHECKLIST.md` for a full picture.*
