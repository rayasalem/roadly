# API & network dev configuration — change report

This document summarizes automatic API base URL resolution and HTTP error improvements for the Expo (React Native) frontend. Generated as part of the “fix all network and API issues” task.

## 1. Scan: frontend API usage

- **Axios / shared client**: All backend calls go through `src/shared/services/http/api.ts` (`createHttpClient`) with `baseURL: API_BASE_URL`, or `refreshAccessToken.ts` using `API_BASE_URL` for `POST /auth/refresh`.
- **Relative paths only** in feature APIs (`authApi`, `requestApi`, `providersApi`, chat, admin, etc.); **no hardcoded `localhost` / `127.0.0.1`** in those modules.
- **`fetch`**: `src/features/map/data/placesApi.ts` calls Google Maps HTTPS URLs only (no local API host).

Host/port resolution is centralized in **`src/shared/constants/env.ts`** (`EXPO_PUBLIC_API_URL`, dev detection, rewrites).

## 2. `env.ts` — automatic dev host

| Priority | Source | Behavior |
|----------|--------|------------|
| 1 | `EXPO_PUBLIC_DEV_API_HOST` | Forces API hostname for native dev and default URL when `EXPO_PUBLIC_API_URL` is unset. |
| 2 | Metro bundle URL | `NativeModules.SourceCode.scriptURL` → hostname (e.g. `192.168.x.x` from device loading the bundle). Skips loopback. |
| 3 | Expo | `expo-constants`: `expoConfig.hostUri`, `expoGoConfig.debuggerHost`, `manifest` / `manifest2` / `platform` variants → hostname. Skips loopback. |
| 4 | Android | `10.0.2.2` (emulator → host). |
| 5 | iOS | `127.0.0.1` (Simulator → host). |

**Loopback rewrite (development, native):** If `EXPO_PUBLIC_API_URL` points at `localhost` / `127.0.0.1`, the hostname is replaced with the resolved dev machine host; **port, path, query, and hash are preserved** (implicit port on loopback defaults to backend dev port `8082`).

**Web:** Unchanged rules: loopback page keeps localhost API; LAN / `10.0.2.2` page rewrites loopback API URL to match the page host; other hosts fall back to `getDefaultApiUrl` (same as before).

**Debug:**

- `EXPO_PUBLIC_DEBUG_HTTP=1` → `logResolvedApiBaseUrl()` logs **`API_BASE_URL`** and **`getApiResolutionMeta()`** (how the URL was chosen).
- Called from `api.ts` on module load in `__DEV__`.

## 3. `httpClient.ts` — network errors

- **`ERR_NETWORK` / `ECONNREFUSED` / Axios “Network Error”**: User-facing `HttpError.message` includes the **resolved `API_BASE_URL`** and guidance on localhost vs device, `EXPO_PUBLIC_DEV_API_HOST`, Android emulator (`10.0.2.2`), iOS Simulator (`127.0.0.1`), and **`EXPO_PUBLIC_DEBUG_HTTP=1`**.
- In **`__DEV__`**, a **`console.warn`** is emitted with the same context and Axios `code`.

## 4. `errorMessage.ts`

- **`Network`**: Uses **`HttpError.message`** when non-empty so the improved text from `toHttpError` surfaces in UI/helpers; otherwise falls back to `t('error.network')`.

## 5. `api.ts`

- Replaced duplicate `console.info` with **`logResolvedApiBaseUrl()`** when `EXPO_PUBLIC_DEBUG_HTTP=1`.

## 6. `.env.example`

- Comments updated to describe auto-resolution, optional `EXPO_PUBLIC_DEV_API_HOST`, and `EXPO_PUBLIC_DEBUG_HTTP`.

## 7. Other files touched

- **`NotificationsScreen.tsx`**: Restored missing **`ListSeparator`** component (referenced by `FlatList`) so TypeScript builds succeed; unrelated to API wiring but required for a clean compile.

## 8. What was not changed

- **Business logic** of API payloads, screens, or navigation.
- **Backend** CORS / listen address (backend must still bind so LAN/emulator can connect, e.g. `0.0.0.0` and correct `PORT`).
- **Production** behavior: production/staging URLs without loopback are unchanged; `__DEV__ === false` still uses the production default when applicable.

## 9. Manual checklist (if auto-detection fails)

1. PC and phone on same Wi‑Fi; firewall allows inbound on backend port (default **8082**).
2. Run `node scripts/show-dev-ip.mjs` and set **`EXPO_PUBLIC_DEV_API_HOST`** if needed.
3. Set **`EXPO_PUBLIC_DEBUG_HTTP=1`** and confirm logged **`API_BASE_URL`** matches where the backend listens.
