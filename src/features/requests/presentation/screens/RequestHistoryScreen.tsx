/**
 * Customer request history: list with filters (All / In progress / Completed / Cancelled),
 * status colors, and actions (Track, Rate, Cancel).
 */
import React, { useCallback, memo, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
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
import { getRequestStatusTheme, isRequestInProgress } from '../../constants/requestStatusTheme';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import { safeNavigateToSettings } from '../../../../navigation/navigationRef';

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'RequestHistory'>;
type FilterId = 'all' | 'in_progress' | 'completed' | 'cancelled';

function serviceTypeLabel(st: string): string {
  if (st === 'mechanic') return t('map.filter.mechanic');
  if (st === 'tow') return t('map.filter.tow');
  if (st === 'rental') return t('map.filter.rental');
  return st;
}

const RequestCard = memo(function RequestCard({
  item,
  onPress,
  onTrack,
  onRate,
}: {
  item: ServiceRequest;
  onPress: (requestId: string) => void;
  onTrack: (requestId: string) => void;
  onRate: (requestId: string, providerName?: string | null) => void;
}) {
  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  const theme = getRequestStatusTheme(item.status);
  const inProgress = isRequestInProgress(item.status);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item.id)} activeOpacity={0.85}>
      <View style={styles.cardRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.color + '22' }]}>
          <MaterialCommunityIcons name={theme.icon as any} size={22} color={theme.color} />
        </View>
        <View style={styles.cardBody}>
          <AppText variant="callout" weight="semibold" numberOfLines={1}>{serviceTypeLabel(item.serviceType)}</AppText>
          {item.providerName ? (
            <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.providerName}>
              {item.providerName}
            </AppText>
          ) : null}
          <View style={[styles.statusBadge, { backgroundColor: theme.color + '22' }]}>
            <Text style={[styles.statusBadgeText, { color: theme.color }]}>{t(theme.labelKey)}</Text>
          </View>
          <AppText variant="caption" color={colors.textMuted} style={styles.dateText}>{dateStr}</AppText>
          <View style={styles.cardActions}>
            {inProgress && (
              <TouchableOpacity style={styles.cardActionBtn} onPress={() => onTrack(item.id)}>
                <MaterialCommunityIcons name="map-marker-path" size={18} color={colors.primary} />
                <AppText variant="caption" style={styles.cardActionText}>{t('request.trackOnMap')}</AppText>
              </TouchableOpacity>
            )}
            {item.status === 'completed' && (
              <TouchableOpacity style={styles.cardActionBtn} onPress={() => onRate(item.id, item.providerName)}>
                <MaterialCommunityIcons name="star-outline" size={18} color={colors.primary} />
                <AppText variant="caption" style={styles.cardActionText}>{t('request.rateProvider')}</AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
});

const FILTERS: { id: FilterId; labelKey: string }[] = [
  { id: 'all', labelKey: 'request.filterAll' },
  { id: 'in_progress', labelKey: 'request.filterInProgress' },
  { id: 'completed', labelKey: 'request.filterCompleted' },
  { id: 'cancelled', labelKey: 'request.filterCancelled' },
];

export function RequestHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<FilterId>('all');
  const { requests, isLoading, isError, refetch } = useRequestHistory(true);

  const filteredRequests = useMemo(() => {
    if (filter === 'all') return requests;
    if (filter === 'in_progress') return requests.filter((r) => ['pending', 'accepted', 'on_the_way'].includes(r.status));
    if (filter === 'completed') return requests.filter((r) => r.status === 'completed');
    if (filter === 'cancelled') return requests.filter((r) => r.status === 'cancelled');
    return requests;
  }, [requests, filter]);

  const handleTab = useCallback((tab: NavTabId) => {
    if (tab === 'Home') navigation.navigate('Map');
    else if (tab === 'Profile') navigation.navigate('Profile');
    else if (tab === 'Chat') navigation.navigate('Chat');
    else if (tab === 'Notifications') navigation.navigate('Notifications');
    else if (tab === 'Settings') safeNavigateToSettings(navigation);
  }, [navigation]);

  const openRequest = useCallback((requestId: string) => {
    navigation.navigate('Request', { requestId });
  }, [navigation]);
  const onTrack = useCallback((requestId: string) => {
    navigation.navigate('LiveTracking', { requestId });
  }, [navigation]);
  const onRate = useCallback(
    (requestId: string, providerName?: string | null) => {
      navigation.navigate('Ratings', { requestId, providerName: providerName ?? undefined });
    },
    [navigation],
  );

  const header = (
    <>
      <AppHeader title={t('request.historyTitle') ?? 'My requests'} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>{t(f.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
  const emptyState = (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={56} color={colors.textMuted} />
      <AppText variant="body" color={colors.textSecondary} center style={styles.emptyText}>
        {t('request.noHistory') ?? 'No requests yet. Create one from the map.'}
      </AppText>
    </View>
  );
  const renderItem = useCallback(
    ({ item }: { item: ServiceRequest }) => (
      <RequestCard item={item} onPress={openRequest} onTrack={onTrack} onRate={onRate} />
    ),
    [openRequest, onTrack, onRate],
  );
  const keyExtractor = useCallback((r: ServiceRequest) => r.id, []);

  const listContent = (
    <FlatList
      data={filteredRequests}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews
    />
  );

  return (
    <ScreenWrapper bottomNav={<BottomNavBar activeTab="Profile" onSelect={handleTab} />}>
      <ListScreenLayout
        header={header}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        errorMessage={t('error.network')}
        isEmpty={requests.length === 0}
        emptyState={emptyState}
      >
        {listContent}
      </ListScreenLayout>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingTop: spacing.sm, paddingBottom: 100 },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primaryContrast,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.card,
    ...shadows.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 48, height: 48, borderRadius: radii.lg, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  cardBody: { flex: 1 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginTop: 4,
  },
  statusBadgeText: { fontFamily: typography.fontFamily.semibold, fontSize: 13 },
  dateText: { marginTop: 4 },
  providerName: { marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cardActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardActionText: { fontFamily: typography.fontFamily.medium, fontSize: 13, color: colors.primary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  emptyText: { marginTop: spacing.md },
});
