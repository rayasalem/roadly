/**
 * Syncs RTL layout with locale: when locale is Arabic, enables RTL.
 * I18nManager.forceRTL is applied on mount. Text alignment and font (Tajawal) switch immediately via useTypography.
 * Full layout RTL (e.g. navigation order) may require app restart after changing to/from Arabic.
 */
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { useLocaleStore } from '../../store/localeStore';

export function LocaleRTLSync() {
  const locale = useLocaleStore((s) => s.locale);
  const isRTL = locale === 'ar';

  useEffect(() => {
    I18nManager.allowRTL(true);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
  }, [isRTL]);

  return null;
}
