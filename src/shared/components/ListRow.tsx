/**
 * Standard list row: optional leading icon, title, subtitle, trailing (chevron / badge).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, spacing, radii } from '../theme';
import { HIT_SLOP_DEFAULT } from '../constants/ux';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  leadingIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  trailing?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
};

export function ListRow({ title, subtitle, onPress, leadingIcon, trailing, disabled, style }: ListRowProps) {
  const { colors } = useTheme();
  const content = (
    <>
      {leadingIcon ? (
        <View style={[styles.lead, { backgroundColor: colors.primary + '18' }]}>
          <MaterialCommunityIcons name={leadingIcon as any} size={22} color={colors.primary} />
        </View>
      ) : (
        <View style={styles.leadSpacer} />
      )}
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing != null ? <View style={styles.trail}>{trailing}</View> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && !disabled && { opacity: 0.92 },
          style,
        ]}
        accessibilityRole="button"
        hitSlop={HIT_SLOP_DEFAULT}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{content}</View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  lead: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.md,
  },
  leadSpacer: { width: 0, marginEnd: 0 },
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 4 },
  trail: { marginStart: spacing.sm },
});
