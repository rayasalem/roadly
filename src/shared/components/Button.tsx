/**
 * Design system button.
 * Variants: primary, secondary, outline, ghost. Accent maps to primary.
 * Min touch target: 44pt (md/lg). Uses spacing scale and typography presets.
 * Press feedback: scale 0.97 + opacity 0.92 (lightweight RN Animated).
 */
import React, { useRef } from 'react';
import { Animated, Platform, Pressable, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { useTheme, spacing, typography, radii } from '../theme';
import { springPress, PRESS_SCALE } from '../utils/animations';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const BORDER_WIDTH = 2;

function getBtnVariantStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return {
    primary: {
      backgroundColor: colors.primary,
      borderWidth: 0,
      borderColor: 'transparent' as const,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderWidth: 0,
      borderColor: 'transparent' as const,
    },
    danger: {
      backgroundColor: colors.error,
      borderWidth: 0,
      borderColor: 'transparent' as const,
    },
    outline: {
      backgroundColor: 'transparent' as const,
      borderWidth: BORDER_WIDTH,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent' as const,
      borderWidth: 0,
      borderColor: 'transparent' as const,
    },
  };
}

function getTextVariantStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return {
    primary: { color: colors.primaryContrast },
    secondary: { color: colors.secondaryContrast },
    danger: { color: colors.primaryContrast },
    outline: { color: colors.primary },
    ghost: { color: colors.primary },
  };
}

export const Button = React.memo(function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth,
  style,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const btnVariantStyles = getBtnVariantStyles(colors);
  const textVariantStyles = getTextVariantStyles(colors);
  const isDisabled = loading || disabled;
  const effectiveVariant = variant === 'accent' ? 'primary' : variant;
  const sizeStyle = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;
  const textSizeStyle = size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd;

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: PRESS_SCALE, ...springPress }),
      Animated.timing(opacity, { toValue: 0.92, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, ...springPress }),
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  };

  const btnStyle = [
    styles.btn,
    btnVariantStyles[effectiveVariant],
    sizeStyle,
    isDisabled && styles.disabled,
  ];
  const textStyle = [
    styles.text,
    textVariantStyles[effectiveVariant],
    textSizeStyle,
  ];

  const loaderColor =
    effectiveVariant === 'outline' || effectiveVariant === 'ghost'
      ? colors.primary
      : colors.primaryContrast;

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, style, { opacity, transform: [{ scale }] }]}>
      <Pressable
        testID={testID}
        style={({ pressed }) => [
          btnStyle,
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
          <ActivityIndicator size="small" color={loaderColor} />
        ) : (
          <Text style={textStyle}>{title}</Text>
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
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.9 },
  text: {
    fontFamily: typography.fontFamily.semibold,
  },
  textSm: {
    fontSize: typography.presets.bodySmall.fontSize,
  },
  textMd: {
    fontSize: typography.presets.body.fontSize,
  },
  textLg: {
    fontSize: typography.presets.subtitle.fontSize,
  },
});
