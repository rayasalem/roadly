/**
 * Bottom card on native map: nearest provider info, or loading/error/empty state.
 */
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../../shared/components/Button';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { Skeleton } from '../../../../shared/components/Skeleton';
import { LocationInfoCard } from './LocationInfoCard';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import type { Provider } from '../../../providers/domain/types';

interface MapBottomCardProps {
  nearest: Provider | null;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  showEmpty: boolean;
  onRetry: () => void;
  onDirectionsPress: (provider: Provider) => void;
  cardAnimated: Animated.Value;
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
}: MapBottomCardProps) {
  const { colors } = useTheme();

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
    <View style={[styles.card, { backgroundColor: colors.surface }, shadows.sm]}>
      {isLoading && (
        <>
          <Text style={[styles.skeletonLabel, { color: colors.textSecondary }]}>{t('map.loadingProviders')}</Text>
          <Skeleton width="70%" height={20} radius={4} style={styles.skeletonTitle} />
          <Skeleton width="50%" height={14} radius={4} style={styles.skeletonSubtitle} />
          <Skeleton width="100%" height={48} radius={radii.lg} style={styles.skeletonButton} />
        </>
      )}
      {isError && (
        <ErrorWithRetry testID="map-retry-providers" message={t('error.network')} onRetry={onRetry} isRetrying={isRefetching} />
      )}
      {showEmpty && !isLoading && (
        <>
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={40} color={colors.textMuted} />
          </View>
          <Text style={[styles.infoTitle, { color: colors.text }]}>{t('map.noProviders')}</Text>
          <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>{t('map.noProvidersSubtitle')}</Text>
          <Button title={t('common.retry')} onPress={onRetry} fullWidth size="lg" style={styles.startButton} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg, marginHorizontal: 0 },
  card: { marginTop: spacing.lg, padding: spacing.lg, borderRadius: radii.lg },
  skeletonLabel: { fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.callout, marginBottom: spacing.sm },
  skeletonTitle: { marginBottom: spacing.sm },
  skeletonSubtitle: { marginBottom: spacing.md },
  skeletonButton: { marginTop: spacing.sm },
  infoTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.body, marginBottom: spacing.xs },
  infoSubtitle: { fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.callout, marginBottom: spacing.md },
  startButton: { marginTop: spacing.sm },
  emptyIconWrap: { marginBottom: spacing.sm, alignItems: 'center' },
});
