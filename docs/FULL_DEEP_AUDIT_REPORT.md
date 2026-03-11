# Full Deep Audit Report — React Native Project

**Scope:** Navigation, Authentication, API layer, State management (Zustand), React Query, Hooks safety, Memory leaks, AsyncStorage, Loading/error states, Security.

**Convention:** Severity = Critical | Medium | Minor. Each issue includes File, Line(s), Problem, Severity, Fix suggestion, and Corrected code where applicable.

---

## 1. Navigation

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| NAV-1 | `src/navigation/RootNavigator.tsx` | 22 | Root stack uses `initialRouteName="Launch"`. After `hydrate()` restores a session, the user stays on Launch; there is no redirect to App. | **Critical** | Use auth state to drive initial route or have a wrapper (e.g. AuthBootstrap) navigate to App when `hasHydrated && isAuthenticated`. | See fix section below. |
| NAV-2 | `src/features/map/presentation/screens/MapScreen.tsx`, `MapScreen.web.tsx` | ~229, ~156 | Both call `navigation.navigate('Request', { serviceType })`. The `Request` screen exists only in **CustomerStack**. MechanicStack, TowStack, RentalStack, and AdminStack do not define `Request`, so when a mechanic/tow/rental/admin user taps "Request Service" on the Map, navigation can fail or throw. | **Critical** | Add a `Request` screen to Mechanic/Tow/Rental/Admin stacks (or a shared stack), or guard: only navigate to Request when the current navigator has that screen (e.g. check route list or use a root-level navigator for Request). | Add `Request` screen + param list to each role stack that uses MapScreen, or use `navigation.getParent()` / common stack for Request. |
| NAV-3 | `src/features/requests/presentation/screens/RequestScreen.tsx` | 22–23 | `const { serviceType } = route.params` is used without validation. If something navigates to Request without params (e.g. deep link or bug), `serviceType` can be undefined and later usage can throw. | **Minor** | Validate or default `serviceType`; redirect or goBack when invalid. | See fix section below. |
| NAV-4 | `src/features/chat/presentation/screens/ChatScreen.tsx` | 41 | `useNavigation<any>()` loses type safety for screen names and params. | **Minor** | Use the stack param list type, e.g. `useNavigation<NativeStackNavigationProp<CustomerStackParamList, 'Chat'>>()`. | Replace `any` with `NativeStackNavigationProp<CustomerStackParamList, 'Chat'>`. |
| NAV-5 | `src/features/settings/presentation/screens/SettingsScreen.tsx`, `NotificationsScreen.tsx` | ~82, ~80 | Same as NAV-4: `useNavigation<any>()` used. | **Minor** | Use typed navigation for the relevant stack and screen name. | Same pattern as NAV-4. |
| NAV-6 | `src/navigation/navigationRef.ts` | 4 | `createNavigationContainerRef<RootStackParamList>()` only types the root stack. Nested stacks (e.g. CustomerStack’s Request params) are not reflected. | **Minor** | Use a composite param list that includes nested navigators so nested navigations are type-checked. | Optional: extend RootStackParamList with nested params for App stack. |

---

## 2. Authentication

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| AUTH-1 | `src/store/authStore.ts`, `UnauthorizedHandler.tsx` | authStore 112–114; UnauthorizedHandler 11–14 | On refresh failure, `refreshAccessTokenSafe()` emits `'unauthorized'`. UnauthorizedHandler runs `clearSession()` and `navigateToLogin()`. Hydrate then also runs `clearSession()` and `navigateToLogin()`, so both run (redundant work, possible double navigation). | **Medium** | In hydrate, when refresh returns null, only reset local state and return; do not call clearSession or navigateToLogin. Let UnauthorizedHandler be the single place that clears and redirects. | In hydrate: when `!refreshed`, set state to initial + hasHydrated and return; remove `get().clearSession()` and `navigateToLogin()`. |
| AUTH-2 | `src/features/auth/presentation/screens/LoginScreen.tsx` | 77–96, 219 | `handleMockLogin` is async (uses `await setSession`) but is invoked as `onPress={() => handleMockLogin(role)}`. Failures (e.g. setSession or navigation.replace) are not caught, leading to unhandled promise rejection. | **Medium** | Await or void the promise and add try/catch inside handleMockLogin; on error show toast or set error state. | See fix section below. |
| AUTH-3 | `src/shared/services/auth/sessionStorage.ts` | 5 | `AUTH_KEY = 'roadly:auth_session'` is a fixed key in source. Low risk; main concern is never logging it or sending it. | **Minor** | Ensure the key is never logged; document that real protection is secure storage (e.g. expo-secure-store). | No code change; add comment if desired. |

---

## 3. API Layer

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| API-1 | `src/shared/services/http/httpClient.ts` | 91–95 | Default `timeoutMs` is 15_000 for the main client; not all endpoints may need the same timeout. | **Minor** | Keep default; consider per-request timeout for long operations (e.g. upload) if added later. | No change required for current scope. |
| API-2 | `src/features/auth/data/authApi.ts`, `requestApi.ts`, `providersApi.ts` | various | API modules throw `new Error(getErrorMessage(error))` on failure. Callers must catch; otherwise the error propagates. No structural issue. | **Minor** | Ensure all call sites (e.g. mutations, handlers) catch or handle errors. | Audit call sites; add catch where missing. |
| API-3 | `src/shared/services/http/api.ts` | 17–18 | `onRequestStart` / `onRequestEnd` run for **every** request, including internal/background (e.g. refresh). Refresh uses a bare axios instance, so it does not trigger loader—good. | — | None. | — |

---

## 4. State Management (Zustand)

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| Z-1 | `src/store/authStore.ts` | 88–151 | `hydrate` is async and can be triggered from AuthBootstrap’s useEffect. If the component unmounts before hydrate completes, set() is still called (Zustand is safe, but side effects like navigateToLogin could run after unmount). | **Minor** | Use an abort/cancellation flag or check mount before calling set/navigate after async steps. | Optional: store a hydrateAborted ref and check before set/navigate. |
| Z-2 | `src/store/uiStore.ts` | 31–34 | `toast` appends and then slices to MAX_TOASTS. Correct. | — | None. | — |
| Z-3 | `src/store/authStore.ts` | 55–65 | `setSession` calls `resetUnauthorizedGuard()`, then await persistSession, then set(). Order is correct. | — | None. | — |

---

## 5. React Query Usage

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| RQ-1 | `src/features/providers/hooks/useNearbyProviders.ts` | 15–16 | Query key is built from primitives; no refetch loop. | — | None. | — |
| RQ-2 | `src/features/requests/hooks/useRequest.ts` | 20–24 | `refetchInterval` returns 5_000 for non-terminal status. When request is completed/cancelled, polling stops. Good. | — | None. | — |
| RQ-3 | `src/shared/providers/QueryErrorFallback.tsx` | 15–21 | Subscribes to query cache and shows toast on any query error. Can duplicate toast when the same request also triggers HttpEventsBinder (axios onError). | **Minor** | Accept duplicate as fallback, or debounce/dedupe by query key when showing toast. | Optional: track last toasted query key + error and skip if same. |
| RQ-4 | `src/features/map/hooks/usePlacesSearch.ts` | 34–39 | Query key uses `debouncedQuery` (string); stable. retry/retryDelay set. | — | None. | — |

---

## 6. Hooks Safety

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| H-1 | `src/shared/providers/AuthBootstrap.tsx` | 16–18 | `useEffect(() => { void hydrate(); }, [hydrate])`. `hydrate` from Zustand is stable. No dependency issue. | — | None. | — |
| H-2 | `src/features/requests/presentation/screens/RequestScreen.tsx` | 29–31 | `useEffect` depends on `coords` and `fetchLocation`. Correct. | — | None. | — |
| H-3 | `src/features/auth/presentation/screens/LoginScreen.tsx` | 77–96 | `handleMockLogin` is useCallback with async body but not declared `async` in signature; it returns a Promise. Call site does not void or await. | **Medium** | Make handler explicitly async and use `onPress={() => void handleMockLogin(role)}`; inside handler use try/catch and toast on error. | See fix section below. |
| H-4 | `src/features/map/hooks/usePlacesSearch.ts` | 23–30 | Debounce effect clears timeout on cleanup. Correct. | — | None. | — |

---

## 7. Memory Leaks

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| M-1 | `src/navigation/navigationRef.ts` | 54–68 | `setInterval` is started when redirect is queued; cleared in `stopPendingFlushPoll` when flush runs or after FLUSH_POLL_MAX_MS. Cleanup is correct. | — | None. | — |
| M-2 | `src/shared/providers/QueryErrorFallback.tsx` | 16–21 | `cache.subscribe` returns `unsub` and it is returned from useEffect cleanup. Correct. | — | None. | — |
| M-3 | `src/shared/providers/HttpEventsBinder.tsx` | 9–12 | `httpEvents.on` returns unsubscribe and it is returned from useEffect. Correct. | — | None. | — |
| M-4 | `src/shared/components/ToastHost.tsx` | 34–40 | `setTimeout` is cleared in the effect cleanup (return () => clearTimeout(timer)). Correct. | — | None. | — |
| M-5 | `src/shared/utils/eventBus.ts` | 8 | Listeners are stored; `Unsubscribe` is returned. Callers must call it. UnauthorizedHandler and HttpEventsBinder do. | — | None. | — |

---

## 8. AsyncStorage Usage

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| AS-1 | `src/shared/services/auth/sessionStorage.ts` | 77–140 | `loadPersistedSession` wrapped in try/catch; on error or invalid data clears storage and returns null. No raw token in logs. | — | None. | — |
| AS-2 | `src/shared/services/auth/sessionStorage.ts` | 145–160 | `loadPersistedSessionWithTimeout` races load with timeout; avoids hanging. | — | None. | — |
| AS-3 | `src/store/authStore.ts` | 94 | Hydrate uses `loadPersistedSessionWithTimeout()`. Correct. | — | None. | — |
| AS-4 | Session key | 5 | Single key `roadly:auth_session`; documented in code. No key rotation. | **Minor** | For multi-account or key rotation, consider versioned or derived keys. | No change for current design. |

---

## 9. Loading and Error States

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| LE-1 | MapScreen | 421–447 | Loading skeleton and error (ErrorWithRetry) with retry and isRefetching. Visible. | — | None. | — |
| LE-2 | `src/shared/providers/AuthBootstrap.tsx` | 19–25 | Shows ActivityIndicator while `!hasHydrated \|\| isHydrating`. No error state if hydrate fails; state is reset to logged-out and children render (Launch). | **Minor** | Optionally show a one-time toast or message if hydrate failed due to timeout/error. | Optional: in hydrate catch, set a `hydrationError` flag and show toast in AuthBootstrap. |
| LE-3 | `src/features/requests/presentation/screens/RequestScreen.tsx` | 89–99 | createMutation.isError and isLoading/request states shown. Good. | — | None. | — |
| LE-4 | Global loader | `api.ts`, `httpClient.ts` | onRequestStart/onRequestEnd used for global loader. hideLoader in finally. Correct. | — | None. | — |

---

## 10. Security Risks

| ID | File | Line(s) | Problem | Severity | Fix suggestion | Corrected code |
|----|------|---------|---------|----------|----------------|----------------|
| SEC-1 | `src/shared/services/auth/tokenStore.ts` | 17–30 | Tokens in plain memory. Documented. No token logging found in codebase. | **Minor** | Continue to avoid logging tokens; consider expo-secure-store for persistence. | No code change. |
| SEC-2 | `src/shared/services/auth/sessionStorage.ts` | 61–62 | AsyncStorage/localStorage documented as plain text; XSS/backup risk noted. | **Minor** | Same as SEC-1. | No code change. |
| SEC-3 | Login/Register | — | Passwords in component state; not logged. Sent over HTTPS via API. | — | Ensure production uses HTTPS only. | — |
| SEC-4 | `src/shared/services/http/api.ts` | 14–16 | `onUnauthorized` guarded by `unauthorizedTriggered`; no token in callback. | — | None. | — |

---

## Summary by Severity

| Severity | Count | Areas |
|----------|--------|--------|
| **Critical** | 2 | Navigation (initial route after hydrate; MapScreen→Request in non-customer stacks) |
| **Medium** | 3 | Auth (duplicate clear/redirect on refresh failure; mock login unhandled rejection), Hooks (handleMockLogin async not awaited) |
| **Minor** | 12+ | Navigation (params guard, typed nav, ref typing), Auth (session key), React Query (toast dedupe), Hooks (async handler), Loading (hydration error toast), Security (docs), AsyncStorage (key strategy) |

---

## Corrected Code (Critical and Medium)

### NAV-1: Redirect to App when session is restored

**Option A — Navigate from AuthBootstrap when authenticated after hydrate:**

```tsx
// src/shared/providers/AuthBootstrap.tsx
import { useEffect, useRef } from 'react';
import { navigationRef } from '../../navigation/navigationRef';

export function AuthBootstrap({ children }: Props) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hasNavigatedToApp = useRef(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hasHydrated || isHydrating || !isAuthenticated) return;
    if (hasNavigatedToApp.current) return;
    if (!navigationRef.isReady()) return;
    hasNavigatedToApp.current = true;
    navigationRef.reset({ index: 0, routes: [{ name: 'App' }] });
  }, [hasHydrated, isHydrating, isAuthenticated]);

  if (!hasHydrated || isHydrating) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}
```

**Note:** RootNavigator still has initialRouteName="Launch". The first screen tree will be Launch, then AuthBootstrap runs hydrate; when done and authenticated, the effect above resets to App. You may need to avoid showing Launch at all when authenticated (e.g. conditional initialRouteName) to prevent a brief flash—alternative is to set `initialRouteName` dynamically based on auth once hydrated (e.g. in a wrapper that reads from store).

### NAV-2: MapScreen → Request in non-Customer stacks

**Option A — Add Request screen to each role stack that uses Map:**

In `MechanicStack.tsx`, `TowStack.tsx`, `RentalStack.tsx`, `AdminStack.tsx`: add `Request` to the param list and register the screen:

```ts
// MechanicStack.tsx (and similarly for Tow, Rental, Admin)
export type MechanicStackParamList = {
  MechanicDashboard: undefined;
  MechanicServices: undefined;
  MechanicSkills: undefined;
  Map: undefined;
  Profile: undefined;
  Request: { serviceType: 'mechanic' | 'tow' | 'rental' };
};

// In the Stack.Navigator, add:
<Stack.Screen name="Request" component={RequestScreen} />
```

Import `RequestScreen` and use the same component; param type can be a shared type.

### NAV-3: RequestScreen guard for missing serviceType

```tsx
// src/features/requests/presentation/screens/RequestScreen.tsx — start of component, after Props destructure
const rawServiceType = route.params?.serviceType;
const validServiceTypes = ['mechanic', 'tow', 'rental'];
if (!rawServiceType || !validServiceTypes.includes(rawServiceType)) {
  if (navigation.canGoBack()) navigation.goBack();
  return null;
}
const serviceType = rawServiceType as 'mechanic' | 'tow' | 'rental';
// then use serviceType in the rest of the component
```

### AUTH-1: Hydrate — don’t duplicate clearSession / navigateToLogin on refresh failure

```ts
// src/store/authStore.ts — inside hydrate, replace the block when !refreshed:
if (persisted.refreshToken) {
  const refreshed = await refreshAccessTokenSafe();
  if (!refreshed) {
    tokenStore.clear();
    set({ ...initialState, hasHydrated: true, isHydrating: false });
    return;
    // Remove: await get().clearSession(); navigateToLogin();
    // UnauthorizedHandler will run and do clearSession + navigateToLogin.
  }
  accessToken = refreshed;
}
```

(Keep tokenStore.clear() and set() so state is reset; only remove clearSession and navigateToLogin.)

### AUTH-2 / H-3: handleMockLogin async and error handling

```tsx
// src/features/auth/presentation/screens/LoginScreen.tsx
const handleMockLogin = useCallback(
  async (role: Role) => {
    try {
      const user: AuthUser = {
        id: `mock-${role}`,
        name: ROLE_LABELS[role],
        email: `${role}@mock.roadly.dev`,
        role,
      };
      await setSession({
        user,
        accessToken: `mock-access-${role}`,
        refreshToken: null,
      });
      toast({
        type: 'success',
        message: `تم تسجيل الدخول كـ ${ROLE_LABELS[role]} (بيانات تجريبية)`,
      });
      navigation.replace('App');
    } catch (e) {
      toast({
        type: 'error',
        message: e instanceof Error ? e.message : t('error.unknown'),
      });
    }
  },
  [navigation, setSession, toast],
);

// In JSX:
onPress={() => void handleMockLogin(role)}
```

---

## Recommendations

1. **Fix Critical first:** NAV-1 (redirect to App after hydrate), NAV-2 (Request screen in all stacks that use Map, or guard navigation).
2. **Then Medium:** AUTH-1 (remove duplicate clear/redirect in hydrate), AUTH-2/H-3 (handleMockLogin try/catch and void).
3. **Then Minor as needed:** RequestScreen param guard (NAV-3), typed navigation (NAV-4, NAV-5), optional toast dedupe (RQ-3), optional hydration error toast (LE-2).

Do not change overall architecture; limit changes to the files and lines above.
