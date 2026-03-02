import { colors } from './colors';
import { radii } from './radii';
import { shadows } from './shadows';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Typography scale — global app hierarchy (Display → Caption). */
export const typography = {
  fontSize: {
    caption: 12,
    callout: 14,
    body: 16,
    title3: 18,
    title2: 20,
    title1: 24,
    display: 28,
    // Aliases for compatibility
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    caption: 1.4,
    body: 1.5,
    title: 1.35,
  },
} as const;

export { colors, radii, shadows };
export const theme = { colors, spacing, typography, radii, shadows } as const;
export type AppTheme = typeof theme;

