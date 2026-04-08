export type AppEnv = 'development' | 'staging' | 'production';

const rawEnv = (process.env.EXPO_PUBLIC_ENVIRONMENT as AppEnv | undefined) ?? 'development';
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

/** Local backend port when URL does not specify one (match backend PORT=8082). */
const LOCAL_DEV_PORT = '8082';
const localLoopbackApiUrl = `http://localhost:${LOCAL_DEV_PORT}`;
const renderProdApiUrl = 'https://roadmapapp.onrender.com';

/** Filled during resolve; exposed for EXPO_PUBLIC_DEBUG_HTTP=1 */
const apiResolutionMeta: Record<string, string> = {};

function recordResolution(key: string, value: string) {
  apiResolutionMeta[key] = value;
}

/**
 * Optional: PC LAN IPv4 (e.g. 192.168.1.10). Highest priority for dev API host.
 * Also used when rewriting loopback URLs on devices.
 */
function getDevApiHostOverride(): string | null {
  try {
    const raw = process.env.EXPO_PUBLIC_DEV_API_HOST;
    if (!raw || typeof raw !== 'string') return null;
    const cleaned = raw.trim().replace(/^https?:\/\//, '').split(':')[0]?.trim();
    return cleaned && cleaned.length > 0 ? cleaned : null;
  } catch {
    return null;
  }
}

function isLoopbackHostname(hostname: string): boolean {
  const h = hostname.trim().toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]';
}

/** RFC1918-style LAN hosts; excludes 10.0.2.2 (Android emulator special case). */
function isPrivateLanHostname(hostname: string): boolean {
  if (hostname === '10.0.2.2') return false;
  return (
    /^192\.168\.\d+\.\d+$/.test(hostname) ||
    /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname)
  );
}

function devApiUrlForHost(host: string, port: string): string {
  return `http://${host}:${port}`;
}

function extractHostnameFromDevHostString(raw: unknown): string | null {
  if (raw == null || typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;
  if (s.includes('://')) {
    try {
      const u = new URL(s);
      return u.hostname || null;
    } catch {
      const m = s.match(/^https?:\/\/([^/:?]+)/i);
      return m?.[1]?.trim() || null;
    }
  }
  return s.split(':')[0]?.trim() || null;
}

/**
 * Metro / Expo dev server host (same machine as API in typical setups).
 * Prefer non-loopback so physical devices can reach the API.
 */
function getDevHostFromPackagerScriptUrl(): string | null {
  try {
    const { NativeModules } = require('react-native') as typeof import('react-native');
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (!scriptURL || typeof scriptURL !== 'string') return null;
    const host = extractHostnameFromDevHostString(scriptURL.replace(/^file:\/\//, 'http://'));
    if (!host || isLoopbackHostname(host)) return null;
    return host;
  } catch {
    return null;
  }
}

function getHostFromExpoConstants(): string | null {
  try {
    const Constants = require('expo-constants').default as {
      expoConfig?: { hostUri?: string };
      expoGoConfig?: { debuggerHost?: string };
      manifest?: { debuggerHost?: string } | null;
      manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } | null;
      platform?: { hostUri?: string };
    };
    const rawSources: unknown[] = [
      Constants?.expoConfig?.hostUri,
      Constants?.expoGoConfig?.debuggerHost,
      Constants?.manifest?.debuggerHost,
      Constants?.manifest2?.extra?.expoGo?.debuggerHost,
      Constants?.platform?.hostUri,
    ];
    for (const raw of rawSources) {
      const host = extractHostnameFromDevHostString(raw);
      if (host && !isLoopbackHostname(host)) return host;
    }
  } catch {
    // expo-constants unavailable (e.g. some test runners)
  }
  return null;
}

/** Hostname only — used to build http://<host>:<port> for native dev. */
function getNativeDevMachineHostname(): string {
  const override = getDevApiHostOverride();
  if (override) {
    recordResolution('nativeHost', `${override} (EXPO_PUBLIC_DEV_API_HOST)`);
    return override;
  }

  const fromScript = getDevHostFromPackagerScriptUrl();
  if (fromScript) {
    recordResolution('nativeHost', `${fromScript} (Metro bundle URL)`);
    return fromScript;
  }

  const fromExpo = getHostFromExpoConstants();
  if (fromExpo) {
    recordResolution('nativeHost', `${fromExpo} (expo-constants hostUri/debuggerHost)`);
    return fromExpo;
  }

  try {
    const { Platform } = require('react-native') as typeof import('react-native');
    if (Platform.OS === 'android') {
      recordResolution('nativeHost', '10.0.2.2 (Android emulator → host loopback)');
      return '10.0.2.2';
    }
    if (Platform.OS === 'ios') {
      recordResolution('nativeHost', '127.0.0.1 (iOS Simulator → host loopback)');
      return '127.0.0.1';
    }
  } catch {
    // not React Native
  }

  recordResolution('nativeHost', '127.0.0.1 (fallback)');
  return '127.0.0.1';
}

function parseHttpApiUrl(url: string): { protocol: string; hostname: string; port: string } | null {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    let port = u.port || '';
    if (!port) {
      port = isLoopbackHostname(u.hostname) ? LOCAL_DEV_PORT : u.protocol === 'https:' ? '443' : '80';
    }
    return { protocol: u.protocol, hostname: u.hostname, port };
  } catch {
    return null;
  }
}

function hasLoopbackApiHostname(url: string): boolean {
  const p = parseHttpApiUrl(url);
  return p != null && isLoopbackHostname(p.hostname);
}

/**
 * Replace localhost / 127.0.0.1 with the dev machine host; preserve path, query, hash, and port.
 */
function rewriteLoopbackBaseUrl(url: string, newHostname: string): string {
  const p = parseHttpApiUrl(url);
  if (!p || !isLoopbackHostname(p.hostname)) return url.trim().replace(/\/+$/, '');
  try {
    const u = new URL(url.trim());
    u.hostname = newHostname;
    return u.toString().replace(/\/+$/, '');
  } catch {
    return devApiUrlForHost(newHostname, p.port);
  }
}

function getBrowserHostname(): string | null {
  try {
    return typeof window !== 'undefined' && window.location ? window.location.hostname : null;
  } catch {
    return null;
  }
}

/**
 * Default API URL when EXPO_PUBLIC_API_URL is not set (or used after loopback rewrite).
 * - EXPO_PUBLIC_DEV_API_HOST → http://<host>:8082 (or chosen port)
 * - Web on loopback → http://localhost:8082
 * - Web on 10.0.2.2 / LAN → same host, port 8082
 * - Native: Metro host from bundle URL / expo-constants, else 10.0.2.2 (Android) / 127.0.0.1 (iOS)
 */
function getDefaultApiUrl(env: AppEnv): string {
  try {
    // @ts-expect-error - global in RN/Metro
    if (typeof global !== 'undefined' && typeof global.__DEV__ !== 'undefined' && !global.__DEV__) {
      recordResolution('default', 'production bundle (__DEV__ false)');
      return renderProdApiUrl;
    }
  } catch {
    // ignore
  }

  const override = getDevApiHostOverride();
  if (override) {
    recordResolution('default', `override host ${override}`);
    return devApiUrlForHost(override, LOCAL_DEV_PORT);
  }

  const hostname = getBrowserHostname();

  if (env === 'development' && hostname !== null) {
    if (isLoopbackHostname(hostname)) {
      recordResolution('default', 'web loopback → localhost API');
      return localLoopbackApiUrl;
    }
    if (hostname === '10.0.2.2') {
      recordResolution('default', 'web Android emulator host');
      return devApiUrlForHost('10.0.2.2', LOCAL_DEV_PORT);
    }
    if (isPrivateLanHostname(hostname)) {
      recordResolution('default', `web LAN host ${hostname}`);
      return devApiUrlForHost(hostname, LOCAL_DEV_PORT);
    }
  }

  if (env === 'development' && hostname === null) {
    const host = getNativeDevMachineHostname();
    recordResolution('default', `native dev machine host ${host}`);
    return devApiUrlForHost(host, LOCAL_DEV_PORT);
  }

  recordResolution('default', 'fallback production URL');
  return renderProdApiUrl;
}

function resolveApiUrl(): string {
  const trimmed = rawApiUrl && typeof rawApiUrl === 'string' ? rawApiUrl.trim() : '';
  if (!trimmed) {
    recordResolution('source', 'EXPO_PUBLIC_API_URL unset → getDefaultApiUrl');
    return getDefaultApiUrl(rawEnv);
  }

  const browserHostname = getBrowserHostname();
  const isNativeDev = browserHostname === null && rawEnv === 'development';

  if (isNativeDev && hasLoopbackApiHostname(trimmed)) {
    const host = getNativeDevMachineHostname();
    const rewritten = rewriteLoopbackBaseUrl(trimmed, host);
    recordResolution('source', 'EXPO_PUBLIC_API_URL had loopback on native → rewritten to dev machine host');
    recordResolution('rewrittenFrom', trimmed);
    return rewritten.replace(/\/+$/, '');
  }

  if (rawEnv === 'development' && browserHostname !== null && hasLoopbackApiHostname(trimmed)) {
    if (browserHostname && isLoopbackHostname(browserHostname)) {
      recordResolution('source', 'EXPO_PUBLIC_API_URL loopback + web on loopback → keep');
      return trimmed.replace(/\/+$/, '');
    }
    if (browserHostname === '10.0.2.2' || isPrivateLanHostname(browserHostname)) {
      const host = browserHostname === '10.0.2.2' ? '10.0.2.2' : browserHostname;
      const rewritten = rewriteLoopbackBaseUrl(trimmed, host);
      recordResolution('source', 'EXPO_PUBLIC_API_URL loopback + web on LAN/emulator → match page host');
      recordResolution('rewrittenFrom', trimmed);
      return rewritten.replace(/\/+$/, '');
    }
    recordResolution('source', 'EXPO_PUBLIC_API_URL loopback + web host not LAN → getDefaultApiUrl');
    return getDefaultApiUrl(rawEnv).replace(/\/+$/, '');
  }

  recordResolution('source', 'EXPO_PUBLIC_API_URL used as-is');
  return trimmed.replace(/\/+$/, '');
}

const resolvedApiUrl = resolveApiUrl();
const normalizedApiUrl = resolvedApiUrl.replace(/\/+$/, '');
recordResolution('API_BASE_URL', normalizedApiUrl);

export const APP_ENV: AppEnv = rawEnv;
export const API_BASE_URL: string = normalizedApiUrl;

/** Introspection for support / EXPO_PUBLIC_DEBUG_HTTP (no secrets). */
export function getApiResolutionMeta(): Readonly<Record<string, string>> {
  return { ...apiResolutionMeta };
}

export function logResolvedApiBaseUrl(): void {
  if (typeof process === 'undefined' || process.env?.EXPO_PUBLIC_DEBUG_HTTP !== '1') return;
  console.info('[MechNow] API_BASE_URL:', API_BASE_URL);
  console.info('[MechNow] API resolution meta:', getApiResolutionMeta());
}
