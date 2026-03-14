/**
 * Consistent screen and section title sizes.
 * Screen title: 24px (e.g. in AppHeader).
 * Section title: 18px with margin below to avoid overlap.
 */
import { spacing } from './spacing';
import { fontFamilyPoppins } from './typography';

export const SCREEN_TITLE_FONT_SIZE = 24;
export const SCREEN_TITLE_LINE_HEIGHT = 30;

export const SECTION_TITLE_FONT_SIZE = 18;
export const SECTION_TITLE_LINE_HEIGHT = 24;
/** Margin below section titles so content does not overlap */
export const SECTION_TITLE_MARGIN_BELOW = spacing.md;

export const sectionTitleBase = {
  fontFamily: fontFamilyPoppins.semibold,
  fontSize: SECTION_TITLE_FONT_SIZE,
  lineHeight: SECTION_TITLE_LINE_HEIGHT,
  marginBottom: SECTION_TITLE_MARGIN_BELOW,
} as const;
