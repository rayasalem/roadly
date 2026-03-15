/**
 * Native map card: MapView, polyline, markers, search bar with suggestions, filters, draggable service pin, floating buttons.
 * Memoized and stable callbacks for map performance on mid-range devices.
 */
import React, { useCallback, memo } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../../shared/components/AppText';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { ProviderMarker } from './ProviderMarker';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import type { Provider } from '../../../providers/domain/types';
import type { MapFilterRole } from '../../hooks/useMapFilters';
import type { MapClusterItem } from '../../utils/mapClustering';
import { SILVER_MAP_STYLE } from '../../constants/silverMapStyle';
import { colors } from '../../../../shared/theme/colors';
import type { PlaceSuggestion } from '../../data/placesApi';
import { haversineDistanceKm } from '../../../location/data/haversine';

interface MapContainerNativeProps {
  mapRef: React.RefObject<MapView | null>;
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  routeCoordinates: Array<{ latitude: number; longitude: number }>;
  clusterItems: MapClusterItem[];
  selectedProvider: Provider | null;
  filterRole: MapFilterRole;
  filterOptions: MapFilterRole[];
  searchQuery: string;
  onSearchChange: (t: string) => void;
  onFilterChange: (role: MapFilterRole) => void;
  onSelectProvider: (p: Provider | null | undefined) => void;
  onRequestService: (p: Provider | null | undefined) => void;
  onMyLocation: () => void;
  onCreateRequest: () => void;
  onRetry: () => void;
  showLocationOverlay: boolean;
  isProvidersError: boolean;
  isRefetching: boolean;
  isCustomer: boolean;
  getFilterLabel: (role: MapFilterRole) => string;
  /** When true, map fills screen (no border radius). */
  fullScreen?: boolean;
  /** Center used for provider search; when set with onDragPin, show draggable service-location pin. */
  effectiveCenter?: { latitude: number; longitude: number };
  onDragPin?: (latitude: number, longitude: number) => void;
  onUseCurrentLocation?: () => void;
  placeSuggestions?: PlaceSuggestion[];
  onSelectPlace?: (suggestion: PlaceSuggestion) => void;
  /** Origin for distance calculation (e.g. user location); shown in marker callout when set. */
  origin?: { latitude: number; longitude: number } | null;
}

function MapContainerNativeInner(props: MapContainerNativeProps) {
  const { colors: themeColors } = useTheme();
  const {
    mapRef,
    region,
    routeCoordinates,
    clusterItems,
    selectedProvider,
    filterRole,
    filterOptions,
    searchQuery,
    onSearchChange,
    onFilterChange,
    onSelectProvider,
    onRequestService,
    onMyLocation,
    onCreateRequest,
    onRetry,
    showLocationOverlay,
    isProvidersError,
    isRefetching,
    isCustomer,
    getFilterLabel,
  } = props;

  const fullScreen = props.fullScreen === true;
  const { effectiveCenter, onDragPin, onUseCurrentLocation, placeSuggestions = [], onSelectPlace, origin } = props;
  const showServicePin = isCustomer && effectiveCenter && onDragPin;

  const getDistanceKm = useCallback((provider: Provider): number | null => {
    if (!origin || !provider?.location) return null;
    const loc = provider.location as { latitude?: number; longitude?: number };
    if (typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') return null;
    return haversineDistanceKm(origin, { latitude: loc.latitude, longitude: loc.longitude });
  }, [origin]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.mapCard, fullScreen && styles.mapCardFullScreen]}>
        <View style={styles.mapFallbackWeb}>
          <MaterialCommunityIcons name="map" size={32} color={colors.primary} />
          <Text style={styles.mapFallbackWebText}>
            {t('map.webNotSupported') ?? 'الخريطة الأصلية متاحة فقط على الموبايل. استخدم نسخة الويب المدمجة في شاشة الخريطة.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mapCard, fullScreen && styles.mapCardFullScreen, { backgroundColor: themeColors.surface }, !fullScreen && shadows.lg]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation
        customMapStyle={SILVER_MAP_STYLE}
      >
        {routeCoordinates.length >= 2 && (
          <Polyline coordinates={routeCoordinates} strokeColor={themeColors.primary} strokeWidth={4} lineDashPattern={[1, 0]} />
        )}
        {showServicePin && (
          <Marker
            coordinate={effectiveCenter}
            draggable
            onDragEnd={(e) => onDragPin(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
          >
            <View style={markerStyles.servicePin}>
              <MaterialCommunityIcons name="map-marker" size={36} color={colors.primary} />
            </View>
          </Marker>
        )}
        {clusterItems.map((item, index) => {
          if (item.type === 'provider') {
            const provider = item.provider;
            if (provider == null) return null;
            return (
              <ProviderMarker
                key={provider.id ?? `provider-${index}`}
                provider={provider}
                selected={selectedProvider?.id === provider.id}
                onPress={onSelectProvider}
                onRequestService={isCustomer ? onRequestService : undefined}
                distanceKm={origin ? getDistanceKm(provider) ?? null : null}
              />
            );
          }
          const clat = item.latitude;
          const clng = item.longitude;
          const first = item.providers?.[0];
          return (
            <Marker
              key={item.id ?? `cluster-${index}`}
              coordinate={{ latitude: clat, longitude: clng }}
              onPress={() => first && onSelectProvider(first)}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={markerStyles.cluster}>
                <Text style={markerStyles.clusterText}>{item.count}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.searchWrap, { backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.92)' : themeColors.surface }, shadows.sm]}>
        <MaterialCommunityIcons name="magnify" size={20} color={themeColors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: themeColors.text }]}
          placeholder={t('map.searchHerePlaceholder')}
          placeholderTextColor={themeColors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      <View style={[styles.filtersRow, { top: spacing.md + 48 + spacing.sm + 44 + spacing.sm + (placeSuggestions.length > 0 ? 180 + spacing.sm : 0) }]}>
        {filterOptions.map((role) => (
          <TouchableOpacity
            key={role ?? 'all'}
            style={[styles.filterChip, filterRole === role && styles.filterChipActive]}
            onPress={() => onFilterChange(role)}
            accessibilityRole="button"
          >
            <Text style={[styles.filterChipText, filterRole === role && styles.filterChipTextActive]}>{getFilterLabel(role)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.createRequestButton} onPress={onCreateRequest} accessibilityRole="button" accessibilityLabel={t('map.createRequest')}>
        <MaterialCommunityIcons name="plus" size={22} color={colors.primaryContrast} />
        <Text style={styles.createRequestButtonText}>{t('map.createRequest')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.locationButton} onPress={onMyLocation} accessibilityRole="button" accessibilityLabel={t('map.myLocation')}>
        <MaterialCommunityIcons name="crosshairs-gps" size={22} color={themeColors.text} />
      </TouchableOpacity>

      {showLocationOverlay && (
        <View style={[styles.loadingOverlay, { pointerEvents: 'none' as const }]}>
          <View style={styles.loadingOverlayContent}>
            <LoadingSpinner />
            <AppText variant="callout" color={themeColors.textSecondary} style={styles.loadingOverlayText}>{t('map.gettingLocation')}</AppText>
          </View>
        </View>
      )}

      {isProvidersError && (
        <View style={styles.retryBanner}>
          <Text style={styles.retryText}>{t('error.network')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} accessibilityRole="button" accessibilityLabel={t('common.retry')}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export const MapContainerNative = memo(MapContainerNativeInner);

const styles = StyleSheet.create({
  mapCard: { flex: 1, borderRadius: 32, overflow: 'visible' as const },
  mapCardFullScreen: { borderRadius: 0 },
  map: { flex: 1, overflow: 'visible' as const },
  mapFallbackWeb: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  mapFallbackWebText: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  searchRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    gap: spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.callout, paddingVertical: Platform.OS === 'android' ? 4 : 0 },
  useCurrentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  useCurrentLocationText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
  },
  suggestionsWrap: {
    position: 'absolute',
    top: spacing.md + 48 + spacing.sm + 44 + spacing.sm,
    left: spacing.md,
    right: spacing.md,
    maxHeight: 180,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  suggestionsScroll: { maxHeight: 180 },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.callout,
  },
  filtersRow: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    ...shadows.sm,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.caption, color: colors.text },
  filterChipTextActive: { color: colors.primaryContrast },
  createRequestButton: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    gap: spacing.xs,
    ...shadows.sm,
  },
  createRequestButtonText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.caption, color: colors.primaryContrast },
  locationButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  loadingOverlayContent: { alignItems: 'center', gap: spacing.sm },
  loadingOverlayText: { marginTop: spacing.xs },
  retryBanner: {
    position: 'absolute',
    bottom: spacing.lg + 52,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  retryText: { fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.caption, color: colors.surface, flex: 1 },
  retryButton: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radii.sm, backgroundColor: colors.primary },
  retryButtonText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.caption, color: colors.primaryContrast },
});

const markerStyles = StyleSheet.create({
  servicePin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cluster: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.sm,
  },
  clusterText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.caption, color: colors.primaryContrast },
});
