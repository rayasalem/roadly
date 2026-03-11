/**
 * Map legend: marker colors for Available, Busy, Offline, Your location.
 * Uses theme colors for consistency.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../../shared/components/AppText';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

const LEGEND_ITEMS: { key: string; colorKey: 'primary' | 'warning' | 'textMuted' | 'mapUser'; labelKey: string }[] = [
  { key: 'available', colorKey: 'primary' as const, labelKey: 'map.legend.available' },
  { key: 'busy', colorKey: 'warning' as const, labelKey: 'map.legend.busy' },
  { key: 'offline', colorKey: 'textMuted' as const, labelKey: 'map.legend.offline' },
  { key: 'you', colorKey: 'mapUser' as const, labelKey: 'map.legend.you' },
];

export interface MapLegendProps {
  /** Compact horizontal layout when true */
  compact?: boolean;
}

export function MapLegend({ compact }: MapLegendProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {LEGEND_ITEMS.map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: colors[item.colorKey] }]} />
          <AppText variant="caption" style={[styles.label, { color: colors.textSecondary }]}>
            {t(item.labelKey)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'column',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  wrapCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
  },
});
