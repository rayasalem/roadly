/**
 * Customer screen: list all providers with filter by status (all / available / busy / unavailable).
 */
import React, { useMemo, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, type ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../shared/theme';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { ProviderAvatar } from '../../../../shared/components/ProviderAvatar';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { Button } from '../../../../shared/components/Button';
import { t } from '../../../../shared/i18n/t';
import { useUserLocation } from '../../../location/hooks/useUserLocation';
import { useNearbyProviders } from '../../hooks/useNearbyProviders';
import { DEFAULT_MAP_CENTER } from '../../../map/utils/mapHelpers';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { providerRoleToServiceType } from '../../../map/utils/providerToServiceType';
import type { Provider, ProviderDisplayStatus } from '../../domain/types';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors as themeColors } from '../../../../shared/theme/colors';

type FilterTab = 'all' | 'available' | 'busy' | 'offline';

function getProviderStatus(p: Provider): ProviderDisplayStatus | 'unknown' {
  const status = p.displayStatus ?? (p as { status?: string }).status;
  if (status === 'available' || status === 'busy' || status === 'on_the_way' || status === 'offline') return status;
  return p.isAvailable ? 'available' : 'offline';
}

function filterByTab(providers: Provider[], tab: FilterTab): Provider[] {
  if (tab === 'all') return providers;
  return providers.filter((p) => {
    const s = getProviderStatus(p);
    if (tab === 'available') return s === 'available' || s === 'on_the_way';
    if (tab === 'busy') return s === 'busy';
    if (tab === 'offline') return s === 'offline';
    return true;
  });
}

function statusLabelKey(status: ProviderDisplayStatus | 'unknown'): string {
  if (status === 'available') return 'map.status.available';
  if (status === 'busy') return 'map.status.busy';
  if (status === 'on_the_way') return 'map.status.onTheWay';
  if (status === 'offline') return 'map.status.offline';
  return 'map.status.offline';
}

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'AllProviders'>;

const ProviderListRow = memo(function ProviderListRow({
  item: p,
  onProviderPress,
  onRequestPress,
}: {
  item: Provider;
  onProviderPress: (p: Provider) => void;
  onRequestPress: (p: Provider) => void;
}) {
  const { colors } = useTheme();
  const themeId = p.role === 'mechanic_tow' ? 'tow' : p.role === 'car_rental' ? 'rental' : 'mechanic';
  const theme = ROLE_THEMES[themeId];
  const status = getProviderStatus(p);
  const statusColor =
    status === 'available' || status === 'on_the_way'
      ? themeColors.success
      : status === 'busy'
        ? themeColors.warning
        : themeColors.textMuted;
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface }]}
      onPress={() => onProviderPress(p)}
      activeOpacity={0.8}
    >
      <ProviderAvatar
        photoUri={p.photo ?? (p as { avatarUri?: string }).avatarUri ?? null}
        size={48}
        themeColor={theme?.primary ?? colors.primary}
      />
      <View style={styles.rowCenter}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {p.name}
        </Text>
        <Text style={[styles.meta, { color: statusColor }]}>{t(statusLabelKey(status))}</Text>
      </View>
      <Button
        title={t('map.requestService')}
        onPress={() => onRequestPress(p)}
        size="sm"
        style={styles.requestBtn}
      />
    </TouchableOpacity>
  );
});

const TABS: { key: FilterTab; labelKey: string }[] = [
  { key: 'all', labelKey: 'providersPage.filterAll' },
  { key: 'available', labelKey: 'providersPage.filterAvailable' },
  { key: 'busy', labelKey: 'providersPage.filterBusy' },
  { key: 'offline', labelKey: 'providersPage.filterOffline' },
];

export function AllProvidersScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const { coords } = useUserLocation();
  const center = coords ?? DEFAULT_MAP_CENTER;
  const params = useMemo(
    () => ({
      latitude: center.latitude,
      longitude: center.longitude,
      radiusKm: 50,
      availableOnly: false,
      page: 1,
      limit: 100,
    }),
    [center.latitude, center.longitude]
  );
  const { data, isLoading, isError, refetch } = useNearbyProviders(params, true, false);
  const allProviders = (data?.items ?? []) as Provider[];
  const filtered = useMemo(() => filterByTab(allProviders, filterTab), [allProviders, filterTab]);

  const handleProviderPress = useCallback(
    (p: Provider) => {
      navigation.navigate('ProviderProfile', { providerId: p.id });
    },
    [navigation],
  );

  const handleRequestService = useCallback(
    (p: Provider) => {
      const serviceType = providerRoleToServiceType(p.role);
      if (serviceType) navigation.navigate('Request', { serviceType, providerId: p.id });
    },
    [navigation],
  );

  const keyExtractor = useCallback((p: Provider) => p.id, []);

  const renderItem = useCallback<ListRenderItem<Provider>>(
    ({ item }) => (
      <ProviderListRow item={item} onProviderPress={handleProviderPress} onRequestPress={handleRequestService} />
    ),
    [handleProviderPress, handleRequestService],
  );

  return (
    <ScreenWrapper>
      <AppHeader title={t('providersPage.title')} onBack={() => navigation.goBack()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabsWrap, { borderBottomColor: colors.border }]} contentContainerStyle={styles.tabsContent}>
        {TABS.map(({ key, labelKey }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, filterTab === key && { backgroundColor: colors.primary + '22', borderBottomColor: colors.primary }]}
            onPress={() => setFilterTab(key)}
          >
            <Text style={[styles.tabText, { color: filterTab === key ? colors.primary : colors.textSecondary }]}>{t(labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading ? (
        <View style={styles.centered}>
          <LoadingSpinner />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('map.noProviders')}</Text>
          <Button title={t('common.retry')} onPress={() => refetch()} style={styles.retryBtn} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabsWrap: {
    borderBottomWidth: 1,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 12,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowCenter: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
  },
  requestBtn: {
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    marginBottom: 16,
  },
  retryBtn: {
    minWidth: 120,
  },
});
