import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { spacing, radii, shadows } from '../theme';
import type { RoleThemeId } from '../theme/roleThemes';
import { ROLE_THEMES } from '../theme/roleThemes';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  role?: RoleThemeId;
  noPadding?: boolean;
}

export const GlassCard = React.memo(function GlassCard({
  children,
  style,
  role,
  noPadding,
}: GlassCardProps) {
  const tint = role ? ROLE_THEMES[role].primaryLight : undefined;
  return (
    <View
      style={[
        styles.card,
        tint && { backgroundColor: tint + '40', borderColor: tint + '60' },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    ...shadows.md,
  },
  padding: {
    padding: spacing.lg,
  },
});
