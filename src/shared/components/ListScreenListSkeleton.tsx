/**
 * Placeholder rows for list screens while data loads (perceived performance).
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { spacing, radii, shadows, useTheme } from '../theme';
import { t } from '../i18n/t';

export function ListScreenListSkeleton({ rows = 6 }: { rows?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loadingList')}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={`sk-${index}`}
          style={[
            styles.row,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            shadows.sm,
          ]}
        >
          <Skeleton width={44} height={44} radius={22} />
          <View style={styles.textCol}>
            <Skeleton width="72%" height={16} radius={radii.md} />
            <Skeleton width="100%" height={12} radius={radii.sm} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
});
