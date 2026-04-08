/**
 * Sync React Native RTL flags and web `document.documentElement` dir/lang.
 * Call once at app entry (module scope) and whenever locale changes (see LocaleRTLSync).
 */
import { Platform, I18nManager } from 'react-native';
import type { Locale } from '../../store/localeStore';

export function applyRtlFromLocale(locale: Locale): void {
  const isRTL = locale === 'ar';
  I18nManager.allowRTL(true);
  I18nManager.swapLeftAndRightInRTL(true);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
  }
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
  }
}
