import { useEffect } from 'react';
import { httpEvents } from '../services/http/httpEvents';
import { useAuthStore } from '../../store/authStore';
import { navigateToLogin } from '../../navigation/navigationRef';

/**
 * Listens for 401 after failed refresh; clears session and redirects to Login.
 * Must be mounted inside NavigationContainer so navigationRef is ready.
 */
export function UnauthorizedHandler() {
  useEffect(() => {
    return httpEvents.on('unauthorized', async () => {
      await useAuthStore.getState().clearSession();
      navigateToLogin();
    });
  }, []);

  return null;
}
