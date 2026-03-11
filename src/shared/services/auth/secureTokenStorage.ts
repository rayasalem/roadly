/**
 * Secure storage for access and refresh tokens.
 * Uses expo-secure-store on iOS/Android (encrypted keychain/keystore).
 * Falls back to AsyncStorage on web (SecureStore is not available; less secure).
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEY_ACCESS = 'roadly:access_token';
const KEY_REFRESH = 'roadly:refresh_token';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export type TokenPair = {
  accessToken: string | null;
  refreshToken: string | null;
};

export async function setTokens(accessToken: string, refreshToken: string | null): Promise<void> {
  if (isNative) {
    try {
      await SecureStore.setItemAsync(KEY_ACCESS, accessToken);
      if (refreshToken !== null) {
        await SecureStore.setItemAsync(KEY_REFRESH, refreshToken);
      } else {
        await SecureStore.deleteItemAsync(KEY_REFRESH);
      }
    } catch {
      // SecureStore can fail (e.g. device lock); avoid crashing
    }
    return;
  }
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
  if (isNative) {
    try {
      const accessToken = await SecureStore.getItemAsync(KEY_ACCESS);
      const refreshToken = await SecureStore.getItemAsync(KEY_REFRESH);
      return {
        accessToken: accessToken ?? null,
        refreshToken: refreshToken ?? null,
      };
    } catch {
      return { accessToken: null, refreshToken: null };
    }
  }
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
  if (isNative) {
    try {
      await SecureStore.deleteItemAsync(KEY_ACCESS);
      await SecureStore.deleteItemAsync(KEY_REFRESH);
    } catch {
      // ignore
    }
    return;
  }
  try {
    await AsyncStorage.multiRemove([KEY_ACCESS, KEY_REFRESH]);
  } catch {
    // ignore
  }
}
