# MechNow design system (Uber/Careem-style)

## Tokens

| Token | Location | Notes |
|--------|-----------|--------|
| Colors (light/dark) | `src/shared/theme/colors.ts`, `useTheme()` | Primary green `#22C55E`, Uber-style blacks for dark nav |
| Spacing / radii / shadows | `src/shared/theme/spacing.ts`, `radii.ts`, `shadows.ts` | 8pt grid |
| Typography | `src/shared/theme/typography*.ts` | Poppins |
| Component presets | `src/shared/theme/unifiedTheme.ts` → `componentPresets` | Button / input / card min heights |
| Breakpoints | `src/shared/design/layout.ts` | `BREAKPOINT_DESKTOP` (960), `CONTENT_MAX_WIDTH` (1200), `SIDE_NAV_WIDTH` (260) |

## Navigation

- **Tab config:** `src/shared/navigation/navTabs.ts` (`NAV_TABS`, `NavTabId`) — single source for bottom + side nav.
- **Mobile / narrow web:** `BottomNavBar` — 5 tabs, optional dark (Uber) mode.
- **Desktop web (≥ 960px):** `SideNavRail` — same tabs, vertical rail.
- **`ScreenWrapper`:** pass `responsiveNav` + `bottomNavConfig={{ activeTab, onSelect, dark?, labels? }}` to auto-switch rail vs bottom bar on web; native always uses bottom bar.

## Core components

| Component | File | Purpose |
|-----------|------|--------|
| `Button` | `shared/components/Button.tsx` | Variants, loading, web **hover** (Pressable `hovered`) |
| `Input` | `shared/components/Input.tsx` | Label, focus ring, error — **theme-aware** (light/dark) |
| `Card` | `shared/components/Card.tsx` | Elevated / outlined — **theme-aware** surface |
| `AppModal` | `shared/components/AppModal.tsx` | Centered modal, primary/secondary actions |
| `ListRow` | `shared/components/ListRow.tsx` | Standard list row (icon, title, subtitle, trailing) |

## Hooks

- `useResponsive()` — `width`, `isDesktop`, `isWeb`, `contentMaxWidth`.

## Imports

```ts
import { BREAKPOINT_DESKTOP, CONTENT_MAX_WIDTH } from '@/shared/design/layout';
import type { NavTabId } from '@/shared/navigation/navTabs';
```

## Screens using responsive shell

- `HomeScreen`, `RequestScreen`, `RequestHistoryScreen`, `NotificationsScreen`, `SettingsScreen`, `ChatScreen` — `ScreenWrapper` + `responsiveNav`.
- `MapScreen.web` — `SideNavRail` + conditional `BottomNavBar` for narrow web.

## Accessibility

- Tabs: `accessibilityRole="tab"`, `accessibilityState.selected`.
- Buttons / inputs: labels and roles preserved from existing components.
