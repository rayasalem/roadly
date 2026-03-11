import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '../../../../shared/components/AppText';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';

type FilterRole = string | null;

interface MapFiltersBarProps {
  filterRole: FilterRole;
  onFilterChange: (role: FilterRole) => void;
  filterOptions: FilterRole[];
  getLabel: (role: FilterRole) => string;
}

export function MapFiltersBar({ filterRole, onFilterChange, filterOptions, getLabel }: MapFiltersBarProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {filterOptions.map((role) => (
        <TouchableOpacity
          key={role ?? 'all'}
          style={[styles.chip, { backgroundColor: filterRole === role ? colors.primary : 'rgba(255,255,255,0.9)' }, shadows.sm]}
          onPress={() => onFilterChange(role)}
          accessibilityRole="button"
        >
          <AppText variant="callout" style={[styles.chipText, { color: filterRole === role ? colors.primaryContrast : colors.text }]}>
            {getLabel(role)}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    pointerEvents: 'box-none',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  chipText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.caption },
});
