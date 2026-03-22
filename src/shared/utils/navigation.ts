import { Platform } from 'react-native';
import { Linking } from 'react-native';

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
    url = `http://maps.apple.com/?ll=${lat},${lng}`;
  } else {
    // Web and other platforms: fallback to Google Maps in browser
    url = `https://www.google.com/maps?q=${lat},${lng}`;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      // Fallback: always try generic https URL
      const webUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      await Linking.openURL(webUrl);
      return;
    }
    await Linking.openURL(url);
  } catch {
    // Silent fail; callers may choose to show a toast separately if needed.
  }
}

