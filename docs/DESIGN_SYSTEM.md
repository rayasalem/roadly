# Roadly Design System

Central tokens and components for typography, spacing, color, buttons, cards, and inputs.

---

## 1. Typography

**Hierarchy (use `typography.presets` or `AppText` variant):**

| Preset      | Size | Line height | Weight | Use case                    |
|------------|------|-------------|--------|-----------------------------|
| `display`  | 32   | 40          | Bold   | Hero headings, splash       |
| `title`    | 22   | 28          | Semibold | Screen titles, card headings |
| `titleSmall` | 18 | 24        | Semibold | Card titles, list headers  |
| `subtitle` | 16   | 24          | Medium | Section labels, emphasis    |
| `body`     | 16   | 24          | Regular | Paragraphs, form content    |
| `bodySmall`| 14   | 20          | Regular | Secondary content, meta     |
| `caption`  | 12   | 16          | Regular | Hints, metadata, timestamps |

- Use **`AppText`** with `variant` for locale-aware font (Poppins / Tajawal) and RTL.
- Raw `Text`: use `typography.fontFamily.*` and `typography.presets.*.fontSize` / `lineHeight`.

---

## 2. Spacing Scale (4pt grid)

| Token | Value | Use case                          |
|-------|--------|-----------------------------------|
| `xs`  | 4      | Tight gaps (icon–text, chip padding) |
| `sm`  | 8      | Compact (list item padding)       |
| `md`  | 16     | Default (card padding, section gaps) |
| `lg`  | 24     | Relaxed (section margins)         |
| `xl`  | 32     | Large (screen padding)            |
| `xxl` | 48     | Extra large (hero, major sections) |

Import: `import { spacing } from '../theme';`

---

## 3. Colors

- **Brand:** `primary`, `primaryContrast`, `secondary`, `secondaryContrast`, `navDark`
- **Surfaces:** `background`, `surface`, `surfaceElevated`
- **Text:** `text`, `textSecondary`, `textMuted`
- **Borders:** `border`, `borderFocus`
- **Semantic:** `success`, `error`, `warning`, `info` and `*Light` for backgrounds

Use theme tokens only; avoid hardcoded hex in components.

---

## 4. Buttons

**Variants:** `primary` | `secondary` | `outline` | `ghost` | `accent` (alias primary)

**Sizes:** `sm` (36pt min height) | `md` (48pt) | `lg` (52pt)

```tsx
<Button
  title="Submit"
  onPress={onSubmit}
  variant="primary"
  size="lg"
  fullWidth
  loading={isSubmitting}
  disabled={!isValid}
/>
```

- Primary: filled green; Secondary: filled gray; Outline: transparent + green border; Ghost: transparent + green text.

---

## 5. Cards

**Variant:** `elevated` | `outlined` | `flat`  
**Elevation:** `none` | `sm` | `md` | `lg`  
**Padding:** `sm` | `md` | `lg` | `xl` | `xxl` | `xxxl` (from spacing scale)  
**Radius:** `sm` | `md` | `lg` | `xl` (default `lg`)

```tsx
<Card variant="elevated" elevation="sm" padding="lg" radius="lg" onPress={onPress}>
  {children}
</Card>
```

---

## 6. Inputs

- **Label** (optional)
- **Focus state:** 2px primary border; on iOS, subtle primary shadow
- **Error state:** 2px error border + `errorLight` background
- **Helper text:** Shown below when no error; caption style, `textMuted`
- **Error text:** Caption style, `error`, `accessibilityRole="alert"`

```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  hint="We'll never share your email."
  leftAdornment={<Icon name="email-outline" />}
/>
```

---

## 7. Radii & Shadows

**Radii:** `none`, `xs` (4), `sm` (8), `md` (12), `lg` (16), `xl` (20), `xxl` (24), `full`

**Shadows:** `none`, `sm`, `md`, `lg` (platform-specific; use for cards and elevated surfaces)

---

## File reference

| Token / component | Path |
|------------------|------|
| Typography presets | `shared/theme/typographyPresets.ts` |
| Spacing           | `shared/theme/spacing.ts` |
| Colors            | `shared/theme/colors.ts` |
| Radii / shadows   | `shared/theme/radii.ts`, `shadows.ts` |
| Theme barrel      | `shared/theme/index.ts` |
| Button            | `shared/components/Button.tsx` |
| Card              | `shared/components/Card.tsx` |
| Input             | `shared/components/Input.tsx` |
| AppText           | `shared/components/AppText.tsx` |
