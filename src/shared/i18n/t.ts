import { STRINGS, type Locale, type StringKey } from './strings';

let currentLocale: Locale = 'ar';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: StringKey): string {
  return STRINGS[currentLocale][key] ?? STRINGS.en[key] ?? key;
}

