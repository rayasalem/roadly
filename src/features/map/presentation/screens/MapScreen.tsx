/**
 * Native map screen: full-screen map for customer with draggable bottom sheet; provider flow unchanged.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, Animated, Linking, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import MapView from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, spacing, typography, shadows } from '../../../../shared/theme';
import type { Provider } from '../../../providers/domain/types';
import { ROLES } from '../../../../shared/constants/roles';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { ProviderBottomSheet } from '../../../../shared/components/ProviderBottomSheet';
import { ProviderCardContent } from '../../../../shared/components/ProviderCardContent';
import { ProviderAvatar } from '../../../../shared/components/ProviderAvatar';
import { MapContainerNative } from '../components/MapContainerNative';
import { MapBottomCard } from '../components/MapBottomCard';
import { MapLocationDeniedView } from '../components/MapLocationDeniedView';
import { MapDockWithFAB } from '../components/MapDockWithFAB';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { Button } from '../../../../shared/components/Button';
import { Skeleton } from '../../../../shared/components/Skeleton';
import { t } from '../../../../shared/i18n/t';
import { useAuthStore } from '../../../../store/authStore';
import { useUIStore } from '../../../../store/uiStore';
import { useUserLocation } from '../../../location/hooks/useUserLocation';
import { useNearbyProviders } from '../../../providers/hooks/useNearbyProviders';
import { useMapFilters } from '../../hooks/useMapFilters';
import { usePlacesSearch } from '../../hooks/usePlacesSearch';
import { providerRoleToServiceType } from '../../utils/providerToServiceType';
import { sortByNearest, haversineDistanceKm } from '../../../location/data/haversine';
import { DEFAULT_MAP_CENTER, MOCK_PROVIDERS, toRegion, filterRoleToArcId, arcIdToFilterRole, getFilterLabel } from '../../utils/mapHelpers';
import { useMapScreenDerivedData } from '../../hooks/useMapScreenDerivedData';
import type { MapFilterRole } from '../../hooks/useMapFilters';
import { safeNavigateToSettings } from '../../../../navigation/navigationRef';
import { mapScreenStyles as styles } from './mapScreen.styles';
import { useMechanicDashboard } from '../../../mechanic/hooks/useMechanicDashboard';
import { colors } from '../../../../shared/theme/colors';
import { radii } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';

export function MapScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const customerSheetRef = useRef<BottomSheet>(null);
  const cardAnimated = useRef(new Animated.Value(0)).current;

  const { coords, isLoading, error: locationError, fetchLocation } = useUserLocation();
  const userRole = useAuthStore((s) => s.user?.role ?? null);
  const isCustomer = userRole === ROLES.USER;
  const isProviderRole = userRole === 'mechanic' || userRole === 'mechanic_tow' || userRole === 'car_rental';
  const isAdmin = userRole === ROLES.ADMIN;
  const { jobs: mechanicJobs } = useMechanicDashboard(userRole === 'mechanic');
  const { filterRole, setFilter, filterOptions } = useMapFilters();
  const { query: searchQuery, setQuery: setSearchQuery, selectedPlace, suggestions, selectPlace, clearSelection } = usePlacesSearch();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [customPinPosition, setCustomPinPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  const effectiveCenter = useMemo(() => {
    if (customPinPosition) return customPinPosition;
    if (selectedPlace) return { latitude: selectedPlace.latitude, longitude: selectedPlace.longitude };
    return coords ?? DEFAULT_MAP_CENTER;
  }, [customPinPosition, selectedPlace, coords]);

  useEffect(() => {
    if (!selectedPlace || !mapRef.current) return;
    const { latitude, longitude } = selectedPlace;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    try {
      mapRef.current.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
        300
      );
    } catch (_) {}
  }, [selectedPlace]);

  const nearbyParams = useMemo(
    () =>
      isCustomer && effectiveCenter
        ? { latitude: effectiveCenter.latitude, longitude: effectiveCenter.longitude, radiusKm: 10, availableOnly: true, role: filterRole ?? undefined, page: 1, limit: 20 }
        : null,
    [isCustomer, effectiveCenter?.latitude, effectiveCenter?.longitude, filterRole]
  );
  const { data, isLoading: isLoadingProviders, isError: isProvidersError, isRefetching, refetch: refetchProviders } = useNearbyProviders(nearbyParams, true, false);
  const providers = (isProvidersError ? MOCK_PROVIDERS : (data?.items ?? [])) as Provider[];
  const providersWithLocation = useMemo(
    () =>
      providers.filter((p) => {
        if (!p?.location || typeof (p.location as { latitude?: unknown }).latitude !== 'number' || typeof (p.location as { longitude?: unknown }).longitude !== 'number')
          return false;
        if (p.displayStatus === 'offline' || (p as { status?: string }).status === 'offline') return false;
        return true;
      }),
    [providers]
  );
  const sortedProviders = useMemo(() => sortByNearest(providersWithLocation, (p) => p.location, effectiveCenter), [providersWithLocation, effectiveCenter.latitude, effectiveCenter.longitude]);
  const nearest = sortedProviders[0] ?? providers[0] ?? null;
  const showEmptyProviders = !isLoadingProviders && !isProvidersError && providers.length === 0;

  const providersWithDistance = useMemo(
    () =>
      sortedProviders.map((p) => ({
        provider: p,
        distanceKm: effectiveCenter && p.location ? haversineDistanceKm(effectiveCenter, p.location as { latitude: number; longitude: number }) : null,
      })),
    [sortedProviders, effectiveCenter]
  );

  const { region, routeCoordinates, clusterItems, selectedProviderDistanceKm, nearestDistanceKm } = useMapScreenDerivedData({
    center: effectiveCenter,
    coords,
    selectedProvider,
    nearest,
    sortedProviders,
  });

  const hasCenteredOnUser = useRef(false);
  useEffect(() => {
    if (!coords || !mapRef.current) return;
    if (hasCenteredOnUser.current) return;
    hasCenteredOnUser.current = true;
    try {
      const reg = toRegion(coords);
      if (Number.isFinite(reg.latitude) && Number.isFinite(reg.longitude)) {
        mapRef.current.animateToRegion(reg, 400);
      }
    } catch (_) {
      hasCenteredOnUser.current = false;
    }
  }, [coords]);

  const handleUseCurrentLocation = useCallback(() => {
    setCustomPinPosition(null);
    clearSelection();
    if (coords && mapRef.current) {
      try {
        const reg = toRegion(coords);
        if (Number.isFinite(reg.latitude) && Number.isFinite(reg.longitude)) {
          mapRef.current.animateToRegion(reg, 300);
        }
      } catch (_) {}
    }
    if (coords) hasCenteredOnUser.current = false;
  }, [coords, clearSelection]);

  const handleDragPin = useCallback((latitude: number, longitude: number) => {
    setCustomPinPosition({ latitude, longitude });
    clearSelection();
    if (mapRef.current && Number.isFinite(latitude) && Number.isFinite(longitude)) {
      try {
        mapRef.current.animateToRegion(
          { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
          300
        );
      } catch (_) {}
    }
  }, [clearSelection]);

  useEffect(() => {
    if (!isCustomer) {
      if (nearest) {
        Animated.spring(cardAnimated, { toValue: 1, useNativeDriver: false, tension: 65, friction: 11 }).start();
      } else {
        cardAnimated.setValue(0);
      }
    }
  }, [!!nearest, cardAnimated, isCustomer]);

  useEffect(() => {
    if (!coords) void fetchLocation();
  }, [coords, fetchLocation]);

  const handleSelectProvider = useCallback((provider: Provider | null | undefined) => {
    if (!provider) return;
    setSelectedProvider(provider);
    const loc = provider.location;
    if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number' && mapRef.current) {
      try {
        mapRef.current.animateToRegion({ latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 300);
      } catch (_) {}
    }
    if (isCustomer) {
      try {
        (customerSheetRef.current as any)?.snapToIndex(1);
      } catch (_) {}
    } else {
      try {
        bottomSheetRef.current?.present();
      } catch (_) {}
    }
  }, [isCustomer]);

  const toast = useUIStore((s) => s.toast);
  const handleRequestService = useCallback(
    (provider: Provider | null | undefined) => {
      if (!provider) return;
      const serviceType = providerRoleToServiceType(provider.role);
      if (!serviceType) {
        if (typeof navigation.goBack === 'function') navigation.goBack();
        return;
      }
      if (!isCustomer) {
        toast({ type: 'info', message: t('map.onlyCustomersCanRequest') });
        return;
      }
      try {
        bottomSheetRef.current?.dismiss();
      } catch (_) {}
      setSelectedProvider(null);
      toast({ type: 'info', message: t('map.confirmOnNextScreen'), durationMs: 3000 });
      try {
        navigation.navigate('Request', { serviceType: serviceType === 'mechanic' || serviceType === 'tow' || serviceType === 'rental' ? serviceType : 'mechanic', providerId: provider.id });
      } catch (_) {
        if (typeof navigation.goBack === 'function') navigation.goBack();
      }
    },
    [navigation, isCustomer, toast]
  );

  const handleMyLocation = useCallback(() => {
    if (isCustomer) {
      handleUseCurrentLocation();
      return;
    }
    if (coords && mapRef.current) {
      try {
        mapRef.current.animateToRegion(toRegion(coords), 300);
      } catch (_) {}
    } else {
      void fetchLocation();
    }
  }, [isCustomer, coords, fetchLocation, handleUseCurrentLocation]);

  const handleOpenMapFromSheet = useCallback(() => {
    const loc = selectedProvider?.location;
    if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number' && mapRef.current) {
      try {
        mapRef.current.animateToRegion({ latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 300);
      } catch (_) {
        handleMyLocation();
      }
    } else {
      handleMyLocation();
    }
  }, [selectedProvider, handleMyLocation]);

  const handleCallProvider = useCallback((provider: Provider) => {
    const phone = provider.phone ?? (provider as { contact?: string }).contact;
    if (phone) Linking.openURL('tel:' + phone);
    else toast({ type: 'info', message: t('map.noPhone') });
  }, [toast]);

  const handleChatProvider = useCallback((_provider: Provider) => {
    try {
      (navigation as any).navigate('Chat');
    } catch (_) {
      toast({ type: 'info', message: t('map.chat') });
    }
  }, [navigation, toast]);

  const handleDockTabPress = useCallback(
    (tab: 'home' | 'notifications' | 'bookmark' | 'settings') => {
      if (tab === 'home') {
        // الخريطة هي الصفحة الرئيسية الآن لكل الأدوار
        if (isCustomer) navigation.navigate('Map');
        else if (isProviderRole) (navigation as any).navigate('ProviderDashboard');
        else if (isAdmin) (navigation as any).navigate('AdminDashboard');
      } else if (tab === 'notifications') (navigation as any).navigate('Notifications');
      else if (tab === 'bookmark') navigation.navigate('Profile');
      else safeNavigateToSettings(navigation);
    },
    [navigation, isCustomer, isProviderRole, isAdmin]
  );

  if (locationError && !coords) {
    return (
      <MapLocationDeniedView
        onBack={() => navigation.goBack()}
        onRetry={() => fetchLocation()}
        onOpenSettings={Platform.OS === 'ios' || Platform.OS === 'android' ? () => Linking.openSettings() : undefined}
        errorMessage={locationError}
      />
    );
  }

  // While الموقع لسه بيُحمَّل لأول مرة، لا نرسم الـ MapView نهائياً لتفادي أي كراش محتمل من مكتبة الخرائط.
  if (!coords && isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <AppHeader
          centerLogo
          title={t('map.title')}
          onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
          rightIcon="calendar"
          onRightPress={() => (navigation as any).navigate('Notifications')}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md }}>
          <LoadingSpinner />
          <Text
            style={{
              marginTop: spacing.md,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.body,
              color: colors.textSecondary,
              textAlign: 'center',
            }}
          >
            {t('map.gettingLocation') ?? 'جاري تحديد موقعك…'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const mapTitle = isCustomer ? t('map.title') : t('map.incomingRequests');
  const nearestRequest = isProviderRole && mechanicJobs.length > 0
    ? { id: mechanicJobs[0].id, title: mechanicJobs[0].title, distance: mechanicJobs[0].distance, eta: mechanicJobs[0].eta, status: mechanicJobs[0].status }
    : null;

  const mapContainer = (
    <MapContainerNative
      mapRef={mapRef}
      region={region}
      routeCoordinates={routeCoordinates}
      clusterItems={clusterItems}
      selectedProvider={selectedProvider}
      filterRole={filterRole}
      filterOptions={filterOptions}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterChange={(role: MapFilterRole) => setFilter(role)}
      onSelectProvider={handleSelectProvider}
      onRequestService={handleRequestService}
      onMyLocation={handleMyLocation}
      onCreateRequest={() => (isCustomer ? navigation.navigate('Request', { serviceType: 'mechanic' }) : toast({ type: 'info', message: t('map.onlyCustomersCanRequest') }))}
      onRetry={() => refetchProviders()}
      showLocationOverlay={Boolean(isLoading && !coords && !locationError)}
      isProvidersError={isProvidersError}
      isRefetching={isRefetching}
      isCustomer={isCustomer}
      getFilterLabel={getFilterLabel}
      fullScreen={isCustomer}
      effectiveCenter={isCustomer ? effectiveCenter : undefined}
      onDragPin={isCustomer ? handleDragPin : undefined}
      onUseCurrentLocation={isCustomer ? handleUseCurrentLocation : undefined}
      placeSuggestions={isCustomer ? suggestions : []}
      onSelectPlace={isCustomer ? selectPlace : undefined}
      origin={effectiveCenter}
    />
  );

  const displayProvider = (selectedProvider ?? nearest) as Provider | null;
  const displayDistanceKm = selectedProvider ? selectedProviderDistanceKm : nearestDistanceKm;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {!isCustomer && <View style={styles.greenCircle} />}
      {isCustomer ? (
        <>
          <View style={localStyles.customerLayout}>
            <View style={localStyles.mapSection} collapsable={false}>
              <View style={localStyles.mapFullScreen} collapsable={false}>
                {mapContainer}
              </View>
              <SafeAreaView style={localStyles.headerSafe} edges={['top']}>
                <AppHeader
                  centerLogo
                  title={mapTitle}
                  onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
                  rightIcon="calendar"
                  onRightPress={() => (navigation as any).navigate('Notifications')}
                />
              </SafeAreaView>
            </View>
            {/* Card section below the map — short height, list of all available providers */}
            <View style={localStyles.sheetBg}>
              <ScrollView
                style={localStyles.sheetScroll}
                contentContainerStyle={localStyles.sheetContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                bounces={true}
                nestedScrollEnabled={true}
              >
              {isLoadingProviders ? (
                <>
                  <Text style={[localStyles.skeletonLabel, { color: colors.textSecondary }]}>
                    {t('map.loadingProviders')}
                  </Text>
                  <Skeleton width="70%" height={20} radius={4} style={localStyles.skeletonBlock} />
                  <Skeleton width="50%" height={14} radius={4} style={localStyles.skeletonBlock} />
                </>
              ) : showEmptyProviders ? (
                <>
                  <View style={localStyles.emptyIcon}>
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={40} color={colors.textMuted} />
                  </View>
                  <Text style={[localStyles.emptyTitle, { color: colors.text }]}>
                    {t('map.noProviders')}
                  </Text>
                  <Button
                    title={t('common.retry')}
                    onPress={() => refetchProviders()}
                    fullWidth
                    size="lg"
                    style={localStyles.emptyButton}
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[localStyles.myRequestsRow, { backgroundColor: colors.primary + '18' }]}
                    onPress={() => navigation.navigate('RequestHistory')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={colors.primary} />
                    <Text style={[localStyles.myRequestsText, { color: colors.primary }]}>{t('request.historyTitle')}</Text>
                    <MaterialCommunityIcons name="chevron-left" size={22} color={colors.primary} style={{ transform: [{ scaleX: -1 }] }} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[localStyles.myRequestsRow, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('AllProviders')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="account-group-outline" size={22} color={colors.primary} />
                    <Text style={[localStyles.myRequestsText, { color: colors.text }]}>{t('providersPage.viewAll')}</Text>
                    <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textSecondary} style={{ transform: [{ scaleX: -1 }] }} />
                  </TouchableOpacity>
                  <Text style={[localStyles.providersListTitle, { color: colors.text }]}>
                    {t('map.availableProviders')}
                  </Text>
                  {providersWithDistance.map(({ provider: p, distanceKm: d }) => {
                    const themeId = p.role === 'mechanic_tow' ? 'tow' : p.role === 'car_rental' ? 'rental' : 'mechanic';
                    const theme = ROLE_THEMES[themeId];
                    return (
                    <TouchableOpacity
                      key={p.id}
                      style={[localStyles.providerRow, { backgroundColor: colors.surface }]}
                      onPress={() => handleSelectProvider(p)}
                      activeOpacity={0.8}
                    >
                      <ProviderAvatar photoUri={p.photo ?? (p as { avatarUri?: string }).avatarUri ?? null} size={40} themeColor={theme?.primary ?? colors.primary} />
                      <View style={localStyles.providerRowCenter}>
                        <Text style={[localStyles.providerRowName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                        <Text style={[localStyles.providerRowMeta, { color: colors.textSecondary }]}>
                          {d != null ? (d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`) : '—'} • {t('map.status.available')}
                        </Text>
                      </View>
                      <Button
                        title={t('map.requestService') ?? 'طلب خدمة'}
                        onPress={() => handleRequestService(p)}
                        size="sm"
                        style={localStyles.providerRowBtn}
                      />
                    </TouchableOpacity>
                  );})}
                </>
              )}
              </ScrollView>
            </View>
          <MapDockWithFAB
            activeId={filterRoleToArcId(filterRole)}
            onArcIconPress={(id) => setFilter(arcIdToFilterRole(id))}
            onFABPress={() => nearest && handleRequestService(nearest)}
            onDockTabPress={handleDockTabPress}
            inFlow
          />
          </View>
        </>
      ) : (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <AppHeader
            centerLogo
            title={mapTitle}
            onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
            rightIcon="calendar"
            onRightPress={() => (navigation as any).navigate('Notifications')}
          />
          {mapContainer}
          {(isProviderRole || isAdmin) && (
            <TouchableOpacity
              style={localStyles.dashboardFab}
              activeOpacity={0.8}
              onPress={() => {
                if (isProviderRole) (navigation as any).navigate('ProviderDashboard');
                else if (isAdmin) (navigation as any).navigate('AdminDashboard');
              }}
            >
              <MaterialCommunityIcons
                name={isAdmin ? 'shield-account' : 'view-dashboard-outline'}
                size={22}
                color="#FFF"
              />
            </TouchableOpacity>
          )}
          <MapBottomCard
            nearest={nearest}
            isLoading={isLoadingProviders}
            isError={isProvidersError}
            isRefetching={isRefetching}
            showEmpty={!nearestRequest}
            onRetry={() => refetchProviders()}
            onDirectionsPress={handleSelectProvider}
            cardAnimated={cardAnimated}
            nearestRequest={nearestRequest}
            onBackToDashboard={() => (navigation as any).navigate('MechanicDashboard')}
          />
          <MapDockWithFAB
            activeId={filterRoleToArcId(filterRole)}
            onArcIconPress={(id) => setFilter(arcIdToFilterRole(id))}
            onFABPress={() => nearest && handleSelectProvider(nearest)}
            onDockTabPress={handleDockTabPress}
          />
        </SafeAreaView>
      )}
      {!isCustomer && (
        <ProviderBottomSheet
          ref={bottomSheetRef}
          provider={selectedProvider}
          onRequestService={handleRequestService}
          onOpenMap={handleOpenMapFromSheet}
          onViewProfile={(p) => {
            try {
              bottomSheetRef.current?.dismiss();
            } catch (_) {}
            setSelectedProvider(null);
            navigation.navigate('ProviderProfile', { providerId: p.id });
          }}
          onCall={handleCallProvider}
          onChat={handleChatProvider}
          onClose={() => setSelectedProvider(null)}
          requestServiceDisabled={!isCustomer}
          distanceKm={selectedProviderDistanceKm ?? undefined}
        />
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  customerLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  mapSection: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  mapFullScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  sheetBg: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: Platform.OS === 'web' ? 220 : 150,
    minHeight: Platform.OS === 'web' ? 200 : 140,
    maxHeight: Platform.OS === 'web' ? 280 : 170,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetHandle: {
    backgroundColor: colors.border,
    width: 40,
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 80,
  },
  myRequestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  myRequestsText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
  providersListTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
    marginBottom: spacing.sm,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    marginBottom: spacing.xs,
  },
  providerRowCenter: { flex: 1, minWidth: 0, marginLeft: spacing.md },
  providerRowName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
  providerRowMeta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    marginTop: 2,
  },
  providerRowProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  providerRowBtn: { marginLeft: spacing.sm },
  skeletonLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.callout,
    marginBottom: spacing.sm,
  },
  skeletonBlock: { marginBottom: spacing.sm },
  emptyIcon: { marginBottom: spacing.sm, alignItems: 'center' },
  emptyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.callout,
    marginBottom: spacing.md,
  },
  emptyButton: { marginTop: spacing.sm },
  dashboardFab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});

