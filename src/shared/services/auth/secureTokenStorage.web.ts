/**
 * Web-only token storage. Uses AsyncStorage only (expo-secure-store is not available on web).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_ACCESS = 'roadly:access_token';
const KEY_REFRESH = 'roadly:refresh_token';

export type TokenPair = {
  accessToken: string | null;
  refreshToken: string | null;
};

export async function setTokens(accessToken: string, refreshToken: string | null): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_ACCESS, accessToken);
    if (refreshToken !== null) {
      await AsyncStorage.setItem(KEY_REFRESH, refreshToken);
    } else {
      await AsyncStorage.removeItem(KEY_REFRESH);
    }
  } catch {
    // ignore
  }
}

export async function getTokens(): Promise<TokenPair> {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem(KEY_ACCESS),
      AsyncStorage.getItem(KEY_REFRESH),
    ]);
    return {
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEY_ACCESS, KEY_REFRESH]);
  } catch {
    // ignore
  }
}
