/**
 * Map legend: marker colors for Available, Busy, Offline, Your location.
 * Uses theme colors for consistency.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../../shared/components/AppText';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

type LegendColorKey = 'primary' | 'warning' | 'textMuted' | 'mapUser' | 'mapMechanic' | 'mapTow' | 'mapRental';

const STATUS_LEGEND_ITEMS: { key: string; colorKey: LegendColorKey; labelKey: string }[] = [
  { key: 'available', colorKey: 'primary', labelKey: 'map.legend.available' },
  { key: 'busy', colorKey: 'warning', labelKey: 'map.legend.busy' },
  { key: 'offline', colorKey: 'textMuted', labelKey: 'map.legend.offline' },
  { key: 'you', colorKey: 'mapUser', labelKey: 'map.legend.you' },
];

const ROLE_LEGEND_ITEMS: { key: string; colorKey: LegendColorKey; labelKey: string }[] = [
  { key: 'mechanic', colorKey: 'mapMechanic', labelKey: 'map.legend.mechanic' },
  { key: 'tow', colorKey: 'mapTow', labelKey: 'map.legend.tow' },
  { key: 'rental', colorKey: 'mapRental', labelKey: 'map.legend.rental' },
];

export interface MapLegendProps {
  /** Compact horizontal layout when true */
  compact?: boolean;
}

export function MapLegend({ compact }: MapLegendProps) {
  const { colors } = useTheme();
  const themeColors = colors as Record<LegendColorKey, string>;
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {STATUS_LEGEND_ITEMS.map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: themeColors[item.colorKey] }]} />
          <AppText variant="caption" style={[styles.label, { color: colors.textSecondary }]}>
            {t(item.labelKey)}
          </AppText>
        </View>
      ))}
      {ROLE_LEGEND_ITEMS.map((item) => (
        <View key={`role-${item.key}`} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: themeColors[item.colorKey] }]} />
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
