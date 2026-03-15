/**
 * Displays current request: status with theme (color + icon), provider name, Track / Rate / Cancel.
 * Customer view: Cancel when new/pending; Track when in progress; Rate when completed.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import { colors } from '../../../../shared/theme/colors';
import { t } from '../../../../shared/i18n/t';
import type { ServiceRequest } from '../../domain/types';
import type { RequestStatus } from '../../domain/types';
import { getRequestStatusTheme, isRequestInProgress, canCustomerCancel } from '../../constants/requestStatusTheme';

interface RequestStatusCardProps {
  request: ServiceRequest | null | undefined;
  requestId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  onRetry: () => void;
  onUpdateStatus: (status: RequestStatus) => void;
  isUpdating: boolean;
  hasRated: boolean;
  ratingStars: number;
  onRatingChange: (stars: number) => void;
  onSubmitRating: () => void;
  isSubmittingRating: boolean;
  onViewTracking?: (requestId: string) => void;
  /** When true (default), show customer actions only: Cancel, Track, Rate. When false, show provider actions. */
  isCustomerView?: boolean;
}

export function RequestStatusCard({
  request,
  requestId,
  isLoading,
  isCreating,
  onRetry,
  onUpdateStatus,
  isUpdating,
  hasRated,
  ratingStars,
  onRatingChange,
  onSubmitRating,
  isSubmittingRating,
  onViewTracking,
  isCustomerView = true,
}: RequestStatusCardProps) {
  const { colors: themeColors } = useTheme();

  if (!requestId && !isCreating) {
    return (
      <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
        <AppText variant="title3" style={[styles.cardTitle, { color: themeColors.text }]}>
          {t('request.currentTitle')}
        </AppText>
        <View style={styles.emptyState}>
          <AppText variant="body" style={{ color: themeColors.textSecondary }}>
            {t('request.none')}
          </AppText>
        </View>
      </View>
    );
  }

  if (isCreating) {
    return (
      <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
        <AppText variant="title3" style={[styles.cardTitle, { color: themeColors.text }]}>
          {t('request.currentTitle')}
        </AppText>
        <View style={styles.loadingState}>
          <AppText variant="body" style={{ color: themeColors.textSecondary }}>
            {t('request.creating')}
          </AppText>
        </View>
      </View>
    );
  }

  if (isLoading && requestId) {
    return (
      <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
        <AppText variant="title3" style={[styles.cardTitle, { color: themeColors.text }]}>
          {t('request.currentTitle')}
        </AppText>
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={themeColors.primary} style={styles.loadingSpinner} />
          <AppText variant="body" style={{ color: themeColors.textSecondary }}>
            {t('request.loading')}
          </AppText>
        </View>
      </View>
    );
  }

  if (requestId && !request) {
    return (
      <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
        <AppText variant="title3" style={[styles.cardTitle, { color: themeColors.text }]}>
          {t('request.currentTitle')}
        </AppText>
        <ErrorWithRetry message={t('error.network')} onRetry={onRetry} />
      </View>
    );
  }

  if (!request) return null;

  const statusTheme = getRequestStatusTheme(request.status);
  const inProgress = isRequestInProgress(request.status);
  const showCancel = isCustomerView && canCustomerCancel(request.status);

  return (
    <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
      <AppText variant="title3" style={[styles.cardTitle, { color: themeColors.text }]}>
        {t('request.currentTitle')}
      </AppText>
      <View style={[styles.statusBadge, { backgroundColor: statusTheme.color + '22' }]}>
        <MaterialCommunityIcons name={statusTheme.icon as any} size={18} color={statusTheme.color} />
        <AppText variant="callout" weight="semibold" style={{ color: statusTheme.color }}>
          {t(statusTheme.labelKey)}
        </AppText>
      </View>
      <AppText variant="body">ID: {request.id}</AppText>
      {request.providerName != null && request.providerName !== '' && (
        <AppText variant="body" style={[styles.etaText, { color: themeColors.text }]}>
          {t('request.provider') ?? 'Provider'}: {request.providerName}
        </AppText>
      )}
      {inProgress && request.etaMinutes != null && (
        <AppText variant="body" style={[styles.etaText, { color: themeColors.primary }]}>
          {t('request.eta')}: {request.etaMinutes} {t('request.etaMinutes')}
        </AppText>
      )}
      {request.status === 'completed' && request.providerId && !hasRated && (
        <View style={[styles.ratingSection, { borderTopColor: themeColors.border }]}>
          <AppText variant="callout" style={[styles.ratingLabel, { color: themeColors.text }]}>
            {t('profile.rating')}
          </AppText>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => onRatingChange(n)}
                style={styles.starTouch}
              >
                <MaterialCommunityIcons
                  name={n <= ratingStars ? 'star' : 'star-outline'}
                  size={28}
                  color={n <= ratingStars ? colors.warning : colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title={t('request.submitRating')}
            onPress={onSubmitRating}
            disabled={ratingStars < 1 || isSubmittingRating}
            loading={isSubmittingRating}
            size="sm"
            style={styles.rateButton}
          />
        </View>
      )}
      {onViewTracking && inProgress && (
        <View style={styles.trackActions}>
          <Button
            title={t('request.viewTracking') ?? t('map.openMap')}
            onPress={() => onViewTracking(request.id)}
            size="sm"
            variant="outline"
          />
        </View>
      )}
      {showCancel && (
        <View style={styles.statusRow}>
          <Button
            title={t('request.cancelRequest')}
            onPress={() => onUpdateStatus('cancelled')}
            size="sm"
            variant="outline"
            disabled={isUpdating}
          />
        </View>
      )}
      {!isCustomerView && (
        <View style={styles.statusRow}>
          {['new', 'pending'].includes(request.status) && (
            <>
              <Button title={t('providerReg.accept')} onPress={() => onUpdateStatus('accepted')} size="sm" disabled={isUpdating} />
              <Button title={t('providerReg.decline')} onPress={() => onUpdateStatus('rejected')} size="sm" variant="outline" disabled={isUpdating} />
            </>
          )}
          {(request.status === 'accepted' || request.status === 'in_progress' || request.status === 'on_the_way') && (
            <>
              <Button title={t('request.status.inProgress')} onPress={() => onUpdateStatus('in_progress')} size="sm" variant="outline" disabled={isUpdating} />
              <Button title={t('request.markComplete')} onPress={() => onUpdateStatus('completed')} size="sm" disabled={isUpdating} />
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    gap: 6,
    marginBottom: spacing.sm,
  },
  etaText: {
    fontFamily: typography.fontFamily.semibold,
    marginTop: spacing.sm,
  },
  emptyState: { paddingVertical: spacing.sm },
  loadingState: { paddingVertical: spacing.sm, alignItems: 'center' as const },
  loadingSpinner: { marginBottom: spacing.sm },
  ratingSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  ratingLabel: { marginBottom: spacing.sm },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  starTouch: { padding: spacing.xs },
  rateButton: { alignSelf: 'flex-start' },
  statusRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trackActions: {
    marginTop: spacing.sm,
  },
});
