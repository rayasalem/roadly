/**
 * Design system card.
 * Elevation: none | sm | md | lg. Rounded corners from radii. Padding from spacing scale.
 * Use for content containers, list items, and tappable tiles.
 * Press feedback: scale animation (lightweight RN Animated).
 */
import React, { useRef } from 'react';
import { Animated, Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, radii, shadows, useTheme } from '../theme';
import { springPress, PRESS_SCALE } from '../utils/animations';
import { HIT_SLOP_DEFAULT } from '../constants/ux';

export type CardElevation = 'none' | 'sm' | 'md' | 'lg';
export type CardPadding = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
export type CardRadius = 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  elevation?: CardElevation;
  padding?: CardPadding;
  /** Corner radius; default lg */
  radius?: CardRadius;
  onPress?: () => void;
  style?: ViewStyle;
}

const paddingMap: Record<CardPadding, number> = {
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
  xxl: spacing.xxl,
  xxxl: spacing.xxl,
};

const radiusMap: Record<CardRadius, number> = {
  sm: radii.sm,
  md: radii.md,
  lg: radii.lg,
  xl: radii.xl,
};

/** Default radius for modern card look */
const DEFAULT_CARD_RADIUS: CardRadius = 'xl';

export const Card = React.memo(function Card({
  children,
  variant = 'elevated',
  elevation: elevationProp,
  padding = 'lg',
  radius = DEFAULT_CARD_RADIUS,
  onPress,
  style,
}: CardProps) {
  const { colors } = useTheme();
  const elevation = elevationProp ?? (variant === 'elevated' ? 'sm' : 'none');
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scale, { toValue: PRESS_SCALE, ...springPress }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scale, { toValue: 1, ...springPress }).start();
  };

  const paddingVal = paddingMap[padding];
  const radiusVal = radiusMap[radius];
  const cardStyle: ViewStyle[] = [
    styles.base,
    // Keep spacing responsibilities outside the Card for consistent layouts.
    { borderRadius: radiusVal, padding: paddingVal, marginVertical: 0 },
    variant === 'elevated' && elevation !== 'none' && shadows[elevation],
    variant === 'outlined' && styles.outlined,
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          style={cardStyle}
          hitSlop={HIT_SLOP_DEFAULT}
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
  base: {},
  outlined: {
    borderWidth: 1,
  },
});
