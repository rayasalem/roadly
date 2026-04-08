import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ProviderCardContent } from '../../../../shared/components/ProviderCardContent';
import { MapSheetContent } from './MapSheetContent';
import { AppText } from '../../../../shared/components/AppText';
import { spacing, radii, shadows, typography } from '../../../../shared/theme';
import type { Provider } from '../../../providers/domain/types';
import { useTheme } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

export interface MapUnifiedBottomSheetContentProps {
  selectedProvider: Provider | null;
  selectedProviderDistanceKm?: number | null;

  // Nearby list state (used when no provider is selected).
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  onRetry: () => void;
  showEmpty: boolean;
  nearest: Provider | null;
  providers: Provider[];
  onSelectProvider: (p: Provider) => void;
  onRequestService: (p: Provider) => void;

  // Role behavior.
  isCustomer: boolean;

  // Selected-provider actions.
  onCloseSelectedProvider: () => void;
  onOpenMap?: () => void;
  onViewProfile?: (provider: Provider) => void;
}

export function MapUnifiedBottomSheetContent({
  selectedProvider,
  selectedProviderDistanceKm,
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
  onCloseSelectedProvider,
  onOpenMap,
  onViewProfile,
}: MapUnifiedBottomSheetContentProps) {
  const { colors: themeColors } = useTheme();

  const handleClear = useCallback(() => {
    onCloseSelectedProvider();
  }, [onCloseSelectedProvider]);

  if (selectedProvider) {
    return (
      <ScrollView contentContainerStyle={styles.selectedContent} showsVerticalScrollIndicator={false}>
        <View style={styles.selectedHeader}>
          <AppText variant="caption" style={[styles.selectedTitle, { color: themeColors.textSecondary }]}>
            {t('map.providerSheetTitle')}
          </AppText>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            activeOpacity={0.85}
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeProviderSheet')}
          >
            <MaterialCommunityIcons name="close" size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ProviderCardContent
          provider={selectedProvider}
          distanceKm={selectedProviderDistanceKm ?? undefined}
          onRequestService={onRequestService}
          onOpenMap={onOpenMap}
          onViewProfile={onViewProfile}
          requestServiceDisabled={!isCustomer}
        />
      </ScrollView>
    );
  }

  return (
    <MapSheetContent
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      onRetry={onRetry}
      showEmpty={showEmpty}
      nearest={nearest}
      providers={providers}
      onSelectProvider={onSelectProvider}
      onRequestService={onRequestService}
      isCustomer={isCustomer}
    />
  );
}

const styles = StyleSheet.create({
  selectedContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  selectedTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});

