/**
 * Ride-style header: back (optional), centered title or logo (icon + app name), profile badge right.
 * Use centerLogo to show icon + app name instead of a bare image, so the logo never appears empty.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, spacing, typography } from '../theme';
import { t } from '../i18n/t';

type AppHeaderProps = {
  title: string;
  /** When true, center shows icon + app name (no image), so logo is never empty. */
  centerLogo?: boolean;
  onBack?: () => void;
  onProfile?: () => void;
  /** Called when right icon is pressed (e.g. calendar). If not set, calendar icon has no action. */
  onRightPress?: () => void;
  rightIcon?: 'profile' | 'calendar' | 'settings' | 'none';
  style?: ViewStyle;
};

export function AppHeader({
  title,
  centerLogo = false,
  onBack,
  onProfile,
  onRightPress,
  rightIcon = 'profile',
  style,
}: AppHeaderProps) {
  const { colors } = useTheme();
  const centerContent = centerLogo ? (
    <View style={styles.logoRow}>
      <MaterialCommunityIcons name="car-side" size={24} color={colors.primary} style={styles.logoIcon} />
      <Text style={[styles.title, styles.logoTitle, { color: colors.text }]} numberOfLines={1}>
        {t('app.name')}
      </Text>
    </View>
  ) : (
    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
      {title ?? ''}
    </Text>
  );
  return (
    <View style={[styles.root, style]}>
      <View style={styles.side}>
        {typeof onBack === 'function' ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityRole="button">
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      {centerContent}
      <View style={styles.side}>
        {rightIcon === 'profile' ? (
          <TouchableOpacity
            onPress={typeof onProfile === 'function' ? onProfile : undefined}
            style={styles.iconBtn}
            accessibilityRole="button"
            disabled={typeof onProfile !== 'function'}
          >
            <MaterialCommunityIcons name="shield-account-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : rightIcon === 'calendar' ? (
          <TouchableOpacity
            onPress={typeof onRightPress === 'function' ? onRightPress : undefined}
            style={styles.iconBtn}
            accessibilityRole="button"
            disabled={typeof onRightPress !== 'function'}
          >
            <MaterialCommunityIcons name="calendar-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : rightIcon === 'settings' ? (
          <TouchableOpacity
            onPress={typeof onProfile === 'function' ? onProfile : undefined}
            style={styles.iconBtn}
            accessibilityRole="button"
            disabled={typeof onProfile !== 'function'}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  side: {
    minWidth: 44,
    alignItems: 'flex-start',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  iconBtn: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.title3,
    textAlign: 'center',
  },
  logoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  logoIcon: {
    marginRight: spacing.xs,
  },
  logoTitle: {
    flex: 0,
  },
});
