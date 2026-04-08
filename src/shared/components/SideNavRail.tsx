/**
 * Desktop side navigation (Careem/Uber-style rail). Same tabs as BottomNavBar.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing } from '../theme';
import { t } from '../i18n/t';
import { ACTIVE_OPACITY, HIT_SLOP_DEFAULT } from '../constants/ux';
import { NAV_TABS, type NavTabId } from '../navigation/navTabs';
import { SIDE_NAV_WIDTH } from '../design/layout';

type Props = {
  activeTab: NavTabId;
  onSelect: (tab: NavTabId) => void;
  labels?: Partial<Record<NavTabId, string>>;
  dark?: boolean;
};

export function SideNavRail({ activeTab, onSelect, labels, dark = false }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const L: Record<NavTabId, string> = {
    Home: labels?.Home ?? t('nav.home'),
    Requests: labels?.Requests ?? t('nav.requests'),
    Chat: labels?.Chat ?? t('nav.chat'),
    Profile: labels?.Profile ?? t('nav.profile'),
  };

  const activeColor = dark ? (colors.uberTextOnDark ?? '#FFFFFF') : colors.primary;
  const inactiveColor = dark ? (colors.uberMuted ?? '#9CA3AF') : colors.textSecondary;
  const bg = dark ? (colors.uberNav ?? '#000000') : colors.surface;
  const border = dark ? 'rgba(255,255,255,0.08)' : colors.border;

  return (
    <View
      style={[
        styles.root,
        {
          width: SIDE_NAV_WIDTH,
          backgroundColor: bg,
          borderRightColor: border,
          paddingTop: Math.max(insets.top, spacing.md),
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
        Platform.OS === 'web' && styles.rootWeb,
      ]}
      accessibilityRole="tablist"
    >
      {NAV_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            style={[styles.row, isActive && { backgroundColor: dark ? 'rgba(34,197,94,0.15)' : colors.primary + '18' }]}
            activeOpacity={ACTIVE_OPACITY}
            hitSlop={HIT_SLOP_DEFAULT}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={L[tab.id]}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={24}
              color={isActive ? activeColor : inactiveColor}
            />
            <Text style={[styles.label, { color: isActive ? activeColor : inactiveColor }]} numberOfLines={1}>
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
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
  },
  rootWeb: {
    minHeight: '100%' as unknown as number,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});
