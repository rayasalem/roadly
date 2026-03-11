/**
 * Card with scale animation on press. Used for list items and tiles.
 * Uses shared spring config for consistent micro-interaction.
 */
import React, { useRef } from 'react';
import { Animated, Pressable, View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radii, shadows } from '../theme';
import { springListItem, LIST_ITEM_PRESS_SCALE } from '../utils/animations';

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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) Animated.spring(scale, { toValue: LIST_ITEM_PRESS_SCALE, ...springListItem }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, ...springListItem }).start();
  };

  return (
    <Pressable testID={testID} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    ...shadows.sm,
  },
});
