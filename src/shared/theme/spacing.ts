/**
 * Design system spacing scale — 4pt base grid.
 * Use for padding, margins, and gaps. Prefer these tokens over magic numbers.
 *
 * Scale:
 * - xs: 4  — tight gaps (icon–text, chip padding)
 * - sm: 8  — compact spacing (list item padding)
 * - md: 16 — default spacing (card padding, section gaps)
 * - lg: 24 — relaxed spacing (section margins)
 * - xl: 32 — large spacing (screen padding, block separation)
 * - xxl: 48 — extra large (hero padding, major sections)
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** @deprecated Use xxl. Kept for backward compatibility. */
  xxxl: 48,
} as const;

export type SpacingKey = keyof typeof spacing;
