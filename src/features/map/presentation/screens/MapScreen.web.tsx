/**
 * Web map screen: search, filters, OSM map, sheet with providers. No component > 200 lines.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, Platform, Linking, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useTheme } from '../../../../shared/theme';
import type { Provider } from '../../../providers/domain/types';
import { ROLES } from '../../../../shared/constants/roles';
import { AppText } from '../../../../shared/components/AppText';
import { BottomNavBar } from '../../../../shared/components/BottomNavBar';
import { SideNavRail } from '../../../../shared/components/SideNavRail';
import { BREAKPOINT_DESKTOP } from '../../../../shared/design/layout';
import type { NavTabId } from '../../../../shared/navigation/navTabs';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { WebMapView } from '../components/WebMapView';
import { MapSearchBar } from '../components/MapSearchBar';
import { MapLocationDeniedView } from '../components/MapLocationDeniedView';
import { MapLegend } from '../components/MapLegend';
import { MapUnifiedBottomSheetContent } from '../components/MapUnifiedBottomSheet';
import { t } from '../../../../shared/i18n/t';
import { useAuthStore } from '../../../../store/authStore';
import { useUIStore } from '../../../../store/uiStore';
import { useMapFilters } from '../../hooks/useMapFilters';
import { useSortedNearbyProviders } from '../../hooks/useSortedNearbyProviders';
import { usePlacesSearch } from '../../hooks/usePlacesSearch';
import { providerRoleToServiceType } from '../../utils/providerToServiceType';
import type { ServiceType } from '../../../requests/domain/types';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import { blurActiveElementForA11y } from '../../../../shared/utils/domA11y';
import { ACTIVE_OPACITY } from '../../../../shared/constants/ux';
import { mapScreenWebStyles as styles } from './mapScreenWeb.styles';
import { spacing, shadows, typography } from '../../../../shared/theme';

const DEFAULT_CENTER = { latitude: 25.2048, longitude: 55.2708 };

function getFilterLabel(role: ReturnType<typeof useMapFilters>['filterRole']): string {
  if (role === null) return t('map.filter.all');
  if (role === 'mechanic') return t('map.filter.mechanic');
  if (role === 'mechanic_tow') return t('map.filter.tow');
  if (role === 'car_rental') return t('map.filter.rental');
  if (role === 'insurance') return t('map.filter.insurance');
  return t('map.filter.all');
}

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'Map'>;

export function MapScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktopShell = Platform.OS === 'web' && width >= BREAKPOINT_DESKTOP;
  const navigation = useNavigation<Nav>();
  const mapBottomSheetRef = useRef<BottomSheetModal>(null);
  const userRole = useAuthStore((s) => s.user?.role ?? null);
  const isCustomer = userRole === ROLES.USER;
  const { filterRole, setFilter, filterOptions } = useMapFilters();
  const { query: searchQuery, setQuery: setSearchQuery, selectedPlace, suggestions, selectPlace } = usePlacesSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [sheetIndex, setSheetIndex] = useState<number>(-1);

  const { sortedProviders, nearest, userCoords: coords, isLoading, isRefetching, error: locationError, isProvidersError, refetchLocation: fetchLocation, refetchProviders, getDistanceKm } =
    useSortedNearbyProviders({ role: filterRole, enabled: true });

  const isSearching = showSuggestions;
  const isSheetOpen = sheetIndex !== -1;
  const isMobileFilters = width < 640 && !isDesktopShell;
  const showLegend = !isSearching && !isSheetOpen;

  const showCreateRequestCTA = isCustomer && !selectedProvider && !isSearching && sheetIndex <= 0;
  const ctaBottom = spacing.lg + (sheetIndex === 0 ? 120 : 0);
  const showLocationButton = !isSearching && sheetIndex <= 0;
  const locationButtonBottom = spacing.lg + (sheetIndex === 0 ? 120 : 0);

  useEffect(() => {
    if (!coords) void fetchLocation();
  }, [coords, fetchLocation]);
  useEffect(() => {
    if (coords) setMapCenter({ latitude: coords.latitude, longitude: coords.longitude });
  }, [coords?.latitude, coords?.longitude]);
  useEffect(() => {
    if (selectedPlace) setMapCenter({ latitude: selectedPlace.latitude, longitude: selectedPlace.longitude });
  }, [selectedPlace]);

  const visibleProviders = useMemo(
    () =>
      sortedProviders.filter(
        (p) => p.displayStatus !== 'offline' && (p as { status?: string }).status !== 'offline'
      ),
    [sortedProviders]
  );
  const shouldShowProvidersError = isProvidersError && visibleProviders.length === 0;
  const nearestVisible = visibleProviders[0] ?? null;
  const showEmptyProviders = !isLoading && visibleProviders.length === 0;
  const selectedProviderDistanceKm = selectedProvider ? getDistanceKm(selectedProvider) ?? null : null;
  const nearestDistanceKm = nearestVisible ? getDistanceKm(nearestVisible) ?? null : nearest ? getDistanceKm(nearest) ?? null : null;

  // Present the map sheet once we have a user location context.
  const hasPresentedSheetRef = useRef(false);
  useEffect(() => {
    if (hasPresentedSheetRef.current) return;
    if (!mapBottomSheetRef.current) return;
    if (!coords) return;
    try {
      mapBottomSheetRef.current.present();
      hasPresentedSheetRef.current = true;
    } catch (_) {}
  }, [coords]);

  useEffect(() => {
    if (isSearching) setIsFilterPanelOpen(false);
  }, [isSearching]);

  const handleSelectProvider = useCallback((provider: Provider | null | undefined) => {
    if (!provider) return;
    setIsFilterPanelOpen(false);
    setShowSuggestions(false);
    setSelectedProvider(provider);
    const loc = provider.location;
    if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
      setMapCenter({ latitude: loc.latitude, longitude: loc.longitude });
    }
    try {
      mapBottomSheetRef.current?.present();
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
        blurActiveElementForA11y();
        mapBottomSheetRef.current?.dismiss();
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
      const nav = navigation as any;
      const routeNames: string[] = nav?.getState?.()?.routeNames ?? [];
      if (tab === 'Home') {
        if (isCustomer) navigation.navigate('Map');
        else if (routeNames.includes('InsuranceDashboard')) nav.navigate('InsuranceDashboard');
        else if (routeNames.includes('RentalDashboard')) nav.navigate('RentalDashboard');
        else nav.navigate('ProviderDashboard');
      } else if (tab === 'Requests') {
        if (isCustomer) nav.navigate('RequestHistory');
        else if (routeNames.includes('MechanicJobHistory')) nav.navigate('MechanicJobHistory');
        else if (routeNames.includes('TowJobHistory')) nav.navigate('TowJobHistory');
        else if (routeNames.includes('RentalBookings')) nav.navigate('RentalBookings');
        else if (routeNames.includes('InsuranceRequests')) nav.navigate('InsuranceRequests');
        else if (routeNames.includes('AdminRequests')) nav.navigate('AdminRequests');
      } else if (tab === 'Profile') nav.navigate('Profile');
      else if (tab === 'Chat') nav.navigate('Chat');
    },
    [navigation, isCustomer]
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
    <View
      style={{
        flex: 1,
        flexDirection: isDesktopShell ? 'row' : 'column',
        backgroundColor: colors.background,
      }}
    >
      {isDesktopShell ? (
        <SideNavRail activeTab="Home" onSelect={handleTab} dark={!isCustomer} />
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={[styles.root, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.searchBarContainer}>
            <MapSearchBar
              query={searchQuery}
              onQueryChange={(text) => {
                setSearchQuery(text);
                setShowSuggestions(true);
                setIsFilterPanelOpen(false);
              }}
              onFocus={() => {
                setShowSuggestions(true);
                setIsFilterPanelOpen(false);
              }}
              suggestions={suggestions}
              onSelectSuggestion={(s) => {
                selectPlace(s);
                setShowSuggestions(false);
                setIsFilterPanelOpen(false);
              }}
              showSuggestions={showSuggestions}
            />
          </View>

          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <View style={styles.headerLeft}>
                {isProvidersError && visibleProviders.length > 0 && (
                  <View style={styles.fallbackBanner}>
                    <AppText variant="caption" style={styles.fallbackBannerText}>
                      {t('map.showingCachedData')}
                    </AppText>
                  </View>
                )}

                {coords && nearest && nearestDistanceKm != null && (
                  <View style={styles.userInfoChip}>
                    <AppText variant="caption" style={styles.userInfoText}>
                      {t('map.youAreHere')} • {nearestDistanceKm.toFixed(1)} km
                    </AppText>
                  </View>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={styles.filterButton}
                onPress={() => {
                  if (isSearching) setShowSuggestions(false);
                  setIsFilterPanelOpen((v) => !v);
                }}
              >
                <MaterialCommunityIcons name="tune-variant" size={20} color={colors.text} />
                <AppText variant="caption" style={{ color: colors.text }}>
                  {t('map.filtersTitle')}
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.mapArea}>
              {(isSearching || isSheetOpen) && <View style={styles.mapInteractionBlocker} />}

              <View style={{ flex: 1, opacity: isSearching ? 0.75 : 1 }}>
                <WebMapView
                  center={mapCenter}
                  providers={sortedProviders}
                  userLocation={coords}
                  selectedProviderId={selectedProvider?.id ?? null}
                  nearestProviderId={nearest?.id ?? null}
                  onProviderPress={handleSelectProvider}
                  onRequestService={handleRequestService}
                />
              </View>

              {showLegend && (
                <View style={styles.legendWrap}>
                  <MapLegend compact />
                </View>
              )}

              {showLocationButton && (
                <TouchableOpacity activeOpacity={ACTIVE_OPACITY} style={[styles.locationButton, { bottom: locationButtonBottom }]} onPress={handleMyLocation}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.primaryContrast} />
                </TouchableOpacity>
              )}

              {showLocationOverlay && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingOverlayContent}>
                    <LoadingSpinner />
                    <AppText variant="callout" color={colors.textSecondary} style={styles.loadingOverlayText}>
                      {t('map.gettingLocation')}
                    </AppText>
                  </View>
                </View>
              )}

              {/* Filter UI */}
              {!isMobileFilters && isFilterPanelOpen && (
                <View style={styles.filterPanel}>
                  <AppText variant="caption" style={styles.filterPanelTitle}>
                    {t('map.filtersTitle')}
                  </AppText>
                  {filterOptions.map((role) => {
                    const label = getFilterLabel(role);
                    const active = role === filterRole;
                    return (
                      <TouchableOpacity
                        key={String(role ?? 'all')}
                        style={styles.filterRow}
                        activeOpacity={ACTIVE_OPACITY}
                        onPress={() => {
                          setFilter(role);
                          setIsFilterPanelOpen(false);
                        }}
                      >
                        <AppText variant="callout" style={styles.filterRowText}>
                          {label}
                        </AppText>
                        {active ? (
                          <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
                        ) : (
                          <View style={[styles.filterRowCheck, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {isMobileFilters && isFilterPanelOpen && (
                <View style={styles.filterOverlay}>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.filterOverlay}
                    onPress={() => setIsFilterPanelOpen(false)}
                  />
                  <View style={styles.filterMobileSheet}>
                    <View style={styles.filterMobileHeader}>
                      <AppText variant="caption" style={{ fontFamily: typography.fontFamily.semibold, fontSize: 14, color: colors.text }}>
                        {t('map.filtersTitle')}
                      </AppText>
                      <TouchableOpacity
                        activeOpacity={ACTIVE_OPACITY}
                        style={styles.filterMobileCloseBtn}
                        onPress={() => setIsFilterPanelOpen(false)}
                      >
                        <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {filterOptions.map((role) => {
                      const label = getFilterLabel(role);
                      const active = role === filterRole;
                      return (
                        <TouchableOpacity
                          key={String(role ?? 'all')}
                          style={styles.filterRow}
                          activeOpacity={ACTIVE_OPACITY}
                          onPress={() => {
                            setFilter(role);
                            setIsFilterPanelOpen(false);
                          }}
                        >
                          <AppText variant="callout" style={styles.filterRowText}>
                            {label}
                          </AppText>
                          {active ? <MaterialCommunityIcons name="check" size={18} color={colors.primary} /> : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Floating CTA */}
          {showCreateRequestCTA && (
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              style={[styles.createRequestButton, { bottom: ctaBottom }]}
              onPress={() => {
                if (!isCustomer) {
                  toast({ type: 'info', message: t('map.onlyCustomersCanRequest') });
                  return;
                }
                const serviceType: ServiceType =
                  filterRole != null ? (providerRoleToServiceType(filterRole) ?? 'mechanic') : 'mechanic';
                navigation.navigate('Request', { serviceType });
              }}
            >
              <MaterialCommunityIcons name="plus" size={20} color={colors.primaryContrast} />
              <AppText variant="caption" style={styles.createRequestButtonText}>
                {t('map.createRequest')}
              </AppText>
            </TouchableOpacity>
          )}

          {/* Draggable providers sheet */}
          <BottomSheetModal
            ref={mapBottomSheetRef}
            snapPoints={['25%', '50%', '90%']}
            enablePanDownToClose
            onChange={(index) => {
              setSheetIndex(index);
            }}
            onDismiss={() => {
              setSelectedProvider(null);
              setSheetIndex(-1);
            }}
            backgroundStyle={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              ...shadows.lg,
            }}
            handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
          >
            <MapUnifiedBottomSheetContent
              selectedProvider={selectedProvider}
              selectedProviderDistanceKm={selectedProviderDistanceKm}
              isLoading={isLoading}
              isError={shouldShowProvidersError}
              isRefetching={isRefetching}
              onRetry={() => refetchProviders()}
              showEmpty={showEmptyProviders}
              nearest={nearestVisible}
              providers={visibleProviders}
              onSelectProvider={handleSelectProvider}
              onRequestService={(p) => handleRequestService(p)}
              isCustomer={isCustomer}
              onCloseSelectedProvider={() => setSelectedProvider(null)}
              onOpenMap={handleOpenMapFromSheet}
              onViewProfile={(provider) => {
                try {
                  blurActiveElementForA11y();
                } catch (_) {}
                setSelectedProvider(null);
                navigation.navigate('ProviderProfile', { providerId: provider.id });
              }}
            />
          </BottomSheetModal>

          {!isDesktopShell ? <BottomNavBar activeTab="Home" onSelect={handleTab} dark={!isCustomer} /> : null}
        </SafeAreaView>
        </View>
      </View>
    </View>
  );
}
