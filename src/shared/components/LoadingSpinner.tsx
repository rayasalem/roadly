import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme';
import { t } from '../i18n/t';

interface LoadingSpinnerProps {
  message?: string;
}

/**
 * مؤشر تحميل موحد — نستخدمه في الشاشات أثناء جلب البيانات
 */
export function LoadingSpinner({ message = t('common.loading') }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
  },
});
