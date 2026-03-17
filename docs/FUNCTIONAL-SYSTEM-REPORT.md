# MechNow — Functional System Report

**Generated:** Technical analysis of the entire codebase (frontend + backend).  
**Roles:** Customer, Service Provider (Mechanic / Tow / Rental), Admin.

---

## 1. CUSTOMER ROLE

### 1.1 Register
- **Status:** **Fully working**
- **Frontend:** `RegisterScreen` → `authApi.register()` → `POST /auth/register`
- **Backend:** `auth.ts` — `createUser`, Joi validation, returns user + accessToken + refreshToken. Role can be passed (default `user`). Blocked users cannot log in.
- **Note:** Provider registration uses `ProviderRegistrationScreen` (separate flow); backend same `POST /auth/register` with role.

### 1.2 Login
- **Status:** **Fully working**
- **Frontend:** `LoginScreen` → `authApi.login()` → `POST /auth/login`; session persisted; refresh token used on hydrate.
- **Backend:** `auth.ts` — `findUserByEmail`, `verifyPassword`, blocked check, tokens returned. Refresh: `POST /auth/refresh`; Logout: `POST /auth/logout` (revokes refresh tokens).

### 1.3 See nearby providers
- **Status:** **Working (with fallback)**
- **Frontend:** `MapScreen` uses `useNearbyProviders(params)` → `fetchNearbyProviders()` → `GET /providers/nearby?lat=&lng=&radius=&role=&available=&page=&limit=`
- **Backend:** `providers.ts` — `findNearby(lat, lng, { radiusKm, role, availableOnly, verifiedOnly, page, limit })` from DB; on DB failure returns mock providers so map always has markers.
- **Behavior:** If API fails (network/CORS/5xx), frontend falls back to `MOCK_PROVIDERS` / `getFallbackNearbyProviders()` so the map never breaks.

### 1.4 Create service request
- **Status:** **Fully working**
- **Frontend:** `RequestScreen` → `useRequestService` → `createRequest()` → `POST /requests` (body: serviceType, origin, destination?, providerId?, description?)
- **Backend:** `requests.ts` — `createRequest(customerId, serviceType, origin, destination, providerId, description)`. When DB fails, returns 201 with synthetic `offline_*` request stored in memory.
- **Note:** `providerId` optional; Joi allows empty string. Customer can create with or without pre-selected provider.

### 1.5 Track request
- **Status:** **Working**
- **Frontend:** `RequestHistoryScreen` (list) → `fetchCustomerRequests()` → `GET /requests/customer`. Single request: `useRequest(requestId)` → `getRequestById()` → `GET /requests/:id`. `LiveTrackingScreen` uses `useRequest(requestId)` to show status, provider name, ETA, provider location.
- **Backend:** `GET /requests/customer` (paginated), `GET /requests/:id` (with offline_ support and enrichment with providerName/providerLocation). Status flow: pending → accepted → on_the_way → completed (or cancelled).

### 1.6 Chat
- **Status:** **Partially implemented**
- **Frontend:** `ChatScreen` → `fetchConversations()` → `GET /chat/conversations`. `ChatDetailScreen` → `fetchMessages(conversationId)`, `sendMessage(conversationId, text)`.
- **Backend:** `GET /chat/conversations` returns **stub list** (3 hardcoded conversations). `GET /chat/conversations/:id/messages` treats `:id` as **requestId**: if request exists and user is customer or provider, returns DB messages; otherwise stub messages. `POST /chat/conversations/:id/messages` persists to DB only when request exists and user is participant.
- **Problem:** Conversation list is not request-based; frontend uses generic conversation IDs ("1","2","3") so message content may be stub or from a real request depending on backend state. **Missing:** Real conversation list derived from user’s requests.

### 1.7 Rate provider
- **Status:** **Fully working**
- **Frontend:** `RatingsScreen` → `rateRequest({ requestId, rating, ratingSpeed?, ratingQuality?, ratingProfessionalism?, comment? })` → `POST /requests/:requestId/rate`
- **Backend:** `requests.ts` — only customer can rate, request must be completed, has provider, not already rated. Writes to rating store (DB).

### 1.8 View notifications
- **Status:** **Working**
- **Frontend:** `NotificationsScreen` → `fetchNotifications()` → `GET /notifications`; mark read → `PATCH /notifications/:id/read`
- **Backend:** `notifications.ts` — list from DB (paginated); on DB error returns empty list (no 500). Mark read with try/catch (404 on error). Register device: `POST /notifications/register`; Unregister: `POST /notifications/unregister`.

### 1.9 Other customer features
- **Profile:** `ProfileScreen` — UI; no dedicated customer profile API (auth user from session).
- **Provider profile (view):** `ProviderProfileScreen` → `fetchProviderById(id)` → `GET /providers/:id` — **working**.
- **All providers list:** `AllProvidersScreen` — uses same nearby/providers data; **working**.
- **Payment:** `PaymentScreen` — **UI only**; “Add payment method coming soon” toast; no payment API.
- **Favorites:** `FavoritesScreen` — **UI only**; empty state; no API, no persistence.
- **Help & Support:** `HelpSupportScreen` — **UI only**; no ticket/API.

---

## 2. SERVICE PROVIDER ROLE (Mechanic / Tow / Rental)

### 2.1 Login
- **Status:** **Fully working**
- Same auth as customer; role from backend (`mechanic`, `mechanic_tow`, `car_rental`). `RoleNavigator` shows MechanicStack, TowStack, or RentalStack.

### 2.2 Set availability
- **Status:** **Fully working**
- **Frontend:** Mechanic dashboard (and profile) → `updateProviderAvailability(isAvailable)` → `PATCH /providers/me/availability`
- **Backend:** `providers.ts` — `upsertProvider` with `isAvailable`.

### 2.3 Appear on map
- **Status:** **Backend only; frontend not sending location**
- **Backend:** `GET /providers/nearby` returns providers from DB with location; `PATCH /providers/me/location` and `POST /providers/location` update provider location (rate-limited).
- **Frontend:** No provider screen calls location update APIs. `providerProfileApi` has only GET /me, PATCH /me (profile), PATCH /me/availability. So provider location is never sent from the app; they appear on map only if already in DB with location (e.g. seed or manual DB entry).

### 2.4 Receive requests
- **Status:** **Working**
- **Frontend:** `MechanicDashboardScreen` / Tow / Rental dashboards → `fetchMechanicDashboard()` / tow/rental equivalents → `GET /dashboard/mechanic` (or `/dashboard/tow`, `/dashboard/rental`)
- **Backend:** `dashboard.ts` — `listPendingRequests(serviceType)` (pending, no provider) + `listRequestsByProvider(providerId)`; merges into jobs with ETA; on DB error returns empty jobs.

### 2.5 Accept / Reject requests
- **Status:** **Working**
- **Frontend:** `useMechanicDashboard` → `acceptJob(requestId)` / `declineJob(requestId)` → `updateRequestStatus({ requestId, status: 'accepted' | 'cancelled' })` → `PATCH /requests/:id/status`
- **Backend:** `requests.ts` — provider can set status `accepted` on pending request (then providerId and optional etaMinutes set); can set `cancelled`. Notifications created for customer on accepted, on_the_way, completed.

### 2.6 Change request status
- **Status:** **Working**
- Provider can set: accepted, on_the_way, completed (and cancelled). Frontend uses same `updateRequestStatus`; backend computes ETA when status is on_the_way and updates request.

### 2.7 Navigation
- **Status:** **UI only**
- Map screen available in provider stacks; no deep link or in-app turn-by-turn. “Open Map” / “Navigate” is present as UI but no integration with external maps (e.g. open in Google Maps) verified in codebase.

### 2.8 Chat with customer
- **Status:** **Same as customer** — partially implemented; conversation list stub; messages by requestId work when request exists and user is participant.

### 2.9 Ratings (view as provider)
- **Status:** **Working**
- **Frontend:** `RatingsScreen` (provider) / `useProviderRatings` → `fetchProviderRatings()` → `GET /providers/me/ratings`
- **Backend:** `GET /providers/me/ratings` returns list + average. Exists and connected.

### 2.10 Provider profile (edit)
- **Status:** **Working**
- **Frontend:** Profile → `fetchMyProviderProfile()`, `updateProviderServices(services)`, `updateProviderAvailability(isAvailable)` → GET/PATCH `/providers/me`, PATCH `/providers/me/availability`
- **Backend:** Implemented; DB or fallback profile when DB fails.

---

## 3. ADMIN ROLE

### 3.1 Admin dashboard
- **Status:** **Partially connected — response shape mismatch**
- **Frontend:** `AdminDashboardScreen` → `useAdminDashboard()` → `fetchAdminDashboard()` → `GET /admin/dashboard`. Expects: `stats`, `chartData`, `mechanicPanel.stats/requests`, `towPanel.stats/requests`, `rentalPanel.stats/vehicles`, `providers.mechanic/tow/rental`.
- **Backend:** Returns `stats` (users, providers, requests, activeProviders, activeRequests, completedServices, pendingRequests, revenue), and arrays `mechanics`, `tow`, `rental` (provider objects). **No** `chartData`, **no** `mechanicPanel.requests` (with title, customerName, distance, eta, status), **no** `towPanel.requests`, **no** `rentalPanel.vehicles`. So dashboard loads but chart and panel lists are empty; stats can be partially mapped if frontend adapts.

### 3.2 User management
- **Status:** **UI only — no API used**
- **Frontend:** `AdminUsersScreen` uses `useAdminUsers()` which is **fully mock**: `INITIAL_USERS` from `MOCK_CUSTOMERS`, `MOCK_PROVIDERS_ALL`, `MOCK_ADMINS`. Block/Edit update local state only.
- **Backend:** `GET /admin/users`, `PATCH /admin/users/:id/block` exist and work (authStore: getAllUsers, setUserBlocked). **Not called from frontend.**

### 3.3 Provider management
- **Status:** **Backend exists; list/verify UI not connected**
- **Backend:** `GET /admin/providers`, `PATCH /admin/providers/:id/verify` implemented.
- **Frontend:** `AdminProviderListScreen` uses `useAdminDashboard()` → `getProvidersByRole(role)` which expects `data.providers.mechanic/tow/rental`. Backend returns `mechanics`, `tow`, `rental` at top level, so frontend `data?.providers` is undefined and the list is empty. Verify button only shows a toast; does not call `PATCH /admin/providers/:id/verify`.

### 3.4 Request monitoring
- **Status:** **UI only — mock data**
- **Frontend:** `AdminRequestsScreen` uses `MOCK_REQUESTS` only; filter by status/service; no API call.
- **Backend:** No dedicated `GET /admin/requests` endpoint. Request counts exist in admin dashboard stats; full list endpoint for admin not present.

### 3.5 Analytics
- **Status:** **UI only**
- Admin dashboard expects `chartData`; backend does not return it. So analytics charts are empty or undefined.

### 3.6 Banning users
- **Status:** **Backend only**
- **Backend:** `PATCH /admin/users/:id/block` with `{ blocked: true }` implemented. Login rejects blocked users.
- **Frontend:** Admin Users screen does not call this API; uses mock and local state.

### 3.7 Viewing complaints
- **Status:** **Not implemented**
- No complaints/reports API or UI in codebase.

---

## 4. API CONNECTIVITY

### 4.1 Auth
| Endpoint            | Backend | Frontend use      | Status   |
|---------------------|---------|-------------------|----------|
| POST /auth/register | Yes     | RegisterScreen    | Working  |
| POST /auth/login    | Yes     | LoginScreen       | Working  |
| POST /auth/refresh  | Yes     | refreshAccessToken| Working  |
| POST /auth/logout   | Yes     | authStore.logout  | Working  |
| GET /auth/me        | Yes     | Not used (session from login/register) | Exists   |

### 4.2 Providers
| Endpoint                     | Backend | Frontend use           | Status   |
|-----------------------------|---------|------------------------|----------|
| GET /providers/nearby       | Yes     | MapScreen, nearby list | Working  |
| GET /providers/:id          | Yes     | ProviderProfileScreen  | Working  |
| GET /providers/me           | Yes     | useProviderProfile     | Working  |
| PATCH /providers/me         | Yes     | providerProfileApi     | Working  |
| PATCH /providers/me/availability | Yes | providerProfileApi     | Working  |
| PATCH /providers/me/location| Yes     | **Not called**         | Missing FE |
| POST /providers/location    | Yes     | **Not called**         | Missing FE |
| GET /providers/me/ratings   | Yes     | useProviderRatings     | Working  |
| GET /providers/:id/ratings  | Yes     | (can be used)          | Exists   |

### 4.3 Requests
| Endpoint                    | Backend | Frontend use        | Status   |
|----------------------------|---------|---------------------|----------|
| POST /requests             | Yes     | createRequest       | Working  |
| GET /requests/customer     | Yes     | fetchCustomerRequests | Working |
| GET /requests/provider     | Yes     | fetchProviderRequests (dashboard) | Working |
| GET /requests/:id          | Yes     | getRequestById, useRequest | Working |
| PATCH /requests/:id/status | Yes     | updateRequestStatus  | Working  |
| POST /requests/:id/rate    | Yes     | rateRequest         | Working  |

### 4.4 Notifications
| Endpoint                    | Backend | Frontend use     | Status   |
|----------------------------|---------|------------------|----------|
| GET /notifications         | Yes     | fetchNotifications | Working (empty on DB error) |
| PATCH /notifications/:id/read | Yes   | markNotificationRead | Working |
| POST /notifications/register | Yes  | (push)           | Exists   |
| POST /notifications/unregister | Yes | cleanup          | Exists   |

### 4.5 Chat
| Endpoint                                | Backend | Frontend use   | Status        |
|----------------------------------------|---------|----------------|---------------|
| GET /chat/conversations                | Yes (stub list) | fetchConversations | Connected; stub data |
| GET /chat/conversations/:id/messages   | Yes (requestId) | fetchMessages | Partial; ID = requestId |
| POST /chat/conversations/:id/messages  | Yes     | sendMessage    | Working when request exists |

### 4.6 Dashboard (provider)
| Endpoint                | Backend | Frontend use     | Status   |
|-------------------------|---------|------------------|----------|
| GET /dashboard/mechanic | Yes     | mechanicDashboardApi | Working |
| GET /dashboard/tow      | Yes     | towDashboardApi  | Working  |
| GET /dashboard/rental   | Yes     | rentalDashboardApi | Working |

### 4.7 Admin
| Endpoint                  | Backend | Frontend use      | Status        |
|---------------------------|---------|-------------------|---------------|
| GET /admin/dashboard      | Yes     | fetchAdminDashboard | Shape mismatch; panels empty |
| GET /admin/users          | Yes     | **Not used**      | Missing FE    |
| PATCH /admin/users/:id/block | Yes  | **Not used**      | Missing FE    |
| GET /admin/providers      | Yes     | Unclear (dashboard uses /admin/dashboard) | Exists |
| PATCH /admin/providers/:id/verify | Yes | Unclear        | Exists        |

### 4.8 Health
| Endpoint         | Backend | Frontend use | Status |
|------------------|---------|--------------|--------|
| GET /health      | Yes     | —            | Exists |
| GET /health/ready| Yes     | —            | Exists |

---

## 5. MAP SYSTEM

- **How providers appear:** Map uses `useNearbyProviders({ latitude, longitude, radiusKm, availableOnly, role, page, limit })` which calls `GET /providers/nearby`. Backend returns providers from DB (with location) or mock list when DB fails. Frontend falls back to `MOCK_PROVIDERS` / `getFallbackNearbyProviders()` on API error so markers always show.
- **How nearby is fetched:** Single GET with query params; no WebSocket. Optional refetch every 5s when `realTimeTracking=true` (used when tracking active request).
- **Real location:** Customer location from `useUserLocation()` (device GPS). Provider locations come from DB (or mock); providers do **not** send their location from the app (no frontend call to PATCH/POST location).
- **Real-time updates:** Polling only (e.g. 5s refetch for tracking). No live push of provider position.

---

## 6. REQUEST LIFECYCLE

| Step                        | Implemented | Notes |
|----------------------------|-------------|--------|
| Customer creates request   | Yes         | POST /requests; optional providerId; offline_ when DB down |
| Provider receives request  | Yes         | GET /dashboard/mechanic (or tow/rental); listPendingRequests + listRequestsByProvider |
| Provider accept            | Yes         | PATCH /requests/:id/status { status: 'accepted' }; providerId set, notification to customer |
| Provider reject/decline    | Yes         | PATCH status 'cancelled' |
| Customer tracks request    | Yes         | GET /requests/:id; LiveTrackingScreen shows status, provider, ETA, location |
| Provider on_the_way        | Yes         | PATCH status; ETA computed and stored; notification |
| Provider complete          | Yes         | PATCH status 'completed'; notification |
| Customer rate              | Yes         | POST /requests/:id/rate after completed |

Flow is implemented end-to-end; accept/reject/status/rate are connected. Only “rejected” in frontend refetch logic does not exist in backend (backend uses “cancelled”).

---

## 7. DATABASE / DATA STORAGE

- **Primary:** PostgreSQL via **Prisma** (authStore, requestStore, providerStore, notificationStore, ratingStore, chatStore). All persistent.
- **In-memory (fallback only):**  
  - `offlineRequests` Map in `requests.ts` for synthetic `offline_*` requests when DB fails on create; returned by GET /requests/:id for that customer.  
  - Mock nearby providers in `providers.ts` when `findNearby` fails.  
  - No local JSON file storage.
- **Persistence:** Data persists after server restart for all DB-backed data. In-memory offline requests and any in-process mock data are lost on restart.
- **Frontend:** Session (tokens + user) persisted in AsyncStorage/SecureStore; no local DB for business data.

---

## 8. FINAL SUMMARY TABLE

| Feature              | Role     | Status    | Problem | Fix needed |
|----------------------|----------|-----------|---------|------------|
| Register             | Customer | Working   | —       | —          |
| Login                | All      | Working   | —       | —          |
| Refresh token        | All      | Working   | —       | —          |
| See nearby providers | Customer | Working   | Fallback to mock on API fail | Optional: reduce fallback scope |
| Create request       | Customer | Working   | —       | —          |
| Track request        | Customer | Working   | —       | —          |
| Live tracking screen | Customer | Working   | —       | —          |
| Request history      | Customer | Working   | —       | —          |
| Rate provider        | Customer | Working   | —       | —          |
| View notifications   | Customer | Working   | —       | —          |
| Mark notification read | Customer | Working | —       | —          |
| Chat list            | Customer/Provider | Partial | Backend returns stub list | Backend: request-based conversation list |
| Chat messages        | Customer/Provider | Partial | Messages by requestId; list not aligned | Align conversation ID with requestId; document contract |
| Provider profile (view) | Customer | Working | —       | —          |
| Payment              | Customer | UI only   | No API  | Add payment backend + connect |
| Favorites            | Customer | UI only   | No API  | Add favorites API + connect |
| Help/Support         | Customer | UI only   | No API  | Add if needed |
| Set availability     | Provider | Working   | —       | —          |
| Appear on map        | Provider | Backend only | Frontend never sends location | Add provider location update UI + call PATCH /me/location or POST /location |
| Receive requests     | Provider | Working   | —       | —          |
| Accept request       | Provider | Working   | —       | —          |
| Reject/decline       | Provider | Working   | —       | —          |
| Change status        | Provider | Working   | —       | —          |
| View own ratings     | Provider | Working   | —       | —          |
| Edit profile (services) | Provider | Working | —       | —          |
| Navigation           | Provider | UI only   | No external map link | Optional: open in maps app |
| Admin dashboard      | Admin    | Partial   | Backend response shape ≠ frontend (chartData, panels) | Align backend response to mechanicPanel/towPanel/rentalPanel or map backend data in FE |
| Admin users list     | Admin    | UI only   | useAdminUsers is mock; no GET /admin/users | Connect to GET /admin/users |
| Admin block user     | Admin    | Backend only | UI doesn’t call PATCH users/:id/block | Connect block/unblock to API |
| Admin providers list | Admin    | Broken    | Dashboard returns mechanics/tow/rental, not providers.*; list empty | Map backend mechanics/tow/rental to providers by role or use GET /admin/providers |
| Admin verify provider| Admin    | Backend only | Verify button only toasts; no API call | Connect to PATCH /admin/providers/:id/verify |
| Admin requests list  | Admin    | UI only   | MOCK_REQUESTS only; no GET /admin/requests | Add GET /admin/requests and connect |
| Admin analytics      | Admin    | UI only   | No chartData from backend | Add chartData or compute from stats |
| Admin complaints     | Admin    | Missing  | —       | Implement if required |

---

*Report based solely on codebase inspection; no runtime testing. Backend base path: `/` for auth, requests, providers, notifications, dashboard, admin, chat; frontend uses shared API base URL from env.*
