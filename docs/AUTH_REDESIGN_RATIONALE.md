# Auth Screens Redesign — Design Rationale

**Goal:** World-class, production-level Login and Register UI (App Store / Google Play quality).  
Every decision below is explained so the design is reproducible and defensible.

---

## 1. Why separate Login and Register into different screens

- **Single responsibility:** One screen = one job. Login is "sign in"; Register is "create account." Mixing both on one scrollable page adds cognitive load and makes the primary CTA ambiguous.
- **Conversion:** Each screen has exactly one primary action (Sign in / Create account). Users know what to do; analytics and A/B tests are clearer.
- **Familiar pattern:** Most global apps (Uber, Airbnb, banking) use separate screens. Users expect "Sign in" and "Create account" as distinct entry points from a welcome/landing screen.

---

## 2. Visual hierarchy: title → subtitle → content → CTA

- **Large bold screen title (e.g. 24–28px):** The first thing the eye hits. It answers "Where am I?" (Sign in / Create account). Size and weight (semibold/bold) establish the screen’s purpose.
- **Clear subtitle (e.g. 14–16px, secondary color):** One short line that sets context or benefit (e.g. "Use your account to continue" / "Join to find mechanics and rentals nearby"). Keeps the layout from feeling like a bare form.
- **Spacing between sections:** We use a **spacing scale** (e.g. 24px between title and subtitle, 32px between subtitle and form, 24px between form and CTA). Consistent rhythm makes the screen feel intentional and premium; random gaps feel amateur.

---

## 3. Layout structure: optional hero, centered content, balanced whitespace

- **Optional illustration or visual at top:** A small brand mark or abstract shape (no clip art) gives the top of the screen a clear "anchor" and makes the screen feel product-level. We keep it minimal so it doesn’t compete with the form. If we skip imagery, we use the app name/logo and rely on typography and spacing.
- **Centered content with max width:** On large phones/tablets, the form is not full bleed. Content is centered and optionally constrained (e.g. max 400px) so lines of text and inputs don’t stretch too wide. Padding is consistent (e.g. 24px horizontal from design system).
- **Balanced whitespace:** We avoid cramming. Space above and below the form, and between inputs, follows the spacing scale. "Air" around the CTA makes it feel like the main action.

---

## 4. CTA button: primary style, pressed state, height, full width

- **Strong primary style:** One filled button in the primary brand color (#0066CC). No competing secondary filled buttons on the same screen. "Sign in" / "Create account" is the only primary CTA.
- **Pressed/active state:** We use `TouchableOpacity` with `activeOpacity={0.8}` so the button visibly dims on press. This gives immediate feedback and meets platform expectations.
- **Minimum height 44px:** Apple HIG and Android guidelines recommend at least 44pt/48dp for touch targets. We use **48px** for the main CTA so it’s easy to tap and accessible.
- **Full width:** The primary button spans the content width (with the same horizontal padding as the form). It’s the natural "end" of the form and is easy to find and tap.

---

## 5. Inputs: clear labels, error state, focus state, spacing

- **Clear labels (above field):** We use a visible label above each input (not only placeholder). Placeholders can disappear when typing; labels stay, so users always know what the field is. Labels use secondary text color and medium weight.
- **Error state:** When validation fails, we show an error message below the field and change the border to the semantic error color. One error at a time (e.g. "Invalid email") keeps the UI clear.
- **Focus state:** When the field is focused, we change the border color (e.g. to primary) and optionally increase border width (e.g. 2px). This shows which field is active and supports keyboard/screen reader users.
- **Consistent spacing:** Inputs use the design system: e.g. 12px between label and field, 16px between fields, 48–52px input height. All inputs share the same vertical rhythm.

---

## 6. Design system usage (colors, typography, spacing, radii, shadows)

- **Color palette:** Primary for CTA and focus; neutrals for background, surface, text hierarchy; semantic colors only for success/error. No extra colors.
- **Typography scale:** Title (e.g. title1 24px), subtitle (callout/body), labels (callout/sm), body in inputs (body 16px). We don’t invent new sizes.
- **Spacing scale:** 4/8/12/16/24/32/48. Screen padding 24px; section gaps 24–32px; between inputs 12–16px.
- **Radii:** Inputs and buttons use the same radius (e.g. 12px) for consistency. Cards/surfaces use 16px.
- **Shadows:** Used sparingly (e.g. optional soft shadow on a card behind the form). We don’t add heavy shadows to inputs or buttons so the UI stays clean.

---

## 7. Accessibility: touch targets and contrast

- **Touch targets ≥ 44px:** Buttons and tappable links have at least 44pt height. We don’t rely on tiny "Forgot password?" or "Sign in" text alone; we ensure the tap area is large enough or add padding.
- **Contrast:** Text on background uses the theme: primary text on background/surface meets contrast guidelines. Error text on background is readable. We avoid low-contrast gray on gray.
- **Labels and roles:** Inputs have visible labels and optional `accessibilityLabel`; buttons have `accessibilityRole="button"` and a clear `accessibilityLabel` so screen readers announce them correctly.

---

## 8. Element placement and flow

- **Title at top:** First thing the user sees; establishes context.
- **Subtitle directly under title:** Reinforces the purpose without scrolling.
- **Form in the middle:** Logical order (e.g. email then password; or name, email, password for register). One column; no side-by-side fields on mobile.
- **Primary CTA after the form:** Natural "complete the flow" action. Full width so it’s obvious.
- **Secondary links (Forgot password? / Create account / Sign in) near the CTA:** Related to the same flow but visually secondary (text link or ghost button). Placed so the user finds them after attempting the main action if needed.
- **Keyboard avoidance:** Form screens sit inside `KeyboardAvoidingView` and optionally `ScrollView` so the focused input and CTA stay visible when the keyboard is open.

This structure (title → subtitle → form → primary CTA → secondary links) is used on both Login and Register for consistency and predictability.
