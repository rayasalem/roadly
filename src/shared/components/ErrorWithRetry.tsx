/**
 * Reusable error fallback with retry action. Use when a query or request fails.
 * Keeps loading and errors visible to the user.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme';
import { t } from '../i18n/t';

export interface ErrorWithRetryProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function ErrorWithRetry({
  message,
  onRetry,
  isRetrying = false,
  style,
  testID = 'error-with-retry',
}: ErrorWithRetryProps) {
  return (
    <View style={[styles.wrap, style]} testID={testID}>
      <MaterialCommunityIcons name="wifi-off" size={40} color={colors.textMuted} style={styles.icon} />
      <Text style={styles.title} numberOfLines={2}>
        {message}
      </Text>
      <Button
        testID={`${testID}-button`}
        title={isRetrying ? t('common.loading') : t('common.retry')}
        onPress={onRetry}
        disabled={isRetrying}
        fullWidth
        size="lg"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.xs,
  },
});
