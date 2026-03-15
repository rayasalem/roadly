/**
 * Floating action button with icon. Optional role theme color.
 */
import React, { useRef } from 'react';
import { Animated, Platform, Pressable, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radii, shadows } from '../theme';
import type { RoleThemeId } from '../theme/roleThemes';
import { ROLE_THEMES } from '../theme/roleThemes';
import { HIT_SLOP_ICON } from '../constants/ux';

export interface FABProps {
  icon: string;
  onPress: () => void;
  role?: RoleThemeId;
  accessibilityLabel?: string;
}

export const FAB = React.memo(function FAB({
  icon,
  onPress,
  role,
  accessibilityLabel,
}: FABProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const theme = role ? ROLE_THEMES[role] : null;
  const bg = theme?.primary ?? colors.primary;

  const useNativeDriver = false;
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={HIT_SLOP_ICON}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? 'Action'}
    >
      <Animated.View style={[styles.fab, { backgroundColor: bg }, { transform: [{ scale }] }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={colors.primaryContrast} />
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
});
