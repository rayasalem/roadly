import React, { useEffect, useState, useCallback } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, ErrorUtils } from 'react-native';
import { navigationRef } from '../../navigation/navigationRef';
import { t } from '../i18n/t';
import { colors } from '../theme/colors';
import { spacing, typography, radii } from '../theme';

/**
 * Global runtime protection:
 * - Captures unhandled JS errors (web + RN)
 * - Shows a non-blank fallback UI instead of letting the app remain white/silent.
 * - Logs errors but tries to prevent fatal crashes UX-wise.
 *
 * Note: React Native redbox may still appear in dev; this component guarantees a fallback UI.
 */
export function GlobalRuntimeProtection() {
  const [fatal, setFatal] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const reload = useCallback(() => {
    try {
      if (Platform.OS === 'web') {
        window.location.reload();
        return;
      }
    } catch {
      // ignore
    }
    try {
      // Fallback: reset to a safe screen if navigation is ready.
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Map' as any }] });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onWebError = (event: ErrorEvent) => {
      const msg = event?.message ?? 'Unknown error';
      setLastMessage(msg);
      setFatal(true);
      // eslint-disable-next-line no-console
      console.error('[GlobalRuntimeProtection] web error:', event?.error ?? msg);
    };

    const onWebRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const msg = reason instanceof Error ? reason.message : String(reason ?? 'Unhandled promise rejection');
      setLastMessage(msg);
      setFatal(true);
      // eslint-disable-next-line no-console
      console.error('[GlobalRuntimeProtection] unhandled rejection:', reason);
    };

    if (Platform.OS === 'web') {
      window.addEventListener('error', onWebError);
      window.addEventListener('unhandledrejection', onWebRejection);
      return () => {
        window.removeEventListener('error', onWebError);
        window.removeEventListener('unhandledrejection', onWebRejection);
      };
    }

    // React Native global handler (best-effort).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((ErrorUtils as any)?.setGlobalHandler) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ErrorUtils as any).setGlobalHandler((error: any, isFatal?: boolean) => {
        setLastMessage(error?.message ?? String(error ?? 'Unknown error'));
        if (isFatal) setFatal(true);
        // eslint-disable-next-line no-console
        console.error('[GlobalRuntimeProtection] native global error:', error);
      });
    }
  }, []);

  if (!fatal) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.card}>
        <Text style={styles.title}>{t('errors.unknown')}</Text>
        {lastMessage ? <Text style={styles.message} numberOfLines={3}>{lastMessage}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={reload} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{t('common.retry') ?? 'Retry'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    fontSize: typography.fontSize.title2,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  buttonText: {
    fontFamily: typography.fontFamily.semibold,
    color: colors.primaryContrast,
    fontSize: typography.fontSize.md,
  },
});

