/**
 * Reusable error fallback with retry action. Use when a query or request fails.
 * Keeps loading and errors visible to the user.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from './Button';
import { AppText } from './AppText';
import { radii, spacing, useTheme } from '../theme';
import { t } from '../i18n/t';

export interface ErrorWithRetryProps {
  /** Short headline (clarity). */
  title?: string;
  /** Detail / server or network message */
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
  /** Tighter layout for sheets/cards (e.g. map bottom card). */
  compact?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function ErrorWithRetry({
  title = t('error.screenTitle'),
  message,
  onRetry,
  isRetrying = false,
  compact = false,
  style,
  testID = 'error-with-retry',
}: ErrorWithRetryProps) {
  const { colors } = useTheme();
  const showDetail = Boolean(message?.trim());

  if (compact) {
    return (
      <View style={[styles.outerCompact, style]} testID={testID}>
        <View style={styles.compactRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={22} color={colors.warning} style={styles.compactIcon} />
          <AppText variant="callout" weight="semibold" style={styles.compactText} numberOfLines={3}>
            {showDetail ? message : title}
          </AppText>
        </View>
        <Button
          testID={`${testID}-button`}
          title={isRetrying ? t('common.loading') : t('common.retry')}
          onPress={onRetry}
          disabled={isRetrying}
          variant="primary"
          fullWidth
          size="md"
          style={styles.buttonCompact}
        />
      </View>
    );
  }

  return (
    <View style={[styles.outer, style]} testID={testID}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <MaterialCommunityIcons name="alert-circle-outline" size={44} color={colors.warning} style={styles.icon} />
        <AppText variant="title3" weight="semibold" center style={styles.title}>
          {title}
        </AppText>
        {showDetail ? (
          <AppText variant="body" color={colors.textSecondary} center style={styles.detail}>
            {message}
          </AppText>
        ) : null}
        <Button
          testID={`${testID}-button`}
          title={isRetrying ? t('common.loading') : t('common.retry')}
          onPress={onRetry}
          disabled={isRetrying}
          variant="primary"
          fullWidth
          size="lg"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  outerCompact: {
    width: '100%',
    paddingVertical: spacing.xs,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  compactIcon: {
    marginTop: 2,
  },
  compactText: {
    flex: 1,
    minWidth: 0,
  },
  buttonCompact: {
    marginTop: spacing.xs,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    alignItems: 'center',
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  detail: {
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.xs,
  },
});
