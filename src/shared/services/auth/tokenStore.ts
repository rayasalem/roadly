type Tokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

let tokens: Tokens = { accessToken: null, refreshToken: null };

export const tokenStore = {
  getAccessToken(): string | null {
    return tokens.accessToken;
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
};

