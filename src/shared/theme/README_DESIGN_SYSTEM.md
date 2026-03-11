# Design System

## Typography

**Presets** (`typography.presets`): semantic scale for consistent hierarchy.

| Preset      | Font size | Line height | Weight  | Use case           |
|------------|-----------|-------------|---------|--------------------|
| `display`  | 28        | 36          | bold    | Hero, splash       |
| `title`    | 22        | 28          | semibold| Screen titles      |
| `titleSmall` | 18     | 24          | semibold| Section headers    |
| `subtitle` | 16        | 24          | medium  | Subtitles, labels   |
| `body`     | 16        | 24          | regular | Body copy          |
| `bodySmall`| 14        | 20          | regular | Secondary text     |
| `caption`  | 12        | 16          | regular | Hints, metadata    |

Legacy keys (`fontSize.title1`, `title2`, `title3`, `callout`) remain for backward compatibility. Use `useTypography()` for locale-aware font family (Poppins / Tajawal).

---

## Spacing

4pt base scale. Use for padding, margins, and gaps.

| Token | Value |
|-------|-------|
| `xs`  | 4  |
| `sm`  | 8  |
| `md`  | 16 |
| `lg`  | 24 |
| `xl`  | 32 |
| `xxl` | 48 |
| `xxxl`| 48 (alias) |

---

## Colors

- **Primary:** CTAs, active states (`primary`, `primaryContrast`).
- **Secondary:** De-emphasized actions (`secondary`, `secondaryContrast`).
- **Semantic:** `success`, `error`, `warning`, `info` (and `*Light` where needed).
- **Surfaces:** `background`, `surface`, `border`, `borderFocus`.
- **Text:** `text`, `textSecondary`, `textMuted`.

---

## Button

**Variants:** `primary` | `secondary` | `outline` | `ghost`. (`accent` is alias for `primary`.)

**Sizes:** `sm` (36px min height), `md` (48px), `lg` (52px).

Uses `spacing` for padding and `typography.presets` for label size. Press animation: scale 0.97.

---

## Card

**Variants:** `elevated` | `outlined` | `flat`.

**Elevation:** `none` | `sm` | `md` | `lg` (maps to shadow tokens). Default: `sm` for elevated, `none` for others.

**Padding:** `sm` | `md` | `lg` | `xl` | `xxl` | `xxxl` (from spacing scale).

**Radius:** `radii.lg` for all cards.

---

## Input

- **Label:** Optional; uses `presets.bodySmall`, medium weight.
- **Focus:** 2px border in `borderFocus` (primary green).
- **Error:** 2px border in `error`; error message below with `presets.caption`, red.
- **Helper text:** Optional `hint`; shown below when no error; `presets.caption`, muted.

Min height 48px; border radius `radii.md`. Use `leftAdornment` / `rightAdornment` for icons.

---

## Radii & shadows

- **Radii:** `xs`(4) … `lg`(16) … `xxl`(24), `full`.
- **Shadows:** `none`, `sm`, `md`, `lg` (iOS + Android elevation).
