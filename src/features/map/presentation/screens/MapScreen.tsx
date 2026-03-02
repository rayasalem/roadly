import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModal as GorhomBottomSheet, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { colors } from '../../../../shared/theme/colors';
import { spacing, radii, shadows } from '../../../../shared/theme';
import type { Provider } from '../../../providers/domain/types';
import { useUserLocation } from '../../../location/hooks/useUserLocation';
import { useNearbyProviders } from '../../../providers/hooks/useNearbyProviders';
import type { GeoPoint } from '../../../../shared/types/geo';
import { NearbyProvidersList } from '../../../providers/presentation/NearbyProvidersList';
import { ProviderCard } from '../../../../shared/components/ProviderCard';
import { Button } from '../../../../shared/components/Button';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DEFAULT_REGION_DELTA = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function toRegion(coords: GeoPoint): Region {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: DEFAULT_REGION_DELTA.latitudeDelta,
    longitudeDelta: DEFAULT_REGION_DELTA.longitudeDelta,
  };
}

export function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const sheetRef = useRef<BottomSheetModal | null>(null);

  const [selected, setSelected] = useState<Provider | null>(null);

  const { coords, isLoading, error, fetchLocation } = useUserLocation();

  useEffect(() => {
    if (!coords) {
      void fetchLocation();
    }
  }, [coords, fetchLocation]);

  const region = useMemo<Region | undefined>(() => {
    if (!coords) return undefined;
    return toRegion(coords);
  }, [coords]);

  const { data, isLoading: isLoadingProviders } = useNearbyProviders(
    coords
      ? {
          latitude: coords.latitude,
          longitude: coords.longitude,
          radiusKm: 10,
          availableOnly: true,
          page: 1,
          limit: 20,
        }
      : null,
  );

  const providers = data?.items ?? [];

  const handleSelectProvider = useCallback((provider: Provider) => {
    setSelected(provider);
    if (provider.location) {
      const r = {
        latitude: provider.location.latitude,
        longitude: provider.location.longitude,
        latitudeDelta: DEFAULT_REGION_DELTA.latitudeDelta,
        longitudeDelta: DEFAULT_REGION_DELTA.longitudeDelta,
      };
      mapRef.current?.animateToRegion(r, 300);
    }
  }, []);

  const handleRequestProvider = useCallback((provider: Provider) => {
    // Placeholder: hook into request flow later.
    setSelected(provider);
  }, []);

  const snapPoints = useMemo(() => ['20%', '50%'], []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
    [],
  );

  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.present();
    }
  }, []);

  if (isLoading && !coords) {
    return <LoadingSpinner />;
  }

  if (!region) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={(ref) => {
          mapRef.current = ref;
        }}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {providers.map((provider) => (
          <Marker
            key={provider.id}
            coordinate={{
              latitude: provider.location.latitude,
              longitude: provider.location.longitude,
            }}
            pinColor={provider.role === 'mechanic_tow' ? colors.mapTow : provider.role === 'car_rental' ? colors.mapRental : colors.mapMechanic}
            onPress={() => handleSelectProvider(provider)}
          />
        ))}
      </MapView>

      {/* Overlay controls (search, filter, location) */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none" edges={['top', 'left', 'right']}>
        <View style={styles.topBar} pointerEvents="box-none">
          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.searchPlaceholder}>Search mechanics, tow, rentals</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Filters">
            <MaterialCommunityIcons
              name="tune-variant"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.locationButton}
          accessibilityRole="button"
          accessibilityLabel="Center on my location"
          onPress={() => {
            if (coords) {
              const r = toRegion(coords);
              mapRef.current?.animateToRegion(r, 300);
            }
          }}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>
      </SafeAreaView>

      <GorhomBottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        enablePanDownToClose={false}
      >
        <View style={styles.sheetContent}>
          {selected ? (
            <View style={styles.detailContainer}>
              <ProviderCard
                title={selected.name}
                subtitle={selected.role}
                distanceText={undefined}
                isAvailable={selected.isAvailable}
                onRequest={() => handleRequestProvider(selected)}
              />
              <View style={styles.detailActions}>
                <Button
                  title="Back to list"
                  variant="ghost"
                  onPress={() => setSelected(null)}
                  fullWidth
                />
              </View>
            </View>
          ) : (
            <>
              {providers[0] && !isLoadingProviders ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Nearest provider</Text>
                  <ProviderCard
                    title={providers[0].name}
                    subtitle={providers[0].role}
                    distanceText={undefined}
                    isAvailable={providers[0].isAvailable}
                    onPress={() => handleSelectProvider(providers[0])}
                    onRequest={() => handleRequestProvider(providers[0])}
                  />
                </View>
              ) : null}
              <NearbyProvidersList
                providers={providers}
                onSelect={handleSelectProvider}
                onRequest={handleRequestProvider}
                loading={isLoadingProviders}
              />
            </>
          )}
        </View>
      </GorhomBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  searchPlaceholder: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.callout,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  locationButton: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xxxl,
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  detailContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  detailActions: {
    marginTop: spacing.lg,
  },
  previewSection: {
    marginBottom: spacing.md,
  },
  previewLabel: {
    marginBottom: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.fontSize.caption,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
    borderRadius: radii.full,
  },
});
