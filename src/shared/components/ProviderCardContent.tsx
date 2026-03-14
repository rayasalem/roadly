/**
 * Reusable provider card content: avatar, name, role, status, rating, distance, actions.
 * Used inside BottomSheet (map) and BottomSheetModal (detail). Safe image with placeholder.
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, typography, radii, shadows } from '../theme';
import { Button } from './Button';
import { ProviderAvatar } from './ProviderAvatar';
import { t } from '../i18n/t';
import type { Provider } from '../../features/providers/domain/types';
import { ROLE_LABELS } from '../constants/roles';
import { ROLE_THEMES, type RoleThemeId } from '../theme/roleThemes';
import { getServiceTypeEmoji } from '../../features/map/utils/mapMarkerUtils';

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
  if (provider.displayStatus === 'on_the_way') return colors.info ?? '#0EA5E9';
  if (provider.displayStatus === 'offline') return colors.textMuted;
  return colors.primary;
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

export interface ProviderCardContentProps {
  provider: Provider;
  distanceKm?: number | null;
  onRequestService: (provider: Provider) => void;
  onOpenMap?: () => void;
  onViewProfile?: (provider: Provider) => void;
  onCall?: (provider: Provider) => void;
  onChat?: (provider: Provider) => void;
  requestServiceDisabled?: boolean;
}

export function ProviderCardContent({
  provider,
  distanceKm,
  onRequestService,
  onOpenMap,
  onViewProfile,
  onCall,
  onChat,
  requestServiceDisabled,
}: ProviderCardContentProps) {
  const handleRequest = useCallback(() => onRequestService(provider), [provider, onRequestService]);
  const roleLabel = ROLE_LABELS[provider.role] ?? provider.role;
  const themeId = getRoleThemeId(provider.role);
  const theme = ROLE_THEMES[themeId];
  const rating = provider.rating ?? 4.5;
  const statusLabel = getStatusLabel(provider);

  return (
    <>
      <View style={[styles.card, { borderColor: theme.primary + '20', backgroundColor: colors.surface }]}>
        <View style={styles.cardInner}>
          <ProviderAvatar photoUri={provider.photo ?? provider.avatarUri ?? null} size={56} themeColor={theme.primary} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {provider.name}
            </Text>
            <Text style={[styles.role, { color: theme.primary }]} numberOfLines={1}>
              {getServiceTypeEmoji(provider)} {roleLabel}
            </Text>
            {(provider.phone ?? provider.contact) ? (
              <Text style={styles.phone} numberOfLines={1}>
                {provider.phone ?? provider.contact}
              </Text>
            ) : null}
            {distanceKm != null && (
              <Text style={styles.distance} numberOfLines={1}>
                {distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m away` : `${distanceKm.toFixed(1)} km away`}
              </Text>
            )}
            <Text style={styles.availabilityLabel}>{t('map.availability') ?? 'Availability'}</Text>
            <View style={[styles.badge, { backgroundColor: provider.displayStatus === 'busy' ? colors.warningLight : colors.greenLight }]}>
              <Text style={[styles.badgeText, { color: getStatusColor(provider) }]}>{statusLabel}</Text>
            </View>
            <View style={styles.ratingRow}>
              <RatingStars value={rating} />
              <Text style={styles.ratingValue}>
                {rating.toFixed(1)} {t('map.ratingStars')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {requestServiceDisabled === false && <Text style={styles.hint}>{t('map.requestHint')}</Text>}
      <View style={styles.actions}>
        <View style={styles.actionRow}>
          {onCall && (provider.phone ?? provider.contact) && (
            <TouchableOpacity style={[styles.iconBtn, { borderColor: theme.primary }]} onPress={() => onCall(provider)} activeOpacity={0.8}>
              <MaterialCommunityIcons name="phone-outline" size={22} color={theme.primary} />
              <Text style={[styles.iconBtnText, { color: theme.primary }]}>{t('map.call')}</Text>
            </TouchableOpacity>
          )}
          {onChat && (
            <TouchableOpacity style={[styles.iconBtn, { borderColor: theme.primary }]} onPress={() => onChat(provider)} activeOpacity={0.8}>
              <MaterialCommunityIcons name="message-text-outline" size={22} color={theme.primary} />
              <Text style={[styles.iconBtnText, { color: theme.primary }]}>{t('map.chat')}</Text>
            </TouchableOpacity>
          )}
          {onOpenMap && (
            <TouchableOpacity style={[styles.iconBtn, { borderColor: theme.primary }]} onPress={onOpenMap} activeOpacity={0.8}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={theme.primary} />
              <Text style={[styles.iconBtnText, { color: theme.primary }]}>{t('map.openMap')}</Text>
            </TouchableOpacity>
          )}
        </View>
        {onViewProfile && (
          <TouchableOpacity style={[styles.openMapBtn, { borderColor: theme.primary, marginTop: spacing.xs }]} onPress={() => onViewProfile(provider)} activeOpacity={0.8}>
            <MaterialCommunityIcons name="account-outline" size={20} color={theme.primary} />
            <Text style={[styles.openMapText, { color: theme.primary }]}>{t('map.viewProfile')}</Text>
          </TouchableOpacity>
        )}
        <Button
          testID="map-sheet-request-service"
          title={t('map.requestService')}
          onPress={handleRequest}
          disabled={requestServiceDisabled}
          fullWidth
          size="lg"
          style={styles.cta}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.card,
    ...shadows.sm,
  },
  cardInner: {
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
    marginBottom: spacing.xs,
  },
  role: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.callout,
    marginBottom: spacing.xs,
  },
  phone: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  distance: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  availabilityLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.full,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  ratingValue: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  hint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    gap: spacing.xs,
    minHeight: 48,
  },
  iconBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  openMapText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
  cta: {
    marginTop: spacing.xs,
  },
});
