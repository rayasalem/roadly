/**
 * Design system typography — five-level hierarchy.
 * Use with useTypography() for locale-aware font family (Poppins / Tajawal).
 *
 * Hierarchy:
 * - display: Hero headings, splash titles (32px)
 * - title: Screen titles, card headings (22px)
 * - subtitle: Section labels, emphasis text (16px medium)
 * - body: Paragraphs, form labels, list content (16px)
 * - caption: Hints, metadata, timestamps (12px)
 */
import type { FontFamilySet } from './typography';

export const typographyPresets = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
  // Optional: bodySmall for secondary content (e.g. list meta)
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  // Optional: titleSmall for card titles, list headers
  titleSmall: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
} as const;

export type TypographyPresetKey = keyof typeof typographyPresets;

/** Map preset weight to font family key for a given FontFamilySet */
export function getFontFamilyKeyForPreset(
  presetKey: TypographyPresetKey,
  fontFamily: FontFamilySet,
): keyof FontFamilySet {
  const preset = typographyPresets[presetKey];
  const w = preset.fontWeight;
  if (w === '700') return 'bold';
  if (w === '600') return 'semibold';
  if (w === '500') return 'medium';
  return 'regular';
}
