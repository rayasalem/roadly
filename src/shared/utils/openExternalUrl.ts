import { Linking, Platform } from 'react-native';

/**
 * Open an external URL. On web, https/http links use a temporary anchor with
 * `target="_blank"` and `rel="noopener noreferrer"` to avoid tab-nabbing and
 * cross-window access (preferable to raw `window.open` without rel).
 * `tel:`, `mailto:`, and custom schemes use `Linking`.
 */
export async function openExternalUrl(url: string): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) return;

  const isHttp = /^https?:\/\//i.test(trimmed);

  if (isHttp && Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      const a = document.createElement('a');
      a.href = trimmed;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      return;
    } catch {
      // fall through to Linking
    }
  }

  const can = await Linking.canOpenURL(trimmed).catch(() => true);
  if (can) await Linking.openURL(trimmed);
}
