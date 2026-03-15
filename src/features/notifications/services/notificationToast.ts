/**
 * Show instant in-app notification (toast) and optionally trigger haptic.
 * Use when a new request arrives, request accepted/rejected, etc.
 */
import { useUIStore } from '../../../store/uiStore';
import type { ToastType } from '../constants/notificationTheme';

export function showNotificationToast(
  type: ToastType,
  message: string,
  options?: { durationMs?: number; triggerHaptic?: boolean }
): void {
  const { toast } = useUIStore.getState();
  toast({ type, message, durationMs: options?.durationMs ?? 4000 });
  if (options?.triggerHaptic !== false && type === 'success') {
    try {
      const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
      impactAsync(ImpactFeedbackStyle.Medium).catch(() => {});
    } catch (_) {}
  }
}
