/**
 * Standard section title row for dashboards & long-scroll screens (Map-level hierarchy).
 */
import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { AppText } from '../AppText';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme';

export type DashboardSectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
};

function DashboardSectionHeaderInner({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
}: DashboardSectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.textCol}>
        <AppText variant="title3" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.textSecondary} style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <TouchableOpacity onPress={onActionPress} hitSlop={12} accessibilityRole="button">
          <AppText variant="callout" style={styles.action}>
            {actionLabel}
          </AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export const DashboardSectionHeader = memo(DashboardSectionHeaderInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  textCol: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  subtitle: { marginTop: spacing.xs / 2 },
  action: { color: colors.primary, fontFamily: typography.fontFamily.semibold },
});
