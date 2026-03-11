/**
 * Design system color palette.
 *
 * Usage:
 * - primary / primaryContrast: Main CTAs, active states, links
 * - secondary / secondaryContrast: Secondary buttons, de-emphasized actions
 * - background: Screen background
 * - surface: Cards, inputs, sheets
 * - text / textSecondary / textMuted: Hierarchy for copy
 * - border / borderFocus: Input borders, dividers; focus ring
 * - success, error, warning, info + Light: Semantic feedback (toasts, validation)
 */
export const colors = {
  // —— Brand ——
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryContrast: '#FFFFFF',
  navDark: '#1A313C',
  secondary: '#6B7280',
  secondaryContrast: '#FFFFFF',

  // —— Accent (alias primary for backward compatibility) ——
  accent: '#22C55E',
  accentDark: '#16A34A',
  accentContrast: '#FFFFFF',

  // —— Neutrals ——
  background: '#F3F4F6',
  authBackground: '#F3F4F6',
  authAccent: '#22C55E',
  authInputBg: '#E8F5E9',
  authTopDark: '#1A313C',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderFocus: '#22C55E',

  // —— Semantic ——
  success: '#22C55E',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  // —— Map & role (marker colors: mechanic=blue, tow=red, rental=green) ——
  mapUser: '#22C55E',
  mapMechanic: '#0EA5E9',
  mapTow: '#EF4444',
  mapRental: '#10B981',
} as const;

export type ColorPalette = typeof colors;

export const lightColors: ColorPalette = { ...colors };

export const darkColors: ColorPalette = {
  ...colors,
  background: '#111827',
  authBackground: '#1F2937',
  authInputBg: '#374151',
  authTopDark: '#0F172A',
  surface: '#1F2937',
  surfaceElevated: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  border: '#374151',
  successLight: '#064E3B',
  errorLight: '#7F1D1D',
  warningLight: '#78350F',
  infoLight: '#0C4A6E',
};

export type ColorKey = keyof typeof colors;
