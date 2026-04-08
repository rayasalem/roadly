/**
 * Uber-style card: white background, rounded, two-row layout with dot indicators.
 * Use for pickup/dropoff-style blocks and similar list items.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, typography, radii, shadows } from '../theme';
import { useLocaleStore } from '../../store/localeStore';
import { trailingChevronForLocale } from '../i18n/rtlUtils';

export interface UberStyleRow {
  label: string;
  value: string;
  /** Green dot = pickup, gray = destination. Default true for first row. */
  isOrigin?: boolean;
  onPress?: () => void;
  rightIcon?: 'chevron-right' | 'chevron-down' | 'map-marker';
}

export interface UberStyleCardProps {
  rows: UberStyleRow[];
  onPress?: () => void;
  style?: ViewStyle;
  /** Show dividers between rows. */
  showDividers?: boolean;
}

export function UberStyleCard({ rows, onPress, style, showDividers = true }: UberStyleCardProps) {
  const locale = useLocaleStore((s) => s.locale);
  const trailingChevron = trailingChevronForLocale(locale);
  const dotSize = 12;
  const dotOffset = spacing.md + dotSize / 2;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      style={[styles.card, style]}
      disabled={!onPress}
    >
      {rows.map((row, index) => (
        <React.Fragment key={index}>
          {index > 0 && showDividers ? (
            <View style={[styles.divider, { marginStart: dotOffset }]} />
          ) : null}
          <TouchableOpacity
            style={styles.row}
            activeOpacity={row.onPress ? 0.8 : 1}
            onPress={row.onPress}
            disabled={!row.onPress}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: row.isOrigin !== false && index === 0 ? colors.primary : colors.textMuted },
              ]}
            />
            <View style={styles.col}>
              <Text style={styles.label} numberOfLines={1}>
                {row.label}
              </Text>
              <Text style={styles.value} numberOfLines={1}>
                {row.value}
              </Text>
            </View>
            {row.rightIcon ? (
              <MaterialCommunityIcons name={row.rightIcon} size={22} color={colors.textMuted} />
            ) : null}
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.uberCard ?? colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginEnd: spacing.md,
  },
  col: {
    flex: 1,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  value: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
