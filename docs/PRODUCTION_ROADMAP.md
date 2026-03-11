# Production Roadmap — Multi-Role Service Provider App

This document maps the current MVP (mock data, polished UI) to a **production-grade** app: backend wiring, auth/security, map polish, profile CRUD, error handling, tests, theming, build/deploy, and monitoring.

---

## Current State Summary

| Area | Status | Notes |
|------|--------|--------|
| **Roles** | ✅ | User, Mechanic, Tow, Rental, Admin with role-based navigation |
| **Dashboards** | ✅ UI | Mechanic/Tow/Rental/Admin dashboards with mock data; hooks ready for API |
| **Map** | ⚠️ Partial | Native: react-native-maps + markers + bottom sheet. Web: Google Maps JS when `EXPO_PUBLIC_GOOGLE_MAPS_KEY` set; placeholder otherwise |
| **Profile (provider)** | ✅ UI | Per-role profile with avatar, rating, status, editable services (mock) |
| **Admin** | ✅ UI | Tabs (Mechanic/Tow/Rental), user list, edit services per user (mock) |
| **Auth** | ⚠️ Partial | Login/register call API; refresh rotation and 401 handling scaffolded |
| **i18n** | ✅ | EN/AR, RTL; error toasts now use i18n keys |
| **Components** | ✅ | GlassCard, PressableCard, FAB, AppHeader, BottomNavBar, Button, ProviderBottomSheet |
| **State** | ✅ | Zustand (auth, UI, toasts); TanStack Query scaffolded; Axios + interceptors |

---

## 1️⃣ A. API Integration & Data Wiring

**Goal:** Replace mock hooks with real backend calls; add optimistic updates and rollback.

| Step | Action | Files / Hooks | Complexity |
|------|--------|---------------|------------|
| A1 | **Dashboards** — Wire Mechanic/Tow/Rental/Admin to backend | `useMechanicDashboard`, `useTowDashboard`, `useRentalDashboard`, `useAdminDashboard`, `useAdminUsers`; add API modules under `features/*/data/` | High |
| A2 | **Map providers** — `useNearbyProviders` to real API with filters, paging, search | `providers/data/providersApi.ts`, `useNearbyProviders`, MapScreen (native + web) | Medium |
| A3 | **Profile CRUD** — Services/skills/fleet/vehicles per provider | `useProviderProfile`, Admin “edit services”; new endpoints e.g. `PATCH /users/:id/services` | Medium |
| A4 | **Admin CRUD** — Users and providers, bulk service updates | `useAdminUsers`, Admin dashboard panels; backend RBAC + endpoints | High |
| A5 | **Optimistic updates** — Mutations with rollback on API error | TanStack Query `useMutation` with `onMutate` / `onError` / `onSettled`; toast on rollback | Medium |

**Deliverables:** All dashboards and profile/admin panels read/write via API; loading and error states; optional optimistic UI with rollback.

---

## 2️⃣ B. Auth & Security

**Goal:** Full JWT with refresh rotation; interceptors; role-based guards; backend hardening.

| Step | Action | Files / Areas | Complexity |
|------|--------|----------------|------------|
| B1 | **Refresh rotation** — Implement refresh token flow (client + backend) | `sessionStorage`, auth API, `httpClient` tokenProvider.refreshAccessToken | Medium |
| B2 | **Interceptors** — Attach token; on 401 retry with refresh; logout if refresh fails | `httpClient.ts` (already has retry); ensure onUnauthorized clears session + push token | Low |
| B3 | **Route guarding** — Only permitted dashboards and profile edits per role | Navigation: role-based stacks; protect Admin/Provider routes; redirect to login if no session | Medium |
| B4 | **Backend** — HTTPS, CORS, Zod/Joi validation, rate limiting, RBAC middleware | Backend middleware and env (e.g. Render); role checks on sensitive routes | High |

**Deliverables:** Secure session lifecycle; no access to other roles’ dashboards; backend validated and rate-limited.

---

## 3️⃣ C. Map & UX Polish

**Goal:** Reliable map on iOS, Android, Web; markers, callouts, clustering, zoom behavior.

| Step | Action | Files / Areas | Complexity |
|------|--------|---------------|------------|
| C1 | **Markers** — Animate/scale on tap; optional clustering at high density | `MapScreen.tsx` (AnimatedMapMarker); consider react-native-maps clustering or custom cluster view | Medium |
| C2 | **Camera** — Selecting/closing provider BottomSheet adjusts camera naturally | MapScreen: `handleOpenMapFromSheet`; set region/camera when opening sheet and on close | Low |
| C3 | **Places API** — Validate search; fallback when key missing or quota exceeded | `usePlacesSearch`, `placesApi.ts`; WebMapView placeholder when no key | Low |
| C4 | **Callouts/BottomSheet** — Avatar, name, role, rating, status, CTAs (Open Map, Request) | `ProviderBottomSheet` (already has most); ensure i18n and role themes | Low |
| C5 | **Web** — Ensure `EXPO_PUBLIC_GOOGLE_MAPS_KEY` in env for production web build | `.env.example`, docs; WebMapView shows i18n placeholder when key missing | Low |

**Deliverables:** Map production-ready on all platforms; clear placeholder message when key missing; smooth interactions and callouts.

---

## 4️⃣ D. Profile Pages (Per Provider)

**Goal:** Each provider has a personal page; editable services/skills; Admin can edit any provider.

| Step | Action | Files / Areas | Complexity |
|------|--------|---------------|------------|
| D1 | **Profile UI** — Avatar, name, role, rating, status; services list (GlassCard/PressableCard) | `ProfileScreen.tsx` (provider block + `useProviderProfile`); already in place | Done |
| D2 | **Edit services** — Add/Remove via BottomSheet; owner or Admin only | `EditServicesSheet` in ProfileScreen; AdminUsersScreen “Edit services” | Done (mock) |
| D3 | **Wire to API** — Load/save services and skills from backend | `useProviderProfile` → API; Admin user service assignment → API | Medium |
| D4 | **No service times** — Admin sees only service types, not schedule/availability | Already by design; keep payloads to service IDs/names | Low |

**Deliverables:** Profile page per provider role; editable services/skills; role-themed UI; API-ready.

---

## 5️⃣ E. Error Handling & Notifications

**Goal:** Global error toasts; skeletons/loading; empty states; retry.

| Step | Action | Files / Areas | Complexity |
|------|--------|---------------|------------|
| E1 | **Toasts** — API/network errors surface via toast (i18n) | `HttpEventsBinder` + `t('error.network')` etc.; already done for common errors | Done |
| E2 | **Skeletons / loading** | Dashboards, map, lists: use existing `LoadingSpinner` or add skeleton components | Medium |
| E3 | **Empty states** | Lists: “No requests”, “No vehicles” with i18n keys and optional retry CTA | Low |
| E4 | **Partial failures** | Retry button or “Try again” in toast/empty state; mutation retry in TanStack Query | Low |

**Deliverables:** Consistent error messaging (i18n); loading and empty states; retry where appropriate.

---

## 6️⃣ F. Performance

**Goal:** Smooth lists; minimal re-renders; debounced search; optional background refresh.

| Step | Action | Files / Areas | Complexity |
|------|--------|---------------|------------|
| F1 | **Lists** — Use FlatList/SectionList for long lists | Dashboards, Admin panels, provider lists | Low |
| F2 | **Memoization** — Heavy list items and map markers | `React.memo` on card/marker components; stable callbacks | Low |
| F3 | **Debounce** — Map search and filters | `usePlacesSearch`, filter state; 300–500 ms debounce | Low |
| F4 | **Background refresh** — Active request status (optional) | Polling or WebSocket for “my active request” screen | Medium |

**Deliverables:** No jank on scroll; debounced search; optional real-time updates for active requests.

---

## 7️⃣ G. Testing

**Goal:** Unit + integration tests for hooks and UI; E2E for critical flows.

| Step | Action | Files / Areas | Complexity |
|------|--------|---------------|------------|
| G1 | **Unit** — Hooks (dashboards, map filters, profile, auth) | `*.test.ts` or `*.spec.ts` next to hooks | High |
| G2 | **Integration** — Dashboard screens, profile edit, map provider selection | Screen tests with mock API and navigation | High |
| G3 | **E2E (native)** — Login, role dashboards, map, profile edits | Detox; critical paths only | High |
| G4 | **E2E (web)** — Same flows on web | Cypress or Playwright | Medium |

**Deliverables:** Tests for hooks and main screens; E2E for login, dashboards, map, profile.

---

## 8️⃣ H. Theming & Localization

**Goal:** Role themes everywhere; full EN/AR; RTL; optional dark mode.

| Step | Action | Files / Areas | Complexity |
|------|--------|---------------|------------|
| H1 | **Role themes** — Consistent use of ROLE_THEMES on cards, buttons, headers | Audit screens; use `ROLE_THEMES[role]` for primary/light/icon | Low |
| H2 | **i18n** — All user-facing strings have keys; EN/AR complete | `strings.ts`; add missing keys for new copy | Low |
| H3 | **RTL** — Layout and navigation for Arabic | I18nManager, layout flip; test all screens | Medium |
| H4 | **Dark mode** (optional) | Theme tokens (colors) for light/dark; context or store for mode | Medium |

**Deliverables:** Theming consistent; EN/AR complete; RTL validated; optional dark mode.

---

## 9️⃣ I. Build & Deployment

**Goal:** EAS dev/preview/production; web hosting; backend production env.

| Step | Action | Files / Areas | Complexity |
|------|--------|---------------|------------|
| I1 | **EAS** — `eas.json` profiles: development, preview, production | `eas.json`; app.json versioning | Low |
| I2 | **Web** — Host web build; set `EXPO_PUBLIC_GOOGLE_MAPS_KEY` (and API URL) for production | Env in hosting (e.g. Vercel/Netlify); WebMapView key check | Low |
| I3 | **Backend** — Deploy to production; env (DB, JWT secrets, CORS, rate limit) | e.g. Render/Railway; health check; no localhost | Medium |
| I4 | **Secrets** — No keys in repo; use EAS Secrets and backend env | `.env.example` only; document required vars | Low |

**Deliverables:** Build-ready iOS/Android/Web; backend live with correct env.

---

## 🔟 J. Monitoring & Analytics

**Goal:** Crash reporting; event tracking; performance metrics.

| Step | Action | Files / Areas | Complexity |
|------|--------|---------------|------------|
| J1 | **Sentry** — Frontend and backend | `@sentry/react-native` and backend SDK; DSN in env | Medium |
| J2 | **Events** — login, request_created, request_accepted, vehicle_status_change, map_marker_clicked | Central analytics module; call from auth, request, map, admin | Low |
| J3 | **Performance** — Map load time, API latency, error rate | Sentry or dedicated APM; optional | Medium |

**Deliverables:** Crashes and key events tracked; optional performance dashboard.

---

## Deliverables Checklist (from your brief)

| Deliverable | Status | Notes |
|-------------|--------|--------|
| Profile page per provider — editable services/skills | ✅ UI | Wire to API (A3, D3) |
| All dashboards wired to backend | ⏳ | A1, A4 |
| Map production-ready — markers, callouts, clustering, filters | ⚠️ | C1–C5; key in env for web |
| Admin control panel — edit users/services, monitor | ✅ UI | Wire to API (A4) |
| Error handling, skeletons, toasts | ✅ Toasts i18n | E2–E4 for skeletons/empty/retry |
| Unit + E2E tests | ⏳ | G1–G4 |
| Build-ready — iOS, Android, Web | ⏳ | I1–I4 |
| Monitoring & analytics | ⏳ | J1–J3 |

---

## Suggested Implementation Order

1. **B (Auth & Security)** — So every API call is authenticated and routes are protected.
2. **A (API wiring)** — Dashboards and map first; then profile and Admin CRUD.
3. **C (Map polish)** — Clustering, zoom, Places fallback; ensure web key documented.
4. **E (Error handling)** — Skeletons and empty states once API is in use.
5. **F (Performance)** — FlatList, memo, debounce as lists and map grow.
6. **H (Theming/i18n)** — Quick pass for role themes and missing strings.
7. **I (Build & deploy)** — EAS and backend production.
8. **G (Testing)** — In parallel or after core flows are stable.
9. **J (Monitoring)** — Before or right after first production release.

---

## Quick Wins Already Done

- **Error toasts i18n:** Global HTTP error handler uses `t('error.network')`, `t('error.timeout')`, `t('error.server')` (EN/AR) so “Network error” and similar messages are localized.
- **Map placeholder:** When `EXPO_PUBLIC_GOOGLE_MAPS_KEY` is missing, WebMapView shows a clear message (use `map.placeholderNoKey` in your UI if you show it elsewhere).

---

## File Reference (key areas)

- **Auth:** `src/shared/services/auth/`, `src/store/authStore.ts`, `src/features/auth/`
- **HTTP:** `src/shared/services/http/httpClient.ts`, `httpEvents.ts`, `HttpEventsBinder.tsx`
- **Map:** `src/features/map/presentation/screens/MapScreen.tsx`, `MapScreen.web.tsx`, `WebMapView.tsx`
- **Providers:** `src/features/providers/hooks/useNearbyProviders.ts`, `data/providersApi.ts`
- **Dashboards:** `src/features/mechanic/`, `tow/`, `rental/`, `admin/` (hooks + presentation)
- **Profile:** `src/features/profile/presentation/screens/ProfileScreen.tsx`, `hooks/useProviderProfile.ts`
- **Admin users:** `src/features/admin/hooks/useAdminUsers.ts`, `AdminUsersScreen.tsx`
- **i18n:** `src/shared/i18n/strings.ts`, `t.ts`
- **Theme:** `src/shared/theme/`, `roleThemes.ts`

Use this roadmap to tick off items as you implement them and to onboard new contributors.
