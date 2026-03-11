/**
 * Ride-style bottom navigation: dark teal background, 5 icons, green active.
 * Icons: Home, Chat, Notifications, Profile, Settings.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme';
import { t } from '../i18n/t';

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
};

export function BottomNavBar({ activeTab, onSelect, labels }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const L: Record<NavTabId, string> = {
    Home: labels?.Home ?? t('nav.home'),
    Chat: labels?.Chat ?? t('nav.chat'),
    Notifications: labels?.Notifications ?? t('nav.notifications'),
    Profile: labels?.Profile ?? t('nav.profile'),
    Settings: labels?.Settings ?? t('nav.settings'),
  };

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={L[tab.id]}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={24}
              color={isActive ? colors.primary : colors.primaryContrast}
            />
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
    justifyContent: 'space-around',
    backgroundColor: colors.navDark,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
});
