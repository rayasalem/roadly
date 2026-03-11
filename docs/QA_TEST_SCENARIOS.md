# QA Test Scenarios – Roadly

Structured test cases for manual or automated QA. Each scenario includes **Test case name**, **Steps**, **Expected result**, and **Edge cases**.

---

## 1. Authentication

### TC-AUTH-001: Login with valid credentials

| Field | Content |
|-------|--------|
| **Test case name** | Login with valid email and password |
| **Preconditions** | App on Launch or Welcome screen; backend available; user exists |
| **Steps** | 1. Open app and go to Login (Launch → Sign in, or Welcome → Sign in).<br>2. Enter valid email in email field.<br>3. Enter valid password.<br>4. Tap "Continue" (submit). |
| **Expected result** | Loader appears; API returns 200; session is set; user is redirected to App (role-based dashboard); success toast is shown. |
| **Edge cases** | • Empty email or password → validation error / toast.<br>• Invalid credentials → 401; error message shown.<br>• Network off → error toast (e.g. "Network error").<br>• Backend down → error message. |

---

### TC-AUTH-002: Login with invalid credentials

| Field | Content |
|-------|--------|
| **Test case name** | Login fails with wrong email or password |
| **Preconditions** | App on Login screen |
| **Steps** | 1. Enter a non-existent email or wrong password.<br>2. Tap "Continue". |
| **Expected result** | Request fails (401); error message or toast shown; user remains on Login; no navigation to App. |
| **Edge cases** | • Empty fields → client-side validation before API call.<br>• Malformed email → validation or server error. |

---

### TC-AUTH-003: Mock login (role chips)

| Field | Content |
|-------|--------|
| **Test case name** | Mock login via role chip without API |
| **Preconditions** | App on Login screen (web/customer build) |
| **Steps** | 1. Tap one of the role chips (User, Mechanic, Tow, Rental, Admin). |
| **Expected result** | Session is set with mock user and mock token; user is redirected to App; correct role dashboard is shown (Customer / Mechanic / Tow / Rental / Admin). |
| **Edge cases** | • Subsequent API call with mock token → 401 (expected).<br>• Ensure mock login is disabled or hidden in production. |

---

### TC-AUTH-004: Register new user

| Field | Content |
|-------|--------|
| **Test case name** | Register with name, email, password |
| **Preconditions** | App on Register screen; backend available |
| **Steps** | 1. Navigate to Register (from Login link or Launch "Create account").<br>2. Enter name, valid email, password.<br>3. Tap "Register" (submit). |
| **Expected result** | Loader shown; API returns 201; session set; redirect to App; success toast. |
| **Edge cases** | • Email already registered → 400; error message.<br>• Weak or empty password → validation/error.<br>• Invalid email format → validation/error.<br>• Network failure → error toast. |

---

### TC-AUTH-005: Logout

| Field | Content |
|-------|--------|
| **Test case name** | Logout clears session and redirects to Login |
| **Preconditions** | User is logged in (any role) |
| **Steps** | 1. Navigate to Profile.<br>2. Tap "Logout" button. |
| **Expected result** | Backend logout called (if possible); local session and tokens cleared; user redirected to Login screen. |
| **Edge cases** | • Backend unreachable → logout still clears local session and redirects.<br>• Logout during loading → session still cleared. |

---

### TC-AUTH-006: Session persistence (hydrate)

| Field | Content |
|-------|--------|
| **Test case name** | After app restart, logged-in user remains logged in |
| **Preconditions** | User logged in; session persisted to AsyncStorage/localStorage |
| **Steps** | 1. Log in (real or mock).<br>2. Close app (or refresh on web).<br>3. Reopen app. |
| **Expected result** | Auth bootstrap runs; persisted session loaded; if refresh token present, access token refreshed; user sees role dashboard without Login screen. |
| **Edge cases** | • Corrupted storage → treated as no session; user sees Login.<br>• Refresh fails → session cleared; redirect to Login. |

---

## 2. Map Loading

### TC-MAP-001: Map screen loads with user location

| Field | Content |
|-------|--------|
| **Test case name** | Map loads and shows user location when permission granted |
| **Preconditions** | User logged in (Customer); location permission granted (or prompt accepted) |
| **Steps** | 1. From Home, tap "Nearest Locations" or open Map from bottom nav.<br>2. Wait for map and location to load. |
| **Expected result** | Map is visible (native: react-native-maps; web: Google Maps if key set); user location marker appears; camera centered on user (or default); no crash. |
| **Edge cases** | • Location permission denied → message or fallback; map may show default region.<br>• Location off / unavailable → map still loads with default center.<br>• Web without Google Maps key → placeholder or error message. |

---

### TC-MAP-002: Map loads with providers (API)

| Field | Content |
|-------|--------|
| **Test case name** | Nearby providers are requested and displayed on map |
| **Preconditions** | User logged in; location available; backend returns providers for GET /providers/nearby |
| **Steps** | 1. Open Map screen.<br>2. Wait for location and provider request to complete. |
| **Expected result** | Provider markers appear on map (when API returns data); on web, empty API response may show mock providers fallback; on native, empty response shows no markers. |
| **Edge cases** | • API error → global error toast; native map may show no markers.<br>• API slow → loading state then markers or empty.<br>• No coords yet → providers query disabled until location available. |

---

### TC-MAP-003: Map filter chips

| Field | Content |
|-------|--------|
| **Test case name** | Filtering by role updates provider list/markers |
| **Preconditions** | Map screen open; providers loaded (or mock) |
| **Steps** | 1. Tap filter "All".<br>2. Tap filter "Mechanic".<br>3. Tap "Tow", then "Rental". |
| **Expected result** | Active filter is visually highlighted; provider request is refetched with role param (or client filter); markers/list update according to filter. |
| **Edge cases** | • No providers for selected role → empty list/markers; no crash. |

---

## 3. Provider Selection

### TC-PROV-001: Select provider from map marker

| Field | Content |
|-------|--------|
| **Test case name** | Tapping a provider marker opens bottom sheet with details |
| **Preconditions** | Map screen with at least one provider marker |
| **Steps** | 1. Tap a provider marker on the map. |
| **Expected result** | Marker shows selected state (e.g. scale); bottom sheet opens with provider name, role, status, rating, contact; "Open Map" and "Request service" buttons visible. |
| **Edge cases** | • Tap same marker again → sheet may close or stay open (implementation-dependent).<br>• Tap another marker → sheet updates to new provider. |

---

### TC-PROV-002: Open Map from provider sheet

| Field | Content |
|-------|--------|
| **Test case name** | "Open Map" in sheet re-centers map on provider |
| **Preconditions** | Provider bottom sheet is open |
| **Steps** | 1. Tap "Open Map" (or equivalent) in the bottom sheet. |
| **Expected result** | Map camera animates to provider location; sheet may remain open or close (implementation-dependent). |
| **Edge cases** | • Provider has no location → fallback (e.g. my location) or no move. |

---

### TC-PROV-003: Request service from provider sheet

| Field | Content |
|-------|--------|
| **Test case name** | "Request service" navigates to Request screen with correct service type |
| **Preconditions** | Provider bottom sheet open (mechanic / tow / rental) |
| **Steps** | 1. Tap "Request service" in the bottom sheet. |
| **Expected result** | Sheet closes; navigation to Request screen with serviceType matching provider role (mechanic, tow, or rental). |
| **Edge cases** | • Missing serviceType mapping → Request screen still opens; serviceType may be default or wrong (verify mapping). |

---

### TC-PROV-004: Bottom card "Request Service" (nearest)

| Field | Content |
|-------|--------|
| **Test case name** | Tapping bottom card opens sheet for nearest provider |
| **Preconditions** | Map screen with at least one provider |
| **Steps** | 1. Tap the bottom card that shows nearest provider / "Request Service". |
| **Expected result** | Bottom sheet opens for the nearest provider (same as selecting that provider’s marker). User can then tap "Request service" in sheet to go to Request. |
| **Edge cases** | • No providers → no card or disabled; no crash. |

---

## 4. Navigation Between Dashboards

### TC-NAV-001: Customer bottom nav

| Field | Content |
|-------|--------|
| **Test case name** | Customer can switch between Home, Map, Profile, Chat, Notifications, Settings via bottom nav |
| **Preconditions** | User logged in as Customer (user role) |
| **Steps** | 1. From Home, tap Profile → verify Profile screen.<br>2. Tap Chat → verify Chat screen.<br>3. Tap Notifications → verify Notifications screen.<br>4. Tap Settings → verify Settings screen.<br>5. Tap Home (or back) → verify Home. |
| **Expected result** | Each tap navigates to the correct screen; active tab is highlighted; no crash. |
| **Edge cases** | • Home tab when already on Home → no navigation (no-op). |

---

### TC-NAV-002: Role-based initial screen after login

| Field | Content |
|-------|--------|
| **Test case name** | After login, user sees dashboard matching role |
| **Preconditions** | None |
| **Steps** | 1. Log in as User → expect Customer stack (e.g. Home).<br>2. Log out; log in as Mechanic (mock or real) → expect Mechanic dashboard.<br>3. Repeat for Tow, Rental, Admin. |
| **Expected result** | User → Home (CustomerStack). Mechanic → MechanicDashboard. Tow → TowDashboard. Rental → RentalDashboard. Admin → AdminDashboard. |
| **Edge cases** | • Unknown role → fallback to Customer. |

---

### TC-NAV-003: Mechanic dashboard navigation

| Field | Content |
|-------|--------|
| **Test case name** | Mechanic can open Map, Profile, Services, Skills |
| **Preconditions** | Logged in as Mechanic |
| **Steps** | 1. Tap "Open Map" in GlassCard → Map screen.<br>2. Go back; tap header profile → Profile.<br>3. Go back; tap "My Services" card → MechanicServices screen.<br>4. Go back; tap "My Skills" card → MechanicSkills screen.<br>5. Tap FAB "Open Map" → Map. |
| **Expected result** | Each action navigates to the correct screen; back returns to Mechanic dashboard. |
| **Edge cases** | • Same for Tow and Rental (Open Map, Profile, Services, Skills). |

---

### TC-NAV-004: Request screen has no bottom nav

| Field | Content |
|-------|--------|
| **Test case name** | From Request screen, user cannot switch tabs via bottom nav |
| **Preconditions** | User on Request screen (Customer) |
| **Steps** | 1. Navigate to Request (e.g. from Map or Home).<br>2. Look for BottomNavBar. |
| **Expected result** | BottomNavBar is not rendered on Request screen; user uses Back or Profile in header to leave. |
| **Edge cases** | • Document as known UX: no tab bar on Request. |

---

## 5. Admin Panel

### TC-ADMIN-001: Admin dashboard loads

| Field | Content |
|-------|--------|
| **Test case name** | Admin sees dashboard with stats and role tabs |
| **Preconditions** | Logged in as Admin |
| **Steps** | 1. After login, confirm Admin dashboard.<br>2. Check global stats (users, providers, requests, revenue).<br>3. Check tabs: Mechanic, Tow, Rental. |
| **Expected result** | Stats and tabs visible; data may be mock; no crash. |
| **Edge cases** | • Non-admin role should not see Admin stack. |

---

### TC-ADMIN-002: Manage users navigation

| Field | Content |
|-------|--------|
| **Test case name** | Admin can open Manage users list |
| **Preconditions** | On Admin dashboard |
| **Steps** | 1. Tap "Manage users" (or equivalent) card. |
| **Expected result** | Navigate to AdminUsers screen; list of users (mock or API) with role/status; each user card can open edit. |
| **Edge cases** | • Empty list → empty state; no crash. |

---

### TC-ADMIN-003: Edit user (sheet) – role, status, services

| Field | Content |
|-------|--------|
| **Test case name** | Admin can open edit sheet and change role, status, services |
| **Preconditions** | On Admin Users screen |
| **Steps** | 1. Tap a user card to open edit sheet.<br>2. Change role (chip).<br>3. Change status (chip).<br>4. Toggle one or more services.<br>5. Tap Save. |
| **Expected result** | Sheet opens with user data; role/status/services update in UI; Save closes sheet and updates list (mock or API). |
| **Edge cases** | • Tap Cancel → sheet closes without saving.<br>• No changes → Save still closes and may persist. |

---

### TC-ADMIN-004: Admin panel tabs and filters

| Field | Content |
|-------|--------|
| **Test case name** | Switching Mechanic/Tow/Rental tabs and filters updates content |
| **Preconditions** | On Admin dashboard |
| **Steps** | 1. Tap Mechanic tab → see mechanic requests/panel.<br>2. Tap filter chip (e.g. status) → list updates.<br>3. Tap Tow tab → see tow panel.<br>4. Tap Rental tab → see vehicles; tap "Add vehicle" (if present). |
| **Expected result** | Tab and filter changes update the displayed list; Add vehicle currently has no handler (document known issue). |
| **Edge cases** | • Edit in sheet only closes sheet (handleEdit TODO). |

---

### TC-ADMIN-005: Admin Open Map

| Field | Content |
|-------|--------|
| **Test case name** | Admin can open Map from dashboard and FAB |
| **Preconditions** | On Admin dashboard |
| **Steps** | 1. Tap "Open Map" in GlassCard or FAB.<br>2. Tap "Open Map" on a request/vehicle card. |
| **Expected result** | Navigation to Map screen in Admin stack. |
| **Edge cases** | None. |

---

## 6. Profile Editing

### TC-PROFILE-001: User profile – view and logout

| Field | Content |
|-------|--------|
| **Test case name** | Customer sees profile and can logout |
| **Preconditions** | Logged in as User |
| **Steps** | 1. Navigate to Profile.<br>2. Confirm user name/email/role visible.<br>3. Tap Logout. |
| **Expected result** | Profile data shown; Logout clears session and redirects to Login. |
| **Edge cases** | • Header profile icon does nothing (empty onProfile). |

---

### TC-PROFILE-002: Provider profile – services list

| Field | Content |
|-------|--------|
| **Test case name** | Provider sees services and can remove one (mock) |
| **Preconditions** | Logged in as Mechanic (or Tow/Rental) |
| **Steps** | 1. Navigate to Profile.<br>2. Confirm "My Services" section and list.<br>3. Tap remove (icon) on a service. |
| **Expected result** | Service removed from list (mock state); UI updates immediately. |
| **Edge cases** | • Last service removed → list empty or minimum enforced (implementation-dependent). |

---

### TC-PROFILE-003: Provider – Add service sheet (open, cancel)

| Field | Content |
|-------|--------|
| **Test case name** | Add service sheet opens and Cancel closes without saving |
| **Preconditions** | Provider Profile with services section |
| **Steps** | 1. Tap "Add service".<br>2. Confirm sheet opens with available services (toggles).<br>3. Toggle one or more.<br>4. Tap Cancel. |
| **Expected result** | Sheet opens; toggles work; Cancel closes sheet; no change to saved services list. |
| **Edge cases** | • No available services → empty or message. |

---

### TC-PROFILE-004: Provider – Add service sheet (save)

| Field | Content |
|-------|--------|
| **Test case name** | Add service sheet Save updates provider services |
| **Preconditions** | Provider Profile; Add service sheet open |
| **Steps** | 1. Toggle one or more services in sheet.<br>2. Tap Save. |
| **Expected result** | Sheet closes; selected services appear in profile services list (mock or API); UI updates. |
| **Edge cases** | • All toggles off → list may clear or keep previous (implementation-dependent). |

---

## 7. Service Requests

### TC-REQ-001: Create request (Customer)

| Field | Content |
|-------|--------|
| **Test case name** | Customer can create a service request |
| **Preconditions** | Logged in as Customer; on Request screen with serviceType (e.g. mechanic) |
| **Steps** | 1. Navigate to Request (from Home rider card or Map "Request service").<br>2. Confirm service type shown.<br>3. Tap "Create request" (or equivalent). |
| **Expected result** | Loader/disabled button during request; POST /requests succeeds; request ID shown; status section appears with current request. |
| **Edge cases** | • No location → fallback origin used (e.g. default coords).<br>• API error → error message/toast; button re-enabled. |

---

### TC-REQ-002: View and update request status

| Field | Content |
|-------|--------|
| **Test case name** | User can see request status and tap status buttons |
| **Preconditions** | Request created; Request screen showing request |
| **Steps** | 1. After create, confirm request ID and status visible.<br>2. Tap "Accepted" (or "On the way", "Completed", "Cancel"). |
| **Expected result** | PATCH /requests/:id/status called; button disabled during request; UI updates to new status (or error toast). |
| **Edge cases** | • Invalid transition → server may return 400/422.<br>• Request not found / no permission → 403/404. |

---

### TC-REQ-003: Request screen – no request yet

| Field | Content |
|-------|--------|
| **Test case name** | Request screen shows empty state when no active request |
| **Preconditions** | Customer; no request created this session (or cleared) |
| **Steps** | 1. Navigate to Request with serviceType.<br>2. Do not create request. |
| **Expected result** | Message like "No active request. Create one to get help."; Create request button available. |
| **Edge cases** | • After creating then refreshing/navigating away and back → depends on requestId state. |

---

### TC-REQ-004: Request from Map with service type

| Field | Content |
|-------|--------|
| **Test case name** | Request screen receives correct serviceType from Map |
| **Preconditions** | Map with provider(s); Customer logged in |
| **Steps** | 1. Open Map; select a Mechanic provider; tap "Request service" in sheet.<br>2. Confirm Request screen shows mechanic (or equivalent).<br>3. Repeat for Tow and Rental providers. |
| **Expected result** | Request screen opens with serviceType matching selected provider role (mechanic, tow, rental). |
| **Edge cases** | • Provider role not mapped → default or wrong type; verify providerRoleToServiceType. |

---

## 8. Cross-Cutting / Edge Cases

### TC-EDGE-001: 401 redirect to Login

| Field | Content |
|-------|--------|
| **Test case name** | On 401 (after refresh failure), user is redirected to Login |
| **Preconditions** | User logged in; access token expired; refresh fails or invalid |
| **Steps** | 1. Trigger an API call that returns 401 (e.g. wait for expiry and trigger request).<br>2. Or mock 401 for any protected request. |
| **Expected result** | Session cleared; user redirected to Login screen; no infinite loop. |
| **Edge cases** | • 401 before navigation ready → redirect may not occur immediately (document 401-before-nav-ready issue). |

---

### TC-EDGE-002: Network error handling

| Field | Content |
|-------|--------|
| **Test case name** | Network errors show user-facing message |
| **Preconditions** | App running; backend unreachable or network off |
| **Steps** | 1. Disable network (or stop backend).<br>2. Perform login or any API action. |
| **Expected result** | Error toast or message (e.g. "Network error"); no crash; loader dismissed. |
| **Edge cases** | • Timeout → timeout message if implemented. |

---

### TC-EDGE-003: Location permission denied

| Field | Content |
|-------|--------|
| **Test case name** | Map and Request handle denied location gracefully |
| **Preconditions** | Location permission denied or blocked |
| **Steps** | 1. Deny location when prompted (or set device to deny).<br>2. Open Map and Request screen. |
| **Expected result** | Map may show default region; Request may use fallback origin; error state or message shown; no crash. |
| **Edge cases** | • Permission granted later → retry or refresh updates location. |

---

## Summary Matrix

| Area | Test cases | Priority |
|------|------------|----------|
| Authentication | TC-AUTH-001 to TC-AUTH-006 | P0 |
| Map loading | TC-MAP-001 to TC-MAP-003 | P0 |
| Provider selection | TC-PROV-001 to TC-PROV-004 | P0 |
| Navigation | TC-NAV-001 to TC-NAV-004 | P1 |
| Admin panel | TC-ADMIN-001 to TC-ADMIN-005 | P1 |
| Profile editing | TC-PROFILE-001 to TC-PROFILE-004 | P1 |
| Service requests | TC-REQ-001 to TC-REQ-004 | P0 |
| Edge cases | TC-EDGE-001 to TC-EDGE-003 | P1 |

Use these IDs in test automation (e.g. Cypress/Jest) and in bug reports for traceability.
