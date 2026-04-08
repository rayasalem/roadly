# Development networking (Expo ↔ backend)

## Ports

| Service | Port | Notes |
|--------|------|--------|
| Backend API | **8082** | `npm run dev` in `backend/`; listens on `0.0.0.0` (LAN reachable). |
| Metro / Expo | **8081** default | `npm start`; use `--port` if busy. |
| Web (Expo) | **8081** / **19006** | Legacy; CORS allows common dev ports. |

## Why not `localhost` on a phone?

`EXPO_PUBLIC_API_URL=http://localhost:8082` points to **the device itself**, not your PC. The app resolves this automatically in **native dev** when possible; for **Expo web** opened via `http://192.168.x.x:8081`, the **same LAN IP** is used for the API.

## Environment variables (frontend)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | Full API base URL (e.g. `http://localhost:8082` on desktop web). |
| `EXPO_PUBLIC_DEV_API_HOST` | **Only the host** (e.g. `192.168.1.10`) — forces `http://<host>:8082` in development for all clients. |
| `EXPO_PUBLIC_ENVIRONMENT` | `development` \| `staging` \| `production` |

### Get your PC LAN IP

```bash
node scripts/show-dev-ip.mjs
```

Then in `.env`:

```env
EXPO_PUBLIC_DEV_API_HOST=192.168.1.10
```

Restart Metro after changing `.env`.

## Backend CORS

In **development**, origins that match **private LAN IPv4** (e.g. `http://192.168.1.5:8081`) are allowed so phones and other PCs can load the Expo web app and call the API.

## Remote devices / NAT

Use Expo tunnel when LAN routing is blocked:

```bash
npx expo start --tunnel
```

Metro will be reachable via Expo’s URL; you still need the API reachable from the device (same Wi‑Fi + `EXPO_PUBLIC_DEV_API_HOST`, or a deployed staging API).

## Debugging API base URL

Set:

```env
EXPO_PUBLIC_DEBUG_HTTP=1
```

Logs show the resolved `API_BASE_URL` in dev (`src/shared/services/http/api.ts`).

## Network errors

The HTTP client (`createHttpClient`) normalizes timeouts and 4xx/5xx into `HttpError`; UI surfaces loaders and `ErrorWithRetry` where wired. If the backend is down, you’ll see connection errors or timeouts — start the backend and confirm firewall allows **8082** on the LAN.
