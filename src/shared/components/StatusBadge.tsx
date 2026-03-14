/**
 * Unified status badge for requests/jobs/vehicles. Supports variant colors and optional pulse.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { typography, spacing, radii } from '../theme';

export type StatusVariant = 'pending' | 'active' | 'completed' | 'cancelled' | 'queued' | 'available' | 'rented' | 'maintenance' | 'reserved' | 'neutral';

const VARIANT_BG: Record<StatusVariant, string> = {
  pending: '#FEF3C7',
  active: '#D1FAE5',
  completed: '#E0F2FE',
  cancelled: '#FEE2E2',
  queued: '#FFEDD5',
  available: '#D1FAE5',
  rented: '#FFEDD5',
  maintenance: '#FEE2E2',
  reserved: '#E0E7FF',
  neutral: '#F3F4F6',
};

const VARIANT_FG: Record<StatusVariant, string> = {
  pending: '#B45309',
  active: '#065F46',
  completed: '#0369A1',
  cancelled: '#B91C1C',
  queued: '#C2410C',
  available: '#065F46',
  rented: '#C2410C',
  maintenance: '#B91C1C',
  reserved: '#3730A3',
  neutral: '#4B5563',
};

export interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge = React.memo(function StatusBadge({
  label,
  variant = 'neutral',
  pulse = false,
  size = 'md',
}: StatusBadgeProps) {
  const anim = useRef(new Animated.Value(1)).current;
  const bg = VARIANT_BG[variant];
  const fg = VARIANT_FG[variant];

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.08, useNativeDriver: false, duration: 600 }),
        Animated.timing(anim, { toValue: 1, useNativeDriver: false, duration: 600 }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, anim]);

  const wrap = pulse ? (
    <Animated.View style={[styles.wrap, { backgroundColor: bg }, { transform: [{ scale: anim }] }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  ) : (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  return wrap;
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
  },
  labelSm: {
    fontSize: 11,
  },
});
