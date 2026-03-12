export type AppEnv = 'development' | 'staging' | 'production';

const rawEnv = (process.env.EXPO_PUBLIC_ENVIRONMENT as AppEnv | undefined) ?? 'development';
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

/** Local backend port (set backend PORT=8082 to match). */
const LOCAL_DEV_PORT = '8082';
const localDevApiUrl = `http://localhost:${LOCAL_DEV_PORT}`;
const renderProdApiUrl = 'https://roadmapapp.onrender.com';

/**
 * Decide default API URL when EXPO_PUBLIC_API_URL is NOT set:
 * - Web on localhost → local backend on :8082
 * - Native in __DEV__: use Expo hostUri (same IP as Metro when scanning QR) then :8082, else emulator defaults
 * - Otherwise → Render production URL
 */
function getDefaultApiUrl(env: AppEnv): string {
  // React Native: no window → use emulator/simulator host in development
  try {
    // @ts-expect-error - global in RN/Metro
    if (typeof global !== 'undefined' && typeof global.__DEV__ !== 'undefined' && !global.__DEV__) {
      // production build: use prod API
      return renderProdApiUrl;
    }
  } catch {
    // ignore
  }

  let hostname: string | null = null;
  try {
    hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : null;
  } catch {
    hostname = null;
  }

  // Web: browser on localhost
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '10.0.2.2' ||
    hostname === '::1';

  if (isLocalHost && env === 'development') {
    return localDevApiUrl;
  }

  // Native (no window) in development: use same host as Metro when available (QR / physical device)
  if (env === 'development' && hostname === null) {
    try {
      const Constants = require('expo-constants').default;
      const hostUri =
        Constants?.expoConfig?.hostUri ??
        (Constants?.manifest as { debuggerHost?: string } | undefined)?.debuggerHost ??
        (Constants?.platform as { hostUri?: string } | undefined)?.hostUri;
      if (hostUri && typeof hostUri === 'string') {
        const host = hostUri.split(':')[0]?.trim();
        if (host) return `http://${host}:${LOCAL_DEV_PORT}`;
      }
    } catch {
      // expo-constants not available or no hostUri
    }
    try {
      const { Platform } = require('react-native');
      if (Platform.OS === 'android') return `http://10.0.2.2:${LOCAL_DEV_PORT}`; // Android emulator → host
      if (Platform.OS === 'ios') return `http://127.0.0.1:${LOCAL_DEV_PORT}`;   // iOS simulator
    } catch {
      // react-native not available (e.g. build-time)
    }
  }

  return renderProdApiUrl;
}

// On physical device, localhost = the phone; use PC IP (hostUri) instead so backend is reachable
function resolveApiUrl(): string {
  const trimmed = rawApiUrl && typeof rawApiUrl === 'string' ? rawApiUrl.trim() : '';
  if (!trimmed) return getDefaultApiUrl(rawEnv);

  const isLocalhostUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(trimmed);
  let hostname: string | null = null;
  try {
    hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : null;
  } catch {
    hostname = null;
  }
  const isNativeDev = hostname === null && rawEnv === 'development';
  if (isNativeDev && isLocalhostUrl) return getDefaultApiUrl(rawEnv);
  return trimmed;
}

const resolvedApiUrl = resolveApiUrl();

/** Avoid throwing at build time so Vercel build succeeds; set EXPO_PUBLIC_API_URL in Vercel dashboard. */
const normalizedApiUrl = resolvedApiUrl.replace(/\/+$/, '');

export const APP_ENV: AppEnv = rawEnv;
export const API_BASE_URL: string = normalizedApiUrl;

