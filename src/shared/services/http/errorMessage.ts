/**
 * Unified error message helper for API and HTTP layer.
 * Supports Axios errors, HttpError, and i18n translations.
 */
import { t } from '../../i18n/t';
import type { HttpError } from './types';
import { toHttpError } from './httpClient';

/**
 * Returns a user-facing message for an HttpError using i18n keys where available.
 */
export function getMessageFromHttpError(e: HttpError): string {
  switch (e.kind) {
    case 'Network':
      return t('error.network');
    case 'Timeout':
      return t('error.timeout');
    case 'Server':
      return t('error.server');
    case 'Unauthorized':
    case 'Forbidden':
    case 'NotFound':
    case 'Validation':
    case 'Unknown':
    default:
      return e.message || t('error.unknown');
  }
}

/**
 * Converts unknown (e.g. Axios error or Error) to a user-facing string with i18n support.
 * Use in API modules (authApi, requestApi, providersApi) when catching and rethrowing.
 */
export function getErrorMessage(error: unknown): string {
  const httpError = toHttpError(error);
  return getMessageFromHttpError(httpError);
}

/**
 * True when the error is a connection/network or timeout failure (e.g. ERR_CONNECTION_REFUSED).
 * Use in hooks to return fallback data instead of throwing so the app does not crash.
 */
export function isNetworkOrTimeoutError(error: unknown): boolean {
  const e = toHttpError(error);
  return e.kind === 'Network' || e.kind === 'Timeout';
}
