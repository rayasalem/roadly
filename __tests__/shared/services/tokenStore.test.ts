import { tokenStore } from '../../../src/shared/services/auth/tokenStore';

describe('tokenStore', () => {
  beforeEach(() => {
    tokenStore.clear();
    tokenStore.setAccessTokenFallback(null);
  });

  it('setTokens and getAccessToken/getRefreshToken', () => {
    tokenStore.setTokens({ accessToken: 'a', refreshToken: 'r' });
    expect(tokenStore.getAccessToken()).toBe('a');
    expect(tokenStore.getRefreshToken()).toBe('r');
  });

  it('clear resets tokens', () => {
    tokenStore.setTokens({ accessToken: 'a', refreshToken: 'r' });
    tokenStore.clear();
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });

  it('accessTokenFallback when memory empty', () => {
    tokenStore.setAccessTokenFallback(() => 'fb');
    expect(tokenStore.getAccessToken()).toBe('fb');
    tokenStore.setTokens({ accessToken: 'mem', refreshToken: null });
    expect(tokenStore.getAccessToken()).toBe('mem');
  });
});
