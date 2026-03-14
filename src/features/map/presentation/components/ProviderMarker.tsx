/**
 * Reusable provider map marker: profile image with service-type icon badge (Mechanic / Tow / Car Rental).
 * Tap marker → opens provider card (bottom sheet). Callout shows name, rating, distance hint.
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Provider } from '../../../providers/domain/types';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, shadows } from '../../../../shared/theme';
import { getMarkerColorByStatus, getServiceTypeEmoji, getServiceTypeIconName } from '../../utils/mapMarkerUtils';
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

/** Marker: circular profile image with service-type icon badge (wrench / tow-truck / car). */
const MarkerPin = memo(function MarkerPin({
  photoUri,
  imageFailed,
  onImageError,
  serviceIconName,
  badgeColor,
  selected,
}: {
  photoUri: string | null;
  imageFailed: boolean;
  onImageError: () => void;
  serviceIconName: 'wrench' | 'tow-truck' | 'car-side';
  badgeColor: string;
  selected: boolean;
}) {
  const showImage = photoUri && !imageFailed;
  return (
    <View style={[styles.markerWrap, selected && styles.markerWrapSelected]}>
      <View style={styles.avatarRing}>
        {showImage ? (
          <Image source={{ uri: photoUri! }} style={styles.markerAvatar} onError={onImageError} />
        ) : (
          <View style={[styles.markerAvatar, styles.markerAvatarPlaceholder]}>
            <MaterialCommunityIcons name="account" size={22} color={colors.textMuted} />
          </View>
        )}
      </View>
      <View style={[styles.serviceBadge, { backgroundColor: badgeColor }]}>
        <MaterialCommunityIcons name={serviceIconName} size={12} color={colors.primaryContrast} />
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
  const [imageFailed, setImageFailed] = React.useState(false);
  const coord = getCoord(provider);
  if (!coord) return null;

  const badgeColor = getMarkerColorByStatus(provider, selected);
  const photoUri = provider.photo ?? provider.avatarUri ?? null;
  const serviceIconName = getServiceTypeIconName(provider);
  const serviceEmoji = getServiceTypeEmoji(provider);
  const rating = provider.rating ?? 0;
  const serviceLabel = provider.serviceType ?? (provider.role === 'mechanic_tow' ? 'tow' : provider.role === 'car_rental' ? 'rental' : 'mechanic');

  return (
    <Marker
      coordinate={coord}
      onPress={() => onPress(provider)}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <MarkerPin
        photoUri={photoUri}
        imageFailed={imageFailed}
        onImageError={() => setImageFailed(true)}
        serviceIconName={serviceIconName}
        badgeColor={badgeColor}
        selected={selected}
      />
      <Callout tooltip onPress={() => onPress(provider)}>
        <View style={styles.callout}>
          <Text style={styles.name} numberOfLines={1}>{provider.name}</Text>
          <Text style={styles.serviceType}>{serviceEmoji} {serviceLabel}</Text>
          <Text style={styles.rating}>{rating > 0 ? `${rating.toFixed(1)} ★` : '—'}</Text>
          {distanceKm != null && (
            <Text style={styles.distance}>
              {distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m` : `${distanceKm.toFixed(1)} km`} {t('map.away') ?? 'away'}
            </Text>
          )}
          <Text style={styles.tapHint}>{t('map.tapForDetails') ?? 'Tap to open card'}</Text>
        </View>
      </Callout>
    </Marker>
  );
});

const styles = StyleSheet.create({
  markerWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerWrapSelected: {
    transform: [{ scale: 1.1 }],
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.surface,
    overflow: 'hidden',
    ...shadows.sm,
  },
  markerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  markerAvatarPlaceholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  callout: {
    minWidth: 160,
    maxWidth: 220,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    ...shadows.md,
  },
  name: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
    color: colors.text,
  },
  serviceType: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rating: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.warning,
    marginTop: 2,
  },
  distance: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tapHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
