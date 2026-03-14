/**
 * Unified provider card: image, name, service type, rating, distance, availability.
 * Rounded corners, soft shadows, clean spacing. Tappable to open provider details.
 */
import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, typography, radii, shadows } from '../theme';
import { ACTIVE_OPACITY, HIT_SLOP_DEFAULT } from '../constants/ux';
import { ProviderAvatar } from './ProviderAvatar';
import { ROLE_LABELS } from '../constants/roles';
import { ROLE_THEMES, type RoleThemeId } from '../theme/roleThemes';
import { getServiceTypeEmoji } from '../../features/map/utils/mapMarkerUtils';
import { t } from '../i18n/t';
import type { Provider } from '../../features/providers/domain/types';

function getRoleThemeId(role: Provider['role']): RoleThemeId {
  if (role === 'mechanic') return 'mechanic';
  if (role === 'mechanic_tow') return 'tow';
  if (role === 'car_rental') return 'rental';
  return 'mechanic';
}

function getStatusLabel(provider: Provider): string {
  if (provider.displayStatus === 'offline') return t('map.status.offline');
  if (provider.displayStatus === 'on_the_way') return t('map.status.onTheWay');
  if (provider.displayStatus === 'busy') return t('map.status.busy');
  return t('map.status.available');
}

function getStatusColor(provider: Provider): string {
  if (provider.displayStatus === 'busy') return colors.warning;
  return colors.primary;
}

export interface ProviderCardProps {
  provider: Provider;
  /** Distance in km from user; shown when provided. */
  distanceKm?: number | null;
  /** Called when card is tapped (open provider details). */
  onPress: (provider: Provider) => void;
  /** Optional: secondary action (e.g. Request service). */
  onRequest?: (provider: Provider) => void;
  requestLabel?: string;
}

function RatingStars({ value }: { value: number }) {
  const full = Math.floor(Math.min(5, Math.max(0, value)));
  const hasHalf = value - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return (
    <View style={styles.starRow}>
      {Array.from({ length: full }, (_, i) => (
        <MaterialCommunityIcons key={`f-${i}`} name="star" size={14} color={colors.warning} />
      ))}
      {hasHalf && <MaterialCommunityIcons name="star-half-full" size={14} color={colors.warning} />}
      {Array.from({ length: empty }, (_, i) => (
        <MaterialCommunityIcons key={`e-${i}`} name="star-outline" size={14} color={colors.textMuted} />
      ))}
    </View>
  );
}

const ProviderCardInner = memo(function ProviderCardInner({
  provider,
  distanceKm,
  onPress,
  onRequest,
  requestLabel,
}: ProviderCardProps) {
  const themeId = getRoleThemeId(provider.role);
  const theme = ROLE_THEMES[themeId];
  const roleLabel = ROLE_LABELS[provider.role] ?? provider.role;
  const rating = provider.rating ?? 0;
  const statusLabel = getStatusLabel(provider);
  const statusColor = getStatusColor(provider);

  const handlePress = useCallback(() => onPress(provider), [onPress, provider]);
  const handleRequest = useCallback(() => onRequest?.(provider), [onRequest, provider]);

  const distanceText =
    distanceKm != null
      ? distanceKm < 1
        ? `${(distanceKm * 1000).toFixed(0)} m away`
        : `${distanceKm.toFixed(1)} km away`
      : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={handlePress}
      activeOpacity={ACTIVE_OPACITY}
      hitSlop={HIT_SLOP_DEFAULT}
    >
      <View style={styles.inner}>
        <ProviderAvatar
          photoUri={provider.photo ?? provider.avatarUri ?? null}
          size={52}
          themeColor={theme.primary}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {provider.name}
          </Text>
          <View style={[styles.serviceBadge, { backgroundColor: theme.primary + '18' }]}>
            <Text style={[styles.serviceText, { color: theme.primary }]} numberOfLines={1}>
              {getServiceTypeEmoji(provider)} {roleLabel}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <RatingStars value={rating} />
            <Text style={styles.ratingValue}>{rating > 0 ? rating.toFixed(1) : '—'}</Text>
            {distanceText ? (
              <>
                <View style={styles.dot} />
                <Text style={styles.distance} numberOfLines={1}>{distanceText}</Text>
              </>
            ) : null}
          </View>
          <View style={[styles.availabilityBadge, { backgroundColor: provider.displayStatus === 'busy' ? colors.warningLight : colors.greenLight }]}>
            <View style={[styles.availabilityDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.availabilityText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        {onRequest && (
          <TouchableOpacity
            style={[styles.requestBtn, { borderColor: theme.primary }]}
            onPress={handleRequest}
            activeOpacity={ACTIVE_OPACITY}
            hitSlop={HIT_SLOP_DEFAULT}
          >
            <Text style={[styles.requestBtnText, { color: theme.primary }]}>
              {requestLabel ?? t('map.requestService')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

export const ProviderCard = ProviderCardInner;

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    minWidth: 0,
  },
  name: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  serviceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.full,
    marginBottom: spacing.sm,
  },
  serviceText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingValue: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  distance: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.full,
    gap: spacing.xs / 2,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
  },
  requestBtn: {
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.sm,
  },
  requestBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.caption,
  },
});
