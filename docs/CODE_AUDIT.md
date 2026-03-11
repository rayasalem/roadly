# Deep Code Audit

Focus areas: Authentication security, token handling, AsyncStorage session logic, API error handling, HTTP interceptors, memory leaks, React rendering performance, Zustand state management. Includes race conditions, security vulnerabilities, state bugs, and improper async logic.

---

## Critical issues

### 1. **401 before navigation is ready — user stuck**

**Where:** `navigationRef.ts` — `navigateToLogin()` only runs when `navigationRef.isReady()` is true.

**Issue:** If a 401 (or failed refresh) happens before the navigation container has mounted (e.g. very early on app load or right after a cold start), `navigateToLogin()` does nothing. State is cleared (tokens, session) but the UI may still show an authenticated screen or a blank/loading state, and the user is never sent to Login.

**Fix:** Queue the redirect and run it when the ref becomes ready, or retry after a short delay:

```ts
export const navigateToLogin = () => {
  const tryNav = () => {
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }
    setTimeout(tryNav, 100);
  };
  tryNav();
};
```

Or use a listener for `navigationRef.isReady()` if the API supports it.

---

### 2. **Tokens and session stored in AsyncStorage (localStorage on web)**

**Where:** `sessionStorage.ts` persists full session (including `accessToken`, `refreshToken`) to AsyncStorage; on web this is typically `localStorage`.

**Issue:** Any script running in the same origin (e.g. XSS) can read `localStorage` and steal tokens. This is a standard web security tradeoff; the main risk is XSS elsewhere in the app or in embedded content.

**Fix:**  
- Ensure no unsanitized user content is rendered (avoid `dangerouslySetInnerHTML`, sanitize inputs).  
- Prefer httpOnly cookies for web if the backend can set them; keep tokens out of JS-accessible storage.  
- Document that tokens are in AsyncStorage/localStorage and that XSS would compromise them.

---

### 3. **Persisted session not validated — malformed data can reach app state**

**Where:** `sessionStorage.ts` — `loadPersistedSession()`.

**Issue:** We only check that `parsed.user` and `parsed.accessToken` exist. We do not validate shape of `user` (e.g. `id`, `name`, `email`, `role`). Corrupted or malicious storage could yield `{ user: {}, accessToken: "x" }`, which is then written into Zustand and tokenStore. Downstream code may assume `user.id` or `user.role` exists and crash or behave incorrectly.

**Fix:** Validate persisted data (e.g. with Zod or explicit checks) and return `null` if invalid:

```ts
if (!parsed.user || typeof parsed.user !== 'object' || typeof parsed.user.id !== 'string' || typeof parsed.user.role !== 'string') {
  return null;
}
```

---

## Medium issues

### 4. **Session persistence is fire-and-forget — possible lost session on kill**

**Where:** `authStore.ts` — `setSession()` calls `void persistSession(...)` without awaiting.

**Issue:** If the app is killed (or tab closed on web) before `persistSession` completes, the in-memory state is set but AsyncStorage never gets the session. On next launch the user appears logged out. No error is visible to the user.

**Fix:** Either await `persistSession` in `setSession` (and handle errors, e.g. retry or toast), or keep fire-and-forget but add a short delay before navigating away so the write has time to complete.

---

### 5. **clearSession does not await cleanup — race with logout path**

**Where:** `authStore.ts` — `clearSession()` uses `void clearPersistedSession()` and `void cleanupNotifications()`.

**Issue:** State and tokenStore are cleared synchronously; AsyncStorage clear and the notifications API call run in the background. For 401 we then call `navigateToLogin()`. Usually fine, but if the app is closed or another 401 happens immediately, behavior is still correct because state is already cleared. The only risk is `cleanupNotifications()` failing and leaving the server with a stale device token; the user is still logged out locally.

**Fix:** Prefer awaiting both (and catch errors) so cleanup is best-effort complete before redirect, or document that cleanup is best-effort and non-blocking.

---

### 6. **useUserLocation — setState after unmount (memory leak / warning)**

**Where:** `useUserLocation.ts` — `fetchLocation` is async and calls `setState` when permission or `getCurrentPosition` resolves.

**Issue:** If the component unmounts while a request is in flight (e.g. user leaves the map quickly), the promise still resolves and `setState` runs on an unmounted component. This can cause React warnings and, in theory, leaks if the callback holds refs.

**Fix:** Use a mounted ref and skip setState when unmounted:

```ts
const mounted = useRef(true);
useEffect(() => {
  mounted.current = true;
  return () => { mounted.current = false; };
}, []);
// In fetchLocation, before each setState: if (!mounted.current) return;
```

---

### 7. **Refresh token request has no timeout**

**Where:** `refreshAccessToken.ts` — `axios.post` to `/auth/refresh` uses default Axios behavior (no explicit timeout).

**Issue:** If the server hangs, the refresh can hang indefinitely. All requests waiting on the single refresh promise will wait as well, and the UI can appear stuck.

**Fix:** Add a timeout (e.g. 10s) to the refresh request and treat timeout as refresh failure (clear tokens, emit unauthorized).

---

### 8. **Multiple 401s can trigger multiple onUnauthorized / redirects**

**Where:** `httpClient.ts` — response interceptor: on 401 + failed refresh we call `onUnauthorized()` and then `onError()` and `reject`. Every failed request in flight does the same.

**Issue:** Several concurrent 401s (e.g. multiple tabs or rapid requests) each trigger `onUnauthorized()` → clearSession + navigateToLogin. Session clear and navigation are idempotent, but we do redundant work and multiple `reset()` calls.

**Fix:** Debounce or gate `onUnauthorized` so it runs only once per “session” (e.g. a module-level flag cleared on successful login, or a short cooldown).

---

### 9. **Loader count can get stuck if hideLoader is never called**

**Where:** `uiStore.ts` — `showLoader` / `hideLoader` use a counter; Login/Register call both in try/finally.

**Issue:** If an error is thrown in a path where `hideLoader` is not in a `finally` (e.g. future code), or if the component unmounts in a way that skips `finally`, the counter can stay positive and the global loader may show forever.

**Fix:** Rely only on try/finally for every place that calls `showLoader`; consider a “max loader time” auto-decrement or a single loader state that is always cleared on unmount (e.g. in a global effect that subscribes to a “loader owner” and clears when owner unmounts).

---

### 10. **onUnauthorized clears tokenStore twice**

**Where:** `api.ts` — `onUnauthorized` calls `tokenStore.clear()`. `UnauthorizedHandler` then runs `clearSession()`, which also calls `tokenStore.clear()`.

**Issue:** Redundant. No functional bug, but duplicated logic.

**Fix:** In `onUnauthorized` only emit the event; let the listener (`clearSession`) be the single place that clears tokenStore and state.

---

## Minor improvements

### 11. **Zustand selectors — toast reference in HttpEventsBinder**

**Where:** `HttpEventsBinder.tsx` — `useEffect(..., [toast])`. `toast` from `useUIStore((s) => s.toast)` is a stable reference, so the effect runs once. No bug.

**Improvement:** For consistency and to avoid any future store changes causing re-subscription, the effect could depend on an empty array and read `toast` via `useUIStore.getState().toast` inside the listener. Optional.

---

### 12. **Auth hydrate — no timeout on loadPersistedSession**

**Where:** `authStore.ts` — `hydrate()` awaits `loadPersistedSession()`. If AsyncStorage is slow or stuck, the app can stay on the loading screen.

**Improvement:** Wrap `loadPersistedSession()` in a timeout (e.g. 5s) and treat timeout as “no session” (clear and set hasHydrated).

---

### 13. **Error handling in toHttpError — response.data cast as any**

**Where:** `httpClient.ts` — `(err.response.data as any)?.message`. Works but loses type safety.

**Improvement:** Define a small type for API error body or use a type guard so server message extraction is typed and consistent.

---

### 14. **Request interceptor — getAccessToken can be async but is used with await**

**Where:** `httpClient.ts` — `tokenProvider.getAccessToken()` is typed as `string | null | Promise<string | null>` and is awaited. Current `api.ts` passes a sync function. Correct.

**Improvement:** None required; just note that if a future tokenProvider returns a Promise, it is already awaited.

---

### 15. **TanStack Query — useNearbyProviders params in key**

**Where:** `useNearbyProviders` uses `queryKey: [...QUERY_KEY, params]`. MapScreen passes `nearbyParams` from `useMemo(..., [coords, filterRole])`, so the key is stable when coords/filter don’t change.

**Improvement:** Ensure no caller passes an inline object (e.g. `useNearbyProviders({ latitude: coords.lat, ... })` without useMemo), which would refetch every render. Document that `params` should be memoized.

---

### 16. **ToastHost — only latest toast is auto-dismissed**

**Where:** `ToastHost.tsx` — A timer is set only for `latest` (last toast). When it’s dismissed, the next in the array becomes latest and gets its own timer. The array is updated by `dismissToast`, so toasts are eventually removed.

**Improvement:** No bug; optionally cap `toasts.length` (e.g. max 5) in the store to avoid unbounded growth if toasts are fired very fast.

---

### 17. **Zustand auth state — no persistence middleware**

**Where:** Auth state (user, tokens) is kept in Zustand and separately persisted via `sessionStorage`. On rehydration we load from AsyncStorage and then set Zustand.

**Improvement:** Consider using a persistence middleware (e.g. `persist` from `zustand/middleware`) for a single source of truth, or keep current approach but document that AsyncStorage is the source of truth on load and Zustand is the runtime cache.

---

## Summary table

| Category        | Critical | Medium | Minor |
|----------------|----------|--------|-------|
| Auth security  | 2 (401 before nav ready; tokens in storage) | 1 (session validation) | — |
| Token handling | —       | 1 (refresh timeout) | 1 (double clear) |
| AsyncStorage   | 1 (validation) | 1 (fire-and-forget persist) | — |
| API / HTTP     | —       | 2 (multiple 401, clearSession not awaiting) | 2 (toHttpError types, getAccessToken) |
| Memory / async | —       | 1 (useUserLocation setState after unmount) | — |
| Zustand / UI   | —       | 1 (loader count stuck) | 3 (toast selector, hydrate timeout, persist strategy) |
| React perf     | —       | —     | 1 (params memo for useNearbyProviders) |

---

## Recommended order of fixes

1. **Critical:** Handle 401 when navigation is not ready (queue or retry redirect).  
2. **Critical:** Validate shape of persisted session in `loadPersistedSession`.  
3. **Security:** Document token storage risk (XSS/localStorage) and harden against XSS.  
4. **Medium:** Add mounted guard in `useUserLocation` to avoid setState after unmount.  
5. **Medium:** Add timeout to refresh token request.  
6. **Medium:** Await or document fire-and-forget for `persistSession` and `clearSession` cleanup.  
7. **Medium:** Debounce or gate `onUnauthorized` to run once.  
8. **Minor:** Remove duplicate `tokenStore.clear()` from `onUnauthorized`; single responsibility in listener.
