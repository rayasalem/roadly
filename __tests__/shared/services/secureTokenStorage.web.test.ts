import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokens, getTokens, clearTokens } from '../../../src/shared/services/auth/secureTokenStorage.web';

describe('secureTokenStorage.web', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('roundtrips tokens', async () => {
    await setTokens('aa', 'rr');
    const p = await getTokens();
    expect(p).toEqual({ accessToken: 'aa', refreshToken: 'rr' });
  });

  it('clears tokens', async () => {
    await setTokens('a', 'b');
    await clearTokens();
    const p = await getTokens();
    expect(p.accessToken).toBeNull();
    expect(p.refreshToken).toBeNull();
  });
});
