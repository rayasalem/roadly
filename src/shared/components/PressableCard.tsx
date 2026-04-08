/**
 * Card with scale animation on press. Used for list items and tiles.
 * Uses shared spring config for consistent micro-interaction.
 */
import React, { useRef } from 'react';
import { Animated, Pressable, View, StyleSheet, type ViewStyle } from 'react-native';
import { radii, shadows, spacing, useTheme } from '../theme';
import { springListItem, LIST_ITEM_PRESS_SCALE } from '../utils/animations';
import { HIT_SLOP_DEFAULT } from '../constants/ux';

export interface PressableCardProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  testID?: string;
}

export const PressableCard = React.memo(function PressableCard({
  children,
  onPress,
  style,
  disabled,
  testID,
}: PressableCardProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) Animated.spring(scale, { toValue: LIST_ITEM_PRESS_SCALE, ...springListItem }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, ...springListItem }).start();
  };

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={HIT_SLOP_DEFAULT}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale }], opacity: disabled ? 0.6 : 1 },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginVertical: 0,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
