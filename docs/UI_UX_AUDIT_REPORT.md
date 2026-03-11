# Roadly – Full UI/UX Audit Report

**Auditor:** Senior Mobile UI/UX Designer  
**Scope:** All listed screens, shared components, design system usage, accessibility, dark mode, RTL.  
**Criteria:** Visual hierarchy, typography, spacing, buttons, cards, forms, empty/loading/error states, accessibility, dark mode readiness, RTL.

---

## 1. Design System Summary

| Token | Status | Notes |
|-------|--------|--------|
| **Colors** | ✅ Centralized | `colors.ts`: primary, navDark, surface, text, semantic. No dark-mode variants. |
| **Typography** | ✅ Presets + locale | `typographyPresets`, `useTypography()` for Poppins/Tajawal. Not all screens use presets. |
| **Spacing** | ✅ 4pt scale | xs=4, sm=8, md=16, lg=24, xl=32, xxl=48. Some hardcoded values (e.g. 12, 14, 24). |
| **Radii** | ✅ Scale | xs→full. Cards use `radii.lg`; some screens use 14, 22, 24, 28. |
| **Shadows** | ✅ sm/md/lg | Platform-specific. Used on Card, GlassCard; some screens add custom shadow objects. |

---

## 2. Screen-by-Screen Analysis

### 2.1 LaunchScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Clear: dark hero with headline, two CTAs below. |
| **Typography** | Headline uses `fontSize: 28`, `fontFamily.bold` — not from presets (display = 28). |
| **Spacing** | Uses `spacing.xl`, `spacing.xxxl`; bottomSection uses `gap` (RN gap). `paddingBottom: spacing.xxxl + 24` is magic number. |
| **Buttons** | Custom styles (primaryBtn, secondaryBtn); not shared `Button`. Border radius 14 (should use `radii.lg` 16). |
| **Empty/Load/Error** | N/A. |
| **Accessibility** | `accessibilityRole` and `accessibilityLabel` on buttons. No `accessibilityHint`. |
| **Dark mode** | Uses `colors.authTopDark`; no light variant. |
| **RTL** | No explicit RTL; layout is vertical. `right: -20` on carAccent could flip in RTL. |

**UI problems**
- Inconsistent button component (custom vs design system Button).
- Magic number 24 in paddingBottom.
- Hardcoded borderRadius 14.

**UX problems**
- No loading or transition state between Launch and Login/Register.
- Secondary button has no visible boundary (text only); low affordance.

**Suggested improvements**
- Use shared `Button` with variant `outline` for primary (white border) and `ghost` for secondary.
- Replace 14 with `radii.lg`, 24 with `spacing.xxl`.
- Use `I18nManager.isRTL` for carAccent position (e.g. `right: I18nManager.isRTL ? undefined : -20, left: I18nManager.isRTL ? -20 : undefined`).

---

### 2.2 WelcomeScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Good: brand → subtitle → two CTAs in a card. |
| **Typography** | brand uses `fontSize.display`, subtitle uses body + lineHeight. |
| **Spacing** | Uses spacing scale; card padding `spacing.xl`. Custom shadow object instead of `shadows.*`. |
| **Buttons** | Uses shared `Button` (primary, outline). ✅ |
| **Accessibility** | Only `accessibilityRole="header"` on brand. Buttons need labels (Button component adds them). |
| **RTL** | Centered layout; should be fine. |

**UI problems**
- Card shadow is custom (`shadowOffset`, `shadowRadius`, etc.) instead of `shadows.md`/`shadows.lg`.
- `borderRadius: 24` → use `radii.xxl` (24) for consistency.

**UX problems**
- None significant.

**Suggested improvements**
- Use `shadows.lg` or `shadows.md` and `radii.xxl` for the card.
- Ensure both buttons have `accessibilityLabel` via i18n.

---

### 2.3 LoginScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Strong: dark top bar, white sheet, title row, form, footer. |
| **Typography** | Mix: title uses `fontSize.title1`, subtitle callout; form uses body/caption. |
| **Spacing** | Generally consistent; `marginBottom: spacing.xl` etc. |
| **Form inputs** | Custom wrappers (`inputWrap`) with icon + TextInput; not shared `Input`. Background `colors.authInputBg`. No focus ring from design system. |
| **Buttons** | Shared `Button` for submit. Back button and "Forgot" are custom TouchableOpacity. |
| **Error state** | Inline `errorText`; no icon or retry. |
| **Loading state** | Global loader (showLoader/hideLoader); no inline button loading on submit. |
| **Accessibility** | Back, eye toggle have labels; "Forgot" and "Remember me" need better semantics (link vs checkbox). |
| **RTL** | `chevron-left` should flip to chevron-right in RTL. |

**UI problems**
- Login form does not use shared `Input` (label, error, focus ring, hint).
- Back button uses green chevron on dark; contrast OK but not from theme token for "back".
- Mock section (dev) uses hardcoded Arabic text.

**UX problems**
- "Remember me" is non-functional (visual only).
- "Forgot password" has no `onPress`.
- No inline loading state on submit button (only global loader).

**Suggested improvements**
- Use shared `Input` for email and password with label, error, and optional hint.
- Add `loading={isSubmitting}` to submit Button.
- Implement or remove "Remember me"; add navigation or modal for "Forgot password".
- Use `I18nManager.isRTL` to flip back icon and layout.

---

### 2.4 RegisterScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Same pattern as Login: dark top, white sheet, form. |
| **Typography** | Consistent with Login. |
| **Form inputs** | Same custom input wrap; no shared `Input`. No inline validation message for email format. |
| **Buttons** | Shared `Button` for submit. |
| **Error state** | Single error text; no per-field errors. |
| **Accessibility** | Similar to Login; role selection (if any) not audited in snippet. |

**UI problems**
- Same as Login: no shared `Input`, custom radii/shadows in places.
- Email validation (e.g. `emailValid`) may not be surfaced in UI.

**UX problems**
- No password strength indicator.
- No confirmation field for password.

**Suggested improvements**
- Use `Input` with `error` for each field; show email format error under email field.
- Add password confirm field and match validation.
- Optional: password strength indicator.

---

### 2.5 HomeScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Header, two input-like rows, two dark cards, section title, rider list. |
| **Typography** | Section title uses `title3`; cards and list use body/caption. |
| **Spacing** | Uses spacing scale; `paddingBottom: spacing.xxl` in scroll. |
| **Cards** | Dark cards use `colors.navDark`, `radii.lg`, minHeight 100. Rider cards use `shadows.sm`, custom layout. |
| **Empty state** | None if NEARBY_RIDERS is empty (list would be empty). |
| **Loading state** | None (static mock data). |
| **Accessibility** | Rider cards: no accessibilityLabel for the card or CTA. |
| **RTL** | `riderAvatar` has `marginRight`; should use marginStart for RTL. |

**UI problems**
- Pickup/Destination inputs are non-editable placeholders; look like inputs but don’t use `Input`.
- Rider card uses `marginRight` for avatar; not RTL-friendly.
- Stars in RiderCard use `key={i}`; prefer key from data.

**UX problems**
- "Saved Places" and "Nearest Locations" both go to Map; no distinct behavior for Saved Places.
- No loading or empty state for "Nearby Riders".
- No pull-to-refresh.

**Suggested improvements**
- Use shared `Input` (read-only or with placeholder) for pickup/destination, or make them clear "tap to set" actions.
- Add `marginStart` and RTL-aware layout for rider cards.
- Add empty state component when list is empty; add loading skeleton when data is async.
- Differentiate Saved Places (e.g. navigate to a saved list or map with saved pins).

---

### 2.6 MapScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Map first, then floating search, filters, bottom card (nearest provider or empty/retry). |
| **Typography** | Uses theme typography for labels, titles, retry text. |
| **Spacing** | Consistent use of spacing and radii. |
| **Buttons** | Shared `Button` for Request Service and retry; filter chips are TouchableOpacity. |
| **Empty state** | "No providers nearby" with icon and retry button. ✅ |
| **Loading state** | Skeleton for bottom card while providers load. ✅ |
| **Error state** | Retry banner when providers fail; location denied state with instructions. ✅ |
| **Accessibility** | locationButton and retry have accessibilityRole/Label. Map and markers need accessible descriptions. |
| **RTL** | Search and filters are horizontal; consider mirroring. |

**UI problems**
- Green circle decoration (`greenCircle`) is fixed position; may overlap content on small screens.
- Filter chips and search bar don’t use shared Button/Input; consistency is OK but could use design tokens for min height.

**UX problems**
- None major; empty, loading, and error states are handled.

**Suggested improvements**
- Add accessibility label for the map (e.g. "Map showing your location and nearby providers").
- Ensure filter chips have `accessibilityState={{ selected: filterRole === role }}`.

---

### 2.7 RequestScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Header, subtitle, two cards (create request, current request). |
| **Typography** | Subtitle and body use theme; card titles use semibold body. |
| **Spacing** | Container uses padding and gap. |
| **Cards** | Surface background, `radii.lg`, `shadows.sm`. |
| **Empty state** | "No active request" text inside second card. ✅ |
| **Loading state** | Text "Creating request…" and "Loading request status…". Could use LoadingSpinner or skeleton. |
| **Error state** | Mutation error shown as text below button. |
| **Accessibility** | Buttons use design system Button (with a11y). Status buttons are small; touch targets OK (min 44pt). |

**UI problems**
- Status row (Accepted, On the way, etc.) is many small buttons; could be chips or segmented control for clarity.
- No icon or illustration in empty state.

**UX problems**
- Creating/loading states are text-only; a small spinner or skeleton would reinforce feedback.

**Suggested improvements**
- Add a subtle loading indicator (spinner or skeleton) for "Creating…" and "Loading request status…".
- Consider chips or a single control for status instead of four separate buttons.
- Add empty state illustration or icon for "No active request".

---

### 2.8 ProfileScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Header, GlassCard (avatar, name, role, rating, status), services section, logout. |
| **Typography** | Presets and theme; section title uses title3. |
| **Spacing** | scrollContent padding, card margins consistent. |
| **Cards** | GlassCard with role theme; PressableCard for services. |
| **Empty state** | If no services, only "Add service" button; no explicit empty message. |
| **Loading state** | Full-screen LoadingSpinner for provider profile. ✅ |
| **Error state** | ErrorWithRetry. ✅ |
| **Accessibility** | Buttons and list items need clear labels; sheet rows need accessibilityState. |
| **RTL** | Avatar and rows could use start/end for padding/margin. |

**UI problems**
- User (non-provider) profile is minimal (single card + logout); no BottomNavBar on provider profile (provider branch has no nav bar in snippet).
- EditServicesSheet: sheet row layout should support RTL (flexDirection row is OK; paddingHorizontal is symmetric).

**UX problems**
- Provider profile has no nav bar in the provided code; ensure it’s present where expected.
- Empty services: consider "No services added yet" + Add service.

**Suggested improvements**
- Add explicit empty state for services: "No services yet. Add your first service."
- Ensure BottomNavBar is shown for customer profile and that provider profile has consistent nav or back.

---

### 2.9 MechanicDashboardScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Header, GlassCard (stats + filter), FlatList of job cards, FAB. |
| **Typography** | Stats and job cards use theme; filter labels from t(). |
| **Spacing** | statsRow, jobCard use spacing scale. |
| **Cards** | GlassCard, PressableCard, StatCard. |
| **Empty state** | FlatList ListEmptyComponent not seen in snippet; recommend adding. |
| **Loading state** | Full-screen LoadingSpinner. ✅ |
| **Error state** | ErrorWithRetry. ✅ |
| **Accessibility** | FAB and filter chips need accessibilityLabel and accessibilityState. |
| **RTL** | Filter chips and job row layout should use start/end. |

**UI problems**
- Filter chips: custom TouchableOpacity; could be a shared Chip or use Button variant.
- Job card action row: Accept/Decline buttons; layout is clear.

**UX problems**
- If jobs list is empty, user should see an empty state, not a blank list.

**Suggested improvements**
- Add ListEmptyComponent to FlatList (e.g. "No jobs right now" with icon).
- Give filter chips accessibilityState={{ selected: true/false }} and accessibilityRole="button".

---

### 2.10 TowDashboardScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Same pattern as Mechanic: GlassCard stats, filter, FlatList of tow jobs. |
| **Typography** | Consistent. |
| **Cards** | GlassCard, PressableCard, StatCard. |
| **Empty/Error/Loading** | Same as Mechanic; add ListEmptyComponent. |
| **RTL** | Same as Mechanic. |

**Suggested improvements**
- Same as Mechanic: ListEmptyComponent, filter chip accessibility.

---

### 2.11 RentalDashboardScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | GlassCard stats, map button, FlatList of vehicles. |
| **Typography** | Consistent. |
| **Cards** | Vehicle cards with status pill (available/rented/maintenance). |
| **Empty state** | Recommend ListEmptyComponent. |
| **RTL** | Use start/end for icon and text layout. |

**Suggested improvements**
- ListEmptyComponent for no vehicles.
- Ensure status pill colors meet contrast (e.g. maintenance).

---

### 2.12 AdminDashboardScreen

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Global stats card, "Manage users" card, tabs (Mechanic/Tow/Rental), per-panel lists. |
| **Typography** | Stats and labels from theme. |
| **Spacing** | scroll padding, statsGrid, manageUsersCard. |
| **Cards** | GlassCard, PressableCard, custom manageUsersCard. |
| **Empty state** | Per-panel lists may need empty states. |
| **Accessibility** | Tabs and list items need roles and labels. |
| **RTL** | Tab bar and lists should mirror. |

**UI problems**
- Many panels and actions; ensure tab order and focus order are logical.
- "Edit" in sheet is TODO; UX is incomplete.

**Suggested improvements**
- Add empty states for each panel (no mechanics, no tow requests, no vehicles).
- Implement Edit flow so the button is functional.
- accessibilityRole="tablist" and "tab" for the role tabs.

---

## 3. Shared Components Analysis

### 3.1 Button

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Variants (primary, secondary, outline, ghost) and sizes (sm, md, lg) are clear. |
| **Typography** | Uses typography presets (bodySmall, body, subtitle) per size. |
| **Spacing** | Padding from spacing scale; minHeight 36/48/52. |
| **Accessibility** | accessibilityRole="button", accessibilityLabel=title, accessibilityState disabled. ✅ |
| **Dark mode** | Colors are from theme; no dark variant (theme is light-only). |
| **RTL** | Centered content; no directional padding. |

**Problems**
- No `accent` variant style (falls back to primary); OK.
- Disabled state is opacity 0.6 only; could add reduced contrast or border for clarity.

**Suggested improvements**
- Consider focus style for web (outline/ring).
- Document minimum touch target 44pt (lg is 52pt ✅).

---

### 3.2 Input

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Label, input wrap (optional adornments), error/hint below. |
| **Typography** | Label medium bodySmall; input body; error/hint caption. |
| **Spacing** | marginBottom on container; padding from spacing. |
| **Focus/Error** | Focus ring (border 2px primary); error ring (border 2px error). ✅ |
| **Accessibility** | accessibilityLabel from label or placeholder; accessibilityState disabled; error has accessibilityLiveRegion="polite". ✅ |
| **RTL** | flexDirection row for adornments; text alignment should follow locale (not set in snippet). |

**Problems**
- Input alignment: no explicit textAlign or writingDirection; may need RTL support for placeholder and value.

**Suggested improvements**
- Use useTypography() or I18nManager for textAlign and writingDirection on TextInput.
- Ensure placeholderTextColor works in dark mode if theme adds dark later.

---

### 3.3 ProviderCard

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Avatar, title row (title + badge), meta (rating, distance), optional CTA. |
| **Typography** | title semibold md; badge and meta caption. |
| **Spacing** | gap spacing.md; padding from Card. |
| **Accessibility** | Card has onPress; no accessibilityLabel for the card or "Request service". |
| **RTL** | Row layout; avatar on "start" would be better (flexDirection row + marginStart). |

**Problems**
- Hardcoded "Request service" default; should use i18n (requestLabel is a prop).
- "Unavailable" is hardcoded English.

**Suggested improvements**
- Add accessibilityLabel combining title, distance, rating (e.g. "{title}, {distance}, rating {rating}").
- Use t() for default requestLabel and "Unavailable".

---

### 3.4 ToastHost

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Single toast at bottom; background by type (success/error/info). |
| **Typography** | Semibold callout; single line or few lines. |
| **Spacing** | position bottom 18, horizontal 12; padding 12/14. |
| **Accessibility** | pointerEvents="none" so touches pass through; message not announced (no accessibilityLiveRegion). |
| **Dark mode** | info uses colors.surface; in dark mode would need dark surface. |

**Problems**
- Toast message not exposed to screen readers (no live region).
- Info toast color: toastColor('info') returns surface; may be low contrast.

**Suggested improvements**
- Wrap message in a view with accessibilityLiveRegion="polite" and accessibilityRole="alert" when visible.
- Consider distinct color for info (e.g. colors.info).

---

### 3.5 LoadingSpinner

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Centered ActivityIndicator + optional message. |
| **Typography** | Message uses callout, textSecondary. |
| **Spacing** | padding 24; marginTop 12 on text. |
| **Accessibility** | No accessibilityLabel on ActivityIndicator; no announcement that loading started/ended. |

**Problems**
- Screen readers may not announce loading state.

**Suggested improvements**
- Add accessibilityLabel="Loading" (or i18n) to the container or a wrapper.
- Consider accessibilityState={{ busy: true }}.

---

### 3.6 ErrorView

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Message + retry button. |
| **Typography** | Message body; button text semibold md. |
| **Spacing** | padding 24; button marginTop lg. |
| **Accessibility** | No accessibilityRole or label on container; button is TouchableOpacity (no explicit role). |
| **Consistency** | ErrorWithRetry uses Button and icon; ErrorView is simpler. Two patterns for error state. |

**Problems**
- ErrorView and ErrorWithRetry overlap; consider consolidating or clearly separating use cases.
- ErrorView button has no accessibilityRole="button" or accessibilityLabel.

**Suggested improvements**
- Use ErrorWithRetry as the standard (icon + message + Button) and deprecate ErrorView or use it only for simple cases.
- Add accessibilityRole="alert" or "status" and accessibilityLabel to error message container.

---

### 3.7 ErrorWithRetry

| Criteria | Assessment |
|----------|------------|
| **Visual hierarchy** | Icon (wifi-off), message, retry Button. ✅ |
| **Typography** | title body; button from Button. |
| **Accessibility** | Has testID; recommend accessibilityLabel for the group and button. |

**Suggested improvements**
- accessibilityRole="alert" on wrap and accessibilityLabel summarizing error + retry action.

---

## 4. Cross-Cutting Checks

### 4.1 Visual hierarchy

- **Good:** Headers (AppHeader) are consistent; section titles use title3 or similar; body/caption for secondary.
- **Gaps:** Some screens use raw fontSize (e.g. 28) instead of presets; Launch and Login mix custom and theme typography.

### 4.2 Typography consistency

- **Good:** Theme has presets; AppText supports locale font (Poppins/Tajawal).
- **Gaps:** Many screens use `Text` + `typography.fontFamily`/`fontSize` instead of `AppText`; Arabic/RTL may not apply to those. Inconsistent use of presets (e.g. title1 vs display).

### 4.3 Spacing consistency

- **Good:** spacing scale used in most screens and components.
- **Gaps:** Magic numbers: 12, 14, 22, 24, 28 in margins/padding/borderRadius. Recommend mapping to spacing/radii.

### 4.4 Button design

- **Good:** Shared Button with variants, sizes, loading, accessibility.
- **Gaps:** LaunchScreen and some nav actions use custom TouchableOpacity; Login "Forgot" and "Remember me" are custom. Inconsistent use of Button.

### 4.5 Card design

- **Good:** Card, GlassCard, PressableCard with elevation and radii; role themes on GlassCard.
- **Gaps:** Some screens use custom View + shadow object instead of Card; WelcomeScreen card shadow is custom. PressableCard uses hardcoded padding 12.

### 4.6 Form inputs

- **Good:** Shared Input has label, error, hint, focus/error ring, adornments.
- **Gaps:** Login, Register, Home (pickup/destination) use custom input wrappers; no shared Input. Validation and error display are ad hoc.

### 4.7 Empty states

- **Good:** MapScreen (no providers), NotificationsScreen (no notifications); RequestScreen (no active request).
- **Gaps:** HomeScreen (nearby riders), dashboard FlatLists (mechanic/tow/rental/admin) lack a consistent empty state component.

### 4.8 Loading states

- **Good:** LoadingSpinner used on profile and dashboards; MapScreen has skeleton for bottom card; global loader for auth.
- **Gaps:** RequestScreen "Creating…" / "Loading…" are text-only; no skeleton for list loading on Home.

### 4.9 Error states

- **Good:** ErrorWithRetry used on map, profile, dashboards, notifications; RequestScreen shows mutation error.
- **Gaps:** Login/Register only inline error text; no retry or recovery CTA. ErrorView vs ErrorWithRetry duplication.

### 4.10 Accessibility

- **Good:** Button and Input have roles and labels; BottomNavBar has tab role and state; some screens have accessibilityLabel.
- **Gaps:** Many TouchableOpacity/ Pressable lack accessibilityLabel; Toast and LoadingSpinner not announced; map and list items need better descriptions; focus order and tab order not audited.

### 4.11 Dark mode readiness

- **Current:** No dark theme. Colors are static (light background, dark nav, green accent).
- **Gaps:** No `useColorScheme`, no dark color set, no semantic tokens (e.g. backgroundPrimary, textPrimary). StatusBar is "dark" (light content on dark nav).

**Suggested approach:** Introduce semantic tokens (e.g. `background`, `surface`, `text`, `textSecondary`) and a theme context that switches sets by color scheme; then replace raw colors with tokens.

### 4.12 RTL compatibility

- **Good:** AppText and useTypography support RTL and locale font; I18nManager used elsewhere.
- **Gaps:** Many layouts use `marginRight`/`marginLeft` or `left`/`right` (e.g. HomeScreen rider avatar, LaunchScreen carAccent, back button chevron). No systematic use of `marginStart`/`marginEnd` or `paddingStart`/`paddingEnd`. Flex direction and icon direction (chevron) not flipped in all screens.

**Suggested approach:** Use logical properties (start/end) for margins and padding; flip icons (chevron, arrow) and asymmetric decorations (e.g. green circle) via RTL-aware style or component.

---

## 5. Global UI Improvement Strategy

### Phase 1 – Consistency (quick wins)

1. **Replace custom buttons with design system Button**  
   LaunchScreen primary/secondary, LoginScreen back and "Forgot", any other custom CTAs. Use variant/size and optional icon slot.

2. **Use shared Input everywhere**  
   Login, Register (email, password, name), and Home pickup/destination (read-only or placeholder). Unify label, error, focus ring, and hint.

3. **Remove magic numbers**  
   Audit all screens for margin/padding/borderRadius; replace with `spacing.*` and `radii.*`. Document exceptions.

4. **Unify error presentation**  
   Choose ErrorWithRetry as default; use it on Login/Register (with retry = "Try again" or "Dismiss"). Deprecate or limit ErrorView to non-retry cases.

5. **Card and shadow consistency**  
   WelcomeScreen and any custom cards: use Card or GlassCard and `shadows.md`/`shadows.lg` instead of custom shadow objects.

### Phase 2 – Empty, loading, and error states

1. **Empty states**  
   Create a reusable `EmptyState` component (icon, title, optional subtitle, optional CTA). Use it in: HomeScreen (no riders), Mechanic/Tow/Rental/Admin lists (no jobs/vehicles), Profile (no services).

2. **Loading states**  
   RequestScreen: add small spinner or skeleton next to "Creating…" / "Loading…". HomeScreen: when data is async, show skeleton list or LoadingSpinner until first load.

3. **Error states**  
   Login/Register: show ErrorWithRetry or inline error with "Try again" that clears and refocuses. Ensure all async flows have a clear error message and one recovery action.

### Phase 3 – Accessibility

1. **Labels and roles**  
   Every interactive element: accessibilityRole, accessibilityLabel (from i18n where possible). Add accessibilityState (selected, disabled, busy) for tabs, filters, and loading.

2. **Live regions**  
   Toast: announce message (accessibilityLiveRegion="polite" or role="alert"). LoadingSpinner: expose "Loading" and consider accessibilityState busy.

3. **Map and lists**  
   Map: accessibilityLabel describing map and user location. Markers: optional label or hint. List items: ensure each item has a unique label (e.g. provider name + distance + rating).

4. **Focus and order**  
   Verify tab order on key screens (Login, Home, Map, Profile). Ensure modals and sheets trap focus and return it on close.

### Phase 4 – Theming and RTL

1. **Dark mode**  
   - Add dark color set and semantic tokens (e.g. background, surface, text, border).  
   - Theme context (or store) from `useColorScheme()`.  
   - Replace direct `colors.*` in components with theme tokens.  
   - Test StatusBar, Toast, and modals in dark mode.

2. **RTL hardening**  
   - Replace marginLeft/marginRight and paddingLeft/paddingRight with marginStart/marginEnd and paddingStart/paddingEnd where layout should flip.  
   - Flip chevrons and directional icons (e.g. back, arrow) in RTL.  
   - Use I18nManager.isRTL or layout direction from theme for decorations (e.g. LaunchScreen car, MapScreen green circle).  
   - Test all main screens in Arabic RTL.

### Phase 5 – Polish and scale

1. **Typography**  
   Prefer `AppText` with variant/weight so locale font and RTL apply everywhere. Where raw `Text` is used, pass fontFamily and textAlign from useTypography().

2. **Unified list pattern**  
   Standardize list screens: ListHeader (optional), FlatList with keyExtractor, ListEmptyComponent (EmptyState), loading (skeleton or spinner), error (ErrorWithRetry). Same pattern for Mechanic, Tow, Rental, Admin, Notifications.

3. **Form validation UX**  
   Per-field validation on blur or submit; show error under each Input; optional success state (e.g. checkmark). Use shared Input error and hint for all forms.

4. **Documentation**  
   Document when to use Button vs TouchableOpacity, Card vs GlassCard vs PressableCard, Input vs custom input, ErrorWithRetry vs ErrorView. Add a short UI checklist for new screens (hierarchy, spacing, empty/loading/error, a11y, RTL).

---

## 6. Summary Table

| Area | Rating | Notes |
|------|--------|------|
| Visual hierarchy | Good | Clear in most screens; a few custom headers/forms. |
| Typography consistency | Fair | Presets exist; many screens use raw Text and mixed sizes. |
| Spacing consistency | Good | Scale used; magic numbers remain. |
| Button design | Good | Button component solid; inconsistent usage. |
| Card design | Good | Card/GlassCard/PressableCard; some custom cards/shadows. |
| Form inputs | Fair | Input component good; Login/Register/Home don’t use it. |
| Empty states | Fair | Map and Notifications OK; lists and profile need more. |
| Loading states | Good | Spinner and skeleton used; a few text-only cases. |
| Error states | Good | ErrorWithRetry widespread; Login/Register and duplication need work. |
| Accessibility | Fair | Some roles/labels; gaps in toasts, loading, lists, map. |
| Dark mode readiness | Not ready | No dark theme or semantic tokens. |
| RTL compatibility | Partial | AppText and fonts; layout and icons need logical props and RTL flip. |

**Overall:** The app has a solid design system and consistent patterns on map, dashboards, and notifications. The largest gains will come from: (1) using shared Button and Input everywhere, (2) adding empty states and tightening loading/error UX, (3) accessibility (labels, live regions, RTL), and (4) preparing for dark mode with semantic tokens and a theme layer.
