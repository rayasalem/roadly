/**
 * Reusable text input — design system.
 * Supports label, error, hint, focus state, and accessibility.
 */
import React, { useCallback, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography, radii } from '../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

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
          {...rest}
        />
        {rightAdornment ? <View style={styles.adornment}>{rightAdornment}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    minHeight: 48,
  },
  inputWrapError: {
    borderColor: colors.error,
  },
  inputWrapFocused: {
    borderColor: colors.borderFocus,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  inputWithLeft: { paddingLeft: spacing.xs },
  inputWithRight: { paddingRight: spacing.xs },
  adornment: {
    paddingHorizontal: spacing.sm,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
