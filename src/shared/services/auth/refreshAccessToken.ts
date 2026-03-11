import axios from 'axios';
import { API_BASE_URL } from '../../constants/env';
import { httpEvents } from '../http/httpEvents';
import { tokenStore } from './tokenStore';

const REFRESH_TIMEOUT_MS = 10_000;

type RefreshResponse = {
  accessToken: string;
  refreshToken?: string | null;
};

/**
 * Try to refresh the access token using the stored refreshToken.
 * Returns the new access token, or null if refresh failed.
 * Request has a 10s timeout to avoid hanging.
 *
 * On failure: emits 'unauthorized' only (no tokenStore.clear here).
 * UnauthorizedHandler performs clearSession() so tokenStore is cleared once.
 */
export async function refreshAccessTokenSafe(): Promise<string | null> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) {
    httpEvents.emit('unauthorized', undefined);
    return null;
  }

  try {
    const { data } = await axios.post<RefreshResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: REFRESH_TIMEOUT_MS,
      },
    );

    const nextAccess = data?.accessToken;
    if (typeof nextAccess !== 'string' || nextAccess.trim() === '') {
      httpEvents.emit('unauthorized', undefined);
      return null;
    }

    const nextRefresh = data?.refreshToken ?? refreshToken;
    tokenStore.setTokens({
      accessToken: nextAccess,
      refreshToken: nextRefresh,
    });

    return nextAccess;
  } catch {
    httpEvents.emit('unauthorized', undefined);
    return null;
  }
}

