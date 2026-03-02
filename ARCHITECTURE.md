# Roadly — Architecture & Geo-Location Flow

## 1. Project Overview

**Roadly** is a location-based service platform connecting users with mechanics, tow-truck mechanics, and car rental providers. The system uses real-time device location to match users with the nearest available providers.

### Core Flows
- User requests **nearest mechanic**
- User requests **mechanic with tow truck**
- User finds **nearest car rental** provider

All flows depend on: **user location** → **provider locations** → **distance/ordering** → **map display & actions**.

---

## 2. User Roles (5 Roles)

| Role | Key Capabilities |
|------|------------------|
| **User** | Request mechanic / tow / rental; view map; see distance & ETA |
| **Mechanic** | Live location; accept/reject requests; toggle Online/Offline |
| **Mechanic (Tow)** | Same as Mechanic + tow capability flag |
| **Car Rental** | Live location; list available cars; toggle availability |
| **Admin** | Manage users & providers; monitor live map; block/unblock |

Role-based feature isolation is enforced via:
- `shared/constants/roles.ts` — role enum and helpers
- Feature folders: `auth`, `map`, `location`, `providers`, `admin`
- Navigation and screens gated by role (hooks/guards)

---

## 3. Folder Structure (Feature-Based)

```
src/
├── features/
│   ├── auth/              # Login, role selection, session
│   │   ├── data/           # API, token, repositories
│   │   ├── domain/         # Types, use-case interfaces
│   │   └── presentation/   # Screens, components
│   ├── home/               # Role-specific home (user vs mechanic vs admin)
│   ├── location/           # Permission, GPS, geo utils (Haversine)
│   │   ├── data/           # locationService, permissionService
│   │   ├── domain/         # GeoPoint, LocationStatus
│   │   └── hooks/          # useLocation, useLocationPermission
│   ├── map/                # Map screen, markers, clustering (future)
│   │   ├── data/           # (optional) map config, clustering
│   │   ├── domain/         # MarkerType, MapRegion
│   │   └── presentation/   # MapScreen, Markers, ProviderCard
│   ├── providers/          # List/detail of mechanics, tow, rental
│   │   ├── data/           # API, repositories, geo queries
│   │   ├── domain/         # Provider types, filters
│   │   └── presentation/   # Lists, detail, request actions
│   └── admin/              # User/provider management, live map
│       ├── data/
│       ├── domain/
│       └── presentation/
├── shared/
│   ├── components/         # UI primitives, ErrorBoundary, Toast, Skeleton
│   ├── constants/         # roles, env, apiEndpoints
│   ├── hooks/              # Shared hooks
│   ├── services/          # HTTP client, Query client, auth token
│   ├── theme/              # Colors, spacing, typography
│   ├── types/              # Common types (User, GeoPoint, etc.)
│   └── utils/              # eventBus, formatters
├── navigation/             # Root navigator, stacks, types
└── store/                  # Zustand UI store (toast, loader)
```

---

## 4. Geo-Location Flow (Step-by-Step)

### High-level sequence

1. **App launch** → Auth/session resolved (or guest).
2. **Entry to map or “find provider”** → Location feature is used.
3. **Permission** → Request or verify location permission (expo-location).
4. **Get user position** → One-shot or watch; obtain `{ latitude, longitude }`.
5. **Backend request** → Send user coords (and optional radius/filters) to API.
6. **Backend** → Geo query (e.g. by radius/box), filter by role & availability, sort by distance, paginate.
7. **App** → Receive list of providers with `{ id, role, location, ... }`.
8. **Optional client-side sort** → Haversine for final ordering or ETA (if not done server-side).
9. **Map** → Show user marker + provider markers; on tap → detail + distance + “Request / Contact”.
10. **Real-time (future)** → WebSocket/Firebase for live provider location updates.

### Detailed step-by-step

| Step | Actor | Action |
|------|--------|--------|
| 1 | App | User opens app; auth state is loaded (or guest). |
| 2 | App | User navigates to “Map” or “Find mechanic/rental”. |
| 3 | **Location (data)** | `locationPermissionService.request()` — request or check permission. |
| 4 | **Location (data)** | If granted: `locationService.getCurrentPosition()` (or start watching for “live” user dot). |
| 5 | **Location (domain)** | Emit/store `userLocation: { latitude, longitude, lastUpdated }`. |
| 6 | **Providers (data)** | Call API e.g. `GET /providers/nearby?lat=&lng=&radius=&role=&available=&page=&limit=`. |
| 7 | **Backend** | Query DB with geo index; filter by role & availability; sort by distance; return page. |
| 8 | **Providers (presentation)** | TanStack Query caches result; list/map consume `providers` + `userLocation`. |
| 9 | **Map (presentation)** | Render user marker at `userLocation`; render provider markers; on tap show bottom sheet / modal with detail, distance, “Request service”. |
| 10 | **Distance/ETA** | Distance: Haversine (or from API). ETA: optional backend or client heuristic. |

### Data flow diagram (simplified)

```
[User Device]
     │
     ▼
Location Permission ──► Location Service (expo-location)
     │                            │
     │                            ▼
     │                    userLocation: { lat, lng }
     │                            │
     │                            ├──────────────────► Map (user marker)
     │                            │
     │                            ▼
     │                    API: GET /providers/nearby?lat=&lng=&radius=...
     │                            │
     ▼                            ▼
[Backend: geo query, filter, sort, paginate]
     │
     ▼
providers: [{ id, role, location: { lat, lng }, ... }]
     │
     ├──────────────────► List (sorted by distance)
     │
     └──────────────────► Map (provider markers, tap → detail + Request)
```

### Where each concern lives

- **Permission**: `features/location/data/locationPermissionService` (no UI in components).
- **GPS coordinates**: `features/location/data/locationService` (uses expo-location).
- **Distance**: `features/location/domain/haversine` or shared util (client-side fallback or ETA).
- **API call “nearby providers”**: `features/providers/data/providersRepository` or API service (called from hooks/use cases, not from components).
- **Map rendering**: `features/map/presentation` (receives `userLocation` and `providers` as props or from hooks).

---

## 5. Backend API Structure (Preparation)

### Location payload (stored per user/provider)

```json
{
  "latitude": number,
  "longitude": number,
  "lastUpdated": "ISO8601 timestamp"
}
```

### Suggested endpoints (to be implemented on backend)

| Method | Endpoint | Purpose |
|--------|----------|--------|
| GET | `/providers/nearby` | Geo-based listing: `lat`, `lng`, `radius` (km), `role` (mechanic \| tow \| rental), `available` (boolean), `page`, `limit`. Response: list of providers with `location` and optional `distance`/`eta`. |
| GET | `/providers/:id` | Provider detail. |
| PATCH | `/providers/me/location` | Provider updates own location (body: `latitude`, `longitude`). |
| PATCH | `/providers/me/availability` | Toggle online/offline. |
| POST | `/requests` | User creates service request (mechanic / tow / rental). |
| GET | `/admin/users`, `/admin/providers` | Admin: list, block/unblock. |
| (Future) | WebSocket or Firebase | Live location updates for map. |

### Geo query guidelines (backend)

- Index: 2dsphere or equivalent on `location` (GeoJSON or lat/lng).
- Filter by: role, availability, optional radius (or bounding box).
- Sort by: distance (from request lat/lng).
- Paginate: `page` + `limit` (e.g. 20 per page) to support scalability.

---

## 6. Map & Location Technical Notes

- **Maps**: `react-native-maps` (Expo compatible); Google Maps on Android, Apple Maps on iOS; config via `app.json` / config plugin if needed.
- **Location**: `expo-location` for permission and `getCurrentPosition` / `watchPosition`. Continuous tracking for providers is done via periodic API updates (or WebSocket later).
- **Distance**: Haversine in `shared/utils/geo` or `features/location/domain` for client-side distance; backend should do geo sort for large datasets.
- **Scalability**: Pagination and radius limits on `/providers/nearby`; map clustering when marker count is high (e.g. react-native-maps clustering library or custom).
- **Real-time**: Architecture is prepared for WebSocket or Firebase (e.g. dedicated channel for “provider locations”); no implementation in first deliverable.

---

## 7. State & Data Flow

- **Server state**: TanStack Query for `providers/nearby`, `provider/:id`, and any list/detail from API. No API calls inside components; all via hooks (e.g. `useNearbyProviders`) or use cases.
- **Global UI state**: Zustand (`store/uiStore`) for toast, global loader, and similar. No server data in Zustand.
- **Location state**: Can live in a custom hook that uses `locationService` and exposes `userLocation` and `error`; optionally persisted in Query or context for “current session” only.

---

## 8. First Deliverables Checklist

- [x] Project architecture (this document)
- [x] Role-based system structure (constants, types, feature folders)
- [x] Map integration setup (packages, map types, placeholder screen)
- [x] Location permission handling (service module)
- [x] Location service (get current position, geo types)
- [x] Haversine / geo utils (distance)
- [x] API structure and geo flow documented
- [ ] Full feature implementation (after approval)

No full features are implemented yet; the app is ready for role-based screens, map screen with markers, and provider list/detail to be built on top of this base.
