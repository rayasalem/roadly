import { api } from '../http/api';
import { tokenStore } from '../auth/tokenStore';

/**
 * Unregister current device from push notifications on backend.
 * Call on logout so user stops receiving pushes.
 * Only called when user is authenticated (token present); never call when not logged in.
 */
export async function cleanupNotifications(): Promise<void> {
  const token = tokenStore.getAccessToken();
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return;
  }
  try {
    await api.post('/notifications/unregister', {});
  } catch {
    // Ignore: backend may not have the endpoint or token already invalid
  }
}
