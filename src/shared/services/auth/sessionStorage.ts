import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../../../store/authStore';
import { ROLES } from '../../constants/roles';
import { setTokens, getTokens, clearTokens } from './secureTokenStorage';

/** Non-sensitive user profile only (AsyncStorage). Tokens are in secureTokenStorage (expo-secure-store on native). */
const AUTH_USER_KEY = 'roadly:auth_user';

/** Max length for raw stored string to avoid DoS from corrupted or maliciously large payloads */
const MAX_SESSION_RAW_LENGTH = 16 * 1024;

const VALID_ROLES: ReadonlySet<string> = new Set([
  ROLES.USER,
  ROLES.MECHANIC,
  ROLES.MECHANIC_TOW,
  ROLES.CAR_RENTAL,
  ROLES.ADMIN,
  'guest',
]);

export type PersistedSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string | null;
};

/**
 * Type guard: verifies the shape of stored session data.
 * Ensures user.id, user.role, user.name, user.email exist and accessToken is a non-empty string.
 * If validation fails, callers must clear storage and treat as logged out.
 * Protects against corrupted or tampered AsyncStorage/localStorage data.
 */
export function isPersistedSession(value: unknown): value is PersistedSession {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  const user = o.user;
  if (!user || typeof user !== 'object' || Array.isArray(user)) return false;
  const u = user as Record<string, unknown>;
  if (typeof u.id !== 'string' || u.id.trim() === '') return false;
  if (typeof u.name !== 'string' || u.name.trim() === '') return false;
  if (typeof u.email !== 'string' || u.email.trim() === '') return false;
  if (typeof u.role !== 'string' || !VALID_ROLES.has(u.role)) return false;
  const accessToken = o.accessToken;
  if (typeof accessToken !== 'string' || accessToken.trim() === '') return false;
  const refreshToken = o.refreshToken;
  if (refreshToken !== null && typeof refreshToken !== 'string') return false;
  return true;
}

/**
 * Safe session validator for persisted data.
 * Validates: user (object), user.id (non-empty string), user.role (valid role), accessToken (non-empty string).
 * If invalid → callers (e.g. loadPersistedSession) must clear storage and return null.
 */
export function isValidSession(data: unknown): boolean {
  return isPersistedSession(data);
}

/**
 * Persist session: user (non-sensitive) in AsyncStorage; tokens in secure storage (expo-secure-store on native).
 * On web, tokens fall back to AsyncStorage; prefer HTTPS and short-lived tokens.
 */
export async function persistSession(session: PersistedSession): Promise<void> {
  try {
    const userPayload = JSON.stringify({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    });
    await AsyncStorage.setItem(AUTH_USER_KEY, userPayload);
    await setTokens(session.accessToken, session.refreshToken);
  } catch {
    // Session persist failure should not crash the app
  }
}

/**
 * Safe session loader: user from AsyncStorage, tokens from secure storage; validate and reassemble.
 * If invalid (corrupted/tampered/oversized) or any error → clear all storage and return null.
 */
export async function loadPersistedSession(): Promise<PersistedSession | null> {
  try {
    let rawUser: string | null = null;
    try {
      rawUser = await AsyncStorage.getItem(AUTH_USER_KEY);
    } catch {
      await clearPersistedSession();
      return null;
    }

    if (!rawUser || typeof rawUser !== 'string') return null;
    if (rawUser.length > MAX_SESSION_RAW_LENGTH) {
      await clearPersistedSession();
      return null;
    }

    let userParsed: unknown;
    try {
      userParsed = JSON.parse(rawUser);
    } catch {
      await clearPersistedSession();
      return null;
    }

    const { accessToken, refreshToken } = await getTokens();
    const accessTokenTrimmed = typeof accessToken === 'string' ? accessToken.trim() : '';
    const refreshTokenTrimmed =
      refreshToken === null || refreshToken === undefined
        ? null
        : typeof refreshToken === 'string'
          ? refreshToken.trim() || null
          : null;

    if (!accessTokenTrimmed) {
      await clearPersistedSession();
      return null;
    }

    const reassembled: unknown = {
      user: userParsed,
      accessToken: accessTokenTrimmed,
      refreshToken: refreshTokenTrimmed,
    };

    if (!isValidSession(reassembled)) {
      await clearPersistedSession();
      return null;
    }

    const session = reassembled as PersistedSession;
    return {
      user: {
        id: session.user.id.trim(),
        name: session.user.name.trim(),
        email: session.user.email.trim(),
        role: session.user.role,
      },
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    };
  } catch {
    try {
      await clearPersistedSession();
    } catch {
      // ignore
    }
    return null;
  }
}

export async function clearPersistedSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // ignore
  }
  try {
    await clearTokens();
  } catch {
    // ignore
  }
}

/** Default timeout for loading session (avoid hanging if storage is slow or stuck) */
const SESSION_LOAD_TIMEOUT_MS = 5000;

/**
 * Load persisted session with timeout protection. If storage takes longer than timeoutMs,
 * returns null so hydration can complete and the app doesn't hang.
 */
export function loadPersistedSessionWithTimeout(
  timeoutMs: number = SESSION_LOAD_TIMEOUT_MS,
): Promise<PersistedSession | null> {
  return Promise.race([
    loadPersistedSession(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

