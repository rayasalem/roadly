# Codebase Analysis — Senior Software Engineer Review

Full scan of the React Native + Expo (web) frontend and its interaction with the Node.js REST backend. Covers architecture, mock vs real API usage, bugs, error handling, performance, and improvements.

---

## 1. Architecture Analysis

### 1.1 Layer Overview

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Presentation (UI)** | `features/*/presentation/screens/`, `shared/components/` | Screens and reusable components; no direct API calls. |
| **Business logic / Hooks** | `features/*/hooks/` | State, filters, and data flow; call data layer or hold mock state. |
| **Data / API** | `features/*/data/*Api.ts`, `shared/services/http/` | HTTP client, auth, providers, requests, places. |
| **Storage** | `shared/services/auth/sessionStorage.ts`, `tokenStore.ts`, `savedAuthStorage.ts` | Session persistence (AsyncStorage), in-memory tokens, last login/register. |
| **Domain** | `features/*/domain/types.ts` | Types and DTOs. |
| **Shared** | `shared/constants/`, `shared/theme/`, `shared/i18n/` | Env, endpoints, theme, i18n. |

### 1.2 Clean Architecture Compliance

- **Respected:** API calls are in `*Api.ts` under each feature; hooks and screens consume them. No raw `api.get/post` inside screens.
- **Gaps:**
  - Some screens still hold local mock arrays (e.g. `MechanicServicesScreen`, `TowSkillsScreen`) instead of a single hook/data layer.
  - Deprecated modules still in use: `shared/api/client.ts` (getErrorMessage) and `shared/config/api.ts` (re-export of env).

### 1.3 Real API Usage (as specified)

| Area | Endpoint(s) | Used in |
|------|-------------|--------|
| Auth | `/auth/login`, `/auth/register`, `/auth/logout` | `authApi.ts` → LoginScreen, RegisterScreen; logout from authStore |
| Providers | `/providers/nearby` (query params) | `providersApi.ts` → `useNearbyProviders` → MapScreen (native + web) |
| Requests | `POST /requests`, `GET /requests/:id`, `PATCH /requests/:id/status` | `requestApi.ts` → `useCreateRequest`, `useRequest` → RequestScreen |

Refresh token: `refreshAccessTokenSafe()` calls `POST /auth/refresh` (bare Axios, not shared httpClient). Notifications: `cleanupNotifications()` calls `POST /notifications/unregister` (optional).

### 1.4 Navigation & Auth Flow

- **RootNavigator:** Launch → Welcome → Login/Register → App (RoleNavigator).
- **RoleNavigator:** Chooses stack by role (Customer, Mechanic, Tow, Rental, Admin).
- **Auth bootstrap:** `AuthBootstrap` runs `hydrate()` then renders Launch/Welcome or App based on session.
- **401:** `httpClient` emits `unauthorized`; `UnauthorizedHandler` calls `clearSession()` and `navigateToLogin()` via `navigationRef.reset({ routes: [{ name: 'Login' }] })`.

---

## 2. Mock Data Inventory

| Location | What is mock | Consumed by |
|----------|--------------|-------------|
| `LoginScreen` | Mock login chips (no API) | User chooses role and enters app without backend |
| `useMechanicDashboard` | `MOCK_JOBS`, `MOCK_REQUESTERS`, stats | MechanicDashboardScreen |
| `useTowDashboard` | `MOCK_JOBS`, `MOCK_REQUESTERS`, stats | TowDashboardScreen |
| `useRentalDashboard` | `MOCK_VEHICLES`, `MOCK_BOOKINGS`, stats | RentalDashboardScreen |
| `useAdminDashboard` | `MOCK_MECHANICS`, `MOCK_TOW`, `MOCK_RENTAL`, `MOCK_*_REQUESTS`, chartData | AdminDashboardScreen |
| `useAdminUsers` | `MOCK_USERS`, `MOCK_SERVICES` | AdminUsersScreen |
| `useProviderProfile` | Initial services + pool; profile (name, rating, status) | ProfileScreen (provider block) |
| `MapScreen.web` | `MOCK_PROVIDERS` (fallback when API returns empty/fails) | Web map only |
| `MechanicServicesScreen` | `MOCK_SERVICES` (local state) | Mechanic services list |
| `MechanicSkillsScreen` | `MOCK_SKILLS` | Mechanic skills list |
| `TowServicesScreen` / `TowSkillsScreen` | `MOCK_SERVICES` / `MOCK_SKILLS` | Tow screens |
| `RentalServicesScreen` / `RentalSkillsScreen` | `MOCK_SERVICES` / `MOCK_SKILLS` | Rental screens |
| `NotificationsScreen` | `MOCK_NOTIFICATIONS` | Notifications list |
| `ChatScreen` | `MOCK_CHATS` | Chat list |
| `useRealtimeProviders` | Returns `[]` (stub) | Not used in UI meaningfully |

**Native MapScreen:** Uses only `useNearbyProviders`; no fallback. If API fails or returns empty, `providers` is `[]` and the map shows no markers.

---

## 3. Bug List & Broken Logic

| # | Issue | Location | Severity |
|---|--------|----------|----------|
| 1 | **Places search never moves map** | `placesApi.ts`: `fetchPlaceCoordinates` always returns `null`. `usePlacesSearch.selectPlace()` only sets `selectedPlace` when coords exist, so selecting a suggestion never updates map center. | Medium |
| 2 | **Place suggestions have zero coordinates** | `placesApi.ts`: `fetchPlaceSuggestions` returns items with `latitude: 0, longitude: 0` (Autocomplete doesn’t return lat/lng; Place Details not implemented). So even if `fetchPlaceCoordinates` were used, 0,0 would be wrong. | Medium |
| 3 | **Native map empty when API fails** | `MapScreen.tsx`: `providers = data?.items ?? []`. No fallback. If backend is down or returns empty, user sees no markers. Web has `MOCK_PROVIDERS` fallback. | Medium |
| 4 | **Duplicate / deprecated error message logic** | `shared/api/client.ts` has `getErrorMessage(error)` (Axios-only, no i18n). Used by `authApi` and `requestApi`. Global toasts use `HttpEventsBinder.getErrorMessage(HttpError)` with i18n. So login/register error text can be English-only in the form while toast is translated. | Low |
| 5 | **RequestScreen useEffect dependency** | `RequestScreen`: `useEffect(() => { if (!coords) void fetchLocation(); }, []);` — dependency array is empty. If `coords` is initially null and becomes available later, effect doesn’t run again. First “Create request” may use `FALLBACK_ORIGIN` instead of real location. | Low |
| 6 | **List key using index** | `MechanicServicesScreen`, `MechanicSkillsScreen`, `RentalServicesScreen`, `TowServicesScreen`, `TowSkillsScreen`: `key={i}` on list items. If list is reordered or items added/removed, React can reuse wrong instances. Prefer stable id or item content. | Low |
| 7 | **useRequest refetchInterval with undefined data** | `useRequest`: `refetchInterval: (data) => (!data || terminal) ? false : 5_000`. When `enabled` is true but data not yet loaded, `data` is undefined so returns false. Correct; no bug. (Verified.) | — |

---

## 4. Missing or Weak Error Handling

| Area | Issue | Recommendation |
|------|--------|-----------------|
| **useNearbyProviders** | On failure, TanStack Query sets `isError` and `error`; MapScreen (native) doesn’t show error UI or retry. User just sees empty map. | Show error state + retry (and/or fallback mock on native). |
| **useCreateRequest / useRequest** | RequestScreen shows `createMutation.isError` and message. No explicit retry button for create. | Optional: “Retry” on create failure. |
| **useUserLocation** | Sets `error` in state (“Location permission denied” or “Failed to get location”); not all consumers display it. | Ensure map/request screens show location error when relevant. |
| **Auth hydrate** | On failure, session is cleared and user sent to unauthenticated state. No toast. | Consider a one-time toast: “Session expired” or “Please sign in again.” |
| **Places API** | `fetchPlaceSuggestions` returns `[]` on missing key or network error; `usePlacesSearch` doesn’t surface “no key” or “error”. | Differentiate “no key” vs “no results” and show hint in search UI. |
| **ErrorBoundary** | Catches render errors and shows message + retry. `componentDidCatch` is empty (no Sentry/logging). | Add crash reporting in `componentDidCatch`. |
| **WebMapView** | Script load failure sets `setError('Failed to load Google Maps')`. Parent must render it; verify MapScreen.web shows it. | Confirm error state is visible when script fails. |

---

## 5. Performance Considerations

| Area | Issue | Recommendation |
|------|--------|-----------------|
| **MapScreen markers** | Many markers without clustering. At high density, re-renders and native views can be costly. | Add clustering (e.g. react-native-maps supercluster or similar) when provider count is large. |
| **Dashboard lists** | Mechanic/Tow/Rental/Admin panels use ScrollView + map over arrays. No virtualization. | For long lists, use FlatList/SectionList and stable keys. |
| **usePlacesSearch** | No debounce on `query`; every keystroke can trigger a new query (TanStack Query caches, but still requests). | Debounce search input (e.g. 300–400 ms) before setting query used in queryKey. |
| **Provider list** | `NearbyProvidersList` already uses FlatList, keyExtractor, initialNumToRender, windowSize. | Keep as is. |
| **Heavy screens** | No React.memo on big screen trees; only some components (Button, NearbyProvidersList, etc.) are memoized. | Memoize heavy list items or screen sub-trees if profiling shows need. |
| **useRequest refetchInterval** | 5s polling for non-terminal requests. Acceptable for MVP; can be tuned or replaced by WebSocket later. | Document as intentional; consider increasing interval or moving to push. |

---

## 6. Code Quality Improvements

| # | Improvement |
|---|-------------|
| 1 | **Remove or replace deprecated modules:** Move `getErrorMessage` into a single place (e.g. `shared/services/http/errorMessage.ts`) that handles both Axios and HttpError and uses i18n. Remove `shared/api/client.ts` and `shared/config/api.ts` after updating all imports. |
| 2 | **Centralize mock vs real:** Either a feature flag / env (e.g. `USE_MOCK_*`) or clear “adapters”: real implementation vs mock implementation per feature, so wiring to API is a single swap. |
| 3 | **Places flow:** Implement `fetchPlaceCoordinates(placeId)` (Place Details or Geocoding) and use it in `usePlacesSearch.selectPlace` so the map moves to the selected place. |
| 4 | **Native map fallback:** In MapScreen (native), when `useNearbyProviders` fails or returns empty, use the same or a reduced set of MOCK_PROVIDERS so the map is never empty when backend is down. |
| 5 | **Stable list keys:** Replace `key={i}` with `key={item.id}` or a stable composite key in Mechanic/Tow/Rental services/skills screens. |
| 6 | **RequestScreen location:** Add `coords` (or a “location ready” flag) to the effect dependency array, or call `fetchLocation()` when opening the screen, so the first create uses real location when available. |
| 7 | **Type safety:** Replace `(err.response.data as any)` in httpClient with a small type guard or typed response type. |
| 8 | **i18n for auth errors:** Use the same error-message strategy (e.g. by `HttpError.kind`) in auth/request API so form errors are translated like toasts. |

---

## 7. Security Considerations

| Area | Status | Notes |
|------|--------|--------|
| **Tokens in memory** | OK | `tokenStore` is in-memory; session persisted in AsyncStorage. No tokens in logs in the scanned code. |
| **Env validation** | OK | `env.ts` throws if `EXPO_PUBLIC_API_URL` is missing; app fails fast. |
| **API base URL** | OK | From env; no hardcoded production URL. |
| **Places API key** | Risk | `EXPO_PUBLIC_GOOGLE_PLACES_KEY` used in client (placesApi). In production, prefer a backend proxy so the key is not exposed. |
| **Google Maps key** | Same | WebMapView loads script with key in URL. Same recommendation: proxy or restrict key by referrer/HTTP referrer. |
| **CORS / backend** | N/A | Not visible in frontend; must be enforced on Node backend (origin allowlist, credentials). |
| **Input validation** | Partial | Login/Register validate non-empty; no client-side schema (e.g. Zod). Backend should validate and sanitize. |
| **Role guarding** | OK | RoleNavigator and stacks restrict screens by role; no role in URL. Ensure backend enforces RBAC on /admin, /providers/me, etc. |

---

## 8. Summary

- **Architecture:** Clear separation of UI, hooks, and data layer; real API only for auth, providers/nearby, and requests. Many features still use mock data in hooks or screens.
- **Bugs:** Places search never updates map (stub coordinates + `fetchPlaceCoordinates` always null); native map has no fallback when API fails; minor issues (effect deps, list keys, duplicate error messaging).
- **Error handling:** Missing or inconsistent: native map error/retry, location error display, hydrate feedback, places “no key”/error state, ErrorBoundary reporting.
- **Performance:** No clustering on map; some long lists not virtualized; places search not debounced; otherwise acceptable for current scale.
- **Security:** Env and token handling are reasonable; Google keys are client-exposed — recommend backend proxy for production.

Recommended order of work: (1) Fix Places (coordinates + optional debounce), (2) Add native map fallback and error/retry for providers, (3) Unify error messaging and remove deprecated API client, (4) Add ErrorBoundary reporting and optional auth/session-expired feedback, (5) Virtualize long dashboard lists and add map clustering if needed.
