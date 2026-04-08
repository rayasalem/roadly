import { Platform } from 'react-native';
import { Linking } from 'react-native';

import { openExternalUrl } from './openExternalUrl';

/**
 * Open external maps app (Google Maps / Apple Maps / browser) for turn-by-turn navigation
 * to the given coordinates.
 */
export async function openExternalMap(latitude: number, longitude: number): Promise<void> {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return;
  }

  let url: string;

  if (Platform.OS === 'android') {
    // Google Maps navigation intent
    url = `google.navigation:q=${lat},${lng}`;
  } else if (Platform.OS === 'ios') {
    // Apple Maps
    url = `https://maps.apple.com/?ll=${lat},${lng}`;
  } else {
    // Web and other platforms: fallback to Google Maps in browser
    url = `https://www.google.com/maps?q=${lat},${lng}`;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      const webUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      await openExternalUrl(webUrl);
      return;
    }
    if (/^https:\/\//i.test(url)) {
      await openExternalUrl(url);
    } else {
      await Linking.openURL(url);
    }
  } catch {
    // Silent fail; callers may choose to show a toast separately if needed.
  }
}

