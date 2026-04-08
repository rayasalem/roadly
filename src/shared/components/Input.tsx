/**
 * Underline-style input with floating label, optional left icon, error text.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
  Animated,
} from 'react-native';
import { spacing, typography, useTheme } from '../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

const LABEL_FLOAT = 18;

export const Input = React.memo(function Input({
  label,
  error,
  hint,
  containerStyle,
  leftAdornment,
  rightAdornment,
  onFocus,
  onBlur,
  onChangeText,
  value,
  defaultValue,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState(defaultValue ?? '');
  const anim = useRef(new Animated.Value(0)).current;
  const hasError = Boolean(error);

  const filled = useMemo(() => {
    const v = value !== undefined ? value : internal;
    return typeof v === 'string' && v.length > 0;
  }, [value, internal]);

  const shouldFloat = focused || filled;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: shouldFloat ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [shouldFloat, anim]);

  const labelTop = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 4],
  });
  const labelSize = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [typography.presets.body.fontSize, typography.presets.caption.fontSize],
  });
  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, hasError ? colors.error : colors.primary],
  });

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      if (value === undefined) setInternal(text);
      onChangeText?.(text);
    },
    [onChangeText, value],
  );

  const borderColor = hasError ? colors.error : focused ? colors.borderFocus : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Animated.Text
          pointerEvents="none"
          style={[
            styles.floatingLabel,
            {
              top: labelTop,
              fontSize: labelSize,
              color: labelColor,
            },
          ]}
          accessibilityRole="text"
        >
          {label}
        </Animated.Text>
      ) : null}
      <View
        style={[
          styles.row,
          {
            borderBottomColor: borderColor,
            borderBottomWidth: hasError ? 2 : 1.5,
            minHeight: LABEL_FLOAT + 36,
            paddingTop: label ? LABEL_FLOAT : 0,
          },
        ]}
      >
        {leftAdornment ? <View style={styles.adornment}>{leftAdornment}</View> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { color: colors.text },
            leftAdornment ? styles.inputWithLeft : undefined,
            rightAdornment ? styles.inputWithRight : undefined,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          value={value}
          defaultValue={defaultValue}
          accessibilityLabel={label ?? rest.placeholder}
          accessibilityState={{ disabled: rest.editable === false }}
          accessibilityHint={hint ?? undefined}
          {...rest}
        />
        {rightAdornment ? <View style={styles.adornment}>{rightAdornment}</View> : null}
      </View>
      {error ? (
        <Text
          style={[styles.error, { color: colors.error }]}
          numberOfLines={2}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
      {hint && !error ? (
        <Text style={[styles.helper, { color: colors.textMuted }]} numberOfLines={2}>
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
  floatingLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    fontFamily: typography.fontFamily.medium,
    ...(Platform.OS === 'web' && { userSelect: 'none' }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0 } as ViewStyle) : {}),
  },
  input: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
  },
  inputWithLeft: { marginLeft: spacing.xs },
  inputWithRight: { marginRight: spacing.xs },
  adornment: {
    paddingRight: spacing.sm,
  },
  error: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    marginTop: spacing.xs,
  },
  helper: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    marginTop: spacing.xs,
  },
});
