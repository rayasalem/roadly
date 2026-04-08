/**
 * Ride-style bottom navigation: Home, Requests, Chat, Profile. Unread notifications badge on Chat.
 */
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme, spacing } from '../theme';
import { t } from '../i18n/t';
import { ACTIVE_OPACITY, HIT_SLOP_DEFAULT } from '../constants/ux';
import { NAV_TABS, type NavTabId } from '../navigation/navTabs';
import { fetchNotifications } from '../../features/notifications/data/notificationsApi';
import { NOTIFICATIONS_QUERY_KEY } from '../../features/notifications/hooks/useNotifications';
import { isNetworkOrTimeoutError } from '../services/http/errorMessage';

export type { NavTabId };

type BottomNavBarProps = {
  activeTab: NavTabId;
  onSelect: (tab: NavTabId) => void;
  labels?: Partial<Record<NavTabId, string>>;
  dark?: boolean;
  /** When false, skip fetching notification count (e.g. unauthenticated flows). */
  showChatNotificationBadge?: boolean;
};

export function BottomNavBar({
  activeTab,
  onSelect,
  labels,
  dark = false,
  showChatNotificationBadge = true,
}: BottomNavBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const L: Record<NavTabId, string> = {
    Home: labels?.Home ?? t('nav.home'),
    Requests: labels?.Requests ?? t('nav.requests'),
    Chat: labels?.Chat ?? t('nav.chat'),
    Profile: labels?.Profile ?? t('nav.profile'),
  };

  const inactiveHex = '#8A8A8A';
  const activeColor = dark ? (colors.uberTextOnDark ?? '#FFFFFF') : colors.primary;
  const inactiveColor = dark ? (colors.uberMuted ?? inactiveHex) : inactiveHex;
  const bgStyle = dark
    ? { backgroundColor: colors.uberNav ?? '#000000', borderTopColor: 'rgba(255,255,255,0.1)' }
    : { backgroundColor: colors.surface, borderTopColor: colors.border };

  const { data: notificationList } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchNotifications();
      } catch (e) {
        if (isNetworkOrTimeoutError(e)) return [];
        throw e;
      }
    },
    staleTime: 60 * 1000,
    enabled: showChatNotificationBadge,
    retry: 1,
  });

  const unreadChatBadge = useMemo(() => {
    if (!showChatNotificationBadge || !notificationList?.length) return 0;
    return notificationList.filter((n) => !n.read).length;
  }, [notificationList, showChatNotificationBadge]);

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
        const showBadge = tab.id === 'Chat' && unreadChatBadge > 0;
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
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons
                name={tab.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={22}
                color={isActive ? activeColor : inactiveColor}
              />
              {showBadge ? (
                <View style={[styles.badge, { borderColor: dark ? colors.uberNav ?? '#000' : colors.surface }]}>
                  <Text style={styles.badgeText}>{unreadChatBadge > 9 ? '9+' : String(unreadChatBadge)}</Text>
                </View>
              ) : null}
            </View>
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
    borderTopWidth: StyleSheet.hairlineWidth,
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
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#E11900',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    marginTop: 2,
    fontSize: Platform.OS === 'web' ? 11 : 12,
  },
});
