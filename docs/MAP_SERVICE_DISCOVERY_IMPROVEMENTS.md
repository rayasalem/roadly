# Map & Service Discovery Improvements

Summary of changes made to align the app with the Uber-style service-provider discovery requirements **without breaking existing functionality**.

---

## Implemented

### 1. Map markers (native + web)
- **Profile picture, name, service type, rating, phone, distance, availability** in callout/popup.
- **Service type icons:** Mechanic → 🔧, Tow Truck → 🚛, Car Rental → 🚗 (in marker pin and in callout/popup).
- **Availability:** `available` (normal color), `busy` (orange), `offline` (hidden from map). Providers with `displayStatus === 'offline'` or `status === 'offline'` are filtered out on both native and web.

### 2. Provider type icons
- `getServiceTypeEmoji(provider)` in `mapMarkerUtils.ts`: returns 🔧 / 🚛 / 🚗 by role.
- Native: pin shows emoji + color by status; callout shows name, type, rating, phone, Request Service.
- Web: popup HTML includes service type emoji and role label.

### 3. Provider info card (bottom sheet)
- **ProviderBottomSheet** already had: profile image, name, role, phone, distance, status badge, rating stars.
- **Added:** Service type emoji (🔧/🚛/🚗) next to role label; **View Profile** button; handling of `offline` status label.
- **Buttons:** Open Map, View Profile, Request Service (unchanged flow).

### 4. Filters
- **Mechanics / Tow Trucks / Car Rentals / All** via existing `useMapFilters` and `MapFiltersBar` / `MapDockWithFAB`.
- i18n labels updated to "Mechanics", "Tow Trucks", "Car Rentals", "All" (EN) and Arabic equivalents.

### 5. User service flow (unchanged, already in place)
- Map → see nearby providers → filter by service type → tap marker → card with **Request Service** → navigates to Request screen with `serviceType` and `providerId`. Request payload (user_id, provider_id, user_location, service_type, request_time) is handled by existing request API and screens.

### 6. Design system (tokens only)
- **Theme colors** added in `colors.ts`: `designPrimary: #1E3A8A`, `designSecondary: #0EA5E9`, `designBackground: #F8FAFC` for future use. Existing cards/buttons keep current radii and shadows (e.g. `radii.xl`, `spacing.lg`).

### 7. Types
- **ProviderDisplayStatus** extended with `'offline'` in `providers/domain/types.ts`. Map filters out offline providers before rendering.

---

## Not implemented (for later)

- **Provider dashboard:** Availability toggle (Available / Busy / Offline), incoming request screen (Accept / Reject), navigation screen with route to user. Requires backend endpoints and possibly real-time updates.
- **Real-time location:** Provider location updates every few seconds (e.g. Firebase or Socket.io). Requires backend + client wiring.
- **Admin panel:** Map of all providers, change provider status, disable accounts, view active requests, basic analytics (requests per day). Partially present (AdminDashboard, AdminUsers, AdminProviderList); needs map view and status/disable/analytics wiring.
- **ETA, distance, rating, chat, push notifications:** ETA and distance use existing haversine/API where present; full ETA/chat/push need backend and client features.

---

## Files touched

- `src/features/providers/domain/types.ts` – added `offline` to `ProviderDisplayStatus`.
- `src/features/map/utils/mapMarkerUtils.ts` – `getServiceTypeEmoji`, `getMarkerColorByStatus` for offline, `buildProviderPopupHtml` with service type.
- `src/features/map/presentation/components/ProviderMarker.tsx` – pin with emoji, callout with name/type/rating/phone/Request Service.
- `src/features/map/presentation/screens/MapScreen.tsx` – filter offline providers; pass `onViewProfile` to sheet.
- `src/features/map/presentation/screens/MapScreen.web.tsx` – `visibleProviders` (filter offline); `onViewProfile`; use `visibleProviders` and `nearestVisible`.
- `src/shared/components/ProviderBottomSheet.tsx` – service type emoji, View Profile button, `offline` status label, `onViewProfile` prop.
- `src/shared/theme/colors.ts` – `designPrimary`, `designSecondary`, `designBackground`.
- `src/shared/i18n/strings.ts` – `map.status.offline`, `map.viewProfile`; filter labels (Mechanics, Tow Trucks, Car Rentals).

Existing APIs, navigation, and request flow were not changed.
