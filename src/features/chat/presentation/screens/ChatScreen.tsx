/**
 * Chat list from GET /chat/conversations. Navigate to ChatDetail on row press.
 */
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
import { useChatConversations } from '../../hooks/useChatConversations';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';

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

export function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const { conversations, isLoading, isError, refetch } = useChatConversations();

  const handleTab = (tab: NavTabId) => {
    if (tab === 'Home') navigation.navigate('Home');
    if (tab === 'Profile') navigation.navigate('Profile');
    if (tab === 'Notifications') navigation.navigate('Notifications');
    if (tab === 'Settings') navigation.navigate('Settings');
  };

  const handleOpenChat = (conversationId: string, name: string) => {
    navigation.navigate('ChatDetail', { conversationId, name });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorWithRetry message="" onRetry={() => refetch()} />;

  return (
    <ScreenWrapper>
      <AppHeader title={t('nav.chat')} onProfile={() => navigation.navigate('Profile')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {conversations.length === 0 ? (
          <View style={styles.empty}>
            <AppText variant="body" color={colors.textMuted}>{t('notifications.empty')}</AppText>
          </View>
        ) : (
          conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              style={styles.chatRow}
              activeOpacity={0.85}
              onPress={() => handleOpenChat(conv.id, conv.name)}
            >
              <View style={styles.chatAvatar}>
                <MaterialCommunityIcons name="message-text-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.chatMain}>
                <View style={styles.chatHeader}>
                  <AppText variant="body" weight="semibold" numberOfLines={1} style={styles.chatName}>{conv.name}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>{formatTimeAgo(conv.lastAt)}</AppText>
                </View>
                <AppText variant="callout" color={colors.textSecondary} numberOfLines={2}>{conv.lastMessage}</AppText>
              </View>
              {conv.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <AppText variant="caption" weight="semibold" style={styles.unreadText}>{conv.unread}</AppText>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <BottomNavBar activeTab="Chat" onSelect={handleTab} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  empty: { padding: spacing.xxl, alignItems: 'center' },
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
