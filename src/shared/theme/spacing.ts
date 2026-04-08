/**
 * Design system spacing scale — consistent UI rules.
 * Use for padding, margins, and gaps. Prefer these tokens over magic numbers.
 *
 * Rules:
 * - Padding (screen/content): 16px (md)
 * - Card spacing (between cards): 12px (card)
 * - Section spacing (between sections): 24px (lg)
 *
 * Scale:
 * - xs: 4   — tight gaps (icon–text, chip padding)
 * - sm: 8   — compact spacing (list item padding)
 * - card: 12 — spacing between cards
 * - md: 16  — default padding (screen, content)
 * - lg: 24  — section spacing
 * - xl: 32  — large spacing (block separation)
 * - xxl: 48 — extra large (hero, major sections)
 */
export const spacing = {
  xs: 4,
  sm: 8,
  card: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** @deprecated Use xxl. Kept for backward compatibility. */
  xxxl: 48,
} as const;

/** Border radius scale (Uber-style); use with StyleSheet or alongside `radii` from theme. */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type SpacingKey = keyof typeof spacing;
