/**
 * Native map card: MapView, markers, search with suggestion list, filters, optional service pin, floating actions.
 * Memoized for stable map marker props on mid-range devices.
 */
import React, { useCallback, memo, useMemo, useRef, useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  /** Extra bottom offset for floating map controls when a customer bottom sheet covers the map (UX only). */
  sheetLiftPx?: number;
}

const SUGGESTIONS_MAX_HEIGHT = 176;
const SEARCH_BAR_HEIGHT = 48;

function MapContainerNativeInner(props: MapContainerNativeProps) {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchFocused, setSearchFocused] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const { effectiveCenter, onDragPin, onUseCurrentLocation, placeSuggestions = [], onSelectPlace, origin, sheetLiftPx = 0 } = props;
  const showServicePin = isCustomer && effectiveCenter && onDragPin;

  /** Customer: header overlays map. Provider: map sits below header in SafeAreaView — only a small inset here. */
  const headerUnderlay = fullScreen ? insets.top + 56 + spacing.xs : spacing.md;
  const showSuggestionList =
    isCustomer &&
    Boolean(onSelectPlace) &&
    placeSuggestions.length > 0 &&
    searchFocused;
  const hideFilterRow = isCustomer && searchFocused;
  const hideCreateCta = isCustomer && searchFocused;
  const suggestionsTop = headerUnderlay + SEARCH_BAR_HEIGHT + spacing.xs;
  const filtersTop = useMemo(() => {
    const belowSearch = headerUnderlay + SEARCH_BAR_HEIGHT + spacing.sm;
    const listGap = showSuggestionList ? SUGGESTIONS_MAX_HEIGHT + spacing.sm : 0;
    return belowSearch + listGap;
  }, [headerUnderlay, showSuggestionList]);
  const mapChromeBottom = spacing.md + 4;
  const locationBtnSize = 44;
  const createBtnLift = locationBtnSize + spacing.md;

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => setSearchFocused(false), 200);
  }, []);

  const handleSelectSuggestion = useCallback(
    (s: PlaceSuggestion) => {
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
      setSearchFocused(false);
      onSelectPlace?.(s);
    },
    [onSelectPlace],
  );

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
      <View style={styles.mapStack} collapsable={false}>
      <MapView
        ref={mapRef}
        style={styles.mapFill}
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
              <MaterialCommunityIcons name="map-marker" size={36} color={themeColors.primary} />
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
              <View style={[markerStyles.cluster, { backgroundColor: themeColors.primary, borderColor: themeColors.surface }]}>
                <Text style={[markerStyles.clusterText, { color: themeColors.primaryContrast }]}>{item.count}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View
        style={[
          styles.searchWrap,
          { top: headerUnderlay, backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.92)' : themeColors.surface },
          shadows.sm,
        ]}
      >
        <MaterialCommunityIcons name="magnify" size={20} color={themeColors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: themeColors.text }]}
          placeholder={t('map.searchHerePlaceholder')}
          placeholderTextColor={themeColors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          returnKeyType="search"
        />
      </View>

      {showSuggestionList ? (
        <View
          style={[
            styles.suggestionsPanel,
            {
              top: suggestionsTop,
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <ScrollView
            style={styles.suggestionsScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={placeSuggestions.length > 4}
          >
            {placeSuggestions.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.suggestionRow, { borderBottomColor: themeColors.border }]}
                onPress={() => handleSelectSuggestion(s)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={s.description}
              >
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={themeColors.textSecondary} />
                <View style={styles.suggestionTextCol}>
                  <Text style={[styles.suggestionMain, { color: themeColors.text }]} numberOfLines={1}>
                    {s.mainText}
                  </Text>
                  {s.secondaryText ? (
                    <Text style={[styles.suggestionSecondary, { color: themeColors.textMuted }]} numberOfLines={1}>
                      {s.secondaryText}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {!hideFilterRow ? (
        <View style={[styles.filtersRow, { top: filtersTop }]}>
          {filterOptions.map((role) => {
            const active = filterRole === role;
            return (
              <TouchableOpacity
                key={role ?? 'all'}
                style={[
                  styles.filterChip,
                  { backgroundColor: 'rgba(255,255,255,0.92)' },
                  active && { backgroundColor: themeColors.primary },
                ]}
                onPress={() => onFilterChange(role)}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: themeColors.text },
                    active && { color: themeColors.primaryContrast },
                  ]}
                >
                  {getFilterLabel(role)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {isCustomer && !hideCreateCta ? (
        <TouchableOpacity
          style={[styles.createRequestButton, { bottom: mapChromeBottom + createBtnLift, backgroundColor: themeColors.primary }]}
          onPress={onCreateRequest}
          accessibilityRole="button"
          accessibilityLabel={t('map.createRequest')}
          activeOpacity={0.88}
        >
          <MaterialCommunityIcons name="plus" size={22} color={themeColors.primaryContrast} />
          <Text style={[styles.createRequestButtonText, { color: themeColors.primaryContrast }]}>{t('map.createRequest')}</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.locationButton, { bottom: mapChromeBottom + sheetLiftPx, backgroundColor: themeColors.surface }]}
        onPress={onMyLocation}
        accessibilityRole="button"
        accessibilityLabel={t('map.myLocation')}
        activeOpacity={0.88}
      >
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
        <View
          style={[
            styles.retryBanner,
            {
              bottom:
                sheetLiftPx +
                (isCustomer
                  ? hideCreateCta
                    ? mapChromeBottom + 52
                    : mapChromeBottom + createBtnLift + 46 + spacing.sm
                  : mapChromeBottom + 52),
            },
          ]}
        >
          <Text style={styles.retryText}>{t('error.network')}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: themeColors.primary }]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={t('common.retry')}
          >
            <Text style={[styles.retryButtonText, { color: themeColors.primaryContrast }]}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}
      </View>
    </View>
  );
}

export const MapContainerNative = memo(MapContainerNativeInner);

const styles = StyleSheet.create({
  mapStack: { flex: 1, position: 'relative' as const },
  mapFill: { ...StyleSheet.absoluteFillObject },
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
    position: 'absolute' as const,
    left: spacing.md,
    right: spacing.md,
    zIndex: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    marginStart: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.callout,
    paddingVertical: Platform.OS === 'android' ? 4 : 0,
  },
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
  suggestionsPanel: {
    position: 'absolute' as const,
    left: spacing.md,
    right: spacing.md,
    maxHeight: SUGGESTIONS_MAX_HEIGHT,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden' as const,
    zIndex: 21,
    ...shadows.md,
    ...(Platform.OS === 'android' ? { elevation: 12 } : {}),
  },
  suggestionsScroll: { maxHeight: SUGGESTIONS_MAX_HEIGHT },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionTextCol: { flex: 1, minWidth: 0 },
  suggestionMain: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.callout,
  },
  suggestionSecondary: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    marginTop: 2,
  },
  filtersRow: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 19,
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
    zIndex: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    gap: spacing.xs,
    ...shadows.md,
  },
  createRequestButtonText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.caption, color: colors.primaryContrast },
  locationButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 17,
    width: 44,
    height: 44,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  loadingOverlayContent: { alignItems: 'center', gap: spacing.sm },
  loadingOverlayText: { marginTop: spacing.xs },
  retryBanner: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 28,
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
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.sm,
  },
  clusterText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.caption, color: colors.primaryContrast },
});
