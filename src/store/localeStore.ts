/**
 * Locale state for i18n and typography.
 * Used by t.ts (getLocale/setLocale) and useTypography for reactive font switching.
 */
import { create } from 'zustand';

export type Locale = 'en' | 'ar';

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'ar',
  setLocale: (locale) => set({ locale }),
}));

export function getLocale(): Locale {
  return useLocaleStore.getState().locale;
}

export function setLocale(locale: Locale): void {
  useLocaleStore.getState().setLocale(locale);
}
