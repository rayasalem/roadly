/**
 * Chat list from GET /chat/conversations. FlatList for virtualized list rendering.
 * Navigate to ChatDetail on row press.
 */
import React, { useCallback, memo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { AppText } from '../../../../shared/components/AppText';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { useAuthStore } from '../../../../store/authStore';
import { ROLES } from '../../../../shared/constants/roles';
import { useChatConversations } from '../../hooks/useChatConversations';
import type { ChatConversation } from '../../data/chatApi';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import { safeNavigateToSettings } from '../../../../navigation/navigationRef';

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'Chat'>;

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return t('notifications.justNow');
  if (diff < 3600000) return t('notifications.minAgo');
  if (diff < 86400000) return t('notifications.hoursAgo');
  return t('notifications.yesterday');
}

const ChatRow = memo(function ChatRow({
  item,
  onPress,
}: {
  item: ChatConversation;
  onPress: (id: string, name: string) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.chatRow}
      activeOpacity={0.85}
      onPress={() => onPress(item.id, item.name)}
    >
      <View style={styles.chatAvatar}>
        <MaterialCommunityIcons name="message-text-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.chatMain}>
        <View style={styles.chatHeader}>
          <AppText variant="body" weight="semibold" numberOfLines={1} style={styles.chatName}>{item.name}</AppText>
          <AppText variant="caption" color={colors.textMuted}>{formatTimeAgo(item.lastAt)}</AppText>
        </View>
        <AppText variant="callout" color={colors.textSecondary} numberOfLines={2}>{item.lastMessage}</AppText>
      </View>
      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <AppText variant="caption" weight="semibold" style={styles.unreadText}>{item.unread}</AppText>
        </View>
      )}
    </TouchableOpacity>
  );
});

export function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const role = useAuthStore((s) => s.user?.role);
  const { conversations, isLoading, isError, refetch } = useChatConversations();

  const handleTab = useCallback((tab: NavTabId) => {
    if (tab === 'Home') {
      if (role === ROLES.ADMIN) (navigation as any).navigate('AdminDashboard');
      else navigation.navigate('Map');
      return;
    }
    if (tab === 'Profile') (navigation as any).navigate('Profile');
    if (tab === 'Notifications') (navigation as any).navigate('Notifications');
    if (tab === 'Settings') safeNavigateToSettings(navigation);
  }, [navigation, role]);

  const handleOpenChat = useCallback((conversationId: string, name: string) => {
    navigation.navigate('ChatDetail', { conversationId, name });
  }, [navigation]);

  const renderItem: ListRenderItem<ChatConversation> = useCallback(
    ({ item }) => <ChatRow item={item} onPress={handleOpenChat} />,
    [handleOpenChat],
  );

  const keyExtractor = useCallback((item: ChatConversation) => item.id, []);

  const listEmptyComponent = useCallback(
    () => (
      <View style={styles.empty}>
        <AppText variant="body" color={colors.textMuted}>{t('notifications.empty')}</AppText>
      </View>
    ),
    [],
  );

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  if (isLoading) {
    return (
      <ScreenWrapper bottomNav={<BottomNavBar activeTab="Chat" onSelect={handleTab} />}>
        <AppHeader title={t('nav.chat')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} onProfile={() => navigation.navigate('Profile')} />
        <View style={styles.loadingWrap}><LoadingSpinner /></View>
      </ScreenWrapper>
    );
  }
  if (isError) {
    return (
      <ScreenWrapper bottomNav={<BottomNavBar activeTab="Chat" onSelect={handleTab} />}>
        <AppHeader title={t('nav.chat')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} onProfile={() => navigation.navigate('Profile')} />
        <View style={styles.errorWrap}><ErrorWithRetry message="" onRetry={() => refetch()} /></View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bottomNav={<BottomNavBar activeTab="Chat" onSelect={handleTab} />}>
      <AppHeader title={t('nav.chat')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} onProfile={() => navigation.navigate('Profile')} />
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmptyComponent}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={conversations.length === 0 ? styles.scrollContentEmpty : styles.scrollContent}
        style={styles.scroll}
        showsVerticalScrollIndicator
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.md },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  scrollContentEmpty: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  empty: { padding: spacing.lg, alignItems: 'center' },
  separator: { height: spacing.sm },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  chatMain: { flex: 1, minWidth: 0 },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatName: { flex: 1, marginRight: spacing.sm },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: 6,
  },
  unreadText: { color: colors.primaryContrast },
});
