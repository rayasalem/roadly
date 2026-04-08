/**
 * Ride-style header: back (optional), centered title or logo (icon + app name), profile badge right.
 * Use centerLogo to show icon + app name instead of a bare image, so the logo never appears empty.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, spacing, typography } from '../theme';
import { t } from '../i18n/t';
import { useLocaleStore } from '../../store/localeStore';
import { backChevronForLocale } from '../i18n/rtlUtils';

type AppHeaderProps = {
  title: string;
  /** When true, center shows icon + app name (no image), so logo is never empty. */
  centerLogo?: boolean;
  /** Uber-style: dark background, white text and icons. */
  dark?: boolean;
  onBack?: () => void;
  onProfile?: () => void;
  /** Called when right icon is pressed (e.g. calendar). If not set, calendar icon has no action. */
  onRightPress?: () => void;
  rightIcon?: 'profile' | 'calendar' | 'settings' | 'bell' | 'none';
  style?: ViewStyle;
};

export function AppHeader({
  title,
  centerLogo = false,
  dark = false,
  onBack,
  onProfile,
  onRightPress,
  rightIcon = 'profile',
  style,
}: AppHeaderProps) {
  const locale = useLocaleStore((s) => s.locale);
  const backIcon = backChevronForLocale(locale);
  const { colors } = useTheme();
  const fg = dark ? '#FFFFFF' : colors.text;
  const bg = dark ? '#000000' : undefined;
  const centerContent = centerLogo ? (
    <View style={styles.logoRow}>
      <MaterialCommunityIcons name="car-side" size={24} color={dark ? '#FFFFFF' : colors.primary} style={styles.logoIcon} />
      <Text style={[styles.title, styles.logoTitle, { color: fg }]} numberOfLines={1}>
        {t('app.name')}
      </Text>
    </View>
  ) : (
    <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
      {title ?? ''}
    </Text>
  );
  return (
    <View style={[styles.root, bg && { backgroundColor: bg }, style]}>
      <View style={styles.side}>
        {typeof onBack === 'function' ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityRole="button">
            <MaterialCommunityIcons name={backIcon} size={28} color={fg} />
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
            <MaterialCommunityIcons name="shield-account-outline" size={24} color={fg} />
          </TouchableOpacity>
        ) : rightIcon === 'calendar' ? (
          <TouchableOpacity
            onPress={typeof onRightPress === 'function' ? onRightPress : undefined}
            style={styles.iconBtn}
            accessibilityRole="button"
            disabled={typeof onRightPress !== 'function'}
          >
            <MaterialCommunityIcons name="calendar-outline" size={24} color={fg} />
          </TouchableOpacity>
        ) : rightIcon === 'settings' ? (
          <TouchableOpacity
            onPress={typeof onProfile === 'function' ? onProfile : undefined}
            style={styles.iconBtn}
            accessibilityRole="button"
            disabled={typeof onProfile !== 'function'}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color={fg} />
          </TouchableOpacity>
        ) : rightIcon === 'bell' ? (
          <TouchableOpacity
            onPress={typeof onRightPress === 'function' ? onRightPress : undefined}
            style={styles.iconBtn}
            accessibilityRole="button"
            disabled={typeof onRightPress !== 'function'}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={fg} />
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
    paddingBottom: spacing.md,
    minHeight: 56,
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
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    marginHorizontal: spacing.xs,
  },
  logoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  logoIcon: {
    marginEnd: spacing.xs,
  },
  logoTitle: {
    flex: 0,
  },
});
