/**
 * Map provider callout / bottom sheet: avatar, name, role, status, rating, Open Map & Request.
 * Matches design: white card, rounded corners, shadows, role-themed CTA, optional glassmorphism.
 */
import React, { forwardRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { spacing, typography, radii, shadows } from '../theme';
import { Button } from './Button';
import { t } from '../i18n/t';
import type { Provider } from '../../features/providers/domain/types';
import { ROLE_LABELS } from '../constants/roles';
import { ROLE_THEMES, type RoleThemeId } from '../theme/roleThemes';

const SNAP_POINTS = [320, '50%'];

function getRoleThemeId(role: Provider['role']): RoleThemeId {
  if (role === 'mechanic') return 'mechanic';
  if (role === 'mechanic_tow') return 'tow';
  if (role === 'car_rental') return 'rental';
  return 'mechanic';
}

function getStatusLabel(provider: Provider): string {
  if (provider.displayStatus === 'on_the_way') return t('map.status.onTheWay');
  if (provider.displayStatus === 'busy') return t('map.status.busy');
  return t('map.status.available');
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

export interface ProviderBottomSheetProps {
  provider: Provider | null;
  onRequestService: (provider: Provider) => void;
  onOpenMap?: () => void;
  onClose: () => void;
  /** When true, disables the Request Service button (e.g. non-customer roles). */
  requestServiceDisabled?: boolean;
  /** Optional distance in km from user to provider (shown when provided). */
  distanceKm?: number | null;
}

export const ProviderBottomSheet = forwardRef<BottomSheetModal, ProviderBottomSheetProps>(
  function ProviderBottomSheet({ provider, onRequestService, onOpenMap, onClose, requestServiceDisabled, distanceKm }, ref) {
    const handleRequest = useCallback(() => {
      if (provider) onRequestService(provider);
    }, [provider, onRequestService]);

    if (!provider) return null;

    const roleLabel = ROLE_LABELS[provider.role] ?? provider.role;
    const themeId = getRoleThemeId(provider.role);
    const theme = ROLE_THEMES[themeId];
    const rating = provider.rating ?? 4.5;
    const statusLabel = getStatusLabel(provider);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        onDismiss={onClose}
        backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.surface }]}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.content}>
          {/* Card: glassmorphism-style (semi-transparent surface) */}
          <View style={[styles.card, { borderColor: theme.primary + '30', backgroundColor: colors.surface }]}>
            <View style={styles.cardInner}>
              <View style={[styles.avatarWrap, { backgroundColor: theme.primaryLight }]}>
                {(provider.photo ?? provider.avatarUri) ? (
                  <Image source={{ uri: String(provider.photo ?? provider.avatarUri) }} style={styles.avatarImage} />
                ) : (
                  <MaterialCommunityIcons name="account" size={32} color={theme.primary} />
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {provider.name}
                </Text>
                <Text style={[styles.role, { color: theme.primary }]} numberOfLines={1}>
                  {roleLabel}
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
                <View style={[styles.badge, { backgroundColor: provider.isAvailable ? theme.primaryLight : colors.errorLight }]}>
                  <Text style={[styles.badgeText, { color: provider.isAvailable ? theme.primary : colors.error }]}>
                    {statusLabel}
                  </Text>
                </View>
                <View style={styles.ratingRow}>
                  <RatingStars value={rating} />
                  <Text style={styles.ratingValue}>{rating.toFixed(1)} {t('map.ratingStars')}</Text>
                </View>
              </View>
            </View>
          </View>

          {requestServiceDisabled === false && (
            <Text style={styles.hint}>{t('map.requestHint')}</Text>
          )}
          <View style={styles.actions}>
            {onOpenMap && (
              <TouchableOpacity
                style={[styles.openMapBtn, { borderColor: theme.primary }]}
                onPress={onOpenMap}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={theme.primary} />
                <Text style={[styles.openMapText, { color: theme.primary }]}>{t('map.openMap')}</Text>
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
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadows.lg,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    gap: spacing.sm,
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
