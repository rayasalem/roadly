/**
 * Single row: label + 1-5 stars. Used for overall, speed, quality, professionalism.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../../shared/components/AppText';
import { useTheme } from '../../../../shared/theme';
import { spacing } from '../../../../shared/theme';

const STAR_COLOR_ACTIVE = '#F59E0B';
const STAR_COLOR_INACTIVE = '#D1D5DB';

interface StarRatingRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRatingRow({ label, value, onChange, disabled }: StarRatingRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <AppText variant="callout" style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </AppText>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => !disabled && onChange(n)}
            style={styles.starTouch}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: n <= value }}
          >
            <MaterialCommunityIcons
              name={n <= value ? 'star' : 'star-outline'}
              size={32}
              color={n <= value ? STAR_COLOR_ACTIVE : STAR_COLOR_INACTIVE}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  label: { flex: 1 },
  stars: { flexDirection: 'row', gap: 4 },
  starTouch: { padding: 4 },
});
