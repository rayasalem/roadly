/**
 * Reusable button — design system.
 * Variants: primary (brand), accent (urgent action), outline, ghost.
 * Includes a subtle scale animation on press.
 */
import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography, radii } from '../theme';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const Button = React.memo(function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth,
}: ButtonProps) {
  const isDisabled = loading || disabled;
  const sizeStyle = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;

  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  };

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale }] }]}>
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          styles[`btn_${variant}`],
          sizeStyle,
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled }}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.primaryContrast}
          />
        ) : (
          <Text style={[styles.text, styles[`text_${variant}`], size === 'sm' && styles.textSm, size === 'lg' && styles.textLg]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  btn_primary: {
    backgroundColor: colors.primary,
  },
  btn_accent: {
    backgroundColor: colors.accent,
  },
  btn_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  btn_ghost: {
    backgroundColor: 'transparent',
  },
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 },
  md: { paddingVertical: 14, paddingHorizontal: spacing.lg, minHeight: 48 },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 52 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.9 },
  text: {
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
  text_primary: { color: colors.primaryContrast },
  text_accent: { color: colors.accentContrast },
  text_outline: { color: colors.primary },
  text_ghost: { color: colors.primary },
  textSm: { fontSize: typography.fontSize.sm },
  textLg: { fontSize: typography.fontSize.lg },
});
