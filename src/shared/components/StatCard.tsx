/**
 * Single stat display (number + label) for dashboards.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing } from '../theme';
import { colors } from '../theme/colors';

export interface StatCardProps {
  value: string | number;
  label: string;
  accentColor?: string;
}

export const StatCard = React.memo(function StatCard({
  value,
  label,
  accentColor = colors.primary,
}: StatCardProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.value, { color: accentColor }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    minWidth: 72,
  },
  value: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
