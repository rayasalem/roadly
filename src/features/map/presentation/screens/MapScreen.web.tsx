/**
 * Web map screen: search, filters, OSM map, sheet with providers. No component > 200 lines.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useTheme } from '../../../../shared/theme';
import type { Provider } from '../../../providers/domain/types';
import { ROLES } from '../../../../shared/constants/roles';
import { AppText } from '../../../../shared/components/AppText';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { ProviderBottomSheet } from '../../../../shared/components/ProviderBottomSheet';
import { WebMapView } from '../components/WebMapView';
import { MapSearchBar } from '../components/MapSearchBar';
import { MapFiltersBar } from '../components/MapFiltersBar';
import { MapSheetContent } from '../components/MapSheetContent';
import { MapLocationDeniedView } from '../components/MapLocationDeniedView';
import { MapLegend } from '../components/MapLegend';
import { t } from '../../../../shared/i18n/t';
import { useAuthStore } from '../../../../store/authStore';
import { useUIStore } from '../../../../store/uiStore';
import { useMapFilters } from '../../hooks/useMapFilters';
import { useSortedNearbyProviders } from '../../hooks/useSortedNearbyProviders';
import { usePlacesSearch } from '../../hooks/usePlacesSearch';
import { providerRoleToServiceType } from '../../utils/providerToServiceType';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import { mapScreenWebStyles as styles } from './mapScreenWeb.styles';

const DEFAULT_CENTER = { latitude: 25.2048, longitude: 55.2708 };

function getFilterLabel(role: ReturnType<typeof useMapFilters>['filterRole']): string {
  if (role === null) return t('map.filter.all');
  if (role === 'mechanic') return t('map.filter.mechanic');
  if (role === 'mechanic_tow') return t('map.filter.tow');
  if (role === 'car_rental') return t('map.filter.rental');
  return t('map.filter.all');
}

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'Map'>;

export function MapScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const userRole = useAuthStore((s) => s.user?.role ?? null);
  const isCustomer = userRole === ROLES.USER;
  const { filterRole, setFilter, filterOptions } = useMapFilters();
  const { query: searchQuery, setQuery: setSearchQuery, selectedPlace, suggestions, selectPlace } = usePlacesSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const { sortedProviders, nearest, userCoords: coords, isLoading, isRefetching, error: locationError, isProvidersError, refetchLocation: fetchLocation, refetchProviders, getDistanceKm } =
    useSortedNearbyProviders({ role: filterRole, enabled: true });

  useEffect(() => {
    if (!coords) void fetchLocation();
  }, [coords, fetchLocation]);
  useEffect(() => {
    if (coords) setMapCenter({ latitude: coords.latitude, longitude: coords.longitude });
  }, [coords?.latitude, coords?.longitude]);
  useEffect(() => {
    if (selectedPlace) setMapCenter({ latitude: selectedPlace.latitude, longitude: selectedPlace.longitude });
  }, [selectedPlace]);

  const showEmptyProviders = !isLoading && sortedProviders.length === 0;
  const selectedProviderDistanceKm = selectedProvider ? getDistanceKm(selectedProvider) ?? null : null;
  const nearestDistanceKm = nearest ? getDistanceKm(nearest) ?? null : null;

  const handleSelectProvider = useCallback((provider: Provider | null | undefined) => {
    if (!provider) return;
    setSelectedProvider(provider);
    const loc = provider.location;
    if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
      setMapCenter({ latitude: loc.latitude, longitude: loc.longitude });
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
        try {
          navigation.goBack();
        } catch (_) {}
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
        navigation.navigate('Request', { serviceType, providerId: provider.id });
      } catch (_) {
        try {
          navigation.goBack();
        } catch (_) {}
      }
    },
    [navigation, isCustomer, toast]
  );

  const handleMyLocation = useCallback(() => {
    if (coords) setMapCenter({ latitude: coords.latitude, longitude: coords.longitude });
    else void fetchLocation();
  }, [coords, fetchLocation]);

  const handleOpenMapFromSheet = useCallback(() => {
    if (selectedProvider?.location) {
      setMapCenter({ latitude: selectedProvider.location.latitude, longitude: selectedProvider.location.longitude });
    } else {
      handleMyLocation();
    }
  }, [selectedProvider, handleMyLocation]);

  const handleTab = useCallback(
    (tab: NavTabId) => {
      if (tab === 'Home') navigation.navigate('Map');
      else if (tab === 'Profile') navigation.navigate('Profile');
      else if (tab === 'Chat') navigation.navigate('Chat');
      else if (tab === 'Notifications') navigation.navigate('Notifications');
      else if (tab === 'Settings') navigation.navigate('Settings');
    },
    [navigation]
  );

  const showLocationOverlay = isLoading && !coords && !locationError;

  if (locationError && !coords) {
    return (
      <MapLocationDeniedView
        onBack={() => navigation.goBack()}
        onRetry={() => fetchLocation()}
        onOpenSettings={Platform.OS !== 'web' ? () => Linking.openSettings() : undefined}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.searchBarContainer}>
          <MapSearchBar
            query={searchQuery}
            onQueryChange={(text) => {
              setSearchQuery(text);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            suggestions={suggestions}
            onSelectSuggestion={(s) => {
              selectPlace(s);
              setShowSuggestions(false);
            }}
            showSuggestions={showSuggestions}
          />
        </View>

        <View style={styles.mapCard}>
          {isProvidersError && sortedProviders.length > 0 && (
            <View style={styles.fallbackBanner}>
              <AppText variant="caption" style={styles.fallbackBannerText}>{t('map.showingCachedData')}</AppText>
            </View>
          )}
          {coords && nearest && nearestDistanceKm != null && (
            <View style={styles.userInfoChip}>
              <AppText variant="caption" style={styles.userInfoText}>
                {t('map.youAreHere')}{' '}
                {coords.latitude.toFixed(3)}, {coords.longitude.toFixed(3)} • {nearestDistanceKm.toFixed(1)} km
              </AppText>
            </View>
          )}
          <WebMapView
            center={mapCenter}
            providers={sortedProviders}
            userLocation={coords}
            selectedProviderId={selectedProvider?.id ?? null}
            nearestProviderId={nearest?.id ?? null}
            onProviderPress={handleSelectProvider}
          />
          <View style={styles.legendWrap}>
            <MapLegend compact />
          </View>
          <MapFiltersBar filterRole={filterRole} onFilterChange={setFilter} filterOptions={filterOptions} getLabel={getFilterLabel} />
          <TouchableOpacity style={styles.createRequestButton} onPress={() => (isCustomer ? navigation.navigate('Request', { serviceType: 'mechanic' }) : toast({ type: 'info', message: t('map.onlyCustomersCanRequest') }))}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.primaryContrast} />
            <AppText variant="caption" style={styles.createRequestButtonText}>{t('map.createRequest')}</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton} onPress={handleMyLocation}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.primaryContrast} />
          </TouchableOpacity>
          {showLocationOverlay && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingOverlayContent}>
                <LoadingSpinner />
                <AppText variant="callout" color={colors.textSecondary} style={styles.loadingOverlayText}>{t('map.gettingLocation')}</AppText>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sheet}>
          <MapSheetContent
            isLoading={isLoading}
            isError={isProvidersError}
            isRefetching={isRefetching}
            onRetry={() => refetchProviders()}
            showEmpty={showEmptyProviders}
            nearest={nearest}
            providers={sortedProviders}
            onSelectProvider={handleSelectProvider}
            onRequestService={handleRequestService}
            isCustomer={isCustomer}
          />
        </View>

        <BottomNavBar activeTab="Home" onSelect={handleTab} />
      </SafeAreaView>

      <ProviderBottomSheet
        ref={bottomSheetRef}
        provider={selectedProvider}
        onRequestService={handleRequestService}
        onOpenMap={handleOpenMapFromSheet}
        onClose={() => setSelectedProvider(null)}
        requestServiceDisabled={!isCustomer}
        distanceKm={selectedProviderDistanceKm ?? undefined}
      />
    </View>
  );
}
