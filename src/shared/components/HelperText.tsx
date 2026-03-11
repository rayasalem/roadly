/**
 * Helper text or tooltip below inputs / for complex UI. Optional icon.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { typography, spacing } from '../theme';
import { useTheme } from '../theme';

export interface HelperTextProps {
  text: string;
  type?: 'hint' | 'error' | 'success';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const HelperText = React.memo(function HelperText({
  text,
  type = 'hint',
  icon,
}: HelperTextProps) {
  const { colors } = useTheme();
  const color = type === 'error' ? colors.error : type === 'success' ? colors.success : colors.textSecondary;
  const iconName = icon ?? (type === 'error' ? 'alert-circle-outline' : type === 'success' ? 'check-circle-outline' : 'information-outline');

  return (
    <View style={styles.wrap}>
      <MaterialCommunityIcons name={iconName} size={14} color={color} style={styles.icon} />
      <Text style={[styles.text, { color }]} numberOfLines={3}>
        {text}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    flex: 1,
  },
});
