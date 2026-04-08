# Final consolidated audit report (MechNow)

**Date:** Generated as part of ongoing hardening work.  
**Scope:** Backend (Express), Frontend (Expo / React Native), shared HTTP layer, tooling.

**Important:** A single automated pass cannot guarantee “zero issues” across every file, browser, and device. Production readiness still requires **manual QA**, **staging deploys**, and **dependency upgrades** on a schedule.

---

## 1. Automated / targeted detection (what was checked)

| Area | Method | Finding |
|------|--------|---------|
| `<iframe>` / embedded third-party frames | Repo-wide search | **No iframes** in app source or `public/index.html` |
| XSS vectors (`dangerouslySetInnerHTML`, `innerHTML`, `eval`) | Search in `src/` | **None** in typical patterns |
| **API base URL / localhost on devices** | Code review `src/shared/constants/env.ts` | Addressed via **LAN hostname**, **`EXPO_PUBLIC_DEV_API_HOST`**, **`10.0.2.2`**, **`resolveApiUrl`** |
| **CORS for LAN dev** | `backend/src/app.ts` | **LAN origins** allowed in development + extra Metro ports |
| **fetch without HTTP status** | `src/features/map/data/placesApi.ts` | **`res.ok`** checks added |
| **External links (web)** | `src/shared/utils/openExternalUrl.ts` | **`<a rel="noopener noreferrer">`** pattern for https |
| **Maps navigation** | `src/shared/utils/navigation.ts` | **HTTPS** Apple Maps; https URLs use `openExternalUrl` where appropriate |
| **npm audit** | `npm audit` | **5 low** (chain: **jest-expo → jsdom**); fix needs **`npm audit fix --force`** (breaking) |

---

## 2. Issues that were fixed (already in the codebase)

| # | Item | Location / notes |
|---|------|------------------|
| F1 | Dev API URL resolution for **physical devices & Expo web on LAN** | `src/shared/constants/env.ts` |
| F2 | **CORS** for private LAN IPv4 origins in development | `backend/src/app.ts` |
| F3 | **Google Places `fetch`**: fail fast on non-OK HTTP | `src/features/map/data/placesApi.ts` |
| F4 | Safer **external https** opening on web | `src/shared/utils/openExternalUrl.ts` + `navigation.ts` + Help mailto |
| F5 | **Cypress config** load failure (TS/tsconfig) | `cypress.config.cjs`, `tsconfig.cypress.json` |
| F6 | **npm audit fix** (non-breaking) | Applied earlier in the project history |
| F7 | **Dev IP helper** | `scripts/show-dev-ip.mjs`, `npm run dev:lan-ip` |
| F8 | **Networking documentation** | `docs/DEV_NETWORKING.md`, `.env.example` |

---

## 3. What was *not* auto-fixed (requires deliberate work)

| ID | Topic | Why not one-shot |
|----|--------|------------------|
| R1 | **All TypeScript errors** project-wide (`tsc`) | Many categories (tests, theme typings, i18n keys); needs phased fixes |
| R2 | **Remove unused CSS/JS/assets** globally | Needs bundle analyzer + test pass; risk of breaking imports |
| R3 | **Full accessibility (a11y)** on every screen | Manual / tooling (axe, platform inspectors) |
| R4 | **Every network call** with custom user-facing copy | Many flows already use **React Query + ErrorWithRetry**; blanket changes are risky |
| R5 | **npm audit --force** (jest-expo major) | Breaks semver; schedule with Expo upgrade |
| R6 | **Strict Content-Security-Policy** on web | Can break Expo bootstrap; test in staging first |
| R7 | **Google Places API key in client** (if key set) | Correct fix is **backend proxy**; architectural change |

---

## 4. Security & operations recommendations

1. **Secrets:** Never commit `.env`; use CI secrets for production. Rotate **JWT** secrets if ever leaked.
2. **Production API:** HTTPS only; `EXPO_PUBLIC_API_URL` points to your deployed backend.
3. **Database:** `DATABASE_URL` required for real persistence; local dev may run without DB for limited testing.
4. **CORS in production:** Keep `CLIENT_URL` accurate; avoid `*` with credentials.
5. **Dependencies:** Run **`npm audit`** regularly; plan **Expo/Jest** upgrade to clear low-severity transitive issues.

---

## 5. Commands you still need (cannot be eliminated)

These are **normal** for any real project:

- `npm install` (after pulling changes)
- `npm run dev` in `backend/` for local API
- `npm start` / `npx expo start` for the app
- Optional: `npm run dev:lan-ip` to print LAN IP for `EXPO_PUBLIC_DEV_API_HOST`

---

## 6. Conclusion

- **Stability / security / optimization “everywhere”** is a **process**, not a one-time script.
- This repo has received **concrete fixes** (networking, CORS, Places `fetch`, safe external links, docs).
- **Remaining work** is listed in §3 and should be **scheduled**, not mass-applied blindly.

*For earlier detail, see `docs/AUDIT_REPORT.md` and `docs/DEV_NETWORKING.md`.*
