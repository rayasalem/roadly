/**
 * Unified theme: central object for colors, spacing, typography, and component presets.
 * Use useTheme() for scheme-aware colors (light/dark). Use theme for static values.
 */
import { useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { colors as lightColors, darkColors, type ColorPalette } from './colors';
import { useThemeStore } from '../../store/themeStore';
import { spacing } from './spacing';
import { radii } from './radii';
import { shadows } from './shadows';
import { fontFamilyPoppins } from './typography';
import { typographyPresets } from './typographyPresets';
import { ROLE_THEMES, type RoleThemeId } from './roleThemes';

const typography = {
  fontFamily: fontFamilyPoppins,
  presets: typographyPresets,
  fontSize: {
    caption: typographyPresets.caption.fontSize,
    callout: typographyPresets.bodySmall.fontSize,
    body: typographyPresets.body.fontSize,
    bodySmall: typographyPresets.bodySmall.fontSize,
    subtitle: typographyPresets.subtitle.fontSize,
    title3: typographyPresets.titleSmall.fontSize,
    titleSmall: typographyPresets.titleSmall.fontSize,
    title2: 20,
    title1: 24,
    title: typographyPresets.title.fontSize,
    display: typographyPresets.display.fontSize,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  fontWeight: { regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const },
  lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.625, caption: typographyPresets.caption.lineHeight, body: typographyPresets.body.lineHeight, title: typographyPresets.title.lineHeight, display: typographyPresets.display.lineHeight },
} as const;

export type { ColorPalette, RoleThemeId };

/** Resolved color scheme (light or dark). */
export type ResolvedColorScheme = 'light' | 'dark';

function resolveColorScheme(
  preference: 'light' | 'dark' | 'system',
  system: 'light' | 'dark' | null
): ResolvedColorScheme {
  if (preference === 'system') return system === 'dark' ? 'dark' : 'light';
  return preference;
}

/** Get palette for a given resolved scheme. */
export function getColorsForScheme(scheme: ResolvedColorScheme): ColorPalette {
  return scheme === 'dark' ? darkColors : lightColors;
}

/** Component presets — use with theme.colors for scheme-aware styling. */
export const componentPresets = {
  button: {
    primary: {
      minHeight: 48,
      borderRadius: 12,
      paddingHorizontal: 24,
    },
    secondary: {
      minHeight: 44,
      borderRadius: 10,
      paddingHorizontal: 20,
    },
    small: {
      minHeight: 36,
      borderRadius: 8,
      paddingHorizontal: 16,
    },
  },
  input: {
    default: {
      minHeight: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      borderWidth: 1.5,
    },
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
  },
} as const;

/** Base theme (no scheme — use for spacing, radii, shadows, typography). */
export const baseTheme = {
  spacing,
  radii,
  shadows,
  typography,
  componentPresets,
  roleThemes: ROLE_THEMES,
} as const;

export type UnifiedTheme = typeof baseTheme & { colors: ColorPalette; colorScheme: ResolvedColorScheme };

/**
 * Hook: returns unified theme with colors resolved from user preference and system.
 * Use in components for consistent, role-aware, light/dark styling.
 */
export function useTheme(): UnifiedTheme {
  const preference = useThemeStore((s) => s.colorSchemePreference);
  const systemScheme = useRNColorScheme();
  const system = systemScheme === 'light' || systemScheme === 'dark' ? systemScheme : null;
  const colorScheme = useMemo(
    () => resolveColorScheme(preference, system),
    [preference, system]
  );
  const themeColors = useMemo(
    () => getColorsForScheme(colorScheme),
    [colorScheme]
  );
  return useMemo(
    () => ({
      ...baseTheme,
      colors: themeColors,
      colorScheme,
    }),
    [themeColors, colorScheme]
  );
}

/** Static theme (light colors only) for use outside components or when theme context isn't needed. */
export const theme = {
  ...baseTheme,
  colors: lightColors,
  colorScheme: 'light' as ResolvedColorScheme,
} as UnifiedTheme;
