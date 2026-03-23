/**
 * Design system button.
 * Primary: green background, white text, rounded corners, 48px height.
 * Secondary/Outline: white background, green border, green text.
 * Press feedback: scale + opacity for visual feedback.
 */
import React, { useRef } from 'react';
import { Animated, Platform, Pressable, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { useTheme, spacing, typography, radii, shadows } from '../theme';
import { springPress, PRESS_SCALE } from '../utils/animations';
import { HIT_SLOP_DEFAULT } from '../constants/ux';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger' | 'uber';
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
const PRIMARY_HEIGHT = 48;

function getBtnVariantStyles(colors: ReturnType<typeof useTheme>['colors']) {
  const secondaryStyle = {
    backgroundColor: colors.surface,
    borderWidth: BORDER_WIDTH,
    borderColor: colors.primary,
  };
  const uberStyle = {
    backgroundColor: (colors as { uberBlack?: string }).uberBlack ?? '#000000',
    borderWidth: 0,
    borderColor: 'transparent' as const,
  };
  return {
    primary: {
      backgroundColor: colors.primary,
      borderWidth: 0,
      borderColor: 'transparent' as const,
    },
    secondary: secondaryStyle,
    danger: {
      backgroundColor: colors.error,
      borderWidth: 0,
      borderColor: 'transparent' as const,
    },
    outline: secondaryStyle,
    ghost: {
      backgroundColor: 'transparent' as const,
      borderWidth: 0,
      borderColor: 'transparent' as const,
    },
    uber: uberStyle,
  };
}

function getTextVariantStyles(colors: ReturnType<typeof useTheme>['colors']) {
  const secondaryText = { color: colors.primary };
  const uberText = { color: (colors as { uberTextOnDark?: string }).uberTextOnDark ?? '#FFFFFF' };
  return {
    primary: { color: colors.primaryContrast },
    secondary: secondaryText,
    danger: { color: colors.primaryContrast },
    outline: secondaryText,
    ghost: { color: colors.primary },
    uber: uberText,
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
    if (isDisabled) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: PRESS_SCALE, ...springPress }),
      Animated.timing(opacity, { toValue: 0.88, duration: 60, useNativeDriver: false }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, ...springPress }),
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: false }),
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
    effectiveVariant === 'outline' || effectiveVariant === 'secondary' || effectiveVariant === 'ghost'
      ? colors.primary
      : effectiveVariant === 'uber'
      ? ((colors as { uberTextOnDark?: string }).uberTextOnDark ?? '#FFFFFF')
      : colors.primaryContrast;

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, style, { opacity, transform: [{ scale }] }]}>
      <Pressable
        testID={testID}
        hitSlop={HIT_SLOP_DEFAULT}
        style={(state) => [
          btnStyle,
          state.pressed && !isDisabled && styles.pressed,
          Platform.OS === 'web' &&
            (state as { hovered?: boolean }).hovered &&
            !isDisabled &&
            styles.hoverWeb,
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
    borderRadius: radii.lg,
    minHeight: PRIMARY_HEIGHT,
    paddingVertical: 14,
    paddingHorizontal: 20,
    ...shadows.md,
  },
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  md: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    minHeight: PRIMARY_HEIGHT,
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: PRIMARY_HEIGHT,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  hoverWeb: {
    opacity: 0.94,
  },
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
