/**
 * Locale-aware typography: Poppins for English, Tajawal for Arabic.
 * Use useTypography() in components for reactive font switching; use getFontFamilyForLocale() for static usage.
 */
import { useLocaleStore } from '../../store/localeStore';
import type { Locale } from '../../store/localeStore';

export const fontFamilyPoppins = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export const fontFamilyTajawal = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  semibold: 'Tajawal_700Bold',
  bold: 'Tajawal_800ExtraBold',
} as const;

export type FontFamilySet = typeof fontFamilyPoppins;

export function getFontFamilyForLocale(locale: Locale): FontFamilySet {
  return locale === 'ar' ? fontFamilyTajawal : fontFamilyPoppins;
}

export function useTypography() {
  const locale = useLocaleStore((s) => s.locale);
  const fontFamily = getFontFamilyForLocale(locale);
  const isRTL = locale === 'ar';
  return { fontFamily, isRTL, locale } as const;
}
