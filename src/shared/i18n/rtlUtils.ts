/**
 * Chevron / arrow directions for Arabic RTL vs English LTR.
 * Prefer locale-based helpers so icons match language toggle even before native RTL relayout.
 */
import type { Locale } from '../../store/localeStore';

export function isRtlLocale(locale: Locale): boolean {
  return locale === 'ar';
}

/** Header back: points toward layout start. */
export function backChevronForLocale(locale: Locale): 'chevron-left' | 'chevron-right' {
  return isRtlLocale(locale) ? 'chevron-right' : 'chevron-left';
}

/** List disclosure / forward: points toward layout end. */
export function trailingChevronForLocale(locale: Locale): 'chevron-left' | 'chevron-right' {
  return isRtlLocale(locale) ? 'chevron-left' : 'chevron-right';
}

/** Primary forward CTA arrow. */
export function arrowForwardForLocale(locale: Locale): 'arrow-left' | 'arrow-right' {
  return isRtlLocale(locale) ? 'arrow-left' : 'arrow-right';
}
