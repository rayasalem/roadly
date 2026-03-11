# Performance Optimizations Summary

This document summarizes the performance improvements applied without changing functionality.

---

## 1. Map performance

### Marker clustering (providers > 20)
- **What:** Added `src/features/map/utils/mapClustering.ts` with grid-based clustering. When `providers.length > 20`, providers are grouped by a fixed grid (~1.5 km cells); each cell is either one single-provider marker or one cluster marker showing count.
- **Why:** Rendering many markers (e.g. 50+) causes heavy native view work and re-renders. Clustering reduces the number of markers on screen and keeps the map responsive.
- **Flow:** `clusterProviders(providers, 20)` returns `MapClusterItem[]` (either `{ type: 'provider', provider }` or `{ type: 'cluster', latitude, longitude, count, providers }`). MapScreen renders one Marker per item; clusters show a badge with count and on press select the first provider in the cluster.

### Reduced marker re-renders
- **What:** Wrapped `AnimatedMapMarker` in `React.memo` so only the selected marker’s `selected` prop changes; other markers skip re-renders when selection changes.
- **Why:** Without memo, every marker re-renders when `selectedProvider` changes. With memo, only the previously selected and newly selected markers re-render.

---

## 2. Lists: ScrollView → FlatList

- **MechanicDashboard:** Replaced the main scroll with a single `FlatList`: `data={jobs}`, `ListHeaderComponent` = stats card, requesters card, action cards, filter chips, and “Active requests” title. Job rows are rendered via `renderItem` with a memoized `MechanicJobCard`. Tuned `initialNumToRender={10}`, `maxToRenderPerBatch={10}`, `windowSize={5}`.
- **TowDashboard:** Same pattern: `FlatList` with `data={jobs}`, header (stats, requesters, action cards, filters, section title), and memoized `TowJobCard` in `renderItem`.
- **RentalDashboard:** `FlatList` with `data={vehicles}`, header (stats, action cards, “Fleet overview” title), `ListFooterComponent` (who requested me + bookings), and memoized `RentalVehicleCard` in `renderItem`.
- **AdminDashboard:** Left as `ScrollView`. The tabbed layout (mechanic / tow / rental) would require one FlatList per tab with a large `ListHeaderComponent` or a single FlatList that switches data by tab; that refactor was deferred to avoid scope creep. List content is unchanged.

**Why FlatList:** FlatList virtualizes: only visible (and a small window of) items are mounted. Long lists no longer mount hundreds of components at once, which reduces memory and improves scroll performance.

---

## 3. Debounce places search (350 ms)

- **What:** In `usePlacesSearch`, the value that drives the suggestions API is now debounced. User types into `query`; `debouncedQuery` is updated 350 ms after the last keystroke via `useEffect` + `setTimeout`. `useQuery` uses `debouncedQuery` in its key and `queryFn`.
- **Why:** Without debounce, every keystroke triggers a new request. Debouncing cuts API calls and avoids request races and UI flicker.

---

## 4. Memoized components

- **Provider/map:** `AnimatedMapMarker` wrapped in `React.memo` so marker content re-renders only when that marker’s `provider` or `selected` change.
- **Dashboard job cards:** `MechanicJobCard`, `TowJobCard`, and `RentalVehicleCard` are memoized with `React.memo`. When the parent list re-renders (e.g. filter change), only items whose props changed re-render.
- **Home “provider” cards:** `RiderCard` (nearby riders) wrapped in `React.memo` so parent state updates don’t re-render every card.
- **Notifications:** `NotificationCard` extracted and wrapped in `React.memo`; `handleToggleRead` and `getIconForType` wrapped in `useCallback` so the list’s `renderItem` reference is stable and cards don’t re-render unnecessarily.

**Why:** List items often receive stable props (e.g. same job/vehicle). Memoization avoids re-rendering those items when the parent re-renders for unrelated state (e.g. sheet open, tab change).

---

## 5. TanStack Query

- **useNearbyProviders:** `staleTime: 2 * 60 * 1000` (2 minutes), `refetchOnWindowFocus: false`. Nearby providers are treated as fresh for 2 minutes; refetch is not triggered by window focus.
- **usePlacesSearch (suggestions):** `staleTime: 60 * 1000` (1 minute), `refetchOnWindowFocus: false`. Suggestion results are cached for 1 minute; same query within that window uses cache.

**Why:** Location and place suggestions don’t need to refetch on every focus or immediately after a previous success. `staleTime` reduces redundant network calls and keeps the UI responsive without changing behavior.

---

## Files touched

| Area            | File(s) |
|-----------------|--------|
| Map clustering  | `src/features/map/utils/mapClustering.ts` (new), `MapScreen.tsx` |
| Places debounce | `src/features/map/hooks/usePlacesSearch.ts` |
| Query options   | `src/features/providers/hooks/useNearbyProviders.ts`, `usePlacesSearch.ts` |
| Mechanic list   | `src/features/mechanic/presentation/screens/MechanicDashboardScreen.tsx` |
| Tow list        | `src/features/tow/presentation/screens/TowDashboardScreen.tsx` |
| Rental list     | `src/features/rental/presentation/screens/RentalDashboardScreen.tsx` |
| Home card       | `src/features/home/presentation/screens/HomeScreen.tsx` |
| Notifications   | `src/features/notifications/presentation/screens/NotificationsScreen.tsx` |

Functionality is unchanged; improvements are in rendering cost, list virtualization, request rate, and cache usage.
