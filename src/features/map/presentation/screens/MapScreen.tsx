/**
 * Native map screen: logic and layout only; UI split into MapContainerNative, MapBottomCard, MapLocationDeniedView.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, Animated, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import MapView from 'react-native-maps';

import { useTheme } from '../../../../shared/theme';
import type { Provider } from '../../../providers/domain/types';
import { ROLES } from '../../../../shared/constants/roles';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { ProviderBottomSheet } from '../../../../shared/components/ProviderBottomSheet';
import { MapContainerNative } from '../components/MapContainerNative';
import { MapBottomCard } from '../components/MapBottomCard';
import { MapLocationDeniedView } from '../components/MapLocationDeniedView';
import { MapDockWithFAB } from '../components/MapDockWithFAB';
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
import { mapScreenStyles as styles } from './mapScreen.styles';

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'Map'>;

export function MapScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const cardAnimated = useRef(new Animated.Value(0)).current;

  const { coords, isLoading, error: locationError, fetchLocation } = useUserLocation();
  const userRole = useAuthStore((s) => s.user?.role ?? null);
  const isCustomer = userRole === ROLES.USER;
  const { filterRole, setFilter, filterOptions } = useMapFilters();
  const { query: searchQuery, setQuery: setSearchQuery, selectedPlace } = usePlacesSearch();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

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
      coords
        ? { latitude: coords.latitude, longitude: coords.longitude, radiusKm: 10, availableOnly: true, role: filterRole ?? undefined, page: 1, limit: 20 }
        : null,
    [coords, filterRole]
  );
  const { data, isLoading: isLoadingProviders, isError: isProvidersError, isRefetching, refetch: refetchProviders } = useNearbyProviders(nearbyParams, true, isCustomer);
  const providers = (isProvidersError ? MOCK_PROVIDERS : (data?.items ?? [])) as Provider[];
  const providersWithLocation = useMemo(
    () =>
      providers.filter(
        (p) => p?.location && typeof (p.location as { latitude?: unknown }).latitude === 'number' && typeof (p.location as { longitude?: unknown }).longitude === 'number'
      ),
    [providers]
  );
  const referencePoint = coords ?? DEFAULT_MAP_CENTER;
  const sortedProviders = useMemo(() => sortByNearest(providersWithLocation, (p) => p.location, referencePoint), [providersWithLocation, referencePoint.latitude, referencePoint.longitude]);
  const nearest = sortedProviders[0] ?? providers[0] ?? null;
  const showEmptyProviders = !isLoadingProviders && !isProvidersError && providers.length === 0;

  const { region, routeCoordinates, clusterItems, selectedProviderDistanceKm } = useMapScreenDerivedData({
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
    try {
      bottomSheetRef.current?.present();
    } catch (_) {}
  }, []);

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
    if (coords && mapRef.current) {
      try {
        mapRef.current.animateToRegion(toRegion(coords), 300);
      } catch (_) {}
    } else {
      void fetchLocation();
    }
  }, [coords, fetchLocation]);

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

  const handleDockTabPress = useCallback(
    (tab: 'home' | 'notifications' | 'bookmark' | 'settings') => {
      if (tab === 'home') navigation.navigate('Map');
      else if (tab === 'notifications') navigation.navigate('Notifications');
      else if (tab === 'bookmark') navigation.navigate('Profile');
      else navigation.navigate('Settings');
    },
    [navigation]
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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.greenCircle} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <AppHeader title={t('map.title')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} rightIcon="calendar" onRightPress={() => navigation.navigate('Notifications')} />
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
        />
        <MapBottomCard
          nearest={nearest}
          isLoading={isLoadingProviders}
          isError={isProvidersError}
          isRefetching={isRefetching}
          showEmpty={showEmptyProviders}
          onRetry={() => refetchProviders()}
          onDirectionsPress={handleSelectProvider}
          cardAnimated={cardAnimated}
        />
        <MapDockWithFAB
          activeId={filterRoleToArcId(filterRole)}
          onArcIconPress={(id) => setFilter(arcIdToFilterRole(id))}
          onFABPress={() => nearest && handleSelectProvider(nearest)}
          onDockTabPress={handleDockTabPress}
        />
      </SafeAreaView>
      <ProviderBottomSheet ref={bottomSheetRef} provider={selectedProvider} onRequestService={handleRequestService} onOpenMap={handleOpenMapFromSheet} onClose={() => setSelectedProvider(null)} requestServiceDisabled={!isCustomer} distanceKm={selectedProviderDistanceKm ?? undefined} />
    </View>
  );
}

