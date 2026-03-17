/**
 * Admin: view all service requests from API GET /admin/requests.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { AppHeader } from '../../../../shared/components/AppHeader';
import { AppText } from '../../../../shared/components/AppText';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import type { AdminStackParamList } from '../../../../navigation/AdminStack';
import { getRequestStatusTheme } from '../../../requests/constants/requestStatusTheme';
import { safeNavigateToSettings } from '../../../../navigation/navigationRef';
import { fetchAdminRequests } from '../../data/adminRequestsApi';
import type { AdminRequestApiItem } from '../../data/adminRequestsApi';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminRequests'>;

type FilterStatus = 'all' | 'pending' | 'accepted' | 'on_the_way' | 'completed' | 'cancelled';
type FilterService = 'all' | 'mechanic' | 'tow' | 'rental';

function serviceLabel(s: string): string {
  if (s === 'mechanic') return t('map.filter.mechanic');
  if (s === 'tow') return t('map.filter.tow');
  if (s === 'rental') return t('map.filter.rental');
  return s;
}

const STATUS_FILTER_OPTIONS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: t('request.filterAll') ?? 'All' },
  { id: 'pending', label: t('request.status.pending') ?? 'Pending' },
  { id: 'accepted', label: t('request.status.accepted') ?? 'Accepted' },
  { id: 'on_the_way', label: t('request.status.on_the_way') ?? 'On the way' },
  { id: 'completed', label: t('request.status.completed') ?? 'Completed' },
  { id: 'cancelled', label: t('request.status.cancelled') ?? 'Cancelled' },
];

export function AdminRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [serviceFilter, setServiceFilter] = useState<FilterService>('all');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['admin', 'requests', statusFilter, serviceFilter],
    queryFn: () =>
      fetchAdminRequests({
        page: 1,
        limit: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        serviceType: serviceFilter === 'all' ? undefined : serviceFilter,
      }),
    staleTime: 60 * 1000,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const refreshing = isLoading || isRefetching;

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTab = useCallback(
    (tab: NavTabId) => {
      if (tab === 'Home') navigation.navigate('AdminDashboard');
      else if (tab === 'Profile') navigation.navigate('Profile');
      else if (tab === 'Chat') navigation.navigate('Chat');
      else if (tab === 'Notifications') navigation.navigate('Notifications');
      else if (tab === 'Settings') safeNavigateToSettings(navigation);
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminRequestApiItem }) => {
      const theme = getRequestStatusTheme(item.status);
      const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '';
      return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
          <View style={styles.cardRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.color + '22' }]}>
              <MaterialCommunityIcons name={theme.icon as 'wrench'} size={22} color={theme.color} />
            </View>
            <View style={styles.cardBody}>
              <AppText variant="callout" weight="semibold" numberOfLines={1}>
                {item.customerName} → {item.providerName ?? '-'}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {serviceLabel(item.serviceType)} • {dateStr}
              </AppText>
              <View style={[styles.badge, { backgroundColor: theme.color + '22' }]}>
                <Text style={[styles.badgeText, { color: theme.color }]}>{t(theme.labelKey)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [],
  );

  const keyExtractor = useCallback((item: AdminRequestApiItem) => item.id, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <AppHeader
          title={t('admin.requests') ?? 'Requests'}
          onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        />
        <View style={styles.filters}>
          <FlatList
            horizontal
            data={STATUS_FILTER_OPTIONS}
            keyExtractor={(x) => x.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, statusFilter === item.id && styles.filterChipActive]}
                onPress={() => setStatusFilter(item.id)}
              >
                <AppText variant="caption" style={statusFilter === item.id ? styles.filterChipTextActive : undefined}>
                  {item.label}
                </AppText>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={colors.textMuted} />
              <AppText variant="body" color={colors.textSecondary} style={styles.emptyText}>
                {t('request.noHistory') ?? 'No requests'}
              </AppText>
            </View>
          }
        />
        <View style={styles.bottomNav}>
          <BottomNavBar activeTab="Home" onSelect={handleTab} dark />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  filters: { paddingVertical: spacing.sm },
  filterList: { paddingHorizontal: spacing.md, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipTextActive: { color: colors.primaryContrast },
  list: { padding: spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: { flex: 1 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginTop: 4 },
  badgeText: { fontSize: 11, fontFamily: typography.fontFamily.medium },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: spacing.md },
  bottomNav: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
