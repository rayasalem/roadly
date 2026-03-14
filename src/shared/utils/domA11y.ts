import { Platform } from 'react-native';

/**
 * On web, blur the currently focused element so it is no longer inside a node with aria-hidden.
 * Call this when closing modals/sheets to avoid "Blocked aria-hidden on an element because its descendant retained focus".
 */
export function blurActiveElementForA11y(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const el = document.activeElement as HTMLElement | null;
  if (el?.blur) el.blur();
}
