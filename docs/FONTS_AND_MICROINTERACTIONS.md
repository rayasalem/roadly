# Fonts & Micro-interactions — Roadly

## 1) Font setup

- **Font**: **Poppins** (Regular 400, Medium 500, SemiBold 600, Bold 700).
- **Package**: `@expo-google-fonts/poppins` (added in `package.json`).
- **Loading**: `FontLoader` in `src/shared/providers/FontLoader.tsx` uses `useFonts()` to load the four weights before rendering the app. A loading spinner is shown until fonts are ready.
- **Theme**: `src/shared/theme/index.ts` exports `fontFamily`: `regular`, `medium`, `semibold`, `bold` (e.g. `Poppins_400Regular`). `typography` now includes `fontFamily`; all text styles use it instead of `fontWeight` where a custom font is required.
- **i18n / Arabic**: Poppins is used for all UI; Arabic script may fall back to system font for glyphs Poppins doesn’t support. For full Arabic typography you can later add a secondary font (e.g. Cairo or Tajawal) and switch by locale.

**Install**: run `npm install` so `@expo-google-fonts/poppins` is installed.

---

## 2) Where the font is applied

- **Shared components**: `Button`, `Input`, `ProviderCard`, `LoadingSpinner`, `ToastHost`, `ErrorView`, `ErrorBoundary` — all use `typography.fontFamily.*` (and optionally `typography.fontSize`) in their `StyleSheet` text styles.
- **Screens**:
  - **Auth**: `LaunchScreen`, `WelcomeScreen`, `LoginScreen`, `RegisterScreen` — titles and body use `fontFamily` (bold for headings, regular for body/links).
  - **Home**: `HomeScreen` — greeting, section titles, service cards, nearby cards, search, profile link use Poppins.
  - **Map**: `MapScreen`, `MapScreen.web` — header title, info card, labels use Poppins.
  - **Requests**: `RequestScreen` — heading, card titles, body, error text use Poppins.
  - **Profile**: `ProfileScreen` — title, labels, values use Poppins.
  - **Dashboards**: `MechanicDashboardScreen`, `TowDashboardScreen`, `RentalDashboardScreen` — title and body use Poppins.

**New component**: `AppText` in `src/shared/components/AppText.tsx` — optional wrapper that applies `variant` (display, title1–3, body, callout, caption) and `weight` (regular, medium, semibold, bold) with Poppins. You can use it for new screens or replace plain `Text` where you want semantic typography.

---

## 3) Micro-interactions

- **Buttons**: Existing scale-on-press (0.97) in `Button` and `Card` is unchanged; button labels now use Poppins.
- **Cards**: Service cards and nearby cards on Home already use scale animation on press; no change to behavior.
- **Login**: Title and subtitle fade in and slide up on mount (opacity + `translateY`). Form block fades in.
- **Headings on load**: Login screen uses `Animated` for the card header and form; other screens (Home, etc.) already use fade/slide where implemented. New screens can follow the same pattern (opacity + optional `translateY` on mount).

No extra “color change or shadow on press” was added so the app stays minimal; you can add them later (e.g. opacity or shadow in `pressed` state) using the same pattern as the existing button/card styles.

---

## 4) Files touched

| File | Change |
|------|--------|
| `package.json` | Added `@expo-google-fonts/poppins`. |
| `src/shared/theme/index.ts` | Added `fontFamily` (Poppins weights); typography uses it. |
| `src/shared/providers/FontLoader.tsx` | **New** — loads Poppins, shows spinner until ready. |
| `src/shared/providers/AppProviders.tsx` | Wraps app with `FontLoader`. |
| `src/shared/components/AppText.tsx` | **New** — optional Poppins text with variant/weight. |
| `src/shared/components/Button.tsx` | Button label uses `typography.fontFamily.semibold`. |
| `src/shared/components/Input.tsx` | Label, input, error, hint use `typography.fontFamily`. |
| `src/shared/components/ProviderCard.tsx` | Title, badge, rating, distance use `typography.fontFamily`. |
| `src/shared/components/LoadingSpinner.tsx` | Message uses `typography.fontFamily.regular`. |
| `src/shared/components/ToastHost.tsx` | Toast text uses `typography.fontFamily.semibold`. |
| `src/shared/components/ErrorView.tsx` | Message and button text use Poppins. |
| `src/shared/components/ErrorBoundary.tsx` | Title, message, button text use Poppins. |
| `src/features/auth/.../LaunchScreen.tsx` | Logo uses `typography.fontFamily.bold`. |
| `src/features/auth/.../WelcomeScreen.tsx` | Brand and subtitle use Poppins. |
| `src/features/auth/.../LoginScreen.tsx` | All text styles use Poppins; title/subtitle and form fade/slide on load. |
| `src/features/auth/.../RegisterScreen.tsx` | All text styles use Poppins. |
| `src/features/home/.../HomeScreen.tsx` | All text and service/nearby card styles use Poppins. |
| `src/features/map/.../MapScreen.tsx` | Header and info card text use Poppins. |
| `src/features/map/.../MapScreen.web.tsx` | All text styles use Poppins. |
| `src/features/requests/.../RequestScreen.tsx` | Heading, card title, body, error use Poppins. |
| `src/features/profile/.../ProfileScreen.tsx` | Title, labels, values use Poppins. |
| `src/features/mechanic/.../MechanicDashboardScreen.tsx` | Title and body use Poppins. |
| `src/features/tow/.../TowDashboardScreen.tsx` | Title and body use Poppins. |
| `src/features/rental/.../RentalDashboardScreen.tsx` | Title and body use Poppins. |
| `src/shared/i18n/strings.ts` | Added `map.title`, `map.nearest`, `map.noProviders`, `map.cta.start` (EN/AR); completed en block for profile/request/map. |

---

## 5) Consistency with design system

- Colors, spacing, radii, and shadows are unchanged; only font and (on Login) entrance animation were added.
- New text uses `typography.fontSize.*` and `typography.fontFamily.*` so future theme or font changes stay in one place.
