# Project audit report (automated + manual review)

**Scope:** MechNow (Expo / React Native + Node backend).  
**Reality check:** A full line-by-line audit of “all files, components, pages, and assets” is not feasible in one pass without dedicated tooling (Snyk, SonarQube, full E2E, visual regression) and staged releases. This document records **what was verified**, **what was changed**, and **what remains**.

---

## 1. Automated / targeted scans performed

| Area | Method | Result |
|------|--------|--------|
| `<iframe>` / embedded external content | Ripgrep (`*.tsx`, `*.ts`, `*.html`) | **None found** in `src/` |
| `dangerouslySetInnerHTML` / `innerHTML` | Ripgrep | **None in `src/`** |
| `eval` / `new Function` | Ripgrep | **None in `src/`** |
| npm dependencies | `npm audit fix` (non–breaking) | **20 packages updated**; remaining issues mostly **low**, tied to **jest-expo → jsdom** chain (fix needs `npm audit fix --force`, **semver-major**) |
| External maps / links | Code review | See fixes below |

---

## 2. Issues detected (high level)

### Security & web

- **No iframes** loading arbitrary external domains were found; nothing to remove or replace.
- **HTTP** is used intentionally for **local dev API** (`localhost`, LAN IP, emulator hosts) in `src/shared/constants/env.ts` — required for Metro/device testing; **production default** uses **HTTPS** (`renderProdApiUrl`).
- **Apple Maps** used `http://maps.apple.com` in `openExternalMap` — updated to **HTTPS** for consistency and to reduce mixed-content concerns if reused in web contexts.
- **HTTPS external links** (e.g. Google Maps fallback) on **web** should open with **`rel="noopener noreferrer"`** semantics; raw `window.open` without that is weaker.

### Tooling / quality

- **TypeScript:** Project-wide `tsc` reports many existing errors (tests, theme typings, i18n keys). **Not auto-fixed** — requires coordinated `tsconfig` / design-system / strings cleanup.
- **ESLint:** No root ESLint config found for the app; **not added** in this pass (large policy decision).
- **Unused CSS/JS removal** at scale needs **bundle analyzers** and test coverage; **not performed** (risk of breaking tree-shaking assumptions).

### Backend

- Input sanitization via **sanitize-html** is already used on several routes (`sanitizeUserInput`).
- **Dev seed user** in `backend/src/index.ts` uses hardcoded credentials in **non-production** only — acceptable for local dev; **must never ship to production** with that pattern unchanged.

### Accessibility

- Many screens rely on React Native primitives; **full WCAG audit** was not run. Recommend systematic pass with **axe** (web) and **Accessibility Inspector** (iOS/Android).

### Network / assets

- Broken API calls depend on **environment** (`EXPO_PUBLIC_API_URL`, backend availability). **No blanket code change** without concrete failing endpoints and logs.

---

## 3. Automatically applied fixes (this audit)

1. **`npm audit fix`** — non-breaking dependency updates (see npm output for remaining advisories).
2. **`src/shared/utils/openExternalUrl.ts`** (new) — opens **http(s)** URLs on **web** via a temporary `<a target="_blank" rel="noopener noreferrer">` click; other schemes use `Linking`.
3. **`src/shared/utils/navigation.ts`** — `https://maps.apple.com/...`; **https** map URLs use `openExternalUrl`, native schemes (`google.navigation:`, etc.) stay on `Linking`.
4. **`src/features/help/presentation/screens/HelpSupportScreen.tsx`** — contact mail uses `openExternalUrl('mailto:...')` for consistent behavior.

---

## 4. Remaining warnings & recommendations

| Priority | Item |
|----------|------|
| High | Resolve **jest-expo / jsdom** advisory chain with a **planned** Expo/Jest upgrade (`npm audit fix --force` is breaking). |
| High | Run **backend** with a real **`DATABASE_URL`** in CI and locally for integration tests. |
| Medium | Add **ESLint + Prettier** (or Biome) and fix **TS** errors in batches (`__tests__/`, `theme/`, `strings`). |
| Medium | **Content-Security-Policy** for web: only after testing; strict CSP can break Expo inline bootstrap. |
| Medium | **E2E (Cypress):** ensure **Expo web** is up on `CYPRESS_BASE_URL` / default **8081** before `npm run crooser`. |
| Low | **Performance:** React.memo / list virtualization where profiles show bottlenecks (measure first). |
| Low | **Cross-browser:** test Safari/Firefox for **web** builds; RN native is not “browser” CSS. |

---

## 5. Production safety checklist (manual)

- [ ] `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_ENVIRONMENT` set correctly for each build.
- [ ] Backend **HTTPS**, **CORS**, **rate limiting**, **secrets** not committed.
- [ ] Remove or guard **dev seed** and any **debug** flags in production builds.
- [ ] Run **`npm audit`** / Dependabot on a schedule.

---

## 6. Second pass (follow-up audit)

| Check | Result |
|-------|--------|
| `iframe` anywhere in repo (`*.tsx`, `*.html`) | **None** — nothing to replace with `<a>` / `window.open`. |
| Central HTTP (`createHttpClient`) | **Already** has interceptors, `toHttpError`, refresh, `onUnauthorized`. |
| `placesApi.ts` `fetch` | **Fixed:** after `fetch`, **`if (!res.ok)`** returns `[]` / `null` before `json()` so HTTP errors are not treated as valid JSON. |

**Still not done in this pass:** project-wide unused CSS/JS removal, fixing all `tsc` errors, CSP headers, full a11y audit — same as §4.

---

*Generated as part of a focused security/UX pass; not a substitute for penetration testing or full QA.*
