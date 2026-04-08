import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../theme/colors';
import { typography, spacing, shadows } from '../theme';
import { TOAST_ENTER_DURATION, TOAST_EXIT_DURATION } from '../utils/animations';

function toastStyle(type: 'success' | 'error' | 'info' | 'warning'): { bg: string; text: string } {
  switch (type) {
    case 'success':
      return { bg: colors.success, text: '#FFFFFF' };
    case 'error':
      return { bg: colors.error, text: '#FFFFFF' };
    case 'warning':
      return { bg: colors.warning, text: '#000000' };
    default:
      return { bg: colors.surface, text: colors.text };
  }
}

export const ToastHost = React.memo(function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);
  const insets = useSafeAreaInsets();

  const latest = toasts[toasts.length - 1];
  const anim = useRef(new Animated.Value(0)).current;

  const { bg, text: textColor } = useMemo(
    () => (latest ? toastStyle(latest.type) : { bg: colors.surface, text: colors.text }),
    [latest]
  );

  useEffect(() => {
    if (!latest) return;

    const useNativeDriver = false;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: TOAST_ENTER_DURATION,
      useNativeDriver,
      easing: Easing.out(Easing.cubic),
    }).start();

    const duration = latest.durationMs ?? 3000;
    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: TOAST_EXIT_DURATION,
        useNativeDriver,
        easing: Easing.in(Easing.cubic),
      }).start(({ finished }) => {
        if (finished) dismissToast(latest.id);
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [latest, dismissToast, anim]);

  if (!latest) return null;

  const iconName =
    latest.type === 'success'
      ? 'check-circle'
      : latest.type === 'error'
      ? 'alert-circle'
      : 'information';

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: Math.max(insets.bottom, 16) + 72, pointerEvents: 'box-none' as const },
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: bg }]}>
        <MaterialCommunityIcons
          name={iconName as any}
          size={20}
          color={textColor}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: textColor }]} numberOfLines={3}>
          {latest.message}
        </Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    alignSelf: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
    ...shadows.lg,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.callout,
    textAlign: 'left',
  },
});

