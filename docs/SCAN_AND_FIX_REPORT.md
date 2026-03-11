# Full Project Fix & UI Polish — Scan and Fix Report

**Date:** 2026-03-07  
**Scope:** Typography & Fonts, Map & Location, Auth & Session, Dashboards, Profile, Chat, Notifications, Settings, UI/Micro-interactions, Stability, and full report.

---

## 1. What was fixed

### 1.1 Typography & Fonts
- **AppText adoption:** Replaced plain `Text` with `AppText` and semantic variants on:
  - **LoginScreen:** Title (`title1`), subtitle (`body`), error (`callout`), remember/forgot links (`callout`), footer (`body`), sign-up link (`callout`), mock section title (`title3`), mock chip labels (`caption`).
  - **RegisterScreen:** Title (`title1`), subtitle (`body`), error (`callout`), remember/forgot (`callout`), divider (`caption`), footer and login link (`body`/`callout`).
  - **RequestScreen:** Subtitle, card titles (`title3`), confirm hint (`caption`), success/error messages (`callout`), empty/loading states (`body`), track hint and request ID/status (`caption`/`body`). Invalid-params state now renders a proper view with `AppText` instead of returning `null`.
  - **MechanicDashboardScreen:** Job card title/meta/status (`body`/`caption`), section titles (`title3`), map button text, requester name/meta/pill, action card titles, filter chips, empty text, bottom sheet title/meta, map link.
  - **MapScreen (native):** Location-denied card title, message, and instructions (`title3`/`body`/`callout`).
- **Font consistency:** `AppText` uses `useTypography()`, which returns Poppins for English and Tajawal for Arabic; all updated screens now follow theme font sizes and weights (display, title1, title2, title3, body, callout, caption) and RTL alignment where applicable.

### 1.2 Map & Location
- **Roles and Request Service:** Confirmed on both **MapScreen (native)** and **MapScreen.web**: `isCustomer = userRole === ROLES.USER`; `handleRequestService` only navigates to Request when `isCustomer`; otherwise shows toast. `ProviderBottomSheet` receives `requestServiceDisabled={!isCustomer}` so the button is disabled for Mechanic/Tow/Rental/Admin.
- **My Location:** Native: `handleMyLocation` animates map to `toRegion(coords)` or calls `fetchLocation()`. Web: updates `mapCenter` from coords or triggers fetch.
- **Markers and bottom sheet:** Marker press calls `handleSelectProvider(provider)` → sets selected provider, animates camera (native) / updates center (web), opens bottom sheet. Clusters and single-provider markers work; bottom sheet opens with provider details.
- **API and fallback:** `useNearbyProviders(nearbyParams)` used with memoized params; fallback to `MOCK_PROVIDERS` only when API fails (`isProvidersError`). Location and providers loading/error states show spinner, location-denied card with retry, or `ErrorWithRetry` for providers.

### 1.3 Auth & Session
- **Hydration:** `RootNavigator` effect runs when `hasHydrated && isAuthenticated`, sets `hasRedirectedToApp.current = true`, and calls `navigationRef.reset({ index: 0, routes: [{ name: 'App' }] })` once. No duplicate redirects.
- **401 handling:** Single redirect per failure via `unauthorizedTriggered` in api layer; `navigateToLogin()` queues if nav not ready and flushes when ready.
- **Mock login:** Wrapped in `APP_ENV === 'development'`; only development shows role chips. Try/catch in `handleMockLogin` shows error toast on failure.

### 1.4 Dashboards (Mechanic, Tow, Rental, Admin)
- **Real API:** Mechanic/Tow dashboards use `fetchMechanicDashboard` / dashboard APIs; Admin uses admin dashboard API. Data comes from backend (stub or real).
- **Accept/Decline:** Mechanic (and Tow where applicable) call `updateRequestStatus` (PATCH `/requests/:id/status`) via `acceptJob`/`declineJob`; on success, dashboard query is invalidated and list updates. Loader and error toasts are shown.

### 1.5 Profile
- **Real API:** Provider profile from `GET /providers/me` via `useProviderProfile`; loading and error states handled. Edits (services) call `updateProviderServices` (PATCH `/providers/me` with `services`); backend supports PATCH and invalidates profile query on success.

### 1.6 Chat
- **Real API:** Chat list from `GET /chat/conversations` via `useChatConversations`; ChatDetail uses `GET /chat/conversations/:id/messages` and `POST .../messages` for send. Loading (spinner) and error (ErrorWithRetry) states are in place. No toast mocks; list and message send/receive use backend stubs.

### 1.7 Notifications
- **Real API:** `useNotifications` uses `fetchNotifications` (GET) and `markNotificationRead` (PATCH). Read/unread toggle calls API and updates list via query cache.

### 1.8 Settings & Profile header
- **Settings rows:** Security row navigates to Profile; Language, Theme, Vehicle, Preferred service show `t('common.notImplemented')` toast so every row is actionable. Profile row navigates to Profile.
- **Profile header icon:** ProfileScreen passes `onProfile={() => navigation.navigate('Settings')}` to AppHeader; icon navigates correctly.

### 1.9 UI / Micro-interactions and stability
- **Consistency:** Button and Card/PressableCard already use scale/opacity press animation (from previous work). ScreenFadeIn used on Request and relevant screens. No additional changes in this pass.
- **Stability:** Request interceptor in `httpClient` calls `onRequestEnd()` on throw so loader count does not get stuck. `useUserLocation` uses `isMountedRef` and skips `setState` after unmount. RequestScreen invalid-params path renders a view and does not return `null` without UI.

### 1.10 RequestScreen and non-customer roles
- **Invalid params:** When `serviceType` is missing or invalid, RequestScreen renders a minimal screen with `AppText` message and back button instead of `null`; effect still calls `goBack()` so user is redirected. Non-customer roles do not have Request in their stack, so they never land on RequestScreen from in-app navigation.

---

## 2. What still requires follow-up

- **Typography:** Some screens (e.g. MapScreen filter chips, bottom card labels, ProviderBottomSheet, HomeScreen, others) still use raw `Text` with `typography.fontSize`/styles. Optional: replace with `AppText` for full locale font (Poppins/Tajawal) and presets everywhere.
- **Provider profile PATCH response shape:** Backend `PATCH /providers/me` returns provider from `upsertProvider`; frontend may expect `MyProviderProfileResponse` (e.g. `reviews` array). If UI breaks after save, align backend response with `MyProviderProfileResponse` or adapt frontend.
- **Chat:** Backend returns stub conversations and messages; real persistence and WebSocket for real-time messages are not implemented. Current flow is functional with stubs.
- **Settings:** Language, Theme, Vehicle, Preferred service only show “Not implemented” toast. To make them fully actionable, add dedicated screens or backend-driven settings.
- **ENV:** `EXPO_PUBLIC_API_URL` must be set; without it app throws. For web map, `EXPO_PUBLIC_GOOGLE_MAPS_KEY` is optional (OSM fallback used when missing).

---

## 3. What could not be fixed (or not applicable)

- **Google Maps key (web):** Without a key, web uses OpenStreetMap fallback (link to open in new tab). Providing a key is environment/config, not a code fix.
- **Backend data persistence:** Dashboard and admin use in-memory stores; real DB and business logic are outside this front-end pass.
- **Real-time (WebSocket):** Chat and live request updates are not real-time; would require backend WebSocket/Push and client integration.
- **Adding Request screen to non-customer stacks:** Not done; Request is intentionally Customer-only. MapScreen prevents navigation to Request for non-customers (toast + disabled button).

---

## 4. Files modified in this pass

| File | Change |
|------|--------|
| `src/features/auth/presentation/screens/LoginScreen.tsx` | Replaced `Text` with `AppText` (title, subtitle, error, links, footer, mock section). Removed `Text` import. |
| `src/features/auth/presentation/screens/RegisterScreen.tsx` | Replaced `Text` with `AppText` (title, subtitle, error, links, divider, footer). Removed `Text` import. |
| `src/features/requests/presentation/screens/RequestScreen.tsx` | Replaced `Text` with `AppText`; invalid-params state now renders view with `AppText` and back button; removed `Text` import. |
| `src/features/mechanic/presentation/screens/MechanicDashboardScreen.tsx` | Replaced all `Text` with `AppText` (job cards, sections, filters, empty, sheet, map link). Added `AppText` import. |
| `src/features/map/presentation/screens/MapScreen.tsx` | Location-denied card uses `AppText` for title, message, instructions. Added `AppText` import. |
| `src/shared/services/http/httpClient.ts` | (Previous pass) Request interceptor: call `onRequestEnd()` on throw. |
| `src/features/location/hooks/useUserLocation.ts` | (Previous pass) `isMountedRef` and guards to avoid setState after unmount. |

---

## 5. Remaining mock / incomplete APIs

| Feature | Status | Notes |
|--------|--------|------|
| **Dashboard data** | Stub | Backend returns stub lists; structure is ready for real DB. |
| **Admin dashboard** | Stub | Same as above. |
| **Chat messages** | Stub | GET/POST work; data is in-memory stub. |
| **Notifications** | Stub | GET/PATCH work; list is stub. |
| **Provider profile** | Partial | GET/PATCH work; backend may return different shape for PATCH. |
| **Requests (create/status)** | Real | Create and PATCH status are implemented and used. |
| **Auth** | Real | Login/Register/refresh and session persistence implemented. |
| **Nearby providers** | Real | GET with fallback to mock on API failure. |

---

## 6. Verification summary

- **Customer flow:** Login/Register → Home → Map → select provider → Request Service (enabled) → RequestScreen → create request → status updates. Notifications and Chat use API with stub data.
- **Provider flow (Mechanic/Tow):** Dashboard with real API, Accept/Decline call PATCH and refetch. Map opens with Request Service disabled. Profile loads and saves services via API.
- **Admin flow:** Dashboard and user/service management with stub data; no crash.
- **Map:** All roles can open map; only customers get Request Service enabled; My Location and markers/sheet work; API errors show retry or fallback.
- **Stability:** No setState-after-unmount in location hook; loader balance fixed in HTTP layer; invalid Request params show UI and redirect.
