import { API_BASE_URL } from '../../constants/env';
import { tokenStore } from '../auth/tokenStore';
import { refreshAccessTokenSafe } from '../auth/refreshAccessToken';
import { createHttpClient } from './httpClient';
import { httpEvents } from './httpEvents';
import { useUIStore } from '../../../store/uiStore';

if (typeof __DEV__ !== 'undefined' && __DEV__ && typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_DEBUG_HTTP === '1') {
  console.info('[MechNow] API base URL:', API_BASE_URL);
}

/** Guard so onUnauthorized (and thus redirect) only runs once; reset on login */
let unauthorizedTriggered = false;

export function resetUnauthorizedGuard(): void {
  unauthorizedTriggered = false;
}

/** When token is missing, the interceptor does not attach Authorization; those requests may get 401 and trigger redirect to Login (except /providers/nearby which uses fallback). */

/**
 * HTTP client: every request gets Authorization: Bearer <accessToken> via request interceptor in httpClient.
 * Token is read from tokenStore (synced from auth store / AsyncStorage on login and hydrate).
 * On 401 (missing or expired token), onUnauthorized redirects to Login; /providers/nearby uses fallback and does not redirect.
 */
export const api = createHttpClient({
  baseURL: API_BASE_URL,
  onError: (e) => httpEvents.emit('httpError', e),
  onRequestStart: () => useUIStore.getState().showLoader(),
  onRequestEnd: () => useUIStore.getState().hideLoader(),
  tokenProvider: {
    getAccessToken: () => tokenStore.getAccessToken(),
    refreshAccessToken: async () => refreshAccessTokenSafe(),
    onUnauthorized: () => {
      if (unauthorizedTriggered) return;
      unauthorizedTriggered = true;
      httpEvents.emit('unauthorized', undefined);
    },
  },
});

