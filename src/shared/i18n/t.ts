import { STRINGS, type Locale, type StringKey } from './strings';
import { getLocale } from '../../store/localeStore';

export { getLocale, setLocale } from '../../store/localeStore';
export type { Locale } from '../../store/localeStore';

export function t(key: StringKey): string {
  const locale = getLocale();
  return STRINGS[locale][key] ?? STRINGS.en[key] ?? key;
}
