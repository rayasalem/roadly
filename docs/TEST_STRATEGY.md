# Test Strategy – Roadly

**Document:** QA automation test strategy  
**Version:** 1.0  
**Application:** Roadly (React Native + Expo, Web)  
**Roles:** Customer (User), Mechanic, Tow, Rental, Admin  

---

## 1. Strategy overview

### 1.1 Test pyramid

| Layer | Scope | Tools / approach | Purpose |
|-------|--------|------------------|---------|
| **E2E** | Full user flows in browser (web build) | Cypress | Critical paths: login, map, request, logout |
| **Integration** | API + store + hooks (no full DOM) | Jest + MSW or fetch mock | Auth flow, providers API, request API |
| **Manual** | UI, accessibility, device-specific | Checklist + devices | Visual, gesture, platform quirks |
| **Edge case** | Boundaries, errors, race conditions | Jest + E2E + manual | 401, network fail, empty data, invalid input |

### 1.2 Test types

- **Manual:** Run by QA on real devices/simulators; verify UI, gestures, and UX.
- **E2E:** Automated in Cypress against web build; cover main journeys.
- **Integration:** Automated in Jest; mock HTTP, test hooks and store reactions.
- **Edge case:** Mix of automated and manual; focus on failure and boundary scenarios.

### 1.3 Environments

- **Local:** `npx expo start --web --port 8082` for Cypress; Jest in Node.
- **Backend:** Dev backend (or mock) for E2E and integration.
- **Platforms:** Web (Cypress); iOS/Android (manual or Detox if added later).

---

## 2. Test scenario matrix (70+ scenarios)

Each scenario has: **ID**, **Category**, **Type** (Manual / E2E / Integration / Edge), **Name**, **Steps**, **Expected result**, **Priority**.

---

### 2.1 Authentication (18 scenarios)

| ID | Category | Type | Name | Steps | Expected result | Priority |
|----|----------|------|------|-------|-----------------|----------|
| AUTH-M01 | Auth | Manual | Login success – full flow | Launch → Sign in → enter valid email/password → Continue | Loader, success toast, redirect to Customer Home | P0 |
| AUTH-M02 | Auth | Manual | Login – empty email | Login screen → leave email empty, set password → Continue | Validation message; no API call | P0 |
| AUTH-M03 | Auth | Manual | Login – empty password | Login screen → enter email, leave password empty → Continue | Validation message; no API call | P0 |
| AUTH-E01 | Auth | E2E | Login success (Cypress) | Visit app → fill login → submit | Redirect to app; session stored | P0 |
| AUTH-E02 | Auth | E2E | Login failure (Cypress) | Visit app → fill invalid credentials → submit | Error shown; stay on Login | P0 |
| AUTH-E03 | Auth | E2E | Logout (Cypress) | Login → navigate to Profile → Logout | Redirect to Login; session cleared | P0 |
| AUTH-E04 | Auth | E2E | Register success (Cypress) | Visit app → go to Register → fill form → submit | Redirect to app; success | P0 |
| AUTH-I01 | Auth | Integration | setSession updates store and tokenStore | Call authStore.setSession with user + tokens | Zustand has user/tokens; tokenStore has tokens | P0 |
| AUTH-I02 | Auth | Integration | clearSession clears store and tokenStore | Call authStore.clearSession() | user null; tokenStore empty | P0 |
| AUTH-I03 | Auth | Integration | hydrate loads persisted session | Mock AsyncStorage with session; call hydrate() | State restored; hasHydrated true | P0 |
| AUTH-X01 | Auth | Edge | Login when backend returns 500 | Mock API 500 on POST /auth/login | Error toast; stay on Login; no crash | P1 |
| AUTH-X02 | Auth | Edge | Login when network is offline | Disable network; submit login | Network error toast; no crash | P0 |
| AUTH-X03 | Auth | Edge | 401 after refresh fails redirects to Login | Expire access; invalid refresh; trigger API call | clearSession; navigateToLogin called | P0 |
| AUTH-X04 | Auth | Edge | Session hydrate with corrupted storage | AsyncStorage returns invalid JSON | hydrate resolves; no session; hasHydrated true | P1 |
| AUTH-X05 | Auth | Edge | Mock login then API call returns 401 | Mock login as User → navigate to Map (triggers API) | 401; redirect to Login or error toast | P1 |
| AUTH-M04 | Auth | Manual | Register – duplicate email | Register with existing email → Submit | Error message; stay on Register | P0 |
| AUTH-M05 | Auth | Manual | Session persists after refresh (web) | Login → refresh page | Still logged in; dashboard visible | P0 |
| AUTH-M06 | Auth | Manual | All role chips (User, Mechanic, Tow, Rental, Admin) | Tap each chip from Login | Each lands on correct role dashboard | P1 |

---

### 2.2 Map interactions (12 scenarios)

| ID | Category | Type | Name | Steps | Expected result | Priority |
|----|----------|------|------|-------|-----------------|----------|
| MAP-M01 | Map | Manual | Map opens from Home | Customer Home → tap Nearest Locations | Map screen; map visible | P0 |
| MAP-M02 | Map | Manual | User location on map | Open Map; allow location | User marker; map centered (or default) | P0 |
| MAP-M03 | Map | Manual | My Location FAB | Open Map → pan away → tap My Location | Map recenters on user | P0 |
| MAP-M04 | Map | Manual | Back from Map | Map → header back | Previous screen (e.g. Home) | P0 |
| MAP-E01 | Map | E2E | Map loads and shows content (Cypress) | Login as Customer → go to Map (via Home or nav) | Map container visible; no crash | P0 |
| MAP-E02 | Map | E2E | Map with providers API stubbed (Cypress) | Intercept GET /providers/nearby → return fixtures → open Map | Markers or list present (or empty state) | P1 |
| MAP-I01 | Map | Integration | useNearbyProviders with params | Render hook with coords + filterRole | useQuery enabled; queryKey includes params | P1 |
| MAP-I02 | Map | Integration | useUserLocation fetchLocation | Call fetchLocation with permission granted mock | coords set; isLoading false | P1 |
| MAP-X01 | Map | Edge | Map when location permission denied | Deny permission → open Map | Map loads default region; no crash | P1 |
| MAP-X02 | Map | Edge | Map when providers API returns empty (native) | API returns { items: [] }; open Map (native) | No markers; no crash (or fallback if implemented) | P1 |
| MAP-X03 | Map | Edge | Map when providers API fails | Mock 500 on /providers/nearby | Error toast; map still visible | P1 |
| MAP-X04 | Map | Edge | useNearbyProviders when coords null | Pass null params | Query disabled; no request | P1 |

---

### 2.3 Provider filtering (8 scenarios)

| ID | Category | Type | Name | Steps | Expected result | Priority |
|----|----------|------|------|-------|-----------------|----------|
| FLT-M01 | Filter | Manual | Filter All | Map open → tap All | All provider types visible | P0 |
| FLT-M02 | Filter | Manual | Filter Mechanic | Map → tap Mechanic | Only mechanic markers/list | P0 |
| FLT-M03 | Filter | Manual | Filter Tow | Map → tap Tow | Only tow providers | P0 |
| FLT-M04 | Filter | Manual | Filter Rental | Map → tap Rental | Only rental providers | P0 |
| FLT-E01 | Filter | E2E | Filter changes refetch or filter (Cypress) | Open Map → tap Mechanic chip | Filter chip active; list/markers filtered | P0 |
| FLT-I01 | Filter | Integration | useMapFilters setFilter | setFilter('mechanic') | filterRole is 'mechanic'; filterOptions unchanged | P1 |
| FLT-X01 | Filter | Edge | Filter to role with zero providers | API returns empty for role → select that filter | Empty state; no crash | P1 |
| FLT-X02 | Filter | Edge | Rapid filter switching | Tap All → Mechanic → Tow → Rental quickly | No crash; final filter reflected | P2 |

---

### 2.4 Provider details (bottom sheet) (10 scenarios)

| ID | Category | Type | Name | Steps | Expected result | Priority |
|----|----------|------|------|-------|-----------------|----------|
| SHT-M01 | Provider | Manual | Tap marker opens sheet | Map → tap provider marker | Sheet opens; name, role, status, rating, buttons | P0 |
| SHT-M02 | Provider | Manual | Open Map from sheet | Sheet open → tap Open Map | Map centers on provider | P0 |
| SHT-M03 | Provider | Manual | Request service from sheet | Sheet open → tap Request service | Sheet closes; Request screen with correct serviceType | P0 |
| SHT-M04 | Provider | Manual | Tap another marker updates sheet | Tap marker A → tap marker B | Sheet shows provider B | P0 |
| SHT-M05 | Provider | Manual | Bottom card opens sheet | Tap bottom “Request Service” card | Same sheet as nearest provider | P1 |
| SHT-E01 | Provider | E2E | Provider sheet open and Request (Cypress) | Map → click marker (or card) → click Request service | Navigate to Request; URL/route has serviceType | P0 |
| SHT-I01 | Provider | Integration | ProviderBottomSheet with provider null | Render with provider=null | Return null; no modal | P1 |
| SHT-X01 | Provider | Edge | Sheet open with provider missing location | Provider with no location; tap Open Map | No crash; fallback behavior (e.g. my location) | P1 |
| SHT-X02 | Provider | Edge | Sheet dismiss by pan down | Open sheet → drag handle down | Sheet closes; onClose called | P1 |
| SHT-X03 | Provider | Edge | Request service with provider null (guard) | Somehow trigger onRequestService with null | No crash; handler guards | P2 |

---

### 2.5 Dashboard interactions (12 scenarios)

| ID | Category | Type | Name | Steps | Expected result | Priority |
|----|----------|------|------|------|-----------------|----------|
| DSH-M01 | Dashboard | Manual | Customer bottom nav – all tabs | From Home tap Profile, Chat, Notifications, Settings | Each screen opens | P0 |
| DSH-M02 | Dashboard | Manual | Mechanic – Open Map from card | Mechanic dashboard → Open Map in GlassCard | Map screen | P0 |
| DSH-M03 | Dashboard | Manual | Mechanic – My Services / My Skills | Mechanic dashboard → tap My Services; back → My Skills | Correct screens | P0 |
| DSH-M04 | Dashboard | Manual | Mechanic – job card opens sheet | Tap a job card | Bottom sheet with details; Accept/Decline | P0 |
| DSH-M05 | Dashboard | Manual | Tow dashboard – same pattern | Tow → Open Map, Services, Skills, job card | Same as Mechanic | P0 |
| DSH-M06 | Dashboard | Manual | Rental – vehicle card opens sheet | Rental dashboard → tap vehicle card | Sheet with vehicle details | P0 |
| DSH-E01 | Dashboard | E2E | Navigate dashboards per role (Cypress) | Mock login Mechanic → see Mechanic dashboard; repeat Tow, Rental, Admin | Correct title/content per role | P0 |
| DSH-E02 | Dashboard | E2E | Customer Home → Map → back (Cypress) | Login as User → Home → Nearest Locations → Back | Back to Home | P1 |
| DSH-I01 | Dashboard | Integration | useMechanicDashboard filter | setStatusFilter('new') | jobs filtered to status 'new' | P1 |
| DSH-X01 | Dashboard | Edge | Dashboard with empty jobs list | Mechanic; mock empty jobs | Empty list; no crash | P1 |
| DSH-X02 | Dashboard | Edge | FAB Open Map from provider dashboard | Mechanic dashboard → tap FAB | Map screen | P0 |
| DSH-X03 | Dashboard | Edge | Home tab when already on Home | Customer on Home → tap Home in nav | No navigation (or scroll to top) | P2 |

---

### 2.6 Admin user management (10 scenarios)

| ID | Category | Type | Name | Steps | Expected result | Priority |
|----|----------|------|------|-------|-----------------|----------|
| ADM-M01 | Admin | Manual | Admin dashboard – stats and tabs | Login as Admin | Stats visible; Mechanic/Tow/Rental tabs | P0 |
| ADM-M02 | Admin | Manual | Manage users opens list | Admin dashboard → tap Manage users | AdminUsers screen; user list | P0 |
| ADM-M03 | Admin | Manual | User card opens edit sheet | Admin Users → tap a user | Sheet with name, role, status, services | P0 |
| ADM-M04 | Admin | Manual | Edit sheet – change role and Save | Sheet open → select role → Save | Sheet closes; list updated (mock) | P0 |
| ADM-M05 | Admin | Manual | Edit sheet – Cancel | Sheet open → change role → Cancel | Sheet closes; no change | P0 |
| ADM-E01 | Admin | E2E | Admin edit user flow (Cypress) | Login Admin → Manage users → open user → change role → Save | Sheet closes; optional assert list | P0 |
| ADM-E02 | Admin | E2E | Admin tabs switch (Cypress) | Admin dashboard → tap Tow tab → Rental tab | Panel content changes | P1 |
| ADM-I01 | Admin | Integration | useAdminUsers updateUser | updateUser(id, { name, role }) | users state updated | P1 |
| ADM-X01 | Admin | Edge | Edit sheet – toggle services and Save | Open sheet → toggle services → Save | Selections saved; sheet closes | P1 |
| ADM-X02 | Admin | Edge | Admin Open Map from FAB | Admin dashboard → FAB | Map screen | P0 |

---

### 2.7 Profile editing (8 scenarios)

| ID | Category | Type | Name | Steps | Expected result | Priority |
|----|----------|------|------|-------|-----------------|----------|
| PRF-M01 | Profile | Manual | Customer profile – Logout | Customer → Profile → Logout | Session cleared; Login screen | P0 |
| PRF-M02 | Profile | Manual | Provider – Add service opens sheet | Mechanic Profile → Add service | Sheet with service toggles | P0 |
| PRF-M03 | Profile | Manual | Provider – toggle and Save | Add service sheet → toggle services → Save | Sheet closes; list updated | P0 |
| PRF-M04 | Profile | Manual | Provider – Cancel | Add service sheet → toggle → Cancel | Sheet closes; no change | P0 |
| PRF-M05 | Profile | Manual | Provider – Remove service | Profile services list → tap remove on one | Service removed from list | P0 |
| PRF-E01 | Profile | E2E | Profile service edit (Cypress) | Login Mechanic → Profile → Add service → toggle → Save | Sheet closes; optional assert list | P0 |
| PRF-I01 | Profile | Integration | useProviderProfile addService/removeService | addService(id); removeService(id) | services list updated | P1 |
| PRF-X01 | Profile | Edge | Profile with no services | Provider with empty services | Empty state or empty list; Add service works | P1 |

---

### 2.8 Service request creation (12 scenarios)

| ID | Category | Type | Name | Steps | Expected result | Priority |
|----|----------|------|------|-------|-----------------|----------|
| REQ-M01 | Request | Manual | Navigate to Request from Home | Home → tap rider card | Request screen; serviceType shown | P0 |
| REQ-M02 | Request | Manual | Create request success | Request screen → tap Create request | Loader; request ID and status section appear | P0 |
| REQ-M03 | Request | Manual | Status buttons (Accepted, etc.) | After create → tap Accepted (or On the way, etc.) | PATCH sent; status updates or error | P0 |
| REQ-M04 | Request | Manual | Request from Map – Mechanic | Map → open Mechanic sheet → Request service | Request screen with mechanic type | P0 |
| REQ-M05 | Request | Manual | Request from Map – Tow / Rental | Map → Tow provider sheet → Request; same for Rental | Correct serviceType each time | P0 |
| REQ-E01 | Request | E2E | Create request flow (Cypress) | Login → Request (from nav or Map) → Create request (stub API) | Success; request ID visible | P0 |
| REQ-E02 | Request | E2E | Request screen – Back | Request screen → header back | Previous screen | P1 |
| REQ-I01 | Request | Integration | useCreateRequest mutation success | mutate({ serviceType, origin }) with success mock | onSuccess; request id in response | P0 |
| REQ-I02 | Request | Integration | useRequest with requestId | Set requestId; mock GET /requests/:id | data populated; isLoading false | P0 |
| REQ-X01 | Request | Edge | Create request when API fails | Mock 500 on POST /requests | Error message; button re-enabled | P0 |
| REQ-X02 | Request | Edge | Create request with no location (fallback) | No coords; open Request → Create | Fallback origin used; request created or error | P1 |
| REQ-X03 | Request | Edge | Update status when request not found | requestId invalid; tap status button | 404 handling; toast or message | P1 |

---

## 3. Scenario count summary

| Area | Manual | E2E | Integration | Edge | Total |
|------|--------|-----|-------------|------|-------|
| Authentication | 6 | 4 | 3 | 5 | 18 |
| Map interactions | 4 | 2 | 2 | 4 | 12 |
| Provider filtering | 4 | 1 | 1 | 2 | 8 |
| Provider details | 5 | 1 | 1 | 3 | 10 |
| Dashboard interactions | 6 | 2 | 1 | 3 | 12 |
| Admin user management | 5 | 2 | 1 | 2 | 10 |
| Profile editing | 5 | 1 | 1 | 1 | 8 |
| Service request creation | 5 | 2 | 2 | 3 | 12 |
| **Total** | **40** | **15** | **12** | **23** | **90** |

---

## 4. Manual test execution

### 4.1 Scope

- All scenarios with **Type = Manual** (40).
- Run on at least: **Web** (Chrome), **iOS simulator**, **Android emulator** (if available).
- Use real backend or mocked API; document which.

### 4.2 Checklist format

For each Manual scenario:

1. **Preconditions** (device, backend, account).
2. **Steps** (numbered).
3. **Expected result** (pass/fail criteria).
4. **Actual result** (notes).
5. **Pass / Fail**.

### 4.3 Regression cadence

- **Smoke:** AUTH-M01, MAP-M01, FLT-M01, SHT-M01, REQ-M02, PRF-M01, ADM-M01 (7).
- **Full manual:** Before each release; all 40 manual scenarios.
- **Ad hoc:** After major UI or flow changes in affected areas.

---

## 5. End-to-end (E2E) automation

### 5.1 Tool

- **Cypress** for web build (`npx expo start --web --port 8082`).

### 5.2 Scenarios to automate (15)

| ID | Scenario | Spec file (suggested) |
|----|----------|------------------------|
| AUTH-E01, AUTH-E02, AUTH-E03, AUTH-E04 | Login success/fail, Logout, Register | `cypress/e2e/auth.cy.ts` |
| MAP-E01, MAP-E02 | Map load, providers stubbed | `cypress/e2e/map.cy.ts` |
| FLT-E01 | Filter on map | `cypress/e2e/map.cy.ts` |
| SHT-E01 | Provider sheet and Request | `cypress/e2e/map.cy.ts` |
| DSH-E01, DSH-E02 | Role dashboards, Home → Map → back | `cypress/e2e/dashboards.cy.ts` |
| ADM-E01, ADM-E02 | Admin edit user, tabs | `cypress/e2e/admin.cy.ts` |
| PRF-E01 | Profile service edit | `cypress/e2e/profile.cy.ts` |
| REQ-E01, REQ-E02 | Create request, Back | `cypress/e2e/request.cy.ts` (or existing flow) |

### 5.3 Best practices

- Use **data-testid** or stable selectors (role, placeholder).
- **Intercept** API (e.g. `/auth/login`, `/providers/nearby`, `/requests`) to control data and avoid flakiness.
- **Wait** for loading to finish (e.g. no spinner) before asserting.
- **Clean state** between tests (e.g. clear storage or use fresh session).

---

## 6. Integration tests

### 6.1 Scope

- **Hooks** that call API or update store: authStore, useNearbyProviders, useCreateRequest, useRequest, useProviderProfile, useAdminUsers, useMechanicDashboard, etc.
- **HTTP mock:** MSW (Mock Service Worker) or Jest `jest.mock` of `api` / fetch.

### 6.2 Scenarios to automate (12)

- AUTH-I01, AUTH-I02, AUTH-I03 (store + hydrate).
- MAP-I01, MAP-I02 (useNearbyProviders, useUserLocation).
- FLT-I01 (useMapFilters).
- SHT-I01 (ProviderBottomSheet guard).
- DSH-I01 (useMechanicDashboard filter).
- ADM-I01 (useAdminUsers updateUser).
- PRF-I01 (useProviderProfile add/remove).
- REQ-I01, REQ-I02 (useCreateRequest, useRequest).

### 6.3 Approach

- Render hook with `@testing-library/react-hooks` or component that uses hook.
- Mock `api.get/post/patch` or Axios adapter.
- Assert state (Zustand, hook return) and optional API call count/args.

---

## 7. Edge case tests

### 7.1 Scope

- **Network:** Offline, timeout, 500, 401 after refresh fail.
- **Data:** Empty lists, null/undefined provider, corrupted session.
- **Input:** Invalid or missing params (e.g. no coords, invalid requestId).
- **Concurrency:** Rapid filter switch, double submit (optional).

### 7.2 Distribution

- **Automated (Jest):** AUTH-X04 (corrupt storage), MAP-X04 (null params), SHT-I01 (null provider), REQ-X01 (API fail).
- **Automated (Cypress):** AUTH-X02 (offline), AUTH-X03 (401 redirect), MAP-X02/X03 (empty/fail), REQ-X01.
- **Manual:** AUTH-X01 (500), MAP-X01 (permission denied), FLT-X01, SHT-X01/X02, DSH-X01/X02/X03, ADM-X01/X02, PRF-X01, REQ-X02/X03.

### 7.3 Priority

- P0 edge cases (e.g. 401 redirect, network error, create request fail) must be automated or run every release.
- P1/P2 can be manual or run less frequently.

---

## 8. Test data and fixtures

### 8.1 Auth

- **Valid user:** email + password (from backend or fixture).
- **Invalid:** wrong password, non-existent email.
- **Roles:** One account or mock per role (User, Mechanic, Tow, Rental, Admin) for E2E.

### 8.2 Providers

- **Cypress:** `cypress/fixtures/providers.json` – `{ items: [ { id, name, role, location, ... } ] }`.
- **Integration:** Mock `fetchNearbyProviders` to return controlled list.

### 8.3 Requests

- **Create:** `{ serviceType, origin }`; optional `destination`.
- **Get/Update:** `requestId` from create response; mock GET/PATCH for integration.

---

## 9. CI/CD and reporting

### 9.1 Recommended pipeline

1. **Lint + unit:** On every push/PR.
2. **Integration tests:** On every push/PR (Jest).
3. **E2E (Cypress):** On PR to main and nightly; run against dev or staging backend (or mocked).
4. **Manual smoke:** Before release; document in checklist.

### 9.2 Reporting

- **Jest:** JUnit or similar for integration; track coverage for hooks/store.
- **Cypress:** Screenshot/video on failure; optional Cypress Dashboard.
- **Manual:** Spreadsheet or test management tool with scenario ID (e.g. AUTH-M01), run date, result, build.

---

## 10. Traceability

| Requirement area | Primary scenarios | Test type |
|------------------|-------------------|-----------|
| User can log in and see dashboard | AUTH-M01, AUTH-E01 | Manual, E2E |
| User can see nearby providers on map | MAP-M02, MAP-E01, MAP-E02 | Manual, E2E |
| User can filter providers by role | FLT-M01–M04, FLT-E01 | Manual, E2E |
| User can open provider details and request service | SHT-M01–M04, SHT-E01 | Manual, E2E |
| User can create and update service request | REQ-M01–M05, REQ-E01, REQ-I01/I02 | Manual, E2E, Integration |
| Provider can see dashboard and jobs | DSH-M02–M06, DSH-E01 | Manual, E2E |
| Admin can manage users and roles | ADM-M01–M05, ADM-E01 | Manual, E2E |
| User can edit profile services (provider) | PRF-M02–M05, PRF-E01 | Manual, E2E |
| Session persists and 401 redirects to Login | AUTH-M05, AUTH-X03 | Manual, Edge |

Use scenario IDs (e.g. AUTH-E01) in bug reports and release notes for traceability.
