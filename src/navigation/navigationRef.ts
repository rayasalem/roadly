import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Pending redirect to Login when 401/unauthorized fired before NavigationContainer was ready */
let pendingNavigateToLogin = false;

/** Interval handle for polling isReady when redirect was queued (fallback if onReady already ran) */
let pendingFlushIntervalId: ReturnType<typeof setInterval> | null = null;

const FLUSH_POLL_MS = 100;
const FLUSH_POLL_MAX_MS = 10000;

function doResetToLogin(): void {
  try {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  } catch {
    // Navigation may not be mounted; ignore
  }
}

/**
 * Navigate to Login screen (reset stack). Safe to call anytime.
 * If NavigationContainer is not ready, the redirect is queued and run when it becomes ready
 * (via onReady flush or a short polling fallback).
 */
export function navigateToLogin(): void {
  if (navigationRef.isReady()) {
    pendingNavigateToLogin = false;
    stopPendingFlushPoll();
    doResetToLogin();
    return;
  }
  pendingNavigateToLogin = true;
  startPendingFlushPoll();
}

function stopPendingFlushPoll(): void {
  if (pendingFlushIntervalId !== null) {
    clearInterval(pendingFlushIntervalId);
    pendingFlushIntervalId = null;
  }
}

function startPendingFlushPoll(): void {
  if (pendingFlushIntervalId !== null) return;
  const startedAt = Date.now();
  pendingFlushIntervalId = setInterval(() => {
    if (!pendingNavigateToLogin) {
      stopPendingFlushPoll();
      return;
    }
    if (navigationRef.isReady()) {
      pendingNavigateToLogin = false;
      stopPendingFlushPoll();
      doResetToLogin();
      return;
    }
    if (Date.now() - startedAt > FLUSH_POLL_MAX_MS) {
      stopPendingFlushPoll();
      pendingNavigateToLogin = false;
    }
  }, FLUSH_POLL_MS);
}

/**
 * Call this from NavigationContainer onReady. Flushes any queued redirect to Login
 * so the user is always sent to Login after 401 even if the nav wasn't ready when the event fired.
 */
export function flushPendingNavigateToLogin(): void {
  if (!pendingNavigateToLogin) return;
  if (!navigationRef.isReady()) return;
  pendingNavigateToLogin = false;
  stopPendingFlushPoll();
  doResetToLogin();
}

/**
 * Type for any navigation object that can navigate to 'Settings'.
 * Used so we only call navigate('Settings') when we're inside a role stack (nested navigator).
 */
type NavWithSettings = { navigate: (name: 'Settings') => void; getParent?: () => unknown };

/**
 * Navigate to Settings only when the current navigator is a nested one (role stack).
 * Avoids "NAVIGATE with payload { name: 'Settings' } was not handled" when
 * the root navigator (Launch/Login/Register) is active.
 */
export function safeNavigateToSettings(navigation: NavWithSettings): void {
  try {
    if (navigation.getParent?.()) {
      navigation.navigate('Settings');
    }
  } catch {
    // Ignore if navigator not ready or screen not in stack
  }
}
