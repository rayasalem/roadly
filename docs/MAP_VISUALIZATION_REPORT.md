# MechNow – Map Visualization Report (Full Detail)

**Scope:** Map feature only. **Mode:** Read-only (no code or data changes).  
**Goal:** Clear, visual, interactive understanding of **every provider on the map**.

---

## 1. Display Every Service Provider on the Map

### 1.1 Data Shown Per Provider

Each provider on the map is represented with:

| Field | Source | Where it appears |
|-------|--------|-------------------|
| **Photo / Avatar** | `provider.photo` or `provider.avatarUri` | Web: popup (48×48, rounded). Native: ProviderBottomSheet avatar, LocationInfoCard image. Placeholder if missing (grey box or account icon). |
| **Name** | `provider.name` | Web: popup. Native: ProviderBottomSheet, LocationInfoCard, list. |
| **Phone number** | `provider.phone` or `provider.contact` | Web: popup (below name). Native: ProviderBottomSheet (below role). |
| **Exact location** | `provider.location.latitude`, `provider.location.longitude` | Used to place the marker on the map. Only providers with valid `location` (both numbers) are rendered. |

Additional fields used in UI: `role` (marker color, label), `rating`, `isAvailable` / `displayStatus`, `distanceKm` (when available).

### 1.2 Who Gets a Marker

- **Included:** Any provider in the `providers` list (from API or fallback) that has valid `location.latitude` and `location.longitude`.
- **Excluded:** Providers without location or with invalid coordinates are filtered out (e.g. in `useSortedNearbyProviders` and `mapClustering.withValidLocation`).

### 1.3 Platform Behavior

- **Web:** One marker per provider at `(location.latitude, location.longitude)`. No clustering; every provider is shown individually.
- **Native:** One marker per provider at the same coordinates, unless clustering is applied (see Section 2). When clustering is on, some markers are replaced by cluster markers (centroid + count); tapping a cluster opens the sheet for one of the providers in that cluster.

---

## 2. Clustering Rules

### 2.1 Web: No Clustering

- **Rule:** Show **all providers individually**.
- **Implementation:** `MapScreen.web.tsx` passes `sortedProviders` to `WebMapView` → `OSMMapView`. There is no call to `clusterProviders` on web. Each provider gets one Leaflet marker at its exact coordinates.
- **Result:** Every provider with valid location is visible as a single marker; popup shows full details (photo, name, phone, button).

### 2.2 Native: Cluster Only If Count > 20

- **Rule:** Use **`mapClustering.ts`** logic: cluster only when the number of providers (with valid location) **exceeds 20**.
- **Implementation:**
  - File: `src/features/map/utils/mapClustering.ts`.
  - Function: `clusterProviders(providers, threshold)` with default `threshold = 20`.
  - If `valid.length <= 20`: returns one item per provider (`type: 'provider'`) → one marker per provider at exact lat/lng.
  - If `valid.length > 20`: groups by grid cell (`GRID_SIZE = 0.015`); cells with one provider yield a single-marker item; cells with multiple yield one `type: 'cluster'` item (centroid lat/lng + count). Map then renders either individual markers or cluster markers.
- **Usage:** `MapScreen.tsx` uses `clusterItems = useMemo(() => clusterProviders(sortedProviders, CLUSTER_THRESHOLD), [sortedProviders])` with `CLUSTER_THRESHOLD = 20`.
- **Result:** Up to 20 providers → each at exact position. More than 20 → some markers are merged into clusters; user can tap cluster to open details for one provider (first in cluster).

---

## 3. Map Structure Overview

### 3.1 Screens

| Screen | File | Role |
|--------|------|------|
| Map (Native) | `src/features/map/presentation/screens/MapScreen.tsx` | Main map for iOS/Android: MapView, markers/clusters, search, filters, dock, BottomSheet, LocationInfoCard. |
| Map (Web) | `src/features/map/presentation/screens/MapScreen.web.tsx` | Main map for web: WebMapView, search, filters, list, BottomSheet. |

### 3.2 Components (Map-Specific)

| Component | File | Role |
|-----------|------|------|
| OSMMapView | `src/features/map/presentation/components/OSMMapView.tsx` | Web: Leaflet OSM map, user circle, one marker per provider, popup with photo/name/phone/button. |
| WebMapView | `src/features/map/presentation/components/WebMapView.tsx` | Web: wrapper that renders OSMMapView. |
| MapDockWithFAB | `src/features/map/presentation/components/MapDockWithFAB.tsx` | Native: bottom dock, FAB, arc filter icons. |
| LocationInfoCard | `src/features/map/presentation/components/LocationInfoCard.tsx` | Native: bottom card (image, title, subtitle, rating, status, Directions button). |

### 3.3 Shared Components (Used by Map)

| Component | File | Role |
|-----------|------|------|
| ProviderBottomSheet | `src/shared/components/ProviderBottomSheet.tsx` | Native (and web): modal with avatar, name, role, phone, distance, status, rating, Open Map, Request Service. |
| ProviderCard | `src/shared/components/ProviderCard.tsx` | Used in list (e.g. web) for name, role, rating, request. |
| NearbyProvidersList | `src/features/providers/presentation/NearbyProvidersList.tsx` | Web: list of providers under map using ProviderCard. |

### 3.4 Hooks

| Hook | File | Role |
|------|------|------|
| useSortedNearbyProviders | `src/features/map/hooks/useSortedNearbyProviders.ts` | User location + fetch nearby providers + sort by distance (Haversine); returns sortedProviders, nearest, mapCenter, getDistanceKm, refetch, etc. |
| useMapFilters | `src/features/map/hooks/useMapFilters.ts` | Filter by role (all / mechanic / tow / rental). |
| usePlacesSearch | `src/features/map/hooks/usePlacesSearch.ts` | Search place query, debounce, suggestions, selectedPlace (used for map center). |

### 3.5 Utils

| Util | File | Role |
|------|------|------|
| mapClustering | `src/features/map/utils/mapClustering.ts` | `clusterProviders(providers, threshold)` – grid-based clustering for Native when count > threshold. |
| providerToServiceType | `src/features/map/utils/providerToServiceType.ts` | Maps provider role to serviceType for request flow. |

### 3.6 Constants

| Constant | File | Role |
|----------|------|------|
| SILVER_MAP_STYLE | `src/features/map/constants/silverMapStyle.ts` | JSON style for Native MapView (silver/minimal theme). |

### 3.7 Data Sources

| Source | File / Layer | Role |
|--------|----------------------|------|
| Nearby providers API | `src/features/providers/data/providersApi.ts` | `fetchNearbyProviders`, `getFallbackNearbyProviders` – used by useNearbyProviders (called from useSortedNearbyProviders). |
| Places (search) | `src/features/map/data/placesApi.ts` | `fetchPlaceSuggestions`, `fetchPlaceCoordinates` – TEST_PLACES when no Google key; otherwise Google Places. |
| Location / distance | `src/features/location/data/haversine.ts` | `haversineDistanceKm`, `sortByNearest` – used for sorting and distance display. |

### 3.8 Data Flow (High Level)

```
User location (useUserLocation / useSortedNearbyProviders)
    → Nearby params (lat, lng, radius, role)
    → useNearbyProviders → API or fallback
    → Filter by valid location
    → Sort by distance (sortByNearest)
    → Web: pass sortedProviders to WebMapView → OSMMapView (one marker each)
    → Native: clusterProviders(sortedProviders, 20) → clusterItems → MapView markers
```

---

## 4. Status of Each Part

| Part | Status | Notes |
|------|--------|-------|
| Display every provider (Web) with photo, name, phone, exact location | **Completed** | OSMMapView renders one marker per provider; popup has all four. |
| Display every provider (Native) with exact location | **Completed** | Markers at provider.location; when ≤20, no clustering. |
| Clustering: Web = no clustering | **Completed** | No cluster logic on web; all markers individual. |
| Clustering: Native = only if > 20 (mapClustering.ts) | **Completed** | clusterProviders(providers, 20) used in MapScreen.tsx. |
| Popup (Web) content | **Completed** | Photo/placeholder, name, phone, “طلب خدمة / اتصل” button. |
| ProviderBottomSheet (Native) content | **Completed** | Avatar, name, role, phone, distance, status, rating, Open Map, Request Service. |
| LocationInfoCard (Native) content | **Completed** | Image, title, subtitle, rating, status, Directions button. |
| useSortedNearbyProviders | **Completed** | Single source for location + providers + sort + fallback. |
| useMapFilters / usePlacesSearch | **Completed** | Filters and place search wired. |
| Map structure (screens, components, hooks, utils, constants, data) | **Completed** | As documented above. |

No items are marked **In Progress** or **Issues** in the current codebase for the described behavior.

---

## 5. Popups (Web) and ProviderBottomSheet / LocationInfoCard (Native)

### 5.1 Web: Popup for Each Provider

- **When:** User clicks a provider marker on the web map.
- **Where:** Implemented in `OSMMapView.tsx` via `buildPopupHtml(provider, …)` and `marker.bindPopup(popupHtml)`.
- **Content (full details):**
  - **Photo/avatar:** `provider.photo` as 48×48 image, object-fit cover, border-radius 8px; if missing, grey placeholder div same size.
  - **Name:** `provider.name` (strong).
  - **Phone:** `provider.phone` or `provider.contact` (small grey text under name).
  - **Action:** Button “طلب خدمة / اتصل” – click triggers `onProviderPress(provider)` (request flow or contact).
- **Note:** Exact latitude/longitude are not shown in the popup; they are used only for marker position.

### 5.2 Native: ProviderBottomSheet for Selected Provider

- **When:** User taps a provider marker (or a cluster, which then selects one provider) on Native.
- **Where:** `ProviderBottomSheet.tsx` used in `MapScreen.tsx`.
- **Content (full details):**
  - **Avatar:** `provider.avatarUri` or `provider.photo`; else account icon in themed circle.
  - **Name:** `provider.name`.
  - **Role:** Role label (e.g. mechanic / tow / rental).
  - **Phone:** `provider.phone ?? provider.contact` (if present).
  - **Distance:** `distanceKm` (e.g. “X km away” or “X m away”).
  - **Status:** Available / busy / on the way (from `displayStatus` or `isAvailable`).
  - **Rating:** Stars + value (e.g. “4.5”).
  - **Actions:** “Open Map” (center map on provider), “Request Service” (navigate to request with providerId).
- **Note:** Coordinates are not shown in the sheet; they are used for marker position and “Open Map”.

### 5.3 Native: LocationInfoCard (Bottom Card)

- **When:** Shown when there is a “nearest” provider and not loading/empty; often used for the closest provider.
- **Where:** `LocationInfoCard.tsx` in `MapScreen.tsx`.
- **Content:**
  - **Image:** `nearest.photo` or placeholder (image-outline icon).
  - **Title:** Provider name.
  - **Subtitle:** e.g. “أقرب مزود” / nearest.
  - **Rating:** Star + number (e.g. 4.5) and optional review count.
  - **Status:** Text from status label.
  - **Directions:** Green button (#00D67D) – typically centers map or opens directions to provider location.
- **Note:** This card does not show phone or lat/lng; full details (including phone) are in ProviderBottomSheet when the user taps the marker.

---

## 6. Risks and Recommended Improvements (Map Display & Provider Visualization)

### 6.1 Risks

1. **Web: No clustering** – With a very large number of providers (e.g. hundreds), the map could become crowded and slow; every provider is still one DOM marker/popup.
2. **Native: Cluster tap** – Tapping a cluster opens the sheet for the first provider in the cluster only; user does not see a list of all providers in that cluster.
3. **List (e.g. web) vs map** – `NearbyProvidersList` uses `ProviderCard` with title/subtitle (name/role) only; it does not show phone or avatar in the card, so “full details” are only on the map popup or in a sheet if opened from the list.
4. **Exact location not shown in UI** – Latitude/longitude are used for positioning but are not displayed in popup or sheet; helpful for debugging or support could be added optionally (e.g. in a dev mode or admin view).
5. **Leaflet from CDN (web)** – Script/style loaded from unpkg without SRI; for higher security, self-host or use SRI.

### 6.2 Recommended Improvements (Read-Only List)

- **Web:** Consider adding optional clustering (e.g. Leaflet.markercluster) when provider count exceeds a threshold (e.g. 50) while keeping “show all individually” below that.
- **Native:** Consider expanding cluster tap behavior (e.g. expand cluster into list or show a small list of providers in the cluster before opening the sheet).
- **List (web):** Consider passing avatar and phone into the list item or into the BottomSheet when user selects from list so that “full details” (photo, name, phone) are visible there too.
- **Optional:** Show lat/lng in popup/sheet in dev or for support (read-only), without changing production UX.
- **Performance:** For very large datasets, consider viewport-based filtering or server-side clustering so only visible-area providers are sent to the client.

---

## 7. Summary

- **Every service provider** with valid location is shown on the map with **photo/avatar** (or placeholder), **name**, **phone**, and **exact location** (lat/lng used for marker placement).
- **Web:** All providers shown **individually**; **no clustering**. **Native:** **Clustering only when count > 20** via `mapClustering.ts`; otherwise one marker per provider.
- **Map structure** is clearly defined: two screens (Native/Web), map components (OSMMapView, WebMapView, MapDockWithFAB, LocationInfoCard), shared ProviderBottomSheet and list components, hooks (useSortedNearbyProviders, useMapFilters, usePlacesSearch), utils (mapClustering, providerToServiceType), constants (silverMapStyle), and data (providers API, places, haversine).
- **Status:** All described parts are **Completed** for the behaviors above.
- **Popups (Web)** and **ProviderBottomSheet / LocationInfoCard (Native)** provide full provider details (photo, name, phone where applicable; exact location used for positioning, not displayed in UI). Improvements listed are optional and do not require code changes in this read-only report.

---

*Report generated from codebase inspection only. No code or production data was modified.*
