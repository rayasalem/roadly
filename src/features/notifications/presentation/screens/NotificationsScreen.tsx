import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { ListScreenLayout } from '../../../../shared/components/ListScreenLayout';
import { ScreenFadeIn } from '../../../../shared/components/ScreenFadeIn';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { usePressScaleAnimation } from '../../../../shared/utils/animations';
import { useAuthStore } from '../../../../store/authStore';
import { ROLES } from '../../../../shared/constants/roles';
import { useNotifications, type Notification } from '../../hooks/useNotifications';
import { safeNavigateToSettings } from '../../../../navigation/navigationRef';

function formatTime(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return t('notifications.justNow') ?? 'Just now';
    if (diffMins < 60) return `${diffMins} ${t('notifications.minAgo') ?? 'min ago'}`;
    if (diffHours < 24) return `${diffHours} ${t('notifications.hoursAgo') ?? 'hours ago'}`;
    if (diffDays < 2) return t('notifications.yesterday') ?? 'Yesterday';
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

const NotificationCard = memo(function NotificationCard({
  item,
  onPress,
}: {
  item: Notification;
  onPress: () => void;
}) {
  const isRead = item.read;
  const { scale, onPressIn, onPressOut } = usePressScaleAnimation();
  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, isRead && styles.cardRead, { transform: [{ scale }] }]}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name={isRead ? 'bell-outline' : 'bell-badge-outline'}
            size={22}
            color={isRead ? colors.textMuted : colors.primary}
          />
        </View>
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.body} numberOfLines={2}>{item.message}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
});

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const role = useAuthStore((s) => s.user?.role);
  const {
    notifications,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead,
    isMarkingRead,
  } = useNotifications();

  const handleTab = useCallback((tab: NavTabId) => {
    if (tab === 'Home') {
      if (role === ROLES.ADMIN) navigation.navigate('AdminDashboard');
      else navigation.navigate('Map');
      return;
    }
    if (tab === 'Chat') navigation.navigate('Chat');
    else if (tab === 'Profile') navigation.navigate('Profile');
    else if (tab === 'Settings') safeNavigateToSettings(navigation);
  }, [navigation, role]);

  const handleNotificationPress = useCallback(
    (item: Notification) => {
      if (!item.read) markAsRead(item.id);
    },
    [markAsRead],
  );

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationCard
        item={item}
        onPress={() => handleNotificationPress(item)}
      />
    ),
    [handleNotificationPress],
  );

  const header = (
    <AppHeader title={t('nav.notifications')} onProfile={() => navigation.navigate('Profile')} />
  );
  const emptyState = (
    <View style={styles.emptyWrap}>
      <MaterialCommunityIcons name="bell-outline" size={48} color={colors.textMuted} />
      <Text style={styles.emptyText}>{t('notifications.empty') ?? 'No notifications yet.'}</Text>
    </View>
  );
  const listContent = (
    <ScreenFadeIn style={styles.fadeWrap}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />
    </ScreenFadeIn>
  );

  return (
    <ScreenWrapper bottomNav={<BottomNavBar activeTab="Notifications" onSelect={handleTab} />}>
      <ListScreenLayout
        header={header}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        errorMessage={error?.message ?? t('error.network')}
        isEmpty={notifications.length === 0}
        emptyState={emptyState}
        style={styles.fadeWrap}
      >
        {listContent}
      </ListScreenLayout>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  fadeWrap: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardRead: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
    color: colors.text,
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  time: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.callout,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
