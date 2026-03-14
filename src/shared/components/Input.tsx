/**
 * Design system text input.
 * Label, focus state (ring + optional shadow), error state (border + background tint), helper text.
 * Accessibility: label, live region for error, disabled state.
 */
import React, { useCallback, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography, radii } from '../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  /** Helper text below input (hint); hidden when error is shown */
  hint?: string;
  containerStyle?: ViewStyle;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

const FOCUS_RING_WIDTH = 2;
const ERROR_RING_WIDTH = 2;

export const Input = React.memo(function Input({
  label,
  error,
  hint,
  containerStyle,
  leftAdornment,
  rightAdornment,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  const handleFocus = useCallback(
    (e: any) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );
  const handleBlur = useCallback(
    (e: any) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const wrapStyle = [
    styles.inputWrap,
    hasError && styles.inputWrapError,
    focused && !hasError && styles.inputWrapFocused,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      ) : null}
      <View style={wrapStyle}>
        {leftAdornment ? <View style={styles.adornment}>{leftAdornment}</View> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            leftAdornment && styles.inputWithLeft,
            rightAdornment && styles.inputWithRight,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label ?? rest.placeholder}
          accessibilityState={{ disabled: rest.editable === false }}
          accessibilityHint={hint ?? undefined}
          {...rest}
        />
        {rightAdornment ? <View style={styles.adornment}>{rightAdornment}</View> : null}
      </View>
      {error ? (
        <Text
          style={styles.error}
          numberOfLines={2}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
      {hint && !error ? (
        <Text style={styles.helper} numberOfLines={2}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    minHeight: 48,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
    }),
  },
  inputWrapFocused: {
    borderWidth: FOCUS_RING_WIDTH,
    borderColor: colors.borderFocus,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 2,
        }
      : Platform.OS === 'web'
      ? {
          boxShadow: '0px 0px 6px rgba(34,197,94,0.4)',
        }
      : {}),
  },
  inputWrapError: {
    borderWidth: ERROR_RING_WIDTH,
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
  },
  inputWithLeft: { paddingLeft: spacing.xs },
  inputWithRight: { paddingRight: spacing.xs },
  adornment: {
    paddingHorizontal: spacing.sm,
  },
  error: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helper: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
