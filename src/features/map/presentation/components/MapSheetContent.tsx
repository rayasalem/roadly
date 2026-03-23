/**
 * Bottom sheet content: loading, error, empty, nearest CTA, provider list.
 */
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { Skeleton } from '../../../../shared/components/Skeleton';
import { NearbyProvidersList } from '../../../providers/presentation/NearbyProvidersList';
import { useTheme, spacing, radii } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import type { Provider } from '../../../providers/domain/types';

interface MapSheetContentProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  onRetry: () => void;
  showEmpty: boolean;
  nearest: Provider | null;
  providers: Provider[];
  onSelectProvider: (p: Provider) => void;
  onRequestService: (p: Provider) => void;
  isCustomer: boolean;
}

export function MapSheetContent({
  isLoading,
  isError,
  isRefetching,
  onRetry,
  showEmpty,
  nearest,
  providers,
  onSelectProvider,
  onRequestService,
  isCustomer,
}: MapSheetContentProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {isLoading && (
        <View style={styles.section}>
          <AppText variant="callout" style={{ color: colors.textMuted }}>{t('map.loadingProviders')}</AppText>
          <Skeleton width="40%" height={14} radius={4} style={styles.skeletonLabel} />
          <Skeleton width="100%" height={48} radius={radii.lg} style={styles.skeletonCta} />
        </View>
      )}
      {isError && providers.length === 0 && (
        <View style={styles.section}>
          <ErrorWithRetry message={t('error.network')} onRetry={onRetry} isRetrying={isRefetching} />
        </View>
      )}
      {showEmpty && (
        <View style={styles.section}>
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={40} color={colors.textMuted} />
          </View>
          <AppText variant="title3" style={[styles.title, { color: colors.text }]}>{t('map.noProviders')}</AppText>
          <AppText variant="body" style={{ color: colors.textSecondary }}>{t('map.noProvidersSubtitle')}</AppText>
          <Button title={t('common.retry')} onPress={onRetry} fullWidth size="lg" style={styles.cta} />
        </View>
      )}
      {nearest && !showEmpty && !isLoading && (
        <View style={styles.section}>
          <AppText variant="caption" style={{ color: colors.textMuted }}>{t('map.nearest')}</AppText>
          <Button
            title={t('map.requestService')}
            onPress={() => onRequestService(nearest)}
            disabled={!isCustomer}
            fullWidth
            size="lg"
            style={styles.cta}
          />
        </View>
      )}
      {!isLoading && !showEmpty && providers.length > 0 && (
        <View style={styles.section}>
          <AppText variant="callout" style={[styles.sectionTitle, { color: colors.text }]}>
            {t('map.nearbyProvidersSection')} ({providers.length})
          </AppText>
          <AppText variant="caption" style={{ color: colors.textMuted, marginTop: 4 }}>{t('map.tapMarkerHint')}</AppText>
        </View>
      )}
      <NearbyProvidersList
        providers={providers}
        onSelect={onSelectProvider}
        onRequest={onSelectProvider}
        loading={isLoading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  section: { marginBottom: spacing.lg },
  skeletonLabel: { marginBottom: spacing.sm },
  skeletonCta: { marginTop: spacing.sm },
  emptyIconWrap: { marginBottom: spacing.sm, alignItems: 'center' },
  title: { marginBottom: spacing.xs },
  sectionTitle: { fontWeight: '600', marginBottom: 2 },
  cta: { marginTop: spacing.xs },
});
