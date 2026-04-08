jest.mock('../../../src/shared/services/auth/secureTokenStorage', () => ({
  setTokens: jest.fn(),
  getTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isPersistedSession,
  isValidSession,
  persistSession,
  loadPersistedSession,
  loadPersistedSessionWithTimeout,
  clearPersistedSession,
} from '../../../src/shared/services/auth/sessionStorage';
const secure = jest.requireMock('../../../src/shared/services/auth/secureTokenStorage') as {
  setTokens: jest.Mock;
  getTokens: jest.Mock;
  clearTokens: jest.Mock;
};

describe('session validation', () => {
  it('isPersistedSession rejects invalid shapes', () => {
    expect(isPersistedSession(null)).toBe(false);
    expect(isPersistedSession({})).toBe(false);
    expect(isPersistedSession({ user: { id: '', name: 'a', email: 'e@e.com', role: 'user' }, accessToken: 'x' })).toBe(false);
    expect(
      isPersistedSession({
        user: { id: '1', name: 'n', email: 'e@e.com', role: 'user' },
        accessToken: 'tok',
        refreshToken: null,
      }),
    ).toBe(true);
  });

  it('isValidSession aliases isPersistedSession', () => {
    expect(isValidSession({ user: { id: '1', name: 'n', email: 'e@e.com', role: 'user' }, accessToken: 't', refreshToken: null })).toBe(true);
  });
});

describe('persistSession / loadPersistedSession', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    secure.getTokens.mockResolvedValue({ accessToken: 'acc', refreshToken: null });
  });

  it('persistSession writes user and tokens', async () => {
    await persistSession({
      user: { id: '1', name: 'N', email: 'n@n.com', role: 'user' },
      accessToken: 'a',
      refreshToken: 'r',
    });
    expect(secure.setTokens).toHaveBeenCalledWith('a', 'r');
  });

  it('loadPersistedSession returns null when no user key', async () => {
    const s = await loadPersistedSession();
    expect(s).toBeNull();
  });

  it('loadPersistedSession returns session when valid', async () => {
    await AsyncStorage.setItem(
      'roadly:auth_user',
      JSON.stringify({ id: '1', name: 'N', email: 'n@n.com', role: 'user' }),
    );
    const s = await loadPersistedSession();
    expect(s?.accessToken).toBe('acc');
    expect(s?.user.id).toBe('1');
  });

  it('loadPersistedSessionWithTimeout resolves null on slow storage', async () => {
    secure.getTokens.mockImplementation(() => new Promise(() => {}));
    const s = await loadPersistedSessionWithTimeout(20);
    expect(s).toBeNull();
  });

  it('clearPersistedSession clears async and secure', async () => {
    await clearPersistedSession();
    expect(secure.clearTokens).toHaveBeenCalled();
  });
});
