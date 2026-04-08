/**
 * Bottom card on native map: nearest provider (customer) or nearest request (mechanic/tow/rental), or loading/empty.
 */
import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../../shared/components/Button';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { Skeleton } from '../../../../shared/components/Skeleton';
import { LocationInfoCard } from './LocationInfoCard';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import type { Provider } from '../../../providers/domain/types';

export interface RequestJobForMap {
  id: string;
  title: string;
  distance: string;
  eta: string;
  status: string;
}

interface MapBottomCardProps {
  nearest: Provider | null;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  showEmpty: boolean;
  onRetry: () => void;
  onDirectionsPress: (provider: Provider) => void;
  cardAnimated: Animated.Value;
  /** When set, show request card for provider role (mechanic/tow/rental) instead of provider card. */
  nearestRequest?: RequestJobForMap | null;
  /** When showing requests and user taps "Back to dashboard". */
  onBackToDashboard?: () => void;
}

export function MapBottomCard({
  nearest,
  isLoading,
  isError,
  isRefetching,
  showEmpty,
  onRetry,
  onDirectionsPress,
  cardAnimated,
  nearestRequest,
  onBackToDashboard,
}: MapBottomCardProps) {
  const { colors } = useTheme();

  if (nearestRequest && !isLoading) {
    return (
      <Animated.View
        style={[
          styles.wrap,
          {
            opacity: cardAnimated,
            transform: [{ translateY: cardAnimated.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }],
          },
        ]}
      >
        <View style={[styles.card, styles.requestCard, { backgroundColor: colors.surface }, shadows.sm]}>
          <View style={styles.requestRow}>
            <View style={[styles.requestIconWrap, { backgroundColor: colors.greenLight }]}>
              <MaterialCommunityIcons name="wrench" size={24} color={colors.primary} />
            </View>
            <View style={styles.requestInfo}>
              <Text style={[styles.requestTitle, { color: colors.text }]} numberOfLines={1}>{nearestRequest.title}</Text>
              <Text style={[styles.requestMeta, { color: colors.textSecondary }]}>{nearestRequest.distance} • ETA {nearestRequest.eta}</Text>
              <Text style={[styles.requestStatus, { color: colors.primary }]}>{nearestRequest.status}</Text>
            </View>
          </View>
          {onBackToDashboard && (
            <Button title={t('mechanic.dashboard.title')} onPress={onBackToDashboard} variant="outline" fullWidth size="lg" style={styles.requestBtn} />
          )}
        </View>
      </Animated.View>
    );
  }

  if (nearest && !isLoading && !showEmpty) {
    return (
      <Animated.View
        style={[
          styles.wrap,
          {
            opacity: cardAnimated,
            transform: [{ translateY: cardAnimated.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }],
          },
        ]}
      >
        <LocationInfoCard
          title={nearest.name}
          subtitle={t('map.nearest')}
          imageUri={nearest.photo ?? nearest.avatarUri ?? null}
          rating={4.5}
          status={nearest.isAvailable ? t('map.status.available') : t('map.status.busy')}
          onDirectionsPress={() => onDirectionsPress(nearest)}
        />
      </Animated.View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {isLoading && (
        <>
          <Text style={[styles.skeletonLabel, { color: colors.textSecondary }]}>{t('map.loadingProviders')}</Text>
          <Skeleton width="70%" height={20} radius={4} style={styles.skeletonTitle} />
          <Skeleton width="50%" height={14} radius={4} style={styles.skeletonSubtitle} />
          <Skeleton width="100%" height={48} radius={radii.lg} style={styles.skeletonButton} />
        </>
      )}
      {isError && !nearest && (
        <ErrorWithRetry
          compact
          testID="map-retry-providers"
          message={t('error.network')}
          onRetry={onRetry}
          isRetrying={isRefetching}
        />
      )}
      {showEmpty && !isLoading && (
        <>
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={40} color={colors.textMuted} />
          </View>
          <Text style={[styles.infoTitle, { color: colors.text }]}>{onBackToDashboard ? t('map.noRequestsYet') : t('map.noProviders')}</Text>
          <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>{onBackToDashboard ? t('map.noRequestsSubtitle') : t('map.noProvidersSubtitle')}</Text>
          {onBackToDashboard ? (
            <Button title={t('mechanic.dashboard.title')} onPress={onBackToDashboard} fullWidth size="lg" style={styles.startButton} />
          ) : (
            <Button title={t('common.retry')} onPress={onRetry} fullWidth size="lg" style={styles.startButton} />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg, marginHorizontal: 0 },
  card: { marginTop: spacing.lg, padding: spacing.md, borderRadius: radii.xl, ...shadows.sm },
  requestCard: {},
  requestRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  requestIconWrap: { width: 48, height: 48, borderRadius: radii.lg, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  requestInfo: { flex: 1, minWidth: 0 },
  requestTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.body.fontSize, marginBottom: spacing.xs },
  requestMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.caption.fontSize, marginBottom: spacing.xs },
  requestStatus: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.caption.fontSize, marginTop: spacing.xs },
  requestBtn: { marginTop: spacing.sm },
  skeletonLabel: { fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.callout, marginBottom: spacing.sm },
  skeletonTitle: { marginBottom: spacing.sm },
  skeletonSubtitle: { marginBottom: spacing.sm },
  skeletonButton: { marginTop: spacing.sm },
  infoTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.body, marginBottom: spacing.sm },
  infoSubtitle: { fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.callout, marginBottom: spacing.sm },
  startButton: { marginTop: spacing.sm },
  emptyIconWrap: { marginBottom: spacing.sm, alignItems: 'center' },
});
