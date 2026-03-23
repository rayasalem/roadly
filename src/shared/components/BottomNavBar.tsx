/**
 * Ride-style bottom navigation: 5 tabs, green active (light) or Uber dark.
 * Tab config shared with SideNavRail via NAV_TABS.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme';
import { t } from '../i18n/t';
import { ACTIVE_OPACITY, HIT_SLOP_DEFAULT } from '../constants/ux';
import { NAV_TABS, type NavTabId } from '../navigation/navTabs';

export type { NavTabId };

type BottomNavBarProps = {
  activeTab: NavTabId;
  onSelect: (tab: NavTabId) => void;
  labels?: Partial<Record<NavTabId, string>>;
  dark?: boolean;
};

export function BottomNavBar({ activeTab, onSelect, labels, dark = false }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const L: Record<NavTabId, string> = {
    Home: labels?.Home ?? t('nav.home'),
    Chat: labels?.Chat ?? t('nav.chat'),
    Notifications: labels?.Notifications ?? t('nav.notifications'),
    Profile: labels?.Profile ?? t('nav.profile'),
    Settings: labels?.Settings ?? t('nav.settings'),
  };

  const activeColor = dark ? (colors.uberTextOnDark ?? '#FFFFFF') : colors.primary;
  const inactiveColor = dark ? (colors.uberMuted ?? '#9CA3AF') : colors.textSecondary;
  const bgStyle = dark ? { backgroundColor: colors.uberNav ?? '#000000', borderTopColor: 'rgba(255,255,255,0.1)' } : {};

  return (
    <View
      style={[
        styles.root,
        bgStyle,
        { paddingBottom: Math.max(insets.bottom, spacing.sm), pointerEvents: 'box-none' as const },
      ]}
    >
      {NAV_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            style={styles.tab}
            activeOpacity={ACTIVE_OPACITY}
            hitSlop={HIT_SLOP_DEFAULT}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={L[tab.id]}
          >
            <MaterialCommunityIcons
              name={tab.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={22}
              color={isActive ? activeColor : inactiveColor}
            />
            <Text
              style={[styles.label, { color: isActive ? activeColor : inactiveColor }]}
              numberOfLines={1}
            >
              {L[tab.id]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 56,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  label: {
    marginTop: 2,
    // Slightly larger labels on mobile for readability, tighter on web to fit.
    fontSize: Platform.OS === 'web' ? 11 : 12,
  },
});
