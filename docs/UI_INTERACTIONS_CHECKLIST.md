# UI Interactions Functional Checklist

Every button, pressable, and navigation action across the app. Status: Works ✅ | Possible issue ⚠️ | Broken / Does nothing ❌

---

## Table

| Screen | Button / Control | Action | Function called | Works / Issue | Notes |
|--------|------------------|--------|------------------|---------------|-------|
| **LaunchScreen** | Sign in | Go to login | `navigation.replace('Login')` | ✅ | |
| **LaunchScreen** | Create account | Go to register | `navigation.navigate('Register')` | ✅ | |
| **WelcomeScreen** | Sign in (Button) | Go to login | `navigation.navigate('Login')` | ✅ | |
| **WelcomeScreen** | Create account (Button) | Go to register | `navigation.navigate('Register')` | ✅ | |
| **LoginScreen** | Back (header) | Go back | `navigation.goBack()` | ✅ | From Welcome only |
| **LoginScreen** | Continue (submit) | Login API → setSession → replace App | `onSubmit` → `login()` → `setSession` → `navigation.replace('App')` | ✅ | Shows loader; error toast on fail |
| **LoginScreen** | Register link | Navigate to Register | `navigation.navigate('Register')` | ✅ | |
| **LoginScreen** | Mock role chips (User, Mechanic, …) | Set session (mock) → replace App | `handleMockLogin(role)` → `setSession` → `navigation.replace('App')` | ✅ | No API |
| **RegisterScreen** | Back (header) | Go back | `navigation.goBack()` | ✅ | |
| **RegisterScreen** | Register (submit) | Register API → setSession → replace App | `register()` → `setSession` → `navigation.replace('App')` | ✅ | Loader + error handling |
| **RegisterScreen** | Login link | Navigate to Login | `navigation.navigate('Login')` | ✅ | |
| **HomeScreen** | Header right (settings icon) | Navigate to Settings | `navigation.navigate('Settings')` | ✅ | |
| **HomeScreen** | Nearest Locations (dark card) | Navigate to Map | `navigation.navigate('Map')` | ✅ | |
| **HomeScreen** | Saved Places (dark card) | — | (no onPress) | ❌ | **Does nothing** |
| **HomeScreen** | Rider card / arrow | Navigate to Request (mechanic) | `navigation.navigate('Request', { serviceType: 'mechanic' })` | ✅ | All 3 riders same action |
| **HomeScreen** | BottomNav: Home | — | `handleTab('Home')` has no case for Home | ❌ | **Tab does nothing** (user already on Home when visible) |
| **HomeScreen** | BottomNav: Profile, Chat, Notifications, Settings | Navigate to respective screen | `navigation.navigate(tab)` | ✅ | |
| **MapScreen** (native) | Header back | Go back | `navigation.goBack()` | ✅ | |
| **MapScreen** (native) | Header calendar icon | — | AppHeader calendar: no onPress | ❌ | **Does nothing** |
| **MapScreen** (native) | Marker tap | Select provider, animate camera, open bottom sheet | `handleSelectProvider(provider)` | ✅ | |
| **MapScreen** (native) | Filter chips (All, Mechanic, Tow, Rental) | Set filter | `setFilter(role)` | ✅ | Refetches providers (if API supports role) |
| **MapScreen** (native) | My location (FAB) | Center map on user / fetch location | `handleMyLocation` | ✅ | |
| **MapScreen** (native) | Bottom card "Request Service" | Open sheet for nearest (not direct request) | `handleSelectProvider(nearest)` | ⚠️ | Opens sheet; user must press Request again in sheet |
| **MapScreen** (native) | BottomNav tabs | Home goBack; others navigate | `handleTab` | ✅ | |
| **MapScreen** (native) | ProviderBottomSheet: Open Map | Re-center map on provider | `handleOpenMapFromSheet` | ✅ | |
| **MapScreen** (native) | ProviderBottomSheet: Request service | Navigate to Request with serviceType | `handleRequestService` → `navigation.navigate('Request', { serviceType })` | ✅ | |
| **MapScreen.web** | Same as MapScreen | Same handlers | Same | ✅ | Plus fallback mock providers when API empty/fails |
| **RequestScreen** | Header back | Go back | `navigation.goBack()` | ✅ | |
| **RequestScreen** | Header profile | Navigate to Profile | `navigation.navigate('Profile')` | ✅ | |
| **RequestScreen** | Create request (Button) | createMutation.mutate → setRequestId on success | `handleCreate` → `createMutation.mutate` | ✅ | Loading: disabled + text; error shown |
| **RequestScreen** | Status buttons (Accepted, On the way, …) | updateStatus(status) | `updateStatus` → API PATCH | ✅ | Disabled when isUpdating |
| **RequestScreen** | BottomNavBar | — | Not rendered | ⚠️ | **handleTab defined but no BottomNavBar** — user cannot switch tabs from Request |
| **ProfileScreen** (user) | Header back | Go back | `navigation.goBack()` | ✅ | |
| **ProfileScreen** (user) | Header profile icon | — | `onProfile={() => {}}` | ❌ | **Does nothing** |
| **ProfileScreen** (user) | Logout | Clear session, redirect to Login | `logout()` | ✅ | |
| **ProfileScreen** (user) | BottomNavBar | Home, Chat, Notifications, Settings | `handleTab` | ✅ | Only when role === USER |
| **ProfileScreen** (provider) | Add service (Button) | Open EditServicesSheet | `openEditServices` | ✅ | |
| **ProfileScreen** (provider) | Remove service (icon on card) | removeService(name) | `removeService` | ✅ | Mock state |
| **ProfileScreen** (provider) | EditServicesSheet: toggles | Toggle service in set | `toggle(name)` | ✅ | |
| **ProfileScreen** (provider) | EditServicesSheet: Save | setServicesList(selected), close | `handleSaveServices` | ✅ | |
| **ProfileScreen** (provider) | EditServicesSheet: Cancel | closeSheet | `closeSheet` | ✅ | |
| **ChatScreen** | Header profile | Navigate to Profile | `navigation.navigate('Profile')` | ✅ | |
| **ChatScreen** | Chat row | Toast "Mock: opening chat with {name}" | `handleOpenChat(name)` | ⚠️ | Mock only; no real chat screen |
| **ChatScreen** | BottomNavBar | Home, Profile, Notifications, Settings | `handleTab` | ✅ | |
| **NotificationsScreen** | Header profile | Navigate to Profile | `navigation.navigate('Profile')` | ✅ | |
| **NotificationsScreen** | Notification card | Toggle read state | `handleToggleRead(n.id)` | ✅ | Local state only |
| **NotificationsScreen** | BottomNavBar | Home, Chat, Profile, Settings | `handleTab` | ✅ | |
| **SettingsScreen** | Header back | Navigate to Home | `navigation.navigate('Home')` | ✅ | |
| **SettingsScreen** | Profile row | Navigate to Profile | `handlePressItem` when item.id === 'profile' | ✅ | |
| **SettingsScreen** | Security / Language / Theme / Vehicle / Preferred service rows | — | `handlePressItem` does nothing for these ids | ❌ | **No navigation or action** |
| **SettingsScreen** | Notifications Switch | Toggle local state | `setNotificationsEnabled` | ✅ | Mock |
| **SettingsScreen** | BottomNavBar | Home, Chat, Notifications, Profile | `handleTab` | ✅ | |
| **MechanicDashboardScreen** | Header profile | Navigate to Profile | `openProfile` | ✅ | |
| **MechanicDashboardScreen** | Open Map (in GlassCard) | Navigate to Map | `openMap` | ✅ | |
| **MechanicDashboardScreen** | My Services card | Navigate to MechanicServices | `navigation.navigate('MechanicServices')` | ✅ | |
| **MechanicDashboardScreen** | My Skills card | Navigate to MechanicSkills | `navigation.navigate('MechanicSkills')` | ✅ | |
| **MechanicDashboardScreen** | Filter chips | setStatusFilter | `setStatusFilter` | ✅ | |
| **MechanicDashboardScreen** | Job card (row) | Open bottom sheet | `setSelectedJob` | ✅ | |
| **MechanicDashboardScreen** | Accept (card + sheet) | Dismiss sheet, clear selection (mock) | `handleAccept` | ⚠️ | No API; list unchanged |
| **MechanicDashboardScreen** | Decline (card + sheet) | Dismiss sheet, clear selection (mock) | `handleDecline` | ⚠️ | No API; list unchanged |
| **MechanicDashboardScreen** | FAB | Navigate to Map | `openMap` | ✅ | |
| **MechanicServicesScreen** | Header back | Go back | `navigation.goBack()` | ✅ | |
| **MechanicSkillsScreen** | Header back | Go back | `navigation.goBack()` | ✅ | |
| **TowDashboardScreen** | Same pattern as Mechanic | openMap, openProfile, Services, Skills, filters, Accept/Decline, FAB | Same | ✅ | Accept/Decline mock only |
| **TowServicesScreen** | Header back | Go back | `navigation.goBack()` | ✅ | |
| **TowSkillsScreen** | Header back | Go back | `navigation.goBack()` | ✅ | |
| **RentalDashboardScreen** | Header profile, Open Map, My Services, My Skills | navigate Profile, Map, RentalServices, RentalSkills | Same pattern | ✅ | |
| **RentalDashboardScreen** | Vehicle card | Open bottom sheet | `handleVehiclePress(v)` | ✅ | |
| **RentalDashboardScreen** | FAB | Navigate to Map | `openMap` | ✅ | |
| **AdminDashboardScreen** | Header profile | Navigate to Profile | `openProfile` | ✅ | |
| **AdminDashboardScreen** | Manage users card | Navigate to AdminUsers | `navigation.navigate('AdminUsers')` | ✅ | |
| **AdminDashboardScreen** | Tab chips (Mechanic, Tow, Rental) | setActiveTab | `setActiveTab(tab.id)` | ✅ | |
| **AdminDashboardScreen** | Filter chips (per panel) | mechanicPanel.setFilter etc. | `setFilter(f)` | ✅ | |
| **AdminDashboardScreen** | Request/vehicle card (press) | Open bottom sheet | `setSheetPayload({ type, item })` | ✅ | |
| **AdminDashboardScreen** | Open Map (card + sheet) | Navigate to Map | `openMap` | ✅ | |
| **AdminDashboardScreen** | Edit (card + sheet) | Open sheet (card) / handleEdit (sheet) | `setSheetPayload` / `handleEdit` → closeSheet only | ⚠️ | **handleEdit only closes sheet; TODO in code** |
| **AdminDashboardScreen** | Add vehicle (Rental tab) | — | `onPress={() => {}}` | ❌ | **Does nothing** |
| **AdminDashboardScreen** | Map button (below chart) | openMap | `openMap` | ✅ | |
| **AdminDashboardScreen** | FAB | openMap | `openMap` | ✅ | |
| **AdminUsersScreen** | Header back | Go back | `navigation.goBack()` | ✅ | |
| **AdminUsersScreen** | User card | Open edit sheet | `openEdit(user)` | ✅ | |
| **AdminUsersScreen** | Edit sheet: role/status chips, service toggles | Local draft state | `setDraftRole`, `setDraftStatus`, `toggleService` | ✅ | |
| **AdminUsersScreen** | Edit sheet: Save | updateUser, setUserAssignedServices, close | `handleSave` | ✅ | Mock state |
| **AdminUsersScreen** | Edit sheet: Cancel | closeSheet | `closeSheet` | ✅ | |
| **AdminProviderListScreen** | Header back | Go back | `navigation.goBack()` | ✅ | Requires route param `role` |
| **AdminProviderListScreen** | — | — | No navigation to this screen from app UI | ⚠️ | **Route exists; no button navigates to AdminProviderList** |
| **ProviderBottomSheet** (shared) | Open Map | onOpenMap() | Parent’s handleOpenMapFromSheet | ✅ | |
| **ProviderBottomSheet** (shared) | Request service | onRequestService(provider) | Parent’s handleRequestService | ✅ | |
| **ErrorBoundary** | Retry | onReset, clear error state | `reset()` + `onReset?.()` | ✅ | |
| **AppHeader** (shared) | Back | onBack() | Caller-provided | ✅ | |
| **AppHeader** (shared) | Profile icon | onProfile() | Caller-provided | ✅ | When rightIcon is profile/settings |
| **AppHeader** (shared) | Calendar icon | — | No onPress | ❌ | **Does nothing** (used on Map) |

---

## Navigation routes that may crash or are unreachable

| Route | Stack | Param | Status |
|-------|--------|--------|--------|
| `AdminProviderList` | AdminStack | `{ role: 'mechanic' \| 'tow' \| 'rental' }` | ⚠️ No screen in the app navigates to it; safe if called with correct params. |
| `Request` | CustomerStack | `{ serviceType }` | ✅ Used from Home, Map, ProviderBottomSheet. |
| All others | — | — | ✅ Defined and used. |

---

## Loading and error handling

| Screen / Flow | Loading | Error |
|---------------|--------|--------|
| Login | ✅ showLoader / hideLoader | ✅ setError + toast |
| Register | ✅ showLoader / hideLoader | ✅ setError + toast |
| RequestScreen create | ✅ disabled + "Creating request…" | ✅ createMutation.isError + message |
| RequestScreen get/update | ✅ "Loading request status…", disabled buttons | ⚠️ No explicit error UI for query/mutation failure (toast from global HTTP) |
| MapScreen (native) | ✅ LoadingSpinner when !coords | ⚠️ No error/retry UI when useNearbyProviders fails (empty markers) |
| MapScreen.web | ✅ isLoadingProviders for list | Same; fallback mock avoids empty list on web |
| useUserLocation | ✅ isLoading in state | ⚠️ error in state; not all consumers show it |
| ProfileScreen (provider) | — | — |
| AdminUsersScreen | — | — |
| Settings / Chat / Notifications | — | Mock only |

---

## Summary

- **Does nothing (fix or remove):** HomeScreen "Saved Places" card; HomeScreen Home tab (no-op when already on Home); MapScreen/AppHeader calendar icon; AdminDashboardScreen "Add vehicle" button; AdminDashboardScreen sheet "Edit" (only closes sheet); SettingsScreen Security / Language / Theme / Vehicle / Preferred service rows; ProfileScreen header profile icon (when shown).
- **Possible issues:** MapScreen bottom card "Request Service" opens sheet instead of going straight to request; RequestScreen has handleTab but no BottomNavBar; AdminProviderList has no entry point; Accept/Decline on Mechanic/Tow are mock-only; Chat opens mock toast only.
- **Loading/error:** Request create has loading and error; Map (native) has no error/retry when providers fail; RequestScreen query/mutation errors rely on global toast.
