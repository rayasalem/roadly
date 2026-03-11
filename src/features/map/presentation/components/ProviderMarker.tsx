/**
 * Reusable provider map marker (native): uses latitude/longitude, colored by status,
 * callout with photo, name, rating, and Request Service action.
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Provider } from '../../../providers/domain/types';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { getMarkerColorByStatus } from '../../utils/mapMarkerUtils';

export interface ProviderMarkerProps {
  provider: Provider;
  selected: boolean;
  onPress: (provider: Provider) => void;
  onRequestService?: (provider: Provider) => void;
}

function getCoord(provider: Provider): { latitude: number; longitude: number } | null {
  const loc = provider.location;
  if (!loc || typeof (loc as { latitude?: number }).latitude !== 'number' || typeof (loc as { longitude?: number }).longitude !== 'number') return null;
  return { latitude: (loc as { latitude: number }).latitude, longitude: (loc as { longitude: number }).longitude };
}

const PinView = memo(function PinView({ color }: { color: string }) {
  return (
    <View style={[styles.pin, { backgroundColor: color }]} />
  );
});

export const ProviderMarker = memo(function ProviderMarker({
  provider,
  selected,
  onPress,
  onRequestService,
}: ProviderMarkerProps) {
  const coord = getCoord(provider);
  if (!coord) return null;

  const color = getMarkerColorByStatus(provider, selected);
  const photoUri = provider.photo ?? provider.avatarUri ?? null;
  const rating = provider.rating ?? 0;
  const services = Array.isArray(provider.services) ? provider.services.slice(0, 3) : [];

  return (
    <Marker
      coordinate={coord}
      onPress={() => onPress(provider)}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <PinView color={color} />
      <Callout tooltip onPress={() => onPress(provider)}>
        <View style={styles.callout}>
          <View style={styles.calloutRow}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={24} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.calloutInfo}>
              <Text style={styles.name} numberOfLines={1}>{provider.name}</Text>
              <Text style={styles.rating}>{rating > 0 ? `${rating.toFixed(1)} ★` : '—'}</Text>
              {services.length > 0 && (
                <Text style={styles.services} numberOfLines={2}>{services.join(', ')}</Text>
              )}
            </View>
          </View>
          {onRequestService && (
            <TouchableOpacity
              style={styles.requestBtn}
              onPress={() => onRequestService(provider)}
              activeOpacity={0.8}
            >
              <Text style={styles.requestBtnText}>طلب خدمة</Text>
            </TouchableOpacity>
          )}
        </View>
      </Callout>
    </Marker>
  );
});

const styles = StyleSheet.create({
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.sm,
  },
  callout: {
    minWidth: 200,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.md,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutInfo: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
    color: colors.text,
  },
  rating: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.warning,
    marginTop: 2,
  },
  services: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  requestBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.caption,
    color: colors.primaryContrast,
  },
});
