# Roadly — Design System & UI Guidelines

**For the full world-class design spec (research, screen structures, UX flow), see [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md).**

## 1. Design philosophy

- **Clean & minimal** — Reduce visual noise so users can focus on location, providers, and actions.
- **Trust & clarity** — Professional palette and clear hierarchy so the app feels reliable (automotive and roadside context).
- **Mobile-first** — Touch targets ≥ 44pt, readable type, and layouts that work on small screens and in daylight (maps).
- **Scalable** — Tokens and components are built so new screens and features stay consistent.

---

## 2. Color palette

| Role | Token | Hex | Usage |
|------|--------|-----|--------|
| **Primary** | `primary` | `#0066CC` | Main CTA, links, brand. Single primary for conversion. |
| **Primary dark** | `primaryDark` | `#0052A3` | Pressed state. |
| **Accent** | `accent` | `#ea580c` | Urgent actions (e.g. “Request help”), tow mechanic, highlights. |
| **Background** | `background` | `#F9FAFB` | App background. |
| **Surface** | `surface` | `#ffffff` | Cards, sheets, inputs. |
| **Text** | `text` | `#111827` | Primary copy. |
| **Text secondary** | `textSecondary` | `#475569` | Labels, secondary info. |
| **Text muted** | `textMuted` | `#9CA3AF` | Placeholders, hints. |
| **Border** | `border` | `#e2e8f0` | Dividers, input borders. |
| **Success** | `success` | `#059669` | Success messages, available status. |
| **Error** | `error` | `#dc2626` | Errors, destructive actions. |
| **Warning** | `warning` | `#d97706` | Warnings, caution. |
| **Map user** | `mapUser` | `#0066CC` | User marker. |
| **Map mechanic** | `mapMechanic` | `#0891b2` | Mechanic marker. |
| **Map tow** | `mapTow` | `#ea580c` | Tow mechanic marker. |
| **Map rental** | `mapRental` | `#7c3aed` | Car rental marker. |

**Why these choices**

- **Blue primary** — Trust and reliability; familiar in automotive and service apps.
- **Amber accent** — High visibility for “Request help” and tow-related actions; not as alarming as red.
- **Light background** — Better readability on maps and in daylight; surfaces stay clear.
- **Neutrals** — Slate scale keeps hierarchy clear and works well with blue/amber.

---

## 3. Typography

- **Scale** (mobile-first): `xs` 12 → `sm` 14 → `md` 16 → `lg` 18 → `xl` 20 → `xxl` 24 → `xxxl` 28.
- **Weights**: `regular` (400), `medium` (500), `semibold` (600), `bold` (700).
- **Line height**: `tight` 1.25 (headings), `normal` 1.5 (body), `relaxed` 1.625 (long copy).

**Usage**

- **Screen titles**: `xxl` or `xl`, semibold.
- **Section titles**: `lg`, semibold.
- **Body / list**: `md`, regular.
- **Captions / metadata**: `sm`, regular or medium; `textSecondary` or `textMuted`.

---

## 4. Spacing & layout

- **Spacing scale**: `xs` 4 → `sm` 8 → `md` 12 → `lg` 16 → `xl` 24 → `xxl` 32 → `xxxl` 48.
- **Screen padding**: typically `xl` (24) horizontal; vertical as needed.
- **Between sections**: `lg`–`xl`.
- **Between related elements**: `sm`–`md`.

---

## 5. Radii & elevation

- **Radii**: `xs` 4 → `sm` 8 → `md` 12 → `lg` 16 → `xl` 20 → `xxl` 24 → `full` (pill).
- **Buttons / inputs**: `radii.md` (12).
- **Cards / sheets**: `radii.lg` (16).
- **Shadows**: `sm` (subtle cards), `md` (modals, FAB), `lg` (bottom sheets).

---

## 6. Components (design system)

| Component | Purpose |
|-----------|--------|
| **Button** | Variants: `primary`, `accent`, `outline`, `ghost`. Sizes: `sm`, `md`, `lg`. Optional `fullWidth`, `loading`. |
| **Input** | Text field with optional `label`, `error`, `hint`, left/right adornments. |
| **Card** | Variants: `elevated`, `outlined`, `flat`. Optional `onPress`, configurable padding. |
| **LoadingSpinner** | Full-screen or inline loading. |
| **ErrorView** | Error message + optional retry. |
| **Skeleton** | Loading placeholders. |
| **ToastHost** | Global toasts (success / error / info). |
| **ErrorBoundary** | App-level error fallback. |
| **ProviderCard** | Provider row: title, subtitle, distance, optional “Request service” (accent). For lists and map bottom sheet. |

All components use theme tokens only (no hardcoded colors/sizes) so they stay reusable and scalable.

---

## 7. Screen structure suggestions

### Splash

- Logo + app name centered.
- Background: `background` or `primary` (minimal).
- After auth/init: navigate to Onboarding (first launch) or Home/Login.

### Onboarding

- 3–4 short slides: value proposition (find mechanic / tow / rental), location permission, trust (professional look).
- Large illustration or icon per slide; primary CTA at bottom (“Next” / “Get started”).
- Final slide: “Enable location” CTA → request permission → go to Home or Login.

### Login / Register

- Single scrollable form: email, password; register adds name and role (or role selection after signup).
- Primary button: “Sign in” / “Create account”.
- Secondary link: “Forgot password?”, “Already have an account?”.
- Use `Input` with `label` and `error`; no API logic in the component.

### Home (map-based)

- **Top**: Header with title (e.g. “Find help”) and profile/notifications.
- **Center**: Full-screen map; user marker (blue); provider markers (mechanic / tow / rental) with distinct colors.
- **Bottom**: Horizontal chip filters (Mechanic, Tow, Rental) and a bottom sheet or card list of “Nearest” (distance + ETA).
- **FAB or bar**: “Request mechanic” / “Request tow” / “Find rental” as primary or accent CTA.
- Tapping a marker or list item opens **Provider details**.

### Provider details

- Card/sheet: provider name, type (mechanic / tow / rental), distance, ETA, availability.
- Actions: “Request service” (accent) or “Contact” (outline).
- Optional: small map snippet with user and provider pins.

### Request flow

- After “Request service”: confirm provider → optional note → “Send request” (accent).
- Success: toast + navigate to “My requests” or home.
- Clear steps and a single primary action per screen.

### Profile

- List of items: Account, Notifications, Language, Help, Log out.
- Role-specific: Mechanic/Tow/Rental see “Availability” and “My location”; Admin sees “Manage users/providers”.

---

## 8. Map-specific UI

- **User marker**: Blue (`mapUser`), always visible when location is on.
- **Provider markers**: Mechanic = teal, Tow = amber, Rental = violet (`mapMechanic`, `mapTow`, `mapRental`).
- **On marker tap**: Show a compact callout or bottom sheet with name, type, distance, and “Request” / “Contact”.
- **Clustering**: When many markers, cluster and expand on zoom or tap.
- **Bottom sheet**: Use `surface` + `radii.lg` and `shadows.lg` so it reads as a card over the map.

---

## 9. Visual hierarchy

1. **Primary action** per screen: one main CTA (primary or accent).
2. **Secondary actions**: outline or ghost buttons, or text links.
3. **Content**: use `text` for primary, `textSecondary` for supporting, `textMuted` for hints.
4. **Sections**: spacing (e.g. `xl`) and optional section titles (`lg`, semibold).

---

## 10. Recommended UX flow

**User opens app → Location detected → Nearest providers shown → User selects provider → Sends request**

1. **Launch** — Splash then auth or home (if already logged in).
2. **First-time** — Onboarding → “Enable location” → permission request.
3. **Home** — If permission granted: get position → show user on map → fetch nearby providers (with role filter) → show markers + list sorted by distance.
4. **Discovery** — User can filter by Mechanic / Tow / Rental; list and map update; distance (and optional ETA) visible.
5. **Selection** — Tap marker or list item → Provider details (name, type, distance, ETA, “Request service” / “Contact”).
6. **Request** — Tap “Request service” → confirmation (optional note) → “Send request” → success toast and navigation.
7. **Ongoing** — Provider gets request; user can see status in “My requests” or home.

**Principles**

- Ask for location once in context (e.g. when entering map or “Find help”), with a short explanation.
- Always show “Nearest” first (distance + ETA) so the value is obvious.
- One main action per screen (e.g. “Request service” on provider details).
- Clear feedback: loading (skeleton/spinner), success (toast), errors (toast or inline with retry).

---

## 11. Accessibility & scalability

- **Touch targets**: minimum 44pt height for buttons and list rows.
- **Contrast**: text on `background`/`surface` meets WCAG AA where possible.
- **Scale**: New screens use the same tokens (colors, spacing, typography, radii, shadows) and shared components so the app stays consistent as you add roles and features.
