/**
 * Reusable card — design system.
 * Use for provider items, list rows, and content blocks.
 * Includes a subtle scale animation on press.
 */
import React, { useRef } from 'react';
import { Animated, Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii, shadows } from '../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
}

export const Card = React.memo(function Card({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = 'lg',
}: CardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  };

  const cardStyle = [
    styles.base,
    styles[`padding_${padding}`],
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    style,
  ];
  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          style={cardStyle}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }
  return <View style={cardStyle}>{children}</View>;
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  elevated: {
    ...shadows.sm,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  padding_xs: { padding: spacing.xs },
  padding_sm: { padding: spacing.sm },
  padding_md: { padding: spacing.md },
  padding_lg: { padding: spacing.lg },
  padding_xl: { padding: spacing.xl },
  padding_xxl: { padding: spacing.xxl },
  padding_xxxl: { padding: spacing.xxxl },
});
