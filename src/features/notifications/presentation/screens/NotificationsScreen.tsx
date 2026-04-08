/**
 * Notifications list: icon and color by type (provider/customer).
 * Tap → mark as read and navigate to request details or dashboard.
 */
import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Animated, type ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import type { NavTabId } from '../../../../shared/navigation/navTabs';
import { ListScreenLayout } from '../../../../shared/components/ListScreenLayout';
import { ScreenFadeIn } from '../../../../shared/components/ScreenFadeIn';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { DashboardEmptyState } from '../../../../shared/components/dashboard/DashboardEmptyState';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { usePressScaleAnimation } from '../../../../shared/utils/animations';
import { useAuthStore } from '../../../../store/authStore';
import { useLocaleStore } from '../../../../store/localeStore';
import type { Locale } from '../../../../store/localeStore';
import { ROLES, isProviderRole, type Role } from '../../../../shared/constants/roles';
import { useNotifications, type Notification } from '../../hooks/useNotifications';
import { getNotificationTheme } from '../../constants/notificationTheme';

function formatTime(createdAt: string | undefined, locale: Locale): string {
  if (!createdAt) return '';
  try {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (locale === 'ar') {
      if (diffMins < 1) return t('notifications.justNow');
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays < 2) return t('notifications.yesterday');
      return date.toLocaleDateString('ar');
    }
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
  isProvider,
  locale,
  onPress,
}: {
  item: Notification;
  isProvider: boolean;
  locale: Locale;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isRead = item.read;
  const theme = getNotificationTheme(item.type, isProvider);
  const isRTL = locale === 'ar';
  const { scale, onPressIn, onPressOut } = usePressScaleAnimation();
  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.surface },
          isRead && styles.cardRead,
          { transform: [{ scale }] },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: theme.color + '22' }]}>
          <MaterialCommunityIcons
            name={theme.icon as any}
            size={24}
            color={theme.color}
          />
        </View>
        <View style={styles.textCol}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRtl]}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>{formatTime(item.createdAt, locale)}</Text>
          </View>
          <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const ListSeparator = memo(function ListSeparator() {
  return <View style={styles.listSeparator} />;
});

const NotificationListRow = memo(function NotificationListRow({
  item,
  isProvider,
  locale,
  onNotificationPress,
}: {
  item: Notification;
  isProvider: boolean;
  locale: Locale;
  onNotificationPress: (n: Notification) => void;
}) {
  const onPress = useCallback(() => onNotificationPress(item), [item, onNotificationPress]);
  return <NotificationCard item={item} isProvider={isProvider} locale={locale} onPress={onPress} />;
});

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const role = useAuthStore((s) => s.user?.role);
  const locale = useLocaleStore((s) => s.locale);
  const { colors } = useTheme();
  const isProvider = role != null && isProviderRole(role as Role);
  const {
    notifications,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead,
  } = useNotifications();

  const handleTab = useCallback((tab: NavTabId) => {
    if (tab === 'Home') {
      if (role === ROLES.ADMIN) navigation.navigate('AdminDashboard');
      else if (role === ROLES.INSURANCE) navigation.navigate('InsuranceDashboard');
      else if (isProvider) navigation.navigate('ProviderDashboard');
      else navigation.navigate('Map');
      return;
    }
    if (tab === 'Requests') {
      if (role === ROLES.USER) navigation.navigate('RequestHistory');
      else if (role === 'mechanic') navigation.navigate('MechanicJobHistory');
      else if (role === 'mechanic_tow') navigation.navigate('TowJobHistory');
      else if (role === 'car_rental') navigation.navigate('RentalBookings');
      else if (role === ROLES.INSURANCE) navigation.navigate('InsuranceRequests');
      else if (role === ROLES.ADMIN) navigation.navigate('AdminRequests');
      return;
    }
    if (tab === 'Chat') {
      navigation.navigate('Chat');
      return;
    }
    if (tab === 'Profile') navigation.navigate('Profile');
  }, [navigation, role, isProvider]);

  const handleNotificationPress = useCallback(
    (item: Notification) => {
      if (item.id && !item.read) markAsRead(item.id);
      const requestId = item.data?.requestId as string | undefined;
      const providerId = item.data?.providerId as string | undefined;
      try {
        if (role === ROLES.ADMIN) {
          navigation.navigate('AdminDashboard');
          return;
        }
        if (role === ROLES.INSURANCE) {
          navigation.navigate('InsuranceDashboard');
          return;
        }
        if (isProvider) {
          navigation.navigate('ProviderDashboard');
          return;
        }
        if (requestId) {
          navigation.navigate('Request', { requestId });
          return;
        }
        if (providerId) {
          navigation.navigate('ProviderProfile', { providerId });
          return;
        }
        navigation.navigate('RequestHistory');
      } catch (_) {
        navigation.navigate('RequestHistory');
      }
    },
    [markAsRead, isProvider, navigation, role]
  );

  const renderItem = useCallback<ListRenderItem<Notification>>(
    ({ item }) => (
      <NotificationListRow
        item={item}
        isProvider={isProvider}
        locale={locale}
        onNotificationPress={handleNotificationPress}
      />
    ),
    [handleNotificationPress, isProvider, locale],
  );

  const header = (
    <AppHeader
      title={t('nav.notifications')}
      onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      onProfile={() => navigation.navigate('Profile')}
    />
  );
  const emptyState = (
    <DashboardEmptyState
      icon="bell-outline"
      title={t('notifications.empty')}
      subtitle={t('notifications.emptySubtitle')}
      iconColor={colors.textMuted}
      style={styles.emptyWrap}
    />
  );
  const listContent = (
    <ScreenFadeIn style={styles.fadeWrap}>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => (item.id != null && item.id !== '' ? String(item.id) : `notification-${index}`)}
        contentContainerStyle={styles.scrollContent}
        ItemSeparatorComponent={ListSeparator}
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
      />
    </ScreenFadeIn>
  );

  return (
    <ScreenWrapper
      responsiveNav
      bottomNavConfig={{
        activeTab: 'Home',
        onSelect: handleTab,
        dark: isProvider || role === ROLES.ADMIN,
      }}
    >
      <ListScreenLayout
        header={header}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        errorMessage={error?.message ?? t('error.network')}
        isEmpty={notifications.length === 0}
        emptyState={emptyState}
        style={styles.fadeWrap}
        loadingVariant="skeleton"
        skeletonRows={6}
        loadingHint={t('common.loadingList')}
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
  },
  listSeparator: {
    height: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardRead: {
    opacity: 0.75,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: spacing.md,
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
  titleRowRtl: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
    flexShrink: 1,
    marginEnd: spacing.sm,
  },
  time: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.callout,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
});
