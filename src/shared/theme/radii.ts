/**
 * Border radius — aligned with design `borderRadius` scale.
 */
export const radii = {
  none: 0,
  xs: 4,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

/** Alias for legacy imports (`borderRadius.md` etc.). */
export const borderRadius = radii;
