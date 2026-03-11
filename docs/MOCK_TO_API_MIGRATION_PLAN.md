# Mock-to-API Migration Plan – Roadly

This document identifies every feature using mock data and provides a step-by-step migration to real REST APIs: endpoint definitions, request/response schemas, backend route implementations, and frontend API + hook wiring.

---

## 1. Mechanic Dashboard

### 1.1 Current mock usage

- **Hook:** `src/features/mechanic/hooks/useMechanicDashboard.ts`
- **Data:** `MOCK_JOBS` (mechanic requests/jobs), `MOCK_REQUESTERS` (“who requested me”), stats (jobsToday, onTheWay, rating) hardcoded.

### 1.2 Required REST API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/mechanic/dashboard` | Yes (mechanic) | Dashboard stats + recent jobs for logged-in mechanic |
| GET | `/mechanic/requests` | Yes (mechanic) | List requests assigned to this mechanic (query: `?status=all\|new\|on_the_way\|in_garage`) |
| GET | `/mechanic/requesters` | Yes (mechanic) | List customers who requested this mechanic (who requested me) |
| PATCH | `/requests/:id/status` | Yes | Accept/decline or update status (existing; ensure mechanic can set `accepted` / `on_the_way` / `in_garage`) |

### 1.3 Request/response schemas

**GET /mechanic/dashboard**

- Response:
```ts
{
  stats: {
    jobsToday: number;
    onTheWay: number;
    rating: string;  // e.g. "4.9"
  };
}
```

**GET /mechanic/requests?status=all|new|on_the_way|in_garage**

- Response:
```ts
{
  items: Array<{
    id: string;
    title: string;        // e.g. "Flat tire - Corolla 2019"
    distance: string;     // e.g. "1.2 km"
    eta: string;          // e.g. "08 min" or "Pending"
    status: 'new' | 'on_the_way' | 'in_garage';
    customerName?: string;
    customerId?: string;
  }>;
  total: number;
  page?: number;
  limit?: number;
}
```

**GET /mechanic/requesters**

- Response:
```ts
{
  items: Array<{
    id: string;
    customerName: string;
    serviceType: string;
    time: string;   // relative, e.g. "10 min ago"
    status: string;
    requestId?: string;
  }>;
  total: number;
}
```

### 1.4 Backend implementation (Express)

- Add `backend/src/routes/mechanic.ts` and mount at `/mechanic`.
- Add `backend/src/store/requestStore.ts` helpers (or reuse): e.g. `listRequestsForMechanic(mechanicId, status?)`, and for “requesters” use same store with a different view (by customer).
- **Dashboard:** `GET /mechanic/dashboard` → authGuard, role check `mechanic`, return stats from requestStore (count by status, today’s jobs; rating can come from a future ratings table or mock for now).
- **Requests:** `GET /mechanic/requests?status=...` → authGuard, role mechanic, return list from `listRequestsForMechanic(req.user.id, status)`.
- **Requesters:** `GET /mechanic/requesters` → authGuard, return list of customers who have requests for this mechanic (from requestStore + authStore for names).

### 1.5 Frontend API layer

- Add `src/features/mechanic/data/mechanicApi.ts`:
  - `fetchMechanicDashboard(): Promise<MechanicDashboardStats>`
  - `fetchMechanicRequests(status?: string): Promise<{ items: MechanicJob[]; total: number }>`
  - `fetchMechanicRequesters(): Promise<{ items: RequesterItem[]; total: number }>`
- Use existing `updateRequestStatus` from `requestApi` for accept/decline.

### 1.6 Replace mock in hook

- In `useMechanicDashboard.ts`: remove `MOCK_JOBS` and `MOCK_REQUESTERS`.
- Use `useQuery` for dashboard stats, requests list, and requesters list (keys: `['mechanic', 'dashboard']`, `['mechanic', 'requests', statusFilter]`, `['mechanic', 'requesters']`).
- Use `useMutation` for accept/decline that calls `updateRequestStatus` and invalidates `['mechanic', 'requests']` and `['mechanic', 'dashboard']`.
- Keep `statusFilter` in component state; pass it to `fetchMechanicRequests(statusFilter)`.

---

## 2. Tow Dashboard

### 2.1 Current mock usage

- **Hook:** `src/features/tow/hooks/useTowDashboard.ts`
- **Data:** `MOCK_JOBS`, `MOCK_REQUESTERS`, stats (active, waiting, fleet) hardcoded.

### 2.2 Required REST API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tow/dashboard` | Yes (tow) | Stats: active tows, waiting, fleet size |
| GET | `/tow/requests` | Yes (tow) | List towing requests (query: `?status=all\|active\|queued`) |
| GET | `/tow/requesters` | Yes (tow) | Who requested this tow provider |
| PATCH | `/requests/:id/status` | Yes | Accept/update status (same as mechanic) |

### 2.3 Request/response schemas

**GET /tow/dashboard**

- Response:
```ts
{
  stats: {
    active: number;
    waiting: number;
    fleet: number;
  };
}
```

**GET /tow/requests?status=all|active|queued**

- Response:
```ts
{
  items: Array<{
    id: string;
    title: string;
    distance: string;
    eta: string;
    vehicle: string;   // e.g. "Tow Truck #A23"
    status: 'active' | 'queued';
    customerName?: string;
  }>;
  total: number;
}
```

**GET /tow/requesters**

- Response: same shape as mechanic requesters (customerName, serviceType, time, status).

### 2.4 Backend implementation

- Add `backend/src/routes/tow.ts`, mount at `/tow`.
- Reuse requestStore: filter by `serviceType === 'tow'` and providerId = current user (or assignable tow providers). Implement `listRequestsForTow(towUserId, status?)`.
- Dashboard stats: count by status from `listRequestsForTow`; fleet size from a new `towFleetStore` or a `providers` extension (e.g. vehicles per tow user).

### 2.5 Frontend API layer

- Add `src/features/tow/data/towApi.ts`: `fetchTowDashboard()`, `fetchTowRequests(status?)`, `fetchTowRequesters()`.
- Reuse `updateRequestStatus` for accept/status updates.

### 2.6 Replace mock in hook

- Same pattern as mechanic: `useQuery` for dashboard, requests, requesters; `statusFilter` in state; `useMutation` for status updates with cache invalidation.

---

## 3. Rental Dashboard

### 3.1 Current mock usage

- **Hook:** `src/features/rental/hooks/useRentalDashboard.ts`
- **Data:** `MOCK_VEHICLES`, `MOCK_BOOKINGS`, stats (total, available, rented) hardcoded.

### 3.2 Required REST API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/rental/dashboard` | Yes (rental) | Stats: total vehicles, available, rented, maintenance |
| GET | `/rental/vehicles` | Yes (rental) | List vehicles (query: `?status=all\|available\|rented\|maintenance`) |
| GET | `/rental/bookings` | Yes (rental) | Upcoming/past bookings for this rental provider |
| POST | `/rental/vehicles` | Yes (rental) | Add vehicle (body: name, plate, price, status) |
| PATCH | `/rental/vehicles/:id` | Yes (rental) | Update vehicle (e.g. status) |

### 3.3 Request/response schemas

**GET /rental/dashboard**

- Response:
```ts
{
  stats: {
    total: number;
    available: number;
    rented: number;
    maintenance?: number;
  };
}
```

**GET /rental/vehicles?status=...**

- Response:
```ts
{
  items: Array<{
    id: string;
    name: string;
    plate: string;
    status: 'available' | 'rented' | 'maintenance';
    price: string;   // e.g. "180 SAR / day"
  }>;
  total: number;
}
```

**GET /rental/bookings**

- Response:
```ts
{
  items: Array<{
    id: string;
    customer: string;
    vehicle: string;
    time: string;
    status?: string;
  }>;
  total: number;
}
```

**POST /rental/vehicles**  
Body: `{ name: string; plate: string; price: string; status?: 'available' | 'maintenance' }`

**PATCH /rental/vehicles/:id**  
Body: `{ name?: string; plate?: string; price?: string; status?: 'available' | 'rented' | 'maintenance' }`

### 3.4 Backend implementation

- Add `backend/src/store/rentalStore.ts`: vehicles (id, userId, name, plate, status, price), bookings (id, vehicleId, customerId, time, status).
- Add `backend/src/routes/rental.ts`: dashboard (aggregate from rentalStore), list vehicles, list bookings, create vehicle, update vehicle. All guarded by authGuard and role `car_rental`.

### 3.5 Frontend API layer

- Add `src/features/rental/data/rentalApi.ts`: `fetchRentalDashboard()`, `fetchRentalVehicles(status?)`, `fetchRentalBookings()`, `createRentalVehicle(payload)`, `updateRentalVehicle(id, payload)`.

### 3.6 Replace mock in hook

- useQuery for dashboard, vehicles (with status filter), bookings; useMutation for create/update vehicle; invalidate lists and dashboard on success.

---

## 4. Admin Dashboard

### 4.1 Current mock usage

- **Hook:** `src/features/admin/hooks/useAdminDashboard.ts`
- **Data:** Global stats, chartData, MOCK_MECHANICS, MOCK_TOW, MOCK_RENTAL, MOCK_MECHANIC_REQUESTS, MOCK_TOW_REQUESTS, MOCK_RENTAL_VEHICLES; all filtered client-side.

### 4.2 Required REST API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/dashboard` | Yes (admin) | Global stats + optional chart data (e.g. requests last 7 days) |
| GET | `/admin/mechanic/requests` | Yes (admin) | All mechanic requests (query: `?status=all\|new\|on_the_way\|in_garage`) |
| GET | `/admin/tow/requests` | Yes (admin) | All tow requests (query: `?status=all\|active\|queued`) |
| GET | `/admin/rental/vehicles` | Yes (admin) | All rental vehicles (query: `?status=all\|available\|rented\|maintenance`) |
| GET | `/admin/providers` | Yes (admin) | List providers by role (query: `?role=mechanic\|tow\|rental`) |

### 4.3 Request/response schemas

**GET /admin/dashboard**

- Response:
```ts
{
  stats: {
    users: number;
    providers: number;
    requests: number;
    revenue: string;
    mechanicsCount: number;
    towCount: number;
    rentalCount: number;
  };
  chartData?: number[];  // e.g. [40, 65, 45, 80, 55, 70, 60] for last 7 days
}
```

**GET /admin/mechanic/requests?status=...**

- Response: same as mechanic panel (list of AdminMechanicRequest-like items).

**GET /admin/tow/requests?status=...**

- Response: same as tow panel.

**GET /admin/rental/vehicles?status=...**

- Response: same as rental vehicles list.

**GET /admin/providers?role=mechanic|tow|rental**

- Response:
```ts
{
  items: Array<{
    id: string;
    name: string;
    role: 'mechanic' | 'tow' | 'rental';
    status: string;
    requestsCount?: number;
  }>;
  total: number;
}
```

### 4.4 Backend implementation

- Add `backend/src/middleware/adminGuard.ts`: same as authGuard but also require `req.user.role === 'admin'`.
- Add `backend/src/routes/admin.ts`: mount at `/admin`, use authGuard + adminGuard for all routes.
- Dashboard: aggregate from authStore (user count), providerStore (provider count), requestStore (request count, last 7 days for chart); revenue/mechanicsCount/towCount/rentalCount from same or new aggregates.
- Mechanic/tow/rental lists: call existing or new store helpers that return all requests/vehicles (no filter by current user); filter by status in query.

### 4.5 Frontend API layer

- Add `src/features/admin/data/adminApi.ts`: `fetchAdminDashboard()`, `fetchAdminMechanicRequests(status?)`, `fetchAdminTowRequests(status?)`, `fetchAdminRentalVehicles(status?)`, `fetchAdminProviders(role?)`.

### 4.6 Replace mock in hook

- useAdminDashboard: use useQuery for dashboard (stats + chartData), and separate useQuery per panel (mechanic requests, tow requests, rental vehicles) with filter from state. Remove all MOCK_* and getProvidersByRole from API `fetchAdminProviders(role)`.

---

## 5. Admin Users

### 5.1 Current mock usage

- **Hook:** `src/features/admin/hooks/useAdminUsers.ts`
- **Data:** `MOCK_USERS`, `MOCK_SERVICES`; updateUser and setUserAssignedServices update local state only.

### 5.2 Required REST API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | Yes (admin) | List all users (query: `?role=&status=&page=&limit=`) |
| GET | `/admin/services` | Yes (admin) | List all service types by category (mechanic/tow/rental) |
| GET | `/admin/users/:id` | Yes (admin) | Single user with assigned service IDs |
| PATCH | `/admin/users/:id` | Yes (admin) | Update user (name, role, status) |
| PUT | `/admin/users/:id/services` | Yes (admin) | Set assigned service IDs (body: `{ serviceIds: string[] }`) |

### 5.3 Request/response schemas

**GET /admin/users**

- Response:
```ts
{
  items: Array<{
    id: string;
    name: string;
    email: string;
    role: 'user' | 'mechanic' | 'tow' | 'rental' | 'admin';
    status: 'active' | 'suspended' | 'pending';
    assignedServiceIds: string[];
  }>;
  total: number;
  page?: number;
  limit?: number;
}
```

**GET /admin/services**

- Response:
```ts
{
  items: Array<{
    id: string;
    name: string;
    category: 'mechanic' | 'tow' | 'rental';
  }>;
}
```

**PATCH /admin/users/:id**  
Body: `{ name?: string; role?: AdminUserRole; status?: AdminUserStatus }`

**PUT /admin/users/:id/services**  
Body: `{ serviceIds: string[] }`

### 5.4 Backend implementation

- Extend authStore (or add userMetadataStore): add `status`, and optionally `assignedServiceIds` per user. Or add a new `userServices` table/map: userId → serviceIds[].
- admin routes: list users from authStore (and metadata), list services from a new `serviceCatalogStore` (id, name, category). PATCH user: update name/role in authStore and status in metadata. PUT services: update userServices store.

### 5.5 Frontend API layer

- In `src/features/admin/data/adminApi.ts` add: `fetchAdminUsers(params?)`, `fetchAdminServices()`, `fetchAdminUserById(id)`, `updateAdminUser(id, payload)`, `setAdminUserServices(id, serviceIds)`.

### 5.6 Replace mock in hook

- useAdminUsers: useQuery for users list and for services list. useMutation for updateUser and setUserAssignedServices; on success invalidate users query and optionally refetch single user.

---

## 6. Provider Profile (services)

### 6.1 Current mock usage

- **Hook:** `src/features/profile/hooks/useProviderProfile.ts`
- **Data:** profile (name, avatarUri, rating, status) from local state; services and servicesPool from hardcoded arrays (MECHANIC_SERVICES_POOL, etc.).

### 6.2 Required REST API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile/me` or `/providers/me` | Yes (provider) | Current provider profile + assigned services |
| GET | `/admin/services` or `/services/catalog` | Yes | Service catalog by category (for “add service” list) |
| PUT | `/profile/me/services` or `/providers/me/services` | Yes (provider) | Set my services (body: `{ serviceIds: string[] }` or `{ serviceNames: string[] }`) |

If profile is shared with provider store: GET/PATCH `/providers/me` for name, avatar, status, rating.

### 6.3 Request/response schemas

**GET /providers/me** (or /profile/me for full profile)

- Response:
```ts
{
  id: string;
  name: string;
  avatarUri: string | null;
  rating: number;
  status: 'available' | 'busy' | 'on_the_way';
  services: string[];   // or serviceIds[] if using catalog
  role: 'mechanic' | 'mechanic_tow' | 'car_rental';
}
```

**PUT /providers/me/services**  
Body: `{ services: string[] }` (names) or `{ serviceIds: string[] }`

### 6.4 Backend implementation

- Extend providerStore (or authStore) to hold for each provider: name, avatarUri, rating, status, services[].
- GET /providers/me: authGuard, require provider role, return current user’s provider profile + services.
- PUT /providers/me/services: authGuard, update provider’s services in store.
- Service catalog: same as admin services (shared list of service names/ids by category).

### 6.5 Frontend API layer

- Add `src/features/profile/data/profileApi.ts` (or under providers): `fetchMyProfile()`, `updateMyServices(services: string[])`. Reuse admin services catalog endpoint for “available to add” or add public `GET /services/catalog?category=mechanic|tow|rental`.

### 6.6 Replace mock in hook

- useProviderProfile(role, displayName): useQuery for profile (and services) when role is provider; useQuery for service catalog by role/category. useMutation for add/remove service (call updateMyServices with new list); keep availableToAdd derived from catalog minus current services.

---

## 7. Notifications

### 7.1 Current mock usage

- **Screen:** `src/features/notifications/presentation/screens/NotificationsScreen.tsx`
- **Data:** `MOCK_NOTIFICATIONS` array; read state in local React state only.

### 7.2 Required REST API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Yes | List notifications for current user (query: `?page=&limit=&unreadOnly=`) |
| PATCH | `/notifications/:id/read` | Yes | Mark as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read (optional) |

### 7.3 Request/response schemas

**GET /notifications**

- Response:
```ts
{
  items: Array<{
    id: string;
    title: string;
    body: string;
    time: string;   // ISO or relative
    type: 'request' | 'status' | 'promo';
    read: boolean;
    data?: Record<string, unknown>;  // e.g. requestId, deep link
  }>;
  total: number;
  unreadCount?: number;
}
```

**PATCH /notifications/:id/read**  
Body: `{}` or `{ read: true }`

### 7.4 Backend implementation

- Extend `backend/src/store/notificationStore.ts`: store notifications (id, userId, title, body, time, type, read, data). Add: `createNotification(userId, payload)`, `listNotifications(userId, options)`, `markRead(id)`, `markAllRead(userId)`. Integrate with request creation/status updates to create notifications.
- Add routes in `backend/src/routes/notifications.ts`: GET list, PATCH :id/read, PATCH read-all.

### 7.5 Frontend API layer

- Add `src/features/notifications/data/notificationsApi.ts`: `fetchNotifications(params?)`, `markNotificationRead(id)`, `markAllNotificationsRead()`.

### 7.6 Replace mock in screen/hook

- Create `useNotifications()`: useQuery for list; useMutation for mark read / mark all read. In NotificationsScreen, use this hook instead of MOCK_NOTIFICATIONS and local readIds; derive read state from `item.read` and invalidate on mutation success.

---

## 8. Chat

### 8.1 Current mock usage

- **Screen:** `src/features/chat/presentation/screens/ChatScreen.tsx`
- **Data:** `MOCK_CHATS` (list of conversations with name, lastMessage, time, unread); no backend.

### 8.2 Required REST API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/chat/channels` | Yes | List conversation channels (with last message, unread count) |
| GET | `/chat/channels/:id/messages` | Yes | Get messages for a channel (query: `?before=&limit=`) |
| POST | `/chat/channels/:id/messages` | Yes | Send message (body: `{ content: string }`) |
| POST | `/chat/channels` | Yes | Create or get channel with another user (body: `{ participantId: string }`) |
| PATCH | `/chat/channels/:id/read` | Yes | Mark channel as read (optional) |

### 8.3 Request/response schemas

**GET /chat/channels**

- Response:
```ts
{
  items: Array<{
    id: string;
    participant: {
      id: string;
      name: string;
      role?: string;
      icon?: string;  // or derive from role
    };
    lastMessage: {
      content: string;
      time: string;
      fromMe: boolean;
    } | null;
    unreadCount: number;
  }>;
  total: number;
}
```

**GET /chat/channels/:id/messages**

- Response:
```ts
{
  items: Array<{
    id: string;
    content: string;
    senderId: string;
    time: string;
    fromMe: boolean;
  }>;
  hasMore: boolean;
}
```

**POST /chat/channels/:id/messages**  
Body: `{ content: string }`  
Response: created message object.

**POST /chat/channels**  
Body: `{ participantId: string }`  
Response: channel object (or existing channel if already exists).

### 8.4 Backend implementation

- Add `backend/src/store/chatStore.ts`: channels (id, participantIds[], createdAt), messages (id, channelId, senderId, content, time). Helpers: listChannels(userId), getOrCreateChannel(userId, participantId), getMessages(channelId, options), addMessage(channelId, senderId, content), markChannelRead(channelId, userId).
- Add `backend/src/routes/chat.ts`: GET /chat/channels, GET /chat/channels/:id/messages, POST /chat/channels/:id/messages, POST /chat/channels; all authGuard.

### 8.5 Frontend API layer

- Add `src/features/chat/data/chatApi.ts`: `fetchChannels()`, `fetchMessages(channelId, params?)`, `sendMessage(channelId, content)`, `createOrGetChannel(participantId)`.

### 8.6 Replace mock in screen

- Create `useChatChannels()`: useQuery for channels list. ChatScreen uses this instead of MOCK_CHATS. On open chat: navigate to a ChatThreadScreen with channelId, which uses `useMessages(channelId)` and sendMessage mutation. Optional: useChatChannels returns channels with same shape as current mock (id, name, lastMessage, time, unread).

---

## 9. Shared: service catalog

Several features (Admin Users, Provider Profile, and optionally Mechanic/Tow/Rental services screens) need a single source of truth for “service types” per role. Recommended:

- **Backend:** One store `serviceCatalogStore`: list of `{ id, name, category: 'mechanic'|'tow'|'rental' }`. Endpoints: GET `/admin/services` (admin) and GET `/services/catalog` (any authenticated user, or public) with optional `?category=`.
- **Frontend:** Single API function `fetchServiceCatalog(category?)` used by admin, profile, and any role-specific “my services” screens. Normalize to same schema (id, name, category) so Admin uses IDs and profile can use IDs or names depending on backend design.

---

## 10. Migration order (recommended)

1. **Service catalog** – Backend store + GET endpoint; frontend fetchServiceCatalog. Used by Admin and Profile.
2. **Admin users** – Backend user list + PATCH user + PUT services; frontend adminApi + useAdminUsers with API.
3. **Provider profile services** – Backend GET/PUT /providers/me (and /me/services); frontend profileApi + useProviderProfile with API.
4. **Mechanic dashboard** – Backend /mechanic/*; frontend mechanicApi + useMechanicDashboard with useQuery/useMutation.
5. **Tow dashboard** – Backend /tow/*; frontend towApi + useTowDashboard.
6. **Rental dashboard** – Backend /rental/* + rentalStore; frontend rentalApi + useRentalDashboard.
7. **Admin dashboard** – Backend /admin/dashboard and /admin/mechanic|tow|rental/*; frontend adminApi + useAdminDashboard.
8. **Notifications** – Backend notification store extensions + GET/PATCH; frontend notificationsApi + useNotifications.
9. **Chat** – Backend chatStore + routes; frontend chatApi + useChatChannels, then ChatThread screen with useMessages.

---

## 11. Frontend hook replacement pattern (summary)

For every feature:

1. **Add feature API module** under `src/features/<feature>/data/<feature>Api.ts` (or reuse shared api).
2. **Define types** in feature `domain/types.ts` or next to API (request/response DTOs).
3. **In the hook:**  
   - Remove mock constants.  
   - useQuery(key, fetcher) for lists and stats; useMutation for updates; pass query params (e.g. status filter) from hook state.  
   - On mutation success: invalidate relevant query keys (e.g. `queryClient.invalidateQueries({ queryKey: ['mechanic', 'requests'] })`).
4. **Keep UI unchanged:** screens keep using the same hook interface (stats, jobs, requesters, etc.); only the source of data changes from mock to API.
5. **Error and loading:** useQuery’s isLoading, isError, refetch and useMutation’s isPending, isError so the UI can show loaders and retry/error states where already planned (e.g. Map retry banner).

This migration plan, when implemented in the order above, replaces all mock data with real REST APIs while preserving the existing UI and navigation structure.
