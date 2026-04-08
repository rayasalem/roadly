/**
 * Keeps I18nManager + web `dir`/`lang` in sync when locale changes.
 * Fonts/alignment also follow locale via useTypography / AppText.
 */
import { useEffect } from 'react';
import { useLocaleStore } from '../../store/localeStore';
import { applyRtlFromLocale } from '../i18n/applyRtl';

export function LocaleRTLSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    applyRtlFromLocale(locale);
  }, [locale]);

  return null;
}
