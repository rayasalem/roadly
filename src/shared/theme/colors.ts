/**
 * Premium color palette — inspired by modern car-rental UI kits.
 *
 * Design decisions:
 * - Primary (green): matches the Evto login UI kit (modern green CTA).
 * - Dark navy (#0F172A): for headers / dark sections if needed.
 * - Light neutral background: cards and content sit on a soft grey, not pure white.
 * - Semantic and map colors used sparingly for clarity and conversion.
 */
export const colors = {
  // —— Brand & primary action ——
  primary: '#16A34A', // green CTA (Evto style)
  primaryDark: '#166534',
  primaryContrast: '#FFFFFF',
  secondary: '#6B7280',

  // —— Accent (urgent action: request, tow) — use sparingly ——
  accent: '#F97316',
  accentDark: '#C2410C',
  accentContrast: '#FFFFFF',

  // —— Neutrals ——
  background: '#F3F4F6',
  // خَلْفِيّة خاصة لشاشات الأوث مستوحاة من UI kit (أخضر فاتح جداً)
  authBackground: '#ECFDF3',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderFocus: '#16A34A',

  // —— Semantic ——
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  // —— Map & role (markers, chips) ——
  mapUser: '#16A34A',
  mapMechanic: '#0EA5E9',
  mapTow: '#F97316',
  mapRental: '#4F46E5',
} as const;

export type ColorKey = keyof typeof colors;
