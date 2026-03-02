import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../theme/colors';

function toastColor(type: 'success' | 'error' | 'info'): string {
  switch (type) {
    case 'success':
      return colors.success;
    case 'error':
      return colors.error;
    default:
      return colors.surface;
  }
}

export const ToastHost = React.memo(function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  const latest = toasts[toasts.length - 1];
  const anim = useRef(new Animated.Value(0)).current;

  const bg = useMemo(() => (latest ? toastColor(latest.type) : colors.surface), [latest]);

  useEffect(() => {
    if (!latest) return;

    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }).start();

    const duration = latest.durationMs ?? 2500;
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
        if (finished) dismissToast(latest.id);
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [latest, dismissToast, anim]);

  if (!latest) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: bg }]}>
        <Text style={styles.text} numberOfLines={3}>
          {latest.message}
        </Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
  },
  toast: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

