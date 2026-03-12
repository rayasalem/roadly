/**
 * Native map screen: full-screen map for customer with draggable bottom sheet; provider flow unchanged.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, Animated, Linking, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import MapView from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, spacing, typography } from '../../../../shared/theme';
import type { Provider } from '../../../providers/domain/types';
import { ROLES } from '../../../../shared/constants/roles';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { ProviderBottomSheet } from '../../../../shared/components/ProviderBottomSheet';
import { ProviderCardContent } from '../../../../shared/components/ProviderCardContent';
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
import { sortByNearest } from '../../../location/data/haversine';
import { DEFAULT_MAP_CENTER, MOCK_PROVIDERS, toRegion, filterRoleToArcId, arcIdToFilterRole, getFilterLabel } from '../../utils/mapHelpers';
import { useMapScreenDerivedData } from '../../hooks/useMapScreenDerivedData';
import type { MapFilterRole } from '../../hooks/useMapFilters';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import { safeNavigateToSettings } from '../../../../navigation/navigationRef';
import { mapScreenStyles as styles } from './mapScreen.styles';
import { useMechanicDashboard } from '../../../mechanic/hooks/useMechanicDashboard';
import { colors } from '../../../../shared/theme/colors';
import { radii } from '../../../../shared/theme';

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'Map'>;

export function MapScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const customerSheetRef = useRef<BottomSheet>(null);
  const cardAnimated = useRef(new Animated.Value(0)).current;

  const { coords, isLoading, error: locationError, fetchLocation } = useUserLocation();
  const userRole = useAuthStore((s) => s.user?.role ?? null);
  const isCustomer = userRole === ROLES.USER;
  const isProviderRole = userRole === 'mechanic' || userRole === 'mechanic_tow' || userRole === 'car_rental';
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
    if (selectedPlace && mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude: selectedPlace.latitude, longitude: selectedPlace.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
        300
      );
    }
  }, [selectedPlace]);

  const nearbyParams = useMemo(
    () =>
      isCustomer && effectiveCenter
        ? { latitude: effectiveCenter.latitude, longitude: effectiveCenter.longitude, radiusKm: 10, availableOnly: true, role: filterRole ?? undefined, page: 1, limit: 20 }
        : null,
    [isCustomer, effectiveCenter?.latitude, effectiveCenter?.longitude, filterRole]
  );
  const { data, isLoading: isLoadingProviders, isError: isProvidersError, isRefetching, refetch: refetchProviders } = useNearbyProviders(nearbyParams, true, isCustomer);
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
    mapRef.current.animateToRegion(toRegion(coords), 400);
  }, [coords]);

  const handleUseCurrentLocation = useCallback(() => {
    setCustomPinPosition(null);
    clearSelection();
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(toRegion(coords), 300);
    }
    if (coords) hasCenteredOnUser.current = false;
  }, [coords, clearSelection]);

  const handleDragPin = useCallback((latitude: number, longitude: number) => {
    setCustomPinPosition({ latitude, longitude });
    clearSelection();
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
        300
      );
    }
  }, [clearSelection]);

  useEffect(() => {
    if (nearest) {
      Animated.spring(cardAnimated, { toValue: 1, useNativeDriver: Platform.OS !== 'web', tension: 65, friction: 11 }).start();
    } else {
      cardAnimated.setValue(0);
    }
  }, [!!nearest, cardAnimated]);

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
        if (isCustomer) navigation.navigate('Map');
        else (navigation as any).navigate('MechanicDashboard');
      } else if (tab === 'notifications') (navigation as any).navigate('Notifications');
      else if (tab === 'bookmark') navigation.navigate('Profile');
      else safeNavigateToSettings(navigation);
    },
    [navigation, isCustomer]
  );

  if (locationError && !coords) {
    return (
      <MapLocationDeniedView
        onBack={() => navigation.goBack()}
        onRetry={() => fetchLocation()}
        onOpenSettings={Platform.OS === 'ios' || Platform.OS === 'android' ? () => Linking.openSettings() : undefined}
      />
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
    />
  );

  const displayProvider = (selectedProvider ?? nearest) as Provider | null;
  const displayDistanceKm = selectedProvider ? selectedProviderDistanceKm : nearestDistanceKm;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {!isCustomer && <View style={styles.greenCircle} />}
      {isCustomer ? (
        <>
          <View style={localStyles.mapFullScreen}>
            {mapContainer}
          </View>
          <SafeAreaView style={localStyles.headerSafe} edges={['top']}>
            <AppHeader centerLogo title={mapTitle} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} rightIcon="calendar" onRightPress={() => (navigation as any).navigate('Notifications')} />
          </SafeAreaView>
          <BottomSheet
            ref={customerSheetRef}
            snapPoints={['25%', '50%', '90%']}
            index={0}
            enablePanDownToClose={false}
            backgroundStyle={localStyles.sheetBg}
            handleIndicatorStyle={localStyles.sheetHandle}
          >
            <View style={localStyles.sheetContent}>
              {isLoadingProviders ? (
                <>
                  <Text style={[localStyles.skeletonLabel, { color: colors.textSecondary }]}>{t('map.loadingProviders')}</Text>
                  <Skeleton width="70%" height={20} radius={4} style={localStyles.skeletonBlock} />
                  <Skeleton width="50%" height={14} radius={4} style={localStyles.skeletonBlock} />
                  <Skeleton width="100%" height={48} radius={radii.lg} style={localStyles.skeletonBlock} />
                </>
              ) : showEmptyProviders ? (
                <>
                  <View style={localStyles.emptyIcon}>
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={40} color={colors.textMuted} />
                  </View>
                  <Text style={[localStyles.emptyTitle, { color: colors.text }]}>{t('map.noProviders')}</Text>
                  <Text style={[localStyles.emptySubtitle, { color: colors.textSecondary }]}>{t('map.noProvidersSubtitle')}</Text>
                  <Button title={t('common.retry')} onPress={() => refetchProviders()} fullWidth size="lg" style={localStyles.emptyButton} />
                </>
              ) : displayProvider ? (
                <ProviderCardContent
                  provider={displayProvider}
                  distanceKm={displayDistanceKm ?? undefined}
                  onRequestService={handleRequestService}
                  onOpenMap={handleOpenMapFromSheet}
                  onViewProfile={(p) => {
                    setSelectedProvider(null);
                    navigation.navigate('Profile');
                  }}
                  onCall={handleCallProvider}
                  onChat={handleChatProvider}
                  requestServiceDisabled={false}
                />
              ) : null}
            </View>
          </BottomSheet>
          <MapDockWithFAB
            activeId={filterRoleToArcId(filterRole)}
            onArcIconPress={(id) => setFilter(arcIdToFilterRole(id))}
            onFABPress={() => nearest && handleSelectProvider(nearest)}
            onDockTabPress={handleDockTabPress}
          />
        </>
      ) : (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <AppHeader centerLogo title={mapTitle} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} rightIcon="calendar" onRightPress={() => (navigation as any).navigate('Notifications')} />
          {mapContainer}
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
            navigation.navigate('Profile');
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
  },
  sheetHandle: {
    backgroundColor: colors.border,
    width: 40,
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
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
});

