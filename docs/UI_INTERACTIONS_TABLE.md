# UI Interactions – Full Scan

Complete table of all buttons, pressables, and clickable components.  
**Works** = implemented and functional. **Potential Issue** = works but has caveats. **Does nothing** = no handler or empty handler.

---

## Table

| Screen | Component | Action | Function Called | Works / Potential Issue | Notes |
|--------|-----------|--------|------------------|-------------------------|--------|
| **LaunchScreen** | TouchableOpacity | Sign in | `navigation.replace('Login')` | ✅ Works | |
| **LaunchScreen** | TouchableOpacity | Create account | `navigation.navigate('Register')` | ✅ Works | |
| **WelcomeScreen** | Button | Sign in | `navigation.navigate('Login')` | ✅ Works | |
| **WelcomeScreen** | Button | Create account | `navigation.navigate('Register')` | ✅ Works | |
| **LoginScreen** | TouchableOpacity (back) | Go back | `navigation.goBack()` | ✅ Works | |
| **LoginScreen** | TouchableOpacity | Toggle password visibility | `setShowPassword((p) => !p)` | ✅ Works | |
| **LoginScreen** | TouchableOpacity | Remember row | (no onPress) | ❌ Does nothing | accessibilityRole="checkbox" only |
| **LoginScreen** | TouchableOpacity | Forgot password link | (no onPress) | ❌ Does nothing | No handler |
| **LoginScreen** | Button | Continue (submit) | `onSubmit` → `login()` → `setSession` → `navigation.replace('App')` | ✅ Works | Loader + error toast |
| **LoginScreen** | TouchableOpacity | Register link | `navigation.navigate('Register')` | ✅ Works | |
| **LoginScreen** | TouchableOpacity (role chips) | Mock login | `handleMockLogin(role)` → `setSession` → `navigation.replace('App')` | ✅ Works | No API; mock tokens |
| **RegisterScreen** | TouchableOpacity | Back | `navigation.goBack()` | ✅ Works | |
| **RegisterScreen** | Button | Register (submit) | `onSubmit` → `register()` → `setSession` → `navigation.replace('App')` | ✅ Works | Loader + error handling |
| **RegisterScreen** | TouchableOpacity | Login link | `navigation.navigate('Login')` | ✅ Works | |
| **HomeScreen** | AppHeader (right icon) | Settings | `onProfile` → `navigation.navigate('Settings')` | ✅ Works | |
| **HomeScreen** | TouchableOpacity | Nearest Locations card | `navigation.navigate('Map')` | ✅ Works | |
| **HomeScreen** | TouchableOpacity | Saved Places card | (no onPress) | ❌ Does nothing | No handler |
| **HomeScreen** | RiderCard / TouchableOpacity | Rider row + arrow | `navigation.navigate('Request', { serviceType: 'mechanic' })` | ✅ Works | All 3 riders same |
| **HomeScreen** | BottomNavBar | Home tab | `handleTab('Home')` — no case for Home | ❌ Does nothing | User already on Home |
| **HomeScreen** | BottomNavBar | Profile, Chat, Notifications, Settings | `navigation.navigate(tab)` | ✅ Works | |
| **MapScreen** (native) | AppHeader | Back | `navigation.goBack()` | ✅ Works | |
| **MapScreen** (native) | AppHeader | Calendar icon | (no onPress) | ❌ Does nothing | AppHeader calendar has no onPress |
| **MapScreen** (native) | Marker | Select provider | `handleSelectProvider(provider)` | ✅ Works | Animates camera, opens sheet |
| **MapScreen** (native) | TouchableOpacity | Filter chips | `setFilter(role)` | ✅ Works | Refetches providers |
| **MapScreen** (native) | FAB | My location | `handleMyLocation` | ✅ Works | |
| **MapScreen** (native) | Bottom card / Button | Request Service | `handleSelectProvider(nearest)` | ⚠️ Potential Issue | Opens sheet; user must press Request in sheet |
| **MapScreen** (native) | BottomNavBar | Tabs | `handleTab` | ✅ Works | |
| **MapScreen** (native) | ProviderBottomSheet | Open Map | `onOpenMap` → `handleOpenMapFromSheet` | ✅ Works | |
| **MapScreen** (native) | ProviderBottomSheet | Request service | `onRequestService(provider)` → `handleRequestService` | ✅ Works | |
| **MapScreen.web** | (same as MapScreen) | (same) | (same handlers) | ✅ Works | Plus MOCK_PROVIDERS fallback |
| **RequestScreen** | AppHeader | Back | `navigation.goBack()` | ✅ Works | |
| **RequestScreen** | AppHeader | Profile | `navigation.navigate('Profile')` | ✅ Works | |
| **RequestScreen** | Button | Create request | `handleCreate` → `createMutation.mutate` | ✅ Works | |
| **RequestScreen** | Button | Accepted | `updateStatus('accepted')` | ✅ Works | |
| **RequestScreen** | Button | On the way | `updateStatus('on_the_way')` | ✅ Works | |
| **RequestScreen** | Button | Completed | `updateStatus('completed')` | ✅ Works | |
| **RequestScreen** | Button | Cancelled | `updateStatus('cancelled')` | ✅ Works | |
| **RequestScreen** | (no BottomNavBar) | — | `handleTab` defined but not rendered | ⚠️ Potential Issue | User cannot switch tabs from Request |
| **ProfileScreen** (user) | AppHeader | Back | `navigation.goBack()` | ✅ Works | |
| **ProfileScreen** (user) | AppHeader | Profile icon | `onProfile={() => {}}` | ❌ Does nothing | Empty callback |
| **ProfileScreen** (user) | Button | Logout | `logout()` | ✅ Works | |
| **ProfileScreen** (user) | BottomNavBar | Tabs | `handleTab` | ✅ Works | Only when role === USER |
| **ProfileScreen** (provider) | AppHeader | Back | `navigation.goBack()` | ✅ Works | |
| **ProfileScreen** (provider) | AppHeader | Profile icon | `onProfile={() => {}}` | ❌ Does nothing | Empty callback |
| **ProfileScreen** (provider) | PressableCard / TouchableOpacity | Remove service | `removeService(name)` | ✅ Works | Mock state |
| **ProfileScreen** (provider) | Button | Add service | `openEditServices` | ✅ Works | Opens EditServicesSheet |
| **ProfileScreen** (provider) | Button | Logout | `logout()` | ✅ Works | |
| **ProfileScreen** (provider) | TouchableOpacity (sheet) | Toggle service | `toggle(name)` | ✅ Works | |
| **ProfileScreen** (provider) | Button (sheet) | Cancel | `handleCancel` / closeSheet | ✅ Works | |
| **ProfileScreen** (provider) | Button (sheet) | Save | `handleSave` | ✅ Works | |
| **ChatScreen** | AppHeader | Profile | `navigation.navigate('Profile')` | ✅ Works | |
| **ChatScreen** | TouchableOpacity | Chat row | `handleOpenChat(name)` → toast only | ⚠️ Potential Issue | Mock; no real chat screen |
| **ChatScreen** | BottomNavBar | Tabs | `handleTab` | ✅ Works | |
| **NotificationsScreen** | AppHeader | Profile | `navigation.navigate('Profile')` | ✅ Works | |
| **NotificationsScreen** | TouchableOpacity | Notification card | `handleToggleRead(n.id)` | ✅ Works | Local state only |
| **NotificationsScreen** | BottomNavBar | Tabs | `handleTab` | ✅ Works | |
| **SettingsScreen** | AppHeader | Back | `navigation.navigate('Home')` | ✅ Works | |
| **SettingsScreen** | SettingsRow (TouchableOpacity) | Profile row | `handlePressItem` → `navigation.navigate('Profile')` | ✅ Works | |
| **SettingsScreen** | SettingsRow | Security row | `handlePressItem(item)` — no action for id !== 'profile' | ❌ Does nothing | |
| **SettingsScreen** | SettingsRow | Language row | same | ❌ Does nothing | |
| **SettingsScreen** | SettingsRow | Theme row | same | ❌ Does nothing | |
| **SettingsScreen** | Switch | Notifications | `setNotificationsEnabled` | ✅ Works | Mock |
| **SettingsScreen** | SettingsRow | Vehicle row | `handlePressItem` — no action | ❌ Does nothing | |
| **SettingsScreen** | SettingsRow | Preferred service row | same | ❌ Does nothing | |
| **SettingsScreen** | BottomNavBar | Tabs | `handleTab` | ✅ Works | |
| **MechanicDashboardScreen** | AppHeader | Profile | `openProfile` → `navigation.navigate('Profile')` | ✅ Works | |
| **MechanicDashboardScreen** | TouchableOpacity | Open Map (in GlassCard) | `openMap` | ✅ Works | |
| **MechanicDashboardScreen** | TouchableOpacity | My Services card | `navigation.navigate('MechanicServices')` | ✅ Works | |
| **MechanicDashboardScreen** | TouchableOpacity | My Skills card | `navigation.navigate('MechanicSkills')` | ✅ Works | |
| **MechanicDashboardScreen** | TouchableOpacity | Filter chips | `setStatusFilter(f)` | ✅ Works | |
| **MechanicDashboardScreen** | PressableCard | Job card | `handleJobPress(job)` → setSelectedJob, open sheet | ✅ Works | |
| **MechanicDashboardScreen** | Button (card) | Open Map | `openMap` | ✅ Works | |
| **MechanicDashboardScreen** | Button (card) | Accept | `handleAccept` | ⚠️ Potential Issue | Mock; only closes sheet, list unchanged |
| **MechanicDashboardScreen** | Button (card) | Decline | `handleDecline` | ⚠️ Potential Issue | Mock; only closes sheet |
| **MechanicDashboardScreen** | TouchableOpacity (sheet) | Open Map | `openMap` | ✅ Works | |
| **MechanicDashboardScreen** | Button (sheet) | Accept | `handleAccept` | ⚠️ Potential Issue | Same mock behavior |
| **MechanicDashboardScreen** | Button (sheet) | Decline | `handleDecline` | ⚠️ Potential Issue | Same mock behavior |
| **MechanicDashboardScreen** | FAB | Open Map | `openMap` | ✅ Works | |
| **MechanicServicesScreen** | AppHeader | Back | `navigation.goBack()` | ✅ Works | |
| **MechanicServicesScreen** | Button | Add service | `onPress={() => {}}` | ❌ Does nothing | Empty handler |
| **MechanicSkillsScreen** | AppHeader | Back | `navigation.goBack()` | ✅ Works | |
| **MechanicSkillsScreen** | Button | Add skill | `onPress={() => {}}` | ❌ Does nothing | Empty handler |
| **TowDashboardScreen** | AppHeader | Profile | `openProfile` | ✅ Works | |
| **TowDashboardScreen** | TouchableOpacity | Open Map | `openMap` | ✅ Works | |
| **TowDashboardScreen** | TouchableOpacity | My Services | `navigation.navigate('TowServices')` | ✅ Works | |
| **TowDashboardScreen** | TouchableOpacity | My Skills | `navigation.navigate('TowSkills')` | ✅ Works | |
| **TowDashboardScreen** | TouchableOpacity | Filter chips | `setStatusFilter(f)` | ✅ Works | |
| **TowDashboardScreen** | PressableCard | Job card | `handleJobPress(job)` | ✅ Works | |
| **TowDashboardScreen** | TouchableOpacity (card) | Open Map | `openMap` | ✅ Works | |
| **TowDashboardScreen** | FAB | Open Map | `openMap` | ✅ Works | |
| **TowDashboardScreen** | TouchableOpacity (sheet) | Open Map | `openMap` | ✅ Works | |
| **TowServicesScreen** | AppHeader | Back | `navigation.goBack()` | ✅ Works | |
| **TowServicesScreen** | Button | Add service | `onPress={() => {}}` | ❌ Does nothing | Empty handler |
| **TowSkillsScreen** | AppHeader | Back | `navigation.goBack()` | ✅ Works | |
| **TowSkillsScreen** | Button | Add skill | `onPress={() => {}}` | ❌ Does nothing | Empty handler |
| **RentalDashboardScreen** | AppHeader | Profile | `openProfile` | ✅ Works | |
| **RentalDashboardScreen** | TouchableOpacity | Open Map | `openMap` | ✅ Works | |
| **RentalDashboardScreen** | TouchableOpacity | My Services | `navigation.navigate('RentalServices')` | ✅ Works | |
| **RentalDashboardScreen** | TouchableOpacity | My Skills | `navigation.navigate('RentalSkills')` | ✅ Works | |
| **RentalDashboardScreen** | PressableCard | Vehicle card | `handleVehiclePress(v)` | ✅ Works | |
| **RentalDashboardScreen** | FAB | Open Map | `openMap` | ✅ Works | |
| **AdminDashboardScreen** | AppHeader | Profile | `openProfile` | ✅ Works | |
| **AdminDashboardScreen** | TouchableOpacity | Manage users card | `navigation.navigate('AdminUsers')` | ✅ Works | |
| **AdminDashboardScreen** | Pressable | Tab chips | `setActiveTab(tab.id)` | ✅ Works | |
| **AdminDashboardScreen** | TouchableOpacity | Filter chips (per panel) | `mechanicPanel.setFilter(f)` etc. | ✅ Works | |
| **AdminDashboardScreen** | PressableCard | Request/vehicle card | `setSheetPayload({ type, item })` | ✅ Works | |
| **AdminDashboardScreen** | Button (card) | Open Map | `openMap` | ✅ Works | |
| **AdminDashboardScreen** | Button (card) | Edit | `setSheetPayload` (opens sheet) | ✅ Works | |
| **AdminDashboardScreen** | TouchableOpacity | Add vehicle (Rental tab) | `onPress={() => {}}` | ❌ Does nothing | Empty handler |
| **AdminDashboardScreen** | TouchableOpacity | Map button (below chart) | `openMap` | ✅ Works | |
| **AdminDashboardScreen** | FAB | Open Map | `openMap` | ✅ Works | |
| **AdminDashboardScreen** | Button (sheet) | Open Map | `openMap` | ✅ Works | |
| **AdminDashboardScreen** | Button (sheet) | Edit / Update Status | `handleEdit` | ⚠️ Potential Issue | Only closes sheet; TODO in code |
| **AdminUsersScreen** | AppHeader | Back | `navigation.goBack()` | ✅ Works | |
| **AdminUsersScreen** | PressableCard / TouchableOpacity | User card | `openEdit(user)` | ✅ Works | |
| **AdminUsersScreen** | TouchableOpacity (sheet) | Role chip | `setDraftRole(r)` | ✅ Works | |
| **AdminUsersScreen** | TouchableOpacity (sheet) | Status chip | `setDraftStatus(s)` | ✅ Works | |
| **AdminUsersScreen** | TouchableOpacity (sheet) | Service toggle | `toggleService(s.id)` | ✅ Works | |
| **AdminUsersScreen** | Button (sheet) | Cancel | `closeSheet` | ✅ Works | |
| **AdminUsersScreen** | Button (sheet) | Save | `handleSave` | ✅ Works | Mock state |
| **AdminProviderListScreen** | AppHeader | Back | `navigation.goBack()` | ✅ Works | Requires param `role` |
| **AdminProviderListScreen** | — | — | No entry from app UI | ⚠️ Potential Issue | Route exists; no screen navigates here |
| **NearbyProvidersList** | PressableCard / onPress | Select provider | `onSelect(item)` | ✅ Works | Parent provides handler |
| **ProviderBottomSheet** (shared) | TouchableOpacity | Open Map | `onOpenMap()` | ✅ Works | Parent passes handler |
| **ProviderBottomSheet** (shared) | Button | Request service | `handleRequest` → `onRequestService(provider)` | ✅ Works | |
| **ProviderCard** (shared) | Card / Button | Request | `onRequest` | ✅ Works | When used with onRequest |
| **ErrorBoundary** | TouchableOpacity | Retry | `this.reset` + `onReset?.()` | ✅ Works | |
| **ErrorView** | TouchableOpacity | Retry | `onRetry` | ✅ Works | Caller-provided |
| **AppHeader** (shared) | TouchableOpacity | Back | `onBack()` | ✅ Works | When onBack provided |
| **AppHeader** (shared) | TouchableOpacity | Profile icon | `onProfile()` | ✅ Works | When rightIcon profile/settings |
| **AppHeader** (shared) | TouchableOpacity | Calendar icon | (no onPress) | ❌ Does nothing | rightIcon="calendar" on Map |

---

## Navigation That May Break

| Route | Stack | Params | Risk |
|-------|--------|--------|------|
| **AdminProviderList** | AdminStack | `{ role: 'mechanic' \| 'tow' \| 'rental' }` | No in-app navigation to this screen; safe if called with valid `role`. |
| **Request** | CustomerStack | `{ serviceType }` | Required. Used from Home, Map, ProviderBottomSheet with valid serviceType. |

---

## Buttons That Do Nothing (Summary)

| Screen | Component | Fix |
|--------|-----------|-----|
| LoginScreen | Remember row | Add onPress or remove if non-interactive |
| LoginScreen | Forgot password link | Add navigation or handler |
| HomeScreen | Saved Places card | Add onPress (e.g. navigate to saved places screen) or remove |
| HomeScreen | BottomNav Home tab | No-op when on Home; optional: do nothing or scroll to top |
| MapScreen | AppHeader calendar icon | Add onPress (e.g. open calendar/schedule) or use rightIcon="none" |
| ProfileScreen | AppHeader profile icon (user & provider) | Pass `onProfile` that navigates or remove |
| SettingsScreen | Security, Language, Theme, Vehicle, Preferred service rows | Implement handlers or navigate to placeholder screens |
| MechanicServicesScreen | Add service Button | Implement add service flow or remove |
| MechanicSkillsScreen | Add skill Button | Implement add skill flow or remove |
| TowServicesScreen | Add service Button | Same |
| TowSkillsScreen | Add skill Button | Same |
| RentalServicesScreen | Add service Button | Same |
| RentalSkillsScreen | Add skill Button | Same |
| AdminDashboardScreen | Add vehicle (Rental tab) | Implement add vehicle or remove |
| AdminDashboardScreen | Edit / Update Status (sheet) | Implement edit/update flow (handleEdit is TODO) |
| AppHeader | Calendar icon | Add onPress when rightIcon="calendar" |

---

## Missing or Incomplete Implementations

| Item | Location | Notes |
|------|----------|--------|
| **handleEdit** | AdminDashboardScreen | Only calls `closeSheet()`; TODO: open edit modal or navigate |
| **handleTab** on RequestScreen | RequestScreen | Defined but BottomNavBar not rendered; user cannot switch tabs |
| **handleOpenChat** | ChatScreen | Shows toast only; no real chat screen |
| **Accept / Decline** | MechanicDashboardScreen, TowDashboardScreen | Mock only; dismiss sheet and clear selection, no API |

---

## Incorrect or Missing Props

| Component | Issue | Notes |
|-----------|--------|--------|
| **AppHeader** (MapScreen) | `rightIcon="calendar"` with no `onProfile`/onPress for calendar | Calendar icon has no onPress in AppHeader.tsx |
| **ProfileScreen** | `onProfile={() => {}}` | Empty callback; profile icon does nothing |
| **RequestScreen** | No `BottomNavBar` | handleTab exists but no way to invoke it from UI |
| **AdminProviderListScreen** | Requires `role` param | No navigator passes this route; direct navigation must include `role` |
