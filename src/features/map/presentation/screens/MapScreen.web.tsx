/**
 * Web version of MapScreen.
 *
 * Native (iOS/Android) uses `MapScreen.tsx` with the real map.
 * Here we recreate the same **visual language** (search bar, filters,
 * provider preview and list) so that the web view still feels like
 * a modern on‑demand map experience, just without the native map.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import type { Provider } from '../../../providers/domain/types';
import { useUserLocation } from '../../../location/hooks/useUserLocation';
import { useNearbyProviders } from '../../../providers/hooks/useNearbyProviders';
import { NearbyProvidersList } from '../../../providers/presentation/NearbyProvidersList';
import { ProviderCard } from '../../../../shared/components/ProviderCard';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';

export function MapScreen() {
  const [selected, setSelected] = useState<Provider | null>(null);

  const { coords, isLoading, fetchLocation } = useUserLocation();

  useEffect(() => {
    if (!coords) {
      void fetchLocation();
    }
  }, [coords, fetchLocation]);

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

  const providers = useMemo(() => data?.items ?? [], [data]);

  const nearest = providers[0];

  if (isLoading && !coords) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.root}>
      {/* Fake map background */}
      <View style={styles.mapArea}>
        <SafeAreaView style={styles.overlay} pointerEvents="box-none" edges={['top', 'left', 'right']}>
          <View style={styles.topBar} pointerEvents="box-none">
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
              <Text style={styles.searchPlaceholder}>Search mechanics, tow, rentals</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Filters">
              <MaterialCommunityIcons name="tune-variant" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.locationButton}
            accessibilityRole="button"
            accessibilityLabel="Center on my location"
            onPress={() => {
              // On web we don't move a real map, but we can re-trigger location.
              void fetchLocation();
            }}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.text} />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.mapHint}>
          <MaterialCommunityIcons name="map-outline" size={24} color={colors.primary} />
          <View style={styles.mapHintText}>
            <Text style={styles.mapHintTitle}>Map preview</Text>
            <Text style={styles.mapHintSubtitle}>
              Full live map is available on the mobile app. Here you can still browse nearby providers.
            </Text>
          </View>
        </View>
      </View>

      {/* Sheet-style content */}
      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {selected ? (
            <View style={styles.detailContainer}>
              <ProviderCard
                title={selected.name}
                subtitle={selected.role}
                distanceText={undefined}
                isAvailable={selected.isAvailable}
                onRequest={() => {
                  // Placeholder for future request flow; keep UI only.
                  setSelected(selected);
                }}
              />
              <View style={styles.detailActions}>
                <TouchableOpacity
                  onPress={() => setSelected(null)}
                  style={styles.backButton}
                  accessibilityRole="button"
                >
                  <Text style={styles.backButtonText}>Back to list</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {nearest && !isLoadingProviders ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Nearest provider</Text>
                  <ProviderCard
                    title={nearest.name}
                    subtitle={nearest.role}
                    distanceText={undefined}
                    isAvailable={nearest.isAvailable}
                    onPress={() => setSelected(nearest)}
                    onRequest={() => {
                      // Placeholder: hook into request flow later.
                      setSelected(nearest);
                    }}
                  />
                </View>
              ) : null}
              <NearbyProvidersList
                providers={providers}
                onSelect={(p) => setSelected(p)}
                onRequest={(p) => {
                  // Placeholder: keep UI only.
                  setSelected(p);
                }}
                loading={isLoadingProviders}
              />
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapArea: {
    height: '48%',
    backgroundColor: colors.primaryDark,
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
    bottom: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  mapHint: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xl * 2,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  mapHintText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  mapHintTitle: {
    color: colors.text,
    fontSize: typography.fontSize.callout,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  mapHintSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.caption,
    lineHeight: typography.fontSize.caption * typography.lineHeight.normal,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -spacing.lg,
    ...shadows.lg,
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  detailContainer: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  detailActions: {
    marginTop: spacing.lg,
  },
  backButton: {
    alignSelf: 'stretch',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  backButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.callout,
    fontWeight: typography.fontWeight.semibold,
  },
  previewSection: {
    marginBottom: spacing.md,
  },
  previewLabel: {
    marginBottom: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.fontSize.caption,
  },
});

