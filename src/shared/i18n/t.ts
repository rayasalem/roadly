import { STRINGS, type Locale, type StringKey } from './strings';
import { getLocale } from '../../store/localeStore';

export { getLocale, setLocale } from '../../store/localeStore';
export type { Locale } from '../../store/localeStore';

/**
 * Arabic-first: الواجهة بالعربية إلزامياً — نستخدم العربية أولاً ثم الإنجليزية كاحتياط فقط.
 */
export function t(key: StringKey): string {
  return STRINGS.ar[key] ?? STRINGS.en[key] ?? key;
}
