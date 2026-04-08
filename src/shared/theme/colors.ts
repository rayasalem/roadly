/**
 * Design tokens — Uber/Careem-inspired light/dark palettes.
 * Keep semantic + map keys for backward compatibility across the app.
 */
export const colors = {
  primary: '#000000',
  primaryDark: '#000000',
  primaryContrast: '#FFFFFF',
  navDark: '#000000',
  secondary: '#276EF1',
  secondaryContrast: '#FFFFFF',

  accent: '#05944F',
  accentDark: '#047857',
  accentContrast: '#FFFFFF',

  background: '#FFFFFF',
  authBackground: '#FFFFFF',
  authAccent: '#000000',
  authInputBg: '#F6F6F6',
  authTopDark: '#000000',
  surface: '#F6F6F6',
  surface2: '#EEEEEE',
  surfaceElevated: '#EEEEEE',
  text: '#000000',
  textPrimary: '#000000',
  textSecondary: '#545454',
  textMuted: '#8A8A8A',
  border: '#E2E2E2',
  borderFocus: '#276EF1',

  success: '#05944F',
  successLight: '#D1FAE5',
  error: '#E11900',
  errorLight: '#FEE2E2',
  warning: '#FFC043',
  warningLight: '#FEF3C7',
  info: '#276EF1',
  infoLight: '#E0F2FE',

  mapUser: '#000000',
  mapMechanic: '#276EF1',
  mapTow: '#E11900',
  mapRental: '#05944F',
  mapInsurance: '#7C3AED',

  designPrimary: '#000000',
  designSecondary: '#276EF1',
  designBackground: '#FFFFFF',

  greenPrimary: '#05944F',
  greenDark: '#047857',
  greenLight: '#D1FAE5',
  backgroundSoft: '#F6F6F6',
  cardWhite: '#FFFFFF',

  uberBlack: '#000000',
  uberNav: '#000000',
  uberCard: '#FFFFFF',
  uberBackground: '#F6F6F6',
  uberTextOnDark: '#FFFFFF',
  uberMuted: '#8A8A8A',
  uberBorder: '#E2E2E2',
} as const;

export type ColorPalette = typeof colors;

export const lightColors: ColorPalette = { ...colors };

export const darkColors = {
  ...colors,
  primary: '#FFFFFF',
  primaryDark: '#E5E5E5',
  primaryContrast: '#000000',
  secondary: '#276EF1',
  secondaryContrast: '#FFFFFF',
  background: '#000000',
  authBackground: '#000000',
  authInputBg: '#242424',
  authTopDark: '#000000',
  surface: '#1A1A1A',
  surface2: '#242424',
  surfaceElevated: '#242424',
  text: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#ABABAB',
  textMuted: '#8A8A8A',
  border: '#333333',
  borderFocus: '#276EF1',
  successLight: '#064E3B',
  errorLight: '#7F1D1D',
  warningLight: '#78350F',
  infoLight: '#0C4A6E',
  uberNav: '#000000',
  uberCard: '#1A1A1A',
  uberBackground: '#000000',
  uberTextOnDark: '#FFFFFF',
  uberMuted: '#ABABAB',
  uberBorder: '#333333',
  designBackground: '#000000',
  backgroundSoft: '#1A1A1A',
  cardWhite: '#1A1A1A',
} as unknown as ColorPalette;

export type ColorKey = keyof typeof colors;
