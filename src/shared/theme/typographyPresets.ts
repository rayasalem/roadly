/**
 * Typography presets — Uber-style scale + legacy aliases (title, body, …).
 */
import type { FontFamilySet } from './typography';

const heading2 = { fontSize: 20, lineHeight: 28, fontWeight: '600' as const, letterSpacing: 0 };
const heading3 = { fontSize: 18, lineHeight: 24, fontWeight: '600' as const, letterSpacing: 0 };
const body1 = { fontSize: 16, lineHeight: 24, fontWeight: '400' as const, letterSpacing: 0 };
const body2 = { fontSize: 14, lineHeight: 20, fontWeight: '400' as const, letterSpacing: 0 };

export const typographyPresets = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -0.5 },
  heading1: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const, letterSpacing: 0 },
  heading2,
  heading3,
  body1,
  body2,
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const, letterSpacing: 0.2 },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0 },
  title: heading2,
  titleSmall: heading3,
  subtitle: { ...body1, fontWeight: '500' as const },
  body: body1,
  bodySmall: body2,
} as const;

export type TypographyPresetKey = keyof typeof typographyPresets;

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
