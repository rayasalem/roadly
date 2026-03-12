# Role Separation & Pages

This document describes how each role is fully separated in terms of navigation, pages, and features.

## 1. User (Customer)

**Stack:** `CustomerStack`

**Pages:**
| Screen | Description |
|--------|-------------|
| Map | Full-screen map, draggable provider Bottom Sheet (25/50/90%), markers, filters |
| Home | Service tiles (Mechanic, Tow, Rental), quick actions |
| Request | Create service request (mechanic/tow/rental) |
| RequestHistory | Past requests and status |
| LiveTracking | Active request ETA, open map |
| Profile | Account info, logout |
| Chat | Conversation list |
| ChatDetail | Single conversation |
| Notifications | Notification list |
| Settings | Theme, notifications, **Logout** |
| Ratings | Rate completed services (empty state) |
| Payment | Payment methods (add card) |
| Favorites | Saved providers (empty state) |
| HelpSupport | FAQ, contact us |

**Features:** Filter by service type, available providers only, tap marker → Bottom Sheet, request service, live ETA (via LiveTracking + Map).

**Flow:** Launch → Onboarding (3 slides) → Welcome → Login/Register → App (Map as home).

---

## 2. Mechanic

**Stack:** `MechanicStack`

**Pages:**
| Screen | Description |
|--------|-------------|
| MechanicDashboard | Stats, availability toggle, incoming requests, accept/decline, Job History link |
| MechanicServices | Services offered |
| MechanicSkills | Skills |
| MechanicJobHistory | Completed jobs |
| Map | Users requesting service, navigate to user |
| Profile | Provider profile, logout |
| Settings | Theme, **Logout** |
| Notifications | Notifications |

**Features:** Accept/Reject requests, availability (Available/Busy/Offline), navigate to user, job history.

---

## 3. Tow Truck (Winch)

**Stack:** `TowStack`

**Pages:**
| Screen | Description |
|--------|-------------|
| TowDashboard | Stats, job list, filters, map FAB |
| TowServices | Services |
| TowSkills | Skills |
| TowJobHistory | Completed tow jobs |
| Map | Map view |
| Profile | Profile |
| Settings | **Logout** |
| Notifications | Notifications |

**Features:** Requests (on dashboard), request details & navigation, availability, completed jobs.

---

## 4. Car Rental Provider

**Stack:** `RentalStack`

**Pages:**
| Screen | Description |
|--------|-------------|
| RentalDashboard | Stats, quick actions |
| RentalServices | Services |
| RentalSkills | Skills |
| RentalCarList | Add/edit cars |
| RentalBookings | Booking requests (accept/reject) |
| RentalHistory | Rental history |
| Map | Map |
| Profile | Profile |
| Settings | **Logout** |
| Notifications | Notifications |

**Features:** Car list, booking requests, rental history, availability.

---

## 5. Admin

**Stack:** `AdminStack`

**Pages:**
| Screen | Description |
|--------|-------------|
| AdminDashboard | Analytics, manage users/providers, map |
| AdminProviderList | Providers by role (mechanic/tow/rental) |
| AdminUsers | All users |
| AdminReports | Reports & export |
| AdminSystemSettings | System-wide settings |
| Map | All providers map |
| Profile | Profile |
| Settings | **Logout** |
| Notifications | Notifications |

**Features:** Manage users & providers, suspend/status, usage stats, reports, system settings.

---

## Shared Behavior

- **Logout:** Available in **Profile** (all roles) and **Settings** (all roles). `authStore.logout()` clears session and redirects to Launch.
- **Role resolution:** `RoleNavigator` switches stack by `user?.role` (user → CustomerStack, mechanic → MechanicStack, mechanic_tow → TowStack, car_rental → RentalStack, admin → AdminStack).
- **Map:** Each role sees role-relevant data (customer: providers; mechanic/tow: requests; admin: all providers). Bottom Sheet / provider cards and markers are role-aware.
- **Onboarding:** 3 slides (mechanic, tow, rental) after Launch for new users; then Welcome → Login/Register.
- **i18n:** All new screens use `t('...')` with keys under `customer.*`, `tow.*`, `rental.*`, `admin.*`, and existing `mechanic.*`, `nav.*`, `auth.*`.

---

## Adding New Role-Specific Screens

1. Create the screen under `src/features/<role>/presentation/screens/` or a shared feature.
2. Add the route to the role’s stack in `src/navigation/<Role>Stack.tsx`.
3. Add i18n keys in `src/shared/i18n/strings.ts` (StringKey type + en + ar).
4. Navigate from dashboard or profile using `navigation.navigate('ScreenName')`.
