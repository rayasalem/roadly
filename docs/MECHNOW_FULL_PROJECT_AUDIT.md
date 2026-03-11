# MechNow Full Project Audit Report

**Project:** MechNow (React Native Web + Node.js/Express Backend)  
**Audit date:** 2025  
**Scope:** Frontend (components, hooks, theme, map, forms), Backend (API, auth, validation, storage), UX/Design, Performance, Code Quality  

---

## Executive Summary

| Area | Status | Summary |
|------|--------|---------|
| **Frontend** | Amber | Modular structure and theme in place; **20+ components exceed 200 lines**; map and request flows work; hooks and theme usage good. |
| **Backend** | Red | **In-memory only** (no DB); JWT + Joi validation + sanitization present; **production blocker**; missing pagination on most list endpoints; no structured logging. |
| **UX / Design** | Green | Unified theme (ThemeProvider, useTheme); map has images, popups, nearest highlight, legend; forms have validation and primary CTA. |
| **Performance** | Amber | Frontend: acceptable; Backend: full scans, no indexes; list endpoints will not scale. |
| **Code Quality** | Amber | Some long files; unused imports minimal; conventions mostly consistent; clear action items below. |

---

## 1. Frontend Audit

### 1.1 Component Length (≤ 200 lines target)

**Components exceeding 200 lines:**

| File | Lines | Recommendation |
|------|-------|----------------|
| `AdminDashboardScreen.tsx` | 516 | Split into: StatsRow, ChartSection, RecentActivityList, AdminFiltersBar. |
| `MechanicDashboardScreen.tsx` | 450 | Split into: MechanicStatsCards, MechanicRequestList, MechanicQuickActions. |
| `AdminUsersScreen.tsx` | 409 | Split into: UserTable, UserFilters, UserRow, BulkActionsBar. |
| `LoginScreen.tsx` | 409 | Split into: LoginForm, SocialLoginButtons, ForgotPasswordLink. |
| `ProfileScreen.tsx` | 405 | Split into: ProfileHeader, ProfileSection, EditProfileForm. |
| `RegisterScreen.tsx` | 381 | Split into: RegisterForm, TermsCheckbox, RoleSelector. |
| `QuickRequestForm.tsx` | 293 | Split into: ServiceTypeChips, LocationRow, SuggestedProvidersList, RequestFormActions. |
| `HomeScreen.tsx` | 289 | Split into: HeroSection, QuickActionsGrid, RecentRequests. |
| `SettingsScreen.tsx` | 289 | Split into: AppearanceSection, AccountSection, SettingsRow. |
| `TowDashboardScreen.tsx` | 271 | Split into: TowStatsCards, TowRequestList. |
| `ProviderBottomSheet.tsx` | 261 | Split into: ProviderHeader, ProviderDetails, ProviderActions. |
| `MapContainerNative.tsx` | 250 | Split into: MapViewLayer, MapOverlayControls, MapRetryBanner. |
| `MapScreen.tsx` | 232 | Already refactored; consider moving more logic to a custom hook. |
| `RequestStatusCard.tsx` | 218 | Split into: RequestStatusHeader, RequestStatusActions, RatingBlock. |
| `MapScreen.web.tsx` | 219 | Within range; keep as is or extract one more subcomponent. |
| `RequestScreen.tsx` | 211 | Within range; keep. |
| `RentalDashboardScreen.tsx` | 212 | Split into: RentalStatsCards, RentalList. |
| `NotificationsScreen.tsx` | 199 | Within range; keep. |
| `OSMMapView.tsx` | 192 | Within range; keep. |
| `MapDockWithFAB.tsx` | 162 | Split arc row into MapArcBar subcomponent. |
| `Button.tsx` | 165 | Acceptable for shared component. |
| `Input.tsx` | 167 | Acceptable. |
| `ProviderCard.tsx` | 166 | Acceptable. |

**Within limit (≤ 200):** MapScreen, MapScreen.web, RequestScreen, RequestConfirmationModal, MapLegend, MapSearchBar, MapFiltersBar, MapSheetContent, MapLocationDeniedView, MapBottomCard, WebMapView, ListScreenLayout, ErrorWithRetry, etc.

### 1.2 Modularization

- **Map:** Well split into MapContainerNative, MapBottomCard, MapLegend, MapSearchBar, MapFiltersBar, MapSheetContent, MapLocationDeniedView, OSMMapView, WebMapView, ProviderMarker.
- **Request flow:** RequestScreen uses QuickRequestForm, RequestStatusCard, RequestConfirmationModal; useRequestService and useRequest encapsulate logic.
- **Large screens (Admin, Auth, Profile, Dashboards):** Still single-file; need extraction as in table above.

### 1.3 Hooks Usage

| Hook | Where used | Purpose |
|------|------------|---------|
| **useTheme()** | MapSearchBar, MapBottomCard, MapLocationDeniedView, Button, AppHeader, SettingsScreen, MapFiltersBar, QuickRequestForm, MapScreen.web, MapLegend, MapContainerNative, RequestConfirmationModal, MapScreen, ScreenWrapper, RequestStatusCard, MapSheetContent | Colors, spacing, typography |
| **useNearbyProviders** | MapScreen (native only) | Fetch providers for native map |
| **useSortedNearbyProviders** | MapScreen.web, useRequestService | Sorted list, nearest, distance, refetch for web map and request form |
| **useRequestService** | RequestScreen | Create request, suggested providers, nearest, distanceKm, handleCreate |
| **useUserLocation** | RequestScreen, MapScreen (native) | coords, fetchLocation, loading, error |

**Gap:** MapScreen.web uses useSortedNearbyProviders (which internally uses useNearbyProviders); MapScreen (native) uses useNearbyProviders directly and implements its own sort/nearest logic. Consistent pattern; no duplication issue.

### 1.4 Theme Consistency

- **Central theme:** `unifiedTheme.ts` (baseTheme, useTheme, getColorsForScheme); `ThemeContext.tsx` (ThemeProvider, useThemeContext).
- **App wrap:** AppProviders wraps app with ThemeProvider; StatusBar style follows colorScheme.
- **Usage:** Screens and shared components use useTheme() for colors/shadows; spacing, radii, typography imported from theme. Light/dark supported via theme store.
- **Gaps:** A few files still import `colors` from `theme/colors` directly instead of useTheme() (e.g. static StyleSheet in mapMarkerUtils, OSMMapView). For static HTML/Leaflet, acceptable.

### 1.5 Map UI

| Feature | Status | Notes |
|---------|--------|-------|
| Provider images in markers | Yes | OSMMapView: marker div shows provider photo when available; ProviderMarker (native): callout shows photo. |
| Hover / popups | Yes | OSMMapView: Leaflet bindPopup with name, rating, services, "Request service" button; ProviderMarker: Callout with same. |
| Highlight nearest | Yes | nearestProviderId → CSS class mechnow-marker-nearest (pulse animation); MapBottomCard/MapSheetContent show nearest. |
| Selected provider | Yes | selectedProviderId → marker color primary; bottom sheet opens. |
| Filters, search, suggestions | Yes | MapFiltersBar (role); MapSearchBar + usePlacesSearch (suggestions); MapSheetContent lists providers. |
| Legend | Yes | MapLegend (compact) on web map with Available/Busy/Offline/You. |

### 1.6 Forms (Service Request)

| Feature | Status | Notes |
|---------|--------|-------|
| Service request creation | Yes | POST /requests via useCreateRequest; RequestScreen + QuickRequestForm. |
| Autocomplete / filter | Partial | Service type filter: text input filters chips (not full autocomplete). Suggested providers list from description. |
| Validation feedback | Yes | locationRequiredError (inline message + red border); createError from API; route param validation (invalid service type → toast + goBack). |
| Primary button | Yes | "Request Now" (t('request.requestNow')), fullWidth, size lg, loading/disabled when isCreating. |
| Toasts on success/error | Yes | Success: created, status updated, rating; Error: create failure, rating failure. |

### 1.7 Responsiveness and Layout

- Flexbox and ScrollView used; no hard-coded widths for key layouts. Map uses minHeight and flex. Legend and filters use flexWrap and gap.
- **Gap:** No explicit breakpoints or Dimensions-based layout for very small/large screens; acceptable for current scope.

### 1.8 Loading and Error Handling

- **Loading:** useNearbyProviders/useSortedNearbyProviders expose isLoading; MapScreen/MapScreen.web show overlay or skeleton; RequestScreen/QuickRequestForm show button loading and createMutation.isPending.
- **Errors:** useRequestService/createMutation.error → createError in form; useRequest refetch + ErrorWithRetry; network/timeout fallbacks in hooks (empty list or null) with console.warn in __DEV__; toast on create/rate failure.
- **Network message:** User-facing string: "خطأ في الشبكة. تحقق من اتصالك وتأكد أن الخادم (Backend) يعمل على المنفذ 4000." (and EN equivalent). env.ts has development fallback to http://localhost:4000 when EXPO_PUBLIC_API_URL is missing.

---

## 2. Backend Audit

### 2.1 API Endpoints (Functional)

| Route file | Endpoints | Auth | Validation | Notes |
|------------|-----------|------|------------|-------|
| health | GET /health, GET /health/ready | — | — | OK |
| auth | POST register, login, refresh, logout; GET me | JWT on /me | Joi: register, login, refresh | OK |
| requests | POST /, GET /provider, /customer, /:id; PATCH /:id/status; POST /:id/rate | authGuard | Joi: create, status, rate, params | OK |
| providers | GET /me, PATCH /me, GET /nearby, /:id, /:id/ratings; PATCH /me/location; POST /location | authGuard or optionalAuth on nearby | Joi: nearby query, location body | PATCH /me body not validated by schema |
| notifications | GET /, PATCH /:id/read; POST /register, /unregister | authGuard (optionalAuth on unregister) | Joi: register body | OK |
| dashboard | GET /mechanic, /tow, /rental | authGuard | — | OK |
| admin | GET /dashboard, /users, /providers; PATCH users/:id/block, providers/:id/verify | authGuard + requireAdmin | Joi: block, verify, params | OK |
| chat | GET /conversations, /conversations/:id/messages; POST /conversations/:id/messages | authGuard | Joi: message body | OK |

All listed endpoints are wired and functional behind auth/validation where applicable.

### 2.2 JWT and Role-Based Access

- **JWT:** jsonwebtoken; access (15m) and refresh (30d); authGuard verifies Bearer token and attaches user; optionalAuth for /providers/nearby and notifications unregister.
- **Roles:** roleGuard.requireRole, requireAdmin on admin routes; blocked users rejected in authGuard.
- **Mock tokens (dev):** mock-access-* accepted when NODE_ENV !== 'production'; must be disabled in production.

### 2.3 Input Validation and Sanitization

- **Validation:** Joi used for body/query/params on critical routes (auth, requests, providers nearby/location, notifications register, admin block/verify, chat message). PATCH /providers/me body and a few admin/chat bodies have minimal or no schema.
- **Sanitization:** sanitizeUserInput (sanitize-html) used on register name, rate comment, chat text. Not applied to PATCH /providers/me (name, phone, etc.); recommend adding.

### 2.4 Persistent Storage and Blockers

- **Storage:** **In-memory only.** All state in store/* (authStore, providerStore, requestStore, notificationStore, chatStore, ratingStore). No database client or ORM.
- **Production blocker:** Data lost on restart; no horizontal scaling; no backup. Must introduce a database (e.g. PostgreSQL + Prisma/TypeORM) and migrate stores.

### 2.5 Performance Risks

- **Full scans:** GET /providers/nearby filters and sorts all providers in memory (haversine); GET /admin/dashboard loads all users and providers; GET /requests/provider, /requests/customer, GET /notifications, GET /admin/users, /admin/providers return full lists with no pagination.
- **Pagination:** Only GET /providers/nearby has page/limit; total is still reported as items.length (current page), not full count.
- **Recommendation:** Add page/limit (and total count) to all list endpoints; use DB indexes and spatial index for nearby when moving to DB.

### 2.6 Logging, Monitoring, Error Handling

- **Logging:** No structured logger (winston/pino). Console only: server start (index), errorHandler (console.error in non-production). No request/response logging, no request ID.
- **Monitoring:** No APM, no Prometheus/metrics, no Sentry.
- **Error handling:** Central errorHandler; AppError for known cases; 500 for unknown; in production, generic message and no stack in response. Some routes use asyncHandler; coverage of all async paths should be verified.

---

## 3. UX / Design

### 3.1 Unified Theme

- ThemeProvider wraps app; useTheme() and useThemeContext() provide colors (light/dark), spacing, radii, typography, componentPresets.
- Buttons, headers, inputs, cards, and map components use theme; SettingsScreen allows Appearance (Light/Dark/System). Consistent across roles and pages for audited screens.

### 3.2 Visual Clarity

- Buttons: primary/secondary/outline; "Request Now" is clearly the primary CTA on the request form.
- Forms: labels, placeholders, inline errors (location required, API error); service type chips and filter input.
- Map: legend, colored markers (role/status), user marker, nearest pulse, selected state, bottom sheet with provider info.
- Lists: ListScreenLayout for loading/error/empty/content; ProviderBottomSheet, RequestStatusCard, cards with clear hierarchy.

### 3.3 Nearest Provider and Suggestions

- Nearest provider highlighted on map (pulse), shown in MapBottomCard and MapSheetContent; FAB and "Request Service" from sheet work.
- Suggestions: service type filter (filter chips by text); suggested providers list from service description (filter by name/services); place search (usePlacesSearch) for map with suggestions dropdown.

---

## 4. Performance and Functionality

### 4.1 API Calls and Feedback

- Frontend uses axios (httpClient) with baseURL from env; token attachment and refresh flow in place. Errors normalized to HttpError; toasts and inline messages used for success/failure.
- Create request: validates route params and location; on failure shows createError and toast; on success shows modal and toast, then navigate to map.
- Map: providers from useNearbyProviders/useSortedNearbyProviders; fallback to cached/mock data on network error with user-visible message where applicable.

### 4.2 Map Load and Updates

- Map loads providers from API; markers and popups use API data (id, name, photo, rating, services). Nearest and selected derived from same data. Refetch and refetchProviders available; real-time is optional (polling possible via refetch interval).

### 4.3 Service Request End-to-End

- User selects service type, optional description, location (from coords or fallback), optional preferred time → "Request Now" → POST /requests with serviceType, origin, providerId (optional) → success: modal + toast + navigate to map; failure: toast + inline createError. Request status and rating flows use PATCH and POST /rate with toasts.

### 4.4 Blocking Points and Deprecated Usage

- **Backend:** In-memory storage is the main blocker; missing pagination and full scans are scalability blockers.
- **Frontend:** No critical deprecated APIs found. pointerEvents used via style (e.g. style={{ pointerEvents: 'box-none' }}), which is correct. No remaining prop-based pointerEvents deprecation warnings identified.

### 4.5 Console Warnings and Broken Components

- No systematic run of the app in this audit. Recommendation: run frontend and backend locally, create a request, open map, switch theme and roles, and capture any console warnings or broken UI (e.g. missing keys, failed requests).

---

## 5. Code Quality and Best Practices

### 5.1 Long Components and Splitting

- See section 1.1 for the list of files > 200 lines and suggested extractions (e.g. AdminDashboardScreen → StatsRow, ChartSection, RecentActivityList; QuickRequestForm → ServiceTypeChips, LocationRow, SuggestedProvidersList, RequestFormActions).

### 5.2 Unused Imports and Commented Code

- No project-wide scan performed. Spot checks suggest limited unused imports; no large blocks of commented-out code. Recommendation: run ESLint with no-unused-vars and remove dead code.

### 5.3 Styling and Conventions

- StyleSheet.create used consistently; theme values (spacing, radii, shadows, typography) imported from shared/theme. Inline styles used for theme-dependent colors (useTheme()). Naming and file structure (features/domain, data, hooks, presentation) are consistent.

### 5.4 Maintainability and Scalability

- **Frontend:** Splitting the 20+ long components will improve maintainability; hooks (useRequestService, useSortedNearbyProviders, useTheme) already separate logic from UI. Adding a shared ListScreenLayout and error/loading patterns across more screens would help.
- **Backend:** Introducing a database, request/response logging, and pagination on all list endpoints is required for scalability and operations.

---

## 6. Action Items

### High priority (production / correctness)

| # | Action | Owner |
|---|--------|--------|
| 1 | Introduce persistent storage (PostgreSQL or similar) and migrate in-memory stores. | Backend |
| 2 | Add pagination (page, limit, total) to GET /requests/provider, /requests/customer, /notifications, /admin/users, /admin/providers, /providers/:id/ratings, chat messages. | Backend |
| 3 | Add request/response logging (with request ID) and structured logger (e.g. pino). | Backend |
| 4 | Validate and sanitize PATCH /providers/me body (name, phone, etc.). | Backend |

### Medium priority (UX and maintainability)

| # | Action | Owner |
|---|--------|--------|
| 5 | Split components > 200 lines per section 1.1 (start with AdminDashboardScreen, MechanicDashboardScreen, LoginScreen, RegisterScreen, QuickRequestForm). | Frontend |
| 6 | Add E2E or integration tests for: login → map → create request → see confirmation. | QA / Frontend |
| 7 | Run app locally and fix any console warnings or broken flows. | Frontend |
| 8 | Optional: add true autocomplete for service type (e.g. dropdown with suggestions from backend or local list). | Frontend |

### Low priority (nice to have)

| # | Action | Owner |
|---|--------|--------|
| 9 | Add compression middleware and health/ready checks that hit DB (when DB exists). | Backend |
| 10 | Add metrics (e.g. Prometheus) and error tracking (e.g. Sentry). | Backend |
| 11 | Document EXPO_PUBLIC_API_URL and backend port (4000) in README and run-local guide (already in scripts/run-local.md). | Docs |

---

## 7. Summary Tables

### Frontend components > 200 lines (split candidates)

| Component | Lines | Suggested split |
|-----------|-------|------------------|
| AdminDashboardScreen | 516 | StatsRow, ChartSection, RecentActivityList, AdminFiltersBar |
| MechanicDashboardScreen | 450 | MechanicStatsCards, MechanicRequestList, MechanicQuickActions |
| AdminUsersScreen | 409 | UserTable, UserFilters, UserRow |
| LoginScreen | 409 | LoginForm, SocialLoginButtons |
| ProfileScreen | 405 | ProfileHeader, ProfileSection, EditProfileForm |
| RegisterScreen | 381 | RegisterForm, TermsCheckbox, RoleSelector |
| QuickRequestForm | 293 | ServiceTypeChips, LocationRow, SuggestedProvidersList, RequestFormActions |
| HomeScreen | 289 | HeroSection, QuickActionsGrid |
| SettingsScreen | 289 | AppearanceSection, AccountSection, SettingsRow |
| TowDashboardScreen | 271 | TowStatsCards, TowRequestList |
| ProviderBottomSheet | 261 | ProviderHeader, ProviderDetails, ProviderActions |
| MapContainerNative | 250 | MapViewLayer, MapOverlayControls, MapRetryBanner |
| RequestStatusCard | 218 | RequestStatusHeader, RequestStatusActions, RatingBlock |
| RentalDashboardScreen | 212 | RentalStatsCards, RentalList |

### Backend endpoints missing pagination

- GET /requests/provider  
- GET /requests/customer  
- GET /notifications  
- GET /admin/users  
- GET /admin/providers  
- GET /providers/:id/ratings  
- GET /chat/conversations/:id/messages  

### Backend production blockers

1. No database (in-memory only).  
2. No pagination on most list endpoints.  
3. No structured logging or request IDs.  
4. Health/ready does not verify DB connectivity.  

---

*End of report. For backend-only detail, see `docs/BACKEND_FULL_PRODUCTION_AUDIT.md`.*
