/**
 * Customer request history: list of user's service requests with status and provider info.
 */
import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { AppText } from '../../../../shared/components/AppText';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { ListScreenLayout } from '../../../../shared/components/ListScreenLayout';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { useRequestHistory } from '../../hooks/useRequestHistory';
import type { ServiceRequest } from '../../domain/types';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'RequestHistory'>;

function statusLabel(status: string): string {
  if (status === 'pending') return t('request.status.pending') ?? 'Pending';
  if (status === 'accepted') return t('request.status.accepted') ?? 'Accepted';
  if (status === 'on_the_way') return t('map.status.onTheWay') ?? 'On the way';
  if (status === 'completed') return t('request.status.completed') ?? 'Completed';
  if (status === 'cancelled') return t('request.status.cancelled') ?? 'Cancelled';
  return status;
}

function serviceTypeLabel(st: string): string {
  if (st === 'mechanic') return t('map.filter.mechanic');
  if (st === 'tow') return t('map.filter.tow');
  if (st === 'rental') return t('map.filter.rental');
  return st;
}

function RequestCard({
  item,
  onPress,
}: {
  item: ServiceRequest;
  onPress: () => void;
}) {
  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <MaterialCommunityIcons name="wrench" size={22} color={colors.primary} />
        </View>
        <View style={styles.cardBody}>
          <AppText variant="callout" weight="semibold" numberOfLines={1}>{serviceTypeLabel(item.serviceType)}</AppText>
          <AppText variant="caption" color={colors.textSecondary}>{statusLabel(item.status)}</AppText>
          <AppText variant="caption" color={colors.textMuted}>{dateStr}</AppText>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export function RequestHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { requests, isLoading, isError, refetch } = useRequestHistory(true);

  const handleTab = useCallback((tab: NavTabId) => {
    if (tab === 'Home') navigation.navigate('Map');
    else if (tab === 'Profile') navigation.navigate('Profile');
    else if (tab === 'Chat') navigation.navigate('Chat');
    else if (tab === 'Notifications') navigation.navigate('Notifications');
    else if (tab === 'Settings') navigation.navigate('Settings');
  }, [navigation]);

  const openRequest = useCallback((requestId: string) => {
    navigation.navigate('Request', { requestId });
  }, [navigation]);

  const header = (
    <AppHeader title={t('request.historyTitle') ?? 'My requests'} onBack={() => navigation.goBack()} />
  );
  const emptyState = (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={56} color={colors.textMuted} />
      <AppText variant="body" color={colors.textSecondary} center style={styles.emptyText}>
        {t('request.noHistory') ?? 'No requests yet. Create one from the map.'}
      </AppText>
    </View>
  );
  const listContent = (
    <FlatList
      data={requests}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => <RequestCard item={item} onPress={() => openRequest(item.id)} />}
      contentContainerStyle={styles.list}
    />
  );

  return (
    <ScreenWrapper>
      <ListScreenLayout
        header={header}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        errorMessage={t('error.network')}
        isEmpty={requests.length === 0}
        emptyState={emptyState}
        bottomNav={<BottomNavBar activeTab="Profile" onSelect={handleTab} />}
      >
        {listContent}
      </ListScreenLayout>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  cardBody: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyText: { marginTop: spacing.md },
});
