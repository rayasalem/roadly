/**
 * Provider map marker: icon by profession (mechanic=wrench, tow=tow-truck, rental=car) with role color.
 * Tap marker → callout with name, service type, availability, and "Request service" button.
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Provider } from '../../../providers/domain/types';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, shadows } from '../../../../shared/theme';
import {
  getMarkerColorByStatus,
  getServiceTypeEmoji,
  getServiceTypeIconName,
  getAvailabilityStatusKey,
} from '../../utils/mapMarkerUtils';
import { t } from '../../../../shared/i18n/t';

export interface ProviderMarkerProps {
  provider: Provider;
  selected: boolean;
  onPress: (provider: Provider) => void;
  onRequestService?: (provider: Provider) => void;
  /** Optional distance in km for callout (from user to provider). */
  distanceKm?: number | null;
}

function getCoord(provider: Provider): { latitude: number; longitude: number } | null {
  const loc = provider.location;
  if (!loc || typeof (loc as { latitude?: number }).latitude !== 'number' || typeof (loc as { longitude?: number }).longitude !== 'number') return null;
  return { latitude: (loc as { latitude: number }).latitude, longitude: (loc as { longitude: number }).longitude };
}

/** Pin: role-colored circle + white profession icon (wrench / tow-truck / car). */
const MarkerPin = memo(function MarkerPin({
  serviceIconName,
  pinColor,
  selected,
}: {
  serviceIconName: 'wrench' | 'tow-truck' | 'car-side';
  pinColor: string;
  selected: boolean;
}) {
  return (
    <View style={[styles.markerWrap, selected && styles.markerWrapSelected]}>
      <View style={[styles.pinCircle, { backgroundColor: pinColor }]}>
        <MaterialCommunityIcons name={serviceIconName} size={26} color="#FFF" />
      </View>
    </View>
  );
});

export const ProviderMarker = memo(function ProviderMarker({
  provider,
  selected,
  onPress,
  onRequestService,
  distanceKm,
}: ProviderMarkerProps) {
  const coord = getCoord(provider);
  if (!coord) return null;

  const pinColor = getMarkerColorByStatus(provider, selected);
  const serviceIconName = getServiceTypeIconName(provider);
  const serviceEmoji = getServiceTypeEmoji(provider);
  const rating = provider.rating ?? 0;
  const serviceLabel = provider.serviceType ?? (provider.role === 'mechanic_tow' ? 'tow' : provider.role === 'car_rental' ? 'rental' : 'mechanic');
  const availabilityKey = getAvailabilityStatusKey(provider);
  const isAvailable = availabilityKey === 'map.status.available';

  return (
    <Marker
      coordinate={coord}
      onPress={() => onPress(provider)}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <MarkerPin serviceIconName={serviceIconName} pinColor={pinColor} selected={selected} />
      <Callout tooltip onPress={() => onPress(provider)}>
        <View style={styles.callout}>
          <Text style={styles.name} numberOfLines={1}>{provider.name}</Text>
          <Text style={styles.serviceType}>{serviceEmoji} {serviceLabel}</Text>
          <View style={styles.availabilityRow}>
            <View style={[styles.availabilityDot, { backgroundColor: isAvailable ? colors.mapRental : availabilityKey === 'map.status.busy' ? colors.warning : colors.textMuted }]} />
            <Text style={styles.availabilityText}>{t(availabilityKey)}</Text>
          </View>
          <Text style={styles.rating}>{rating > 0 ? `${rating.toFixed(1)} ★` : '—'}</Text>
          {distanceKm != null && (
            <Text style={styles.distance}>
              {distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m` : `${distanceKm.toFixed(1)} km`} {t('map.away') ?? 'away'}
            </Text>
          )}
          {onRequestService && (
            <TouchableOpacity
              style={styles.requestButton}
              onPress={(e) => {
                e?.stopPropagation?.();
                onRequestService(provider);
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('map.requestService')}
            >
              <MaterialCommunityIcons name="handshake-outline" size={18} color="#FFF" />
              <Text style={styles.requestButtonText}>{t('map.requestService')}</Text>
            </TouchableOpacity>
          )}
          {!onRequestService && (
            <Text style={styles.tapHint}>{t('map.tapForDetails') ?? 'Tap to open card'}</Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
});

const styles = StyleSheet.create({
  markerWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerWrapSelected: {
    transform: [{ scale: 1.15 }],
  },
  pinCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.md,
  },
  callout: {
    minWidth: 200,
    maxWidth: 260,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 14,
    ...shadows.md,
  },
  name: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    color: colors.text,
  },
  serviceType: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  rating: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.warning,
    marginTop: 4,
  },
  distance: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.mapRental,
    borderRadius: 10,
  },
  requestButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: '#FFF',
  },
  tapHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
