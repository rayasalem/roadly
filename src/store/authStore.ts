import { create } from 'zustand';
import type { Role } from '../shared/constants/roles';
import { tokenStore } from '../shared/services/auth/tokenStore';
import {
  loadPersistedSessionWithTimeout,
  persistSession,
  clearPersistedSession,
} from '../shared/services/auth/sessionStorage';
import { refreshAccessTokenSafe } from '../shared/services/auth/refreshAccessToken';
import { logout as authApiLogout } from '../features/auth/data/authApi';
import { cleanupNotifications } from '../shared/services/notifications/notificationCleanup';
import { navigateToLogin } from '../navigation/navigationRef';
import { resetUnauthorizedGuard } from '../shared/services/http/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role | 'guest';
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  isHydrating: boolean;
  setSession: (payload: {
    user: AuthUser;
    accessToken: string;
    refreshToken?: string | null;
  }) => Promise<void>;
  clearSession: () => Promise<void>;
  /** Logout: call backend, cleanup push token, clear session, redirect to Login */
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const initialState: Pick<
  AuthState,
  'user' | 'accessToken' | 'refreshToken' | 'isAuthenticated' | 'hasHydrated' | 'isHydrating'
> = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  hasHydrated: false,
  isHydrating: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setSession: async ({ user, accessToken, refreshToken = null }) => {
    resetUnauthorizedGuard();
    const session = { user, accessToken, refreshToken };
    await persistSession(session);
    tokenStore.setTokens({ accessToken, refreshToken });
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  clearSession: async () => {
    await clearPersistedSession();
    await cleanupNotifications();
    tokenStore.clear();
    set({
      ...initialState,
      hasHydrated: true,
    });
  },

  logout: async () => {
    try {
      await authApiLogout();
    } catch {
      // Continue with local clear
    }
    await get().clearSession();
    navigateToLogin();
  },

  hydrate: async () => {
    if (get().hasHydrated || get().isHydrating) return;

    set({ isHydrating: true });

    try {
      const persisted = await loadPersistedSessionWithTimeout();

      if (!persisted) {
        tokenStore.clear();
        set({ ...initialState, hasHydrated: true, isHydrating: false });
        return;
      }

      tokenStore.setTokens({
        accessToken: persisted.accessToken,
        refreshToken: persisted.refreshToken,
      });

      let accessToken = persisted.accessToken;

      if (persisted.refreshToken) {
        const refreshed = await refreshAccessTokenSafe();
        if (!refreshed) {
          await get().clearSession();
          navigateToLogin();
          return;
        }
        accessToken = refreshed;
      }

      const newRefresh = tokenStore.getRefreshToken();
      const newAccess = tokenStore.getAccessToken();
      if (newAccess) {
        await persistSession({
          user: persisted.user,
          accessToken: newAccess,
          refreshToken: newRefresh,
        });
      }

      set({
        user: persisted.user,
        accessToken: accessToken ?? newAccess ?? null,
        refreshToken: newRefresh ?? null,
        isAuthenticated: true,
        hasHydrated: true,
        isHydrating: false,
      });
    } catch {
      try {
        await clearPersistedSession();
      } catch {
        // ignore
      }
      try {
        await cleanupNotifications();
      } catch {
        // ignore
      }
      tokenStore.clear();
      set({ ...initialState, hasHydrated: true, isHydrating: false });
    } finally {
      set({ isHydrating: false });
    }
  },
}));

