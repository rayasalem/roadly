import { colors } from './colors';
import { radii, borderRadius } from './radii';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { fontFamilyPoppins } from './typography';
import { typographyPresets } from './typographyPresets';

export { spacing, borderRadius };

/** Font family — Poppins (default). Use getFontFamilyForLocale(locale) or useTypography() for Arabic (Tajawal). */
export const fontFamily = fontFamilyPoppins;

/**
 * Typography — design system hierarchy.
 * Presets: display, title, titleSmall, subtitle, body, bodySmall, caption.
 * fontSize map includes legacy keys for backward compatibility.
 */
export const typography = {
  fontFamily,
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
    /** Screen title (e.g. AppHeader): 24px */
    title1: 24,
    /** Section title: 18px */
    sectionTitle: typographyPresets.titleSmall.fontSize,
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
    caption: typographyPresets.caption.lineHeight,
    body: typographyPresets.body.lineHeight,
    title: typographyPresets.title.lineHeight,
    display: typographyPresets.display.lineHeight,
  },
} as const;

export { colors, radii, shadows };
export { cardBase, cardSectionGap, cardElementGap } from './cardStyles';
export {
  SCREEN_TITLE_FONT_SIZE,
  SCREEN_TITLE_LINE_HEIGHT,
  SECTION_TITLE_FONT_SIZE,
  SECTION_TITLE_LINE_HEIGHT,
  SECTION_TITLE_MARGIN_BELOW,
  sectionTitleBase,
} from './titleStyles';
export { typographyPresets } from './typographyPresets';
export type { TypographyPresetKey } from './typographyPresets';
export type { SpacingKey } from './spacing';
export {
  getFontFamilyForLocale,
  useTypography,
  fontFamilyPoppins,
  fontFamilyTajawal,
} from './typography';
export type { FontFamilySet } from './typography';
export const theme = { colors, spacing, typography, radii, shadows } as const;
export type AppTheme = typeof theme;

export {
  useTheme,
  theme as unifiedThemeStatic,
  getColorsForScheme,
  componentPresets,
  baseTheme,
} from './unifiedTheme';
export type { UnifiedTheme, ResolvedColorScheme, ColorPalette, RoleThemeId } from './unifiedTheme';
export { ThemeProvider, useThemeContext } from './ThemeContext';
