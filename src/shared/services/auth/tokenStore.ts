/**
 * In-memory token store for access and refresh tokens.
 *
 * SECURITY NOTE:
 * - Tokens live in plain JavaScript memory. They are not encrypted at rest here.
 * - Persisted session (AsyncStorage / localStorage) is used by authStore for rehydration;
 *   that layer is also not encrypted by default (see sessionStorage.ts).
 * - Risk: On compromised devices (backup, root/jailbreak, XSS on web), tokens may be readable.
 * - Best practice: Use short-lived access tokens; secure refresh flow; avoid storing secrets.
 * - For higher assurance on mobile, consider expo-secure-store for the persisted layer.
 */
type Tokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

let tokens: Tokens = { accessToken: null, refreshToken: null };

type TokenFallback = () => string | null;
let accessTokenFallback: TokenFallback | null = null;

export const tokenStore = {
  getAccessToken(): string | null {
    const fromMemory = tokens.accessToken;
    if (fromMemory) return fromMemory;
    return accessTokenFallback?.() ?? null;
  },
  getRefreshToken(): string | null {
    return tokens.refreshToken;
  },
  setTokens(next: Partial<Tokens>) {
    tokens = { ...tokens, ...next };
  },
  clear() {
    tokens = { accessToken: null, refreshToken: null };
  },
  /** Set fallback for getAccessToken (e.g. from auth store) so HTTP client gets token when in sync. */
  setAccessTokenFallback(fn: TokenFallback | null) {
    accessTokenFallback = fn;
  },
};

