import { API_BASE_URL } from '../../constants/env';
import { tokenStore } from '../auth/tokenStore';
import { createHttpClient } from './httpClient';
import { httpEvents } from './httpEvents';

export const api = createHttpClient({
  baseURL: API_BASE_URL,
  onError: (e) => httpEvents.emit('httpError', e),
  tokenProvider: {
    getAccessToken: () => tokenStore.getAccessToken(),
    // refreshAccessToken: async () => { ... future-ready ... },
    onUnauthorized: () => {
      // Intentionally empty here (core should not navigate).
      // App layer can subscribe to unauthorized errors if needed.
      tokenStore.clear();
    },
  },
});

