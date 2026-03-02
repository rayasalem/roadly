/**
 * Deprecated: use `src/shared/services/http/*`.
 * Kept for backward compatibility with older imports.
 */
import { AxiosError } from 'axios';
import { tokenStore } from '../services/auth/tokenStore';
import { api } from '../services/http/api';

export { api };

export function setAuthToken(token: string | null) {
  tokenStore.setTokens({ accessToken: token });
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const msg = (error.response?.data as any)?.error || (error.response?.data as any)?.message;
    if (typeof msg === 'string') return msg;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'حدث خطأ، جرّب لاحقاً';
}
