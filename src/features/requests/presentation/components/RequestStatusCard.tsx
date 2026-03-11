/**
 * Displays current request: empty state, loading, error, or request details with status/rating.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import type { ServiceRequest } from '../../domain/types';

interface RequestStatusCardProps {
  request: ServiceRequest | null | undefined;
  requestId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  onRetry: () => void;
  onUpdateStatus: (status: 'accepted' | 'on_the_way' | 'completed' | 'cancelled') => void;
  isUpdating: boolean;
  hasRated: boolean;
  ratingStars: number;
  onRatingChange: (stars: number) => void;
  onSubmitRating: () => void;
  isSubmittingRating: boolean;
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
}: RequestStatusCardProps) {
  const { colors } = useTheme();

  if (!requestId && !isCreating) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <AppText variant="title3" style={[styles.cardTitle, { color: colors.text }]}>
          {t('request.currentTitle')}
        </AppText>
        <View style={styles.emptyState}>
          <AppText variant="body" style={{ color: colors.textSecondary }}>
            {t('request.none')}
          </AppText>
        </View>
      </View>
    );
  }

  if (isCreating) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <AppText variant="title3" style={[styles.cardTitle, { color: colors.text }]}>
          {t('request.currentTitle')}
        </AppText>
        <View style={styles.loadingState}>
          <AppText variant="body" style={{ color: colors.textSecondary }}>
            {t('request.creating')}
          </AppText>
        </View>
      </View>
    );
  }

  if (isLoading && requestId) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <AppText variant="title3" style={[styles.cardTitle, { color: colors.text }]}>
          {t('request.currentTitle')}
        </AppText>
        <View style={styles.loadingState}>
          <AppText variant="body" style={{ color: colors.textSecondary }}>
            {t('request.loading')}
          </AppText>
        </View>
      </View>
    );
  }

  if (requestId && !request) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <AppText variant="title3" style={[styles.cardTitle, { color: colors.text }]}>
          {t('request.currentTitle')}
        </AppText>
        <ErrorWithRetry message={t('error.network')} onRetry={onRetry} />
      </View>
    );
  }

  if (!request) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <AppText variant="title3" style={[styles.cardTitle, { color: colors.text }]}>
        {t('request.currentTitle')}
      </AppText>
      <AppText variant="caption" style={[styles.trackHint, { color: colors.textSecondary }]}>
        {t('request.trackBelow')}
      </AppText>
      <AppText variant="body">ID: {request.id}</AppText>
      <AppText variant="body">
        {t('request.status')}: {request.status}
      </AppText>
      {request.status === 'on_the_way' && request.etaMinutes != null && (
        <AppText variant="body" style={[styles.etaText, { color: colors.primary }]}>
          {t('request.eta')}: {request.etaMinutes} {t('request.etaMinutes')}
        </AppText>
      )}
      {request.status === 'completed' && request.providerId && !hasRated && (
        <View style={[styles.ratingSection, { borderTopColor: colors.border }]}>
          <AppText variant="callout" style={[styles.ratingLabel, { color: colors.text }]}>
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
      <View style={styles.statusRow}>
        <Button
          testID="request-status-accepted"
          title={t('request.status.accepted')}
          onPress={() => onUpdateStatus('accepted')}
          size="sm"
          disabled={isUpdating}
        />
        <Button
          testID="request-status-on-the-way"
          title={t('request.status.on_the_way')}
          onPress={() => onUpdateStatus('on_the_way')}
          size="sm"
          variant="outline"
          disabled={isUpdating}
        />
        <Button
          title={t('request.status.completed')}
          onPress={() => onUpdateStatus('completed')}
          size="sm"
          variant="outline"
          disabled={isUpdating}
        />
        <Button
          title={t('request.status.cancelled')}
          onPress={() => onUpdateStatus('cancelled')}
          size="sm"
          variant="outline"
          disabled={isUpdating}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    marginBottom: spacing.md,
  },
  trackHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    marginBottom: spacing.sm,
  },
  etaText: {
    fontFamily: typography.fontFamily.semibold,
    marginTop: spacing.xs,
  },
  emptyState: { paddingVertical: spacing.sm },
  loadingState: { paddingVertical: spacing.sm },
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
});
