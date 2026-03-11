/**
 * Format amount with currency for display (multi-currency support).
 * Uses i18n common.currency (e.g. USD, SAR). For production, bind currency to locale or user preference.
 */
import { t } from '../i18n/t';

export function formatCurrency(amount: number, options?: { locale?: string; decimals?: number }): string {
  const currency = t('common.currency') || 'USD';
  const locale = options?.locale ?? 'en';
  const decimals = options?.decimals ?? 2;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(decimals)}`;
  }
}
