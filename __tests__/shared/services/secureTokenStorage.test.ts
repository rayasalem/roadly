jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

import { Platform } from 'react-native';
import { setTokens, getTokens, clearTokens } from '../../../src/shared/services/auth/secureTokenStorage';

describe('secureTokenStorage (native path)', () => {
  const origOS = Platform.OS;

  beforeEach(() => {
    (Platform as any).OS = 'android';
    jest.clearAllMocks();
  });

  afterAll(() => {
    (Platform as any).OS = origOS;
  });

  it('setTokens uses SecureStore on native', async () => {
    const SS = require('expo-secure-store');
    await setTokens('a', 'r');
    expect(SS.setItemAsync).toHaveBeenCalled();
  });

  it('getTokens returns pair from SecureStore', async () => {
    const SS = require('expo-secure-store');
    SS.getItemAsync.mockImplementation((k: string) =>
      k.includes('access') ? Promise.resolve('tok') : Promise.resolve('ref'),
    );
    const p = await getTokens();
    expect(p.accessToken).toBe('tok');
    expect(p.refreshToken).toBe('ref');
  });

  it('clearTokens deletes keys on native', async () => {
    const SS = require('expo-secure-store');
    await clearTokens();
    expect(SS.deleteItemAsync).toHaveBeenCalled();
  });
});

