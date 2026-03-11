# Manual Testing Plan – Roadly

**Document:** Complete manual testing plan  
**Version:** 1.0  
**Application:** Roadly (React Native + Expo, Web)  
**Roles:** User (Customer), Mechanic, Tow, Rental, Admin  

Each scenario includes: **ID**, **Scenario name**, **Preconditions**, **Steps**, **Expected result**, **Priority**.

---

## 1. Authentication Tests

| ID | Scenario name | Preconditions | Steps | Expected result | Priority |
|----|----------------|---------------|-------|-----------------|----------|
| **AUTH-01** | Successful login with valid credentials | App on Launch or Welcome; backend up; user exists | 1. Go to Login.<br>2. Enter valid email and password.<br>3. Tap Continue. | Loader appears; success toast; redirect to role-based dashboard (Customer Home). | P0 |
| **AUTH-02** | Login with empty email | On Login screen | 1. Leave email empty; enter password.<br>2. Tap Continue. | Validation message or toast; no API call; stay on Login. | P0 |
| **AUTH-03** | Login with empty password | On Login screen | 1. Enter email; leave password empty.<br>2. Tap Continue. | Validation message or toast; no API call; stay on Login. | P0 |
| **AUTH-04** | Login with invalid credentials | On Login screen | 1. Enter wrong email or password.<br>2. Tap Continue. | Error message/toast (e.g. invalid credentials); stay on Login. | P0 |
| **AUTH-05** | Login when backend is down | Backend stopped; on Login screen | 1. Enter any credentials.<br>2. Tap Continue. | Error toast (e.g. network/server); stay on Login; loader dismissed. | P1 |
| **AUTH-06** | Navigate from Login to Register | On Login screen | 1. Tap Register link. | Navigate to Register screen. | P0 |
| **AUTH-07** | Back from Login to Welcome/Launch | On Login screen (reached from Welcome or Launch) | 1. Tap back (chevron). | Return to Welcome or Launch. | P1 |
| **AUTH-08** | Mock login as User (role chip) | On Login screen | 1. Tap User role chip. | Redirect to Customer Home; mock session set. | P1 |
| **AUTH-09** | Mock login as Mechanic | On Login screen | 1. Tap Mechanic role chip. | Redirect to Mechanic dashboard. | P1 |
| **AUTH-10** | Mock login as Admin | On Login screen | 1. Tap Admin role chip. | Redirect to Admin dashboard. | P1 |
| **AUTH-11** | Register with valid data | On Register screen; backend up | 1. Enter name, valid email, password.<br>2. Tap Register. | Loader; success; redirect to App; session set. | P0 |
| **AUTH-12** | Register with duplicate email | On Register; email already exists | 1. Enter existing email + name + password.<br>2. Tap Register. | Error message; stay on Register. | P0 |
| **AUTH-13** | Back from Register to Login | On Register screen | 1. Tap back. | Return to Login. | P1 |
| **AUTH-14** | Logout from Profile | Logged in (any role) | 1. Go to Profile.<br>2. Tap Logout. | Session cleared; redirect to Login. | P0 |
| **AUTH-15** | Session persists after app restart | User logged in (real or mock) | 1. Close app (or refresh web).<br>2. Reopen app. | User sees dashboard without Login (or Login if refresh failed). | P0 |
| **AUTH-16** | Toggle password visibility on Login | On Login screen | 1. Enter password.<br>2. Tap password visibility icon. | Password toggles between masked and visible. | P2 |

---

## 2. Map Functionality Tests

| ID | Scenario name | Preconditions | Steps | Expected result | Priority |
|----|----------------|---------------|-------|-----------------|----------|
| **MAP-01** | Map screen opens from Home | Customer logged in | 1. On Home, tap Nearest Locations card. | Map screen opens; map visible. | P0 |
| **MAP-02** | Map shows user location when permitted | Customer; location permission granted | 1. Open Map.<br>2. Wait for load. | User location marker visible; map centered (or default region). | P0 |
| **MAP-03** | Map shows default region when location denied | Location permission denied | 1. Open Map. | Map loads with default region; no crash. | P1 |
| **MAP-04** | Map loads provider markers (API) | Backend returns providers for nearby | 1. Open Map with location available. | Provider markers appear on map. | P0 |
| **MAP-05** | Map shows loading state before location | Customer; fresh open | 1. Open Map immediately. | Loading indicator until location/ready; then map. | P1 |
| **MAP-06** | Back from Map to Home | On Map screen | 1. Tap header back. | Return to previous screen (e.g. Home). | P0 |
| **MAP-07** | My Location FAB recenters map | On Map with user location | 1. Pan map away.<br>2. Tap My Location (FAB). | Map recenters on user location. | P0 |
| **MAP-08** | Map search input visible and editable | On Map screen | 1. Locate search bar at top.<br>2. Type text. | Search bar accepts input (search may not move map if Places not implemented). | P1 |
| **MAP-09** | Map on Web with Google Maps key | Web build; EXPO_PUBLIC_GOOGLE_MAPS_KEY set | 1. Open Map on web. | Google Map loads; markers visible (or mock fallback). | P0 |
| **MAP-10** | Map on Web without key | Web build; no Maps key | 1. Open Map on web. | Placeholder or error message; no crash. | P1 |

---

## 3. Provider Filtering Tests

| ID | Scenario name | Preconditions | Steps | Expected result | Priority |
|----|----------------|---------------|-------|-----------------|----------|
| **FLT-01** | Filter All shows all providers | Map open with providers | 1. Tap filter "All". | All provider types shown (mechanic, tow, rental). | P0 |
| **FLT-02** | Filter Mechanic shows only mechanics | Map open with providers | 1. Tap filter "Mechanic". | Only mechanic markers/list; filter chip highlighted. | P0 |
| **FLT-03** | Filter Tow shows only tow | Map open with providers | 1. Tap filter "Tow". | Only tow providers; filter chip highlighted. | P0 |
| **FLT-04** | Filter Rental shows only rental | Map open with providers | 1. Tap filter "Rental". | Only car rental providers; filter chip highlighted. | P0 |
| **FLT-05** | Switching filters updates list/markers | Map with multiple provider types | 1. Select Mechanic.<br>2. Select Tow.<br>3. Select All. | Display updates each time; no crash. | P0 |
| **FLT-06** | Filter with no matching providers | Map; filter to role with no data | 1. Select a role that has no providers. | Empty list/markers; no crash. | P1 |

---

## 4. Provider Bottom Sheet Tests

| ID | Scenario name | Preconditions | Steps | Expected result | Priority |
|----|----------------|---------------|-------|-----------------|----------|
| **SHT-01** | Tapping marker opens bottom sheet | Map with provider markers | 1. Tap a provider marker. | Bottom sheet opens with provider name, role, status, contact, rating. | P0 |
| **SHT-02** | Sheet shows Open Map and Request service buttons | Provider sheet open | 1. Open sheet by tapping a marker. | Both buttons visible and tappable. | P0 |
| **SHT-03** | Open Map from sheet recenters map | Provider sheet open | 1. Tap Open Map in sheet. | Map centers on selected provider; sheet may stay or close. | P0 |
| **SHT-04** | Request service from sheet navigates to Request | Provider sheet open (e.g. Mechanic) | 1. Tap Request service. | Sheet closes; navigate to Request screen with correct serviceType. | P0 |
| **SHT-05** | Tapping different marker updates sheet | Map with multiple markers | 1. Tap marker A → sheet opens.<br>2. Tap marker B. | Sheet content updates to provider B. | P0 |
| **SHT-06** | Bottom card “Request Service” opens sheet | Map with at least one provider | 1. Tap bottom card (nearest provider). | Same sheet opens as if that provider’s marker was tapped. | P1 |
| **SHT-07** | Sheet displays provider avatar/placeholder | Provider sheet open | 1. Open sheet. | Avatar or placeholder and role-themed styling visible. | P2 |

---

## 5. Dashboard Functionality Tests

| ID | Scenario name | Preconditions | Steps | Expected result | Priority |
|----|----------------|---------------|-------|-----------------|----------|
| **DSH-01** | Customer Home displays action cards | Customer logged in | 1. Land on Home after login. | Nearest Locations, Saved Places, Nearby Riders visible. | P0 |
| **DSH-02** | Customer bottom nav: Profile | On Customer Home | 1. Tap Profile in bottom nav. | Profile screen opens. | P0 |
| **DSH-03** | Customer bottom nav: Chat | On Customer Home | 1. Tap Chat. | Chat screen opens. | P0 |
| **DSH-04** | Customer bottom nav: Notifications | On Customer Home | 1. Tap Notifications. | Notifications screen opens. | P0 |
| **DSH-05** | Customer bottom nav: Settings | On Customer Home | 1. Tap Settings. | Settings screen opens. | P0 |
| **DSH-06** | Home header opens Settings | On Customer Home | 1. Tap header right (settings icon). | Navigate to Settings. | P1 |
| **DSH-07** | Mechanic dashboard: Open Map (card) | Mechanic logged in | 1. Tap Open Map in GlassCard. | Map screen opens. | P0 |
| **DSH-08** | Mechanic dashboard: My Services card | Mechanic logged in | 1. Tap My Services card. | MechanicServices screen opens. | P0 |
| **DSH-09** | Mechanic dashboard: My Skills card | Mechanic logged in | 1. Tap My Skills card. | MechanicSkills screen opens. | P0 |
| **DSH-10** | Mechanic dashboard: FAB Open Map | Mechanic logged in | 1. Tap FAB (map icon). | Map screen opens. | P0 |
| **DSH-11** | Mechanic dashboard: filter chips | Mechanic logged in | 1. Tap filter All, New, On the way, In garage. | Job list filters; active chip highlighted. | P1 |
| **DSH-12** | Mechanic job card opens bottom sheet | Mechanic logged in; jobs in list | 1. Tap a job card. | Bottom sheet opens with job details; Accept/Decline visible. | P0 |
| **DSH-13** | Tow dashboard: Open Map, Services, Skills | Tow logged in | 1. Tap Open Map, My Services, My Skills. | Correct screens open. | P0 |
| **DSH-14** | Rental dashboard: vehicle cards and Open Map | Rental logged in | 1. Tap vehicle card; tap Open Map. | Vehicle sheet opens; Map opens from card/FAB. | P0 |
| **DSH-15** | Back from MechanicServices to dashboard | On MechanicServices | 1. Tap back. | Return to Mechanic dashboard. | P0 |
| **DSH-16** | Saved Places card does nothing | Customer on Home | 1. Tap Saved Places card. | No navigation or action (known; document). | P2 |

---

## 6. Admin Management Tests

| ID | Scenario name | Preconditions | Steps | Expected result | Priority |
|----|----------------|---------------|-------|-----------------|----------|
| **ADM-01** | Admin dashboard shows stats and tabs | Admin logged in | 1. Land on Admin dashboard. | Stats (users, providers, requests, revenue); tabs Mechanic, Tow, Rental. | P0 |
| **ADM-02** | Manage users card opens Admin Users | Admin on dashboard | 1. Tap Manage users card. | AdminUsers screen with user list. | P0 |
| **ADM-03** | Admin Users: back to dashboard | On Admin Users | 1. Tap back. | Return to Admin dashboard. | P0 |
| **ADM-04** | Admin Users: tap user opens edit sheet | On Admin Users | 1. Tap a user card. | Bottom sheet opens with user name, role, status, services. | P0 |
| **ADM-05** | Edit sheet: change role and Save | Edit sheet open | 1. Select different role chip.<br>2. Tap Save. | Sheet closes; list reflects new role (mock or API). | P0 |
| **ADM-06** | Edit sheet: Cancel closes without saving | Edit sheet open | 1. Change role or services.<br>2. Tap Cancel. | Sheet closes; no change to user. | P0 |
| **ADM-07** | Edit sheet: toggle services | Edit sheet open | 1. Toggle one or more services on/off.<br>2. Tap Save. | Selections saved; sheet closes. | P1 |
| **ADM-08** | Admin tabs: Mechanic, Tow, Rental | Admin dashboard | 1. Tap Mechanic tab.<br>2. Tap Tow.<br>3. Tap Rental. | Panel content switches; lists/requests/vehicles shown. | P0 |
| **ADM-09** | Admin panel filter chips | Admin on a tab (e.g. Mechanic) | 1. Tap filter chips. | List filters by status; no crash. | P1 |
| **ADM-10** | Admin Open Map from dashboard/FAB | Admin dashboard | 1. Tap Open Map in card or FAB. | Map screen opens. | P0 |
| **ADM-11** | Admin sheet Edit button closes sheet only | Admin; request/vehicle sheet open | 1. Tap Edit in sheet. | Sheet closes; no edit screen (known TODO). | P2 |
| **ADM-12** | Add vehicle button (Rental tab) does nothing | Admin; Rental tab | 1. Tap Add vehicle. | No action (known; document). | P2 |

---

## 7. Profile Editing Tests

| ID | Scenario name | Preconditions | Steps | Expected result | Priority |
|----|----------------|---------------|-------|-----------------|----------|
| **PRF-01** | Customer profile shows name and Logout | Customer logged in | 1. Go to Profile. | User info visible; Logout button present. | P0 |
| **PRF-02** | Provider profile shows services section | Mechanic/Tow/Rental logged in | 1. Go to Profile. | My Services section with list; Add service button. | P0 |
| **PRF-03** | Add service opens sheet | Provider on Profile | 1. Tap Add service. | Bottom sheet with available services (toggles). | P0 |
| **PRF-04** | Add service sheet: toggle and Save | Add service sheet open | 1. Toggle one or more services.<br>2. Tap Save. | Sheet closes; selected services appear in profile list. | P0 |
| **PRF-05** | Add service sheet: Cancel | Add service sheet open | 1. Toggle services.<br>2. Tap Cancel. | Sheet closes; no change to list. | P0 |
| **PRF-06** | Remove service (icon on card) | Provider Profile with services | 1. Tap remove (e.g. minus icon) on a service. | Service removed from list (mock state). | P0 |
| **PRF-07** | Profile back button | On Profile | 1. Tap back. | Return to previous screen. | P0 |
| **PRF-08** | Customer Profile bottom nav | Customer on Profile | 1. Tap Home, Chat, Notifications, Settings. | Correct screens open. | P1 |

---

## 8. Service Request Creation Tests

| ID | Scenario name | Preconditions | Steps | Expected result | Priority |
|----|----------------|---------------|-------|-----------------|----------|
| **REQ-01** | Navigate to Request from Home rider card | Customer on Home | 1. Tap a rider card (or arrow). | Request screen opens with serviceType (e.g. mechanic). | P0 |
| **REQ-02** | Request screen shows Create request button | Customer on Request | 1. Open Request (e.g. from Home). | Service type and Create request button visible. | P0 |
| **REQ-03** | Create request success | Customer on Request; backend up | 1. Tap Create request. | Loader/disabled button; request created; request ID and status section appear. | P0 |
| **REQ-04** | Create request shows error on API failure | Backend returns error or down | 1. Tap Create request. | Error message/toast; button re-enabled. | P0 |
| **REQ-05** | Update status: Accepted | Request created and visible | 1. Tap Accepted. | PATCH sent; button disabled during request; status updates or error shown. | P0 |
| **REQ-06** | Update status: On the way, Completed, Cancelled | Request visible | 1. Tap each status button. | Each triggers update; UI/API behavior correct. | P0 |
| **REQ-07** | Request from Map with Mechanic provider | Map; Mechanic selected | 1. Open provider sheet; tap Request service. | Request screen opens with mechanic serviceType. | P0 |
| **REQ-08** | Request from Map with Tow provider | Map; Tow selected | 1. Open sheet; tap Request service. | Request screen with tow serviceType. | P0 |
| **REQ-09** | Request from Map with Rental provider | Map; Rental selected | 1. Open sheet; tap Request service. | Request screen with rental serviceType. | P0 |
| **REQ-10** | Request screen: Back to previous screen | On Request screen | 1. Tap header back. | Return to Map or Home. | P0 |
| **REQ-11** | Request screen: Profile in header | On Request screen | 1. Tap Profile in header. | Navigate to Profile. | P1 |
| **REQ-12** | Request screen has no bottom nav | On Request screen | 1. Look for bottom nav. | BottomNavBar not rendered. | P2 |

---

## 9. Additional / Regression Scenarios

| ID | Scenario name | Preconditions | Steps | Expected result | Priority |
|----|----------------|---------------|-------|-----------------|----------|
| **REG-01** | Settings Profile row navigates to Profile | On Settings | 1. Tap Profile row (account data). | Profile screen opens. | P1 |
| **REG-02** | Settings back goes to Home | On Settings | 1. Tap back. | Home screen. | P1 |
| **REG-03** | Notifications toggle read state | On Notifications | 1. Tap a notification card. | Card toggles read state (visual change). | P1 |
| **REG-04** | Chat row shows toast (mock) | On Chat | 1. Tap a chat row. | Toast about opening chat (mock). | P2 |
| **REG-05** | ErrorBoundary Retry | Trigger error boundary (e.g. crash) | 1. Tap Retry. | Error cleared; app recovers or reloads. | P1 |
| **REG-06** | 401 redirects to Login | Session expired; trigger API call | 1. Perform action that calls API. | Session cleared; redirect to Login. | P0 |

---

## Test Summary

| Area | Count | Priority focus |
|------|-------|----------------|
| Authentication | 16 | P0: login, register, logout, validation |
| Map functionality | 10 | P0: load, location, markers, back, FAB |
| Provider filtering | 6 | P0: All, Mechanic, Tow, Rental |
| Provider bottom sheet | 7 | P0: open, Open Map, Request service |
| Dashboard functionality | 16 | P0: nav, Mechanic/Tow/Rental flows |
| Admin management | 12 | P0: dashboard, users, edit sheet, tabs |
| Profile editing | 8 | P0: view, Add service, Save/Cancel, remove |
| Service request creation | 12 | P0: create, status updates, from Map |
| Additional / Regression | 6 | P0: 401; P1: Settings, Notifications |
| **Total** | **93** | — |

---

## Execution Notes

1. **Environment:** Run against dev backend (or mock); set `EXPO_PUBLIC_API_URL` and optional Maps/Places keys for web.
2. **Roles:** Use real login for API flows; use mock login (chips) for quick role switching.
3. **Platforms:** Execute on iOS, Android, and Web where applicable; note Web-specific (e.g. Maps key, mock fallback).
4. **Pass criteria:** Steps complete without crash; expected result matches; no blocking UX issues.
5. **Defects:** Log with Test ID (e.g. AUTH-01), steps, actual vs expected, and build/environment.
