# Roadly – Production Implementation Summary

## 1) Auth & Session

### Implemented
- **Login/Register** call real backend `POST /auth/login`, `POST /auth/register`.
- **Refresh token rotation**: client uses `refreshAccessTokenSafe()` (POST `/auth/refresh`); backend issues new access + new refresh and revokes old refresh. New tokens persisted in AsyncStorage after hydrate.
- **Session persistence**: AsyncStorage via `sessionStorage.ts`; `AuthBootstrap` runs `hydrate()` on app start and restores or clears session.
- **Logout**: `authStore.logout()` calls `POST /auth/logout`, `cleanupNotifications()` (POST `/notifications/unregister`), clears tokens and persisted session, then `navigateToLogin()`.
- **401 handling**: `httpClient` on 401 tries refresh once; on failure calls `onUnauthorized` → `tokenStore.clear()` + `httpEvents.emit('unauthorized')`. `UnauthorizedHandler` subscribes and runs `clearSession()` + `navigateToLogin()`.
- **Refresh queue**: single in-flight refresh in `httpClient`; retry with `_retry` flag to avoid loops.

### Files touched
- `src/shared/services/http/api.ts` – emit `unauthorized` on failed refresh.
- `src/shared/services/http/httpEvents.ts` – added `unauthorized` event.
- `src/navigation/navigationRef.ts` – **new** – `navigationRef` + `navigateToLogin()`.
- `src/shared/providers/UnauthorizedHandler.tsx` – **new** – listens `unauthorized`, clearSession, redirect.
- `src/shared/providers/AppProviders.tsx` – `NavigationContainer` ref + `UnauthorizedHandler`.
- `src/features/auth/data/authApi.ts` – **logout()**.
- `src/store/authStore.ts` – **logout()**, clearSession calls **cleanupNotifications()**, hydrate **persists new tokens** after refresh.
- `src/shared/services/notifications/notificationCleanup.ts` – **new** – `cleanupNotifications()` POST `/notifications/unregister`.

---

## 2) Role-based navigation & dashboards

### Pages per role

| Role   | Stack        | Screens                                                                 |
|--------|--------------|-------------------------------------------------------------------------|
| User   | CustomerStack| Home, Map, Request, Profile                                             |
| Mechanic | MechanicStack | MechanicDashboard, Map, Profile                                      |
| Tow    | TowStack     | TowDashboard, Map, Profile                                              |
| Rental | RentalStack  | RentalDashboard, Map, Profile                                           |
| Admin  | (same as User for now; can add AdminStack later)                        |

- **RoleNavigator** reads `useAuthStore().user?.role`, maps to segment (`customer` | `mechanic` | `tow` | `rental`) and renders the matching stack.
- **Profile** added to all stacks with Log out button calling `authStore.logout()`.
- Home (customer) has Profile link in hero; provider dashboards can add Profile in header/menu.

### Files touched
- `src/navigation/CustomerStack.tsx` – added **Profile** screen.
- `src/navigation/MechanicStack.tsx`, `TowStack.tsx`, `RentalStack.tsx` – added **Profile**.
- `src/features/profile/presentation/screens/ProfileScreen.tsx` – **new** – user info + Log out.
- `src/features/home/presentation/screens/HomeScreen.tsx` – Profile link in hero.

---

## 3) Service requests

### Implemented
- **Create**: `requestApi.createRequest()` → `POST /requests` (serviceType, origin, destination).
- **Get**: `requestApi.getRequestById()` → `GET /requests/:id`.
- **Update status**: `requestApi.updateRequestStatus()` → `PATCH /requests/:id/status` (pending → accepted → on_the_way → completed | cancelled).
- **RequestScreen** uses **useUserLocation** for origin (fallback to FALLBACK_ORIGIN if no coords).
- **Real-time**: **useRequest** uses `refetchInterval: 5_000` when status is not completed/cancelled (polling).

### Files touched
- `src/features/requests/presentation/screens/RequestScreen.tsx` – real location via `useUserLocation`, origin from coords or fallback.
- `src/features/requests/hooks/useRequest.ts` – `refetchInterval` for non-terminal status.

---

## 4) Map & location

### Implemented (unchanged)
- **expo-location** in `useUserLocation`; permission via `locationPermissionService`.
- **useNearbyProviders** calls `fetchNearbyProviders` → `GET /providers/nearby?lat=&lng=&radius=&role=&available=&page=&limit`.
- **MapScreen** (native) shows user location + provider markers; **MapScreen.web** fallback without native maps.
- Filter chips and bottom sheet for nearest provider / list; **ProviderCard** and **NearbyProvidersList**.

### Backend
- **GET /providers/nearby** – implemented (in-memory store; can swap to DB).
- **GET /providers/:id** – implemented.
- **PATCH /providers/me/location** – for providers to update location.

---

## 5) Backend (Node.js / Express)

### Structure
- `backend/` – ESM, TypeScript.
- **Auth**: POST `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, GET `/auth/me`.
- **Requests**: POST `/requests`, GET `/requests/:id`, PATCH `/requests/:id/status`.
- **Providers**: GET `/providers/nearby`, GET `/providers/:id`, PATCH `/providers/me/location`.
- **Notifications**: POST `/notifications/register`, POST `/notifications/unregister`.
- **Health**: GET `/health` → `{ status: 'ok', timestamp }`.

### Security
- **Helmet** enabled.
- **CORS** `origin: CLIENT_URL`.
- **Rate limit**: `authLimiter` (auth routes), `apiLimiter` (general).
- **Refresh rotation**: new refresh on each refresh; old token consumed and deleted; reuse returns 401.
- **No sensitive logging**: no tokens/passwords in logs; `errorHandler` logs only in non-production.

### Config
- **env**: `PORT`, `CLIENT_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `BCRYPT_ROUNDS`; validation in `config/env.ts` (throws if required missing).
- **backend/.env.example** – template for all vars.

### Files created
- `backend/package.json`, `backend/tsconfig.json`, `backend/.env.example`
- `backend/src/config/env.ts`
- `backend/src/services/password.ts`, `backend/src/services/tokenService.ts`
- `backend/src/store/authStore.ts`, `requestStore.ts`, `providerStore.ts`, `notificationStore.ts`
- `backend/src/middleware/auth.ts`, `rateLimit.ts`, `errorHandler.ts`
- `backend/src/routes/auth.ts`, `requests.ts`, `providers.ts`, `notifications.ts`, `health.ts`
- `backend/src/index.ts`

---

## 6) Environment & build

### Frontend
- **EXPO_PUBLIC_API_URL** required (no localhost fallback); **EXPO_PUBLIC_ENVIRONMENT** optional.
- **app.json**: identifiers, icons, splash as per existing setup; EAS-ready.

### Backend
- **CLIENT_URL** = frontend origin (e.g. `http://localhost:8081` for dev).
- Run: `cd backend && npm i && npm run dev` (or `npm run build && npm start`).

---

## 7) UI / frontend polish

- **Profile** and **request** i18n keys added (EN/AR) in `src/shared/i18n/strings.ts`.
- Theme/design tokens used in new screens; toasts, skeletons, loaders unchanged and working.
- TanStack Query + Axios interceptors: 401 + refresh queue, timeouts, normalized errors; production-ready.

---

## 8) Checklist – production-ready features

| Feature                         | Status |
|---------------------------------|--------|
| Login/Register → backend       | ✅     |
| Refresh token rotation (client + server) | ✅ |
| Session persist + restore      | ✅     |
| Logout (API + push cleanup + redirect) | ✅ |
| 401 → clear session + redirect | ✅     |
| Role-based stacks + Profile    | ✅     |
| Request create/get/update      | ✅     |
| RequestScreen real location + polling | ✅ |
| Map + nearby providers API     | ✅     |
| Backend auth/requests/providers/notifications/health | ✅ |
| Backend security (Helmet, CORS, rate limit) | ✅ |
| Env validation (front + back)  | ✅     |
| i18n EN/AR (profile, request) | ✅     |

---

## 9) Remaining / high-risk items

1. **Admin role**: no dedicated AdminStack yet; admin users land in CustomerStack. Add AdminStack + admin-only screens when needed.
2. **Provider dashboards**: Mechanic/Tow/Rental dashboards are placeholders; connect to “my requests” and availability/location APIs.
3. **Real-time**: currently polling (5s) for request status; WebSocket or SSE can be added later.
4. **Push sending**: backend stores device tokens; actual push (e.g. Expo push API) not implemented; add when going live.
5. **DB**: backend uses in-memory stores; replace with DB (e.g. Prisma) for production data.
