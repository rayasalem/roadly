/**
 * Ride-style bottom navigation: dark teal background, 5 icons, green active.
 * Icons: Home, Chat, Notifications, Profile, Settings.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme';
import { t } from '../i18n/t';
import { ACTIVE_OPACITY, HIT_SLOP_DEFAULT } from '../constants/ux';

export type NavTabId = 'Home' | 'Chat' | 'Notifications' | 'Profile' | 'Settings';

type TabConfig = {
  id: NavTabId;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
};

const TABS: TabConfig[] = [
  { id: 'Home', icon: 'home', labelKey: 'nav.home' },
  { id: 'Chat', icon: 'message-text-outline', labelKey: 'nav.chat' },
  { id: 'Notifications', icon: 'bell-outline', labelKey: 'nav.notifications' },
  { id: 'Profile', icon: 'account-outline', labelKey: 'nav.profile' },
  { id: 'Settings', icon: 'cog-outline', labelKey: 'nav.settings' },
];

type BottomNavBarProps = {
  activeTab: NavTabId;
  onSelect: (tab: NavTabId) => void;
  /** Optional labels map (key = NavTabId, value = string) for i18n */
  labels?: Partial<Record<NavTabId, string>>;
  /** Uber-style: dark background, white/gray icons and labels */
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
      {TABS.map((tab) => {
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
              name={tab.icon as any}
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
    fontSize: 11,
  },
});
