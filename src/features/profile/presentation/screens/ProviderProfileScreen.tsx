/**
 * Public profile of a provider (for customers). Shows provider info and "Request service".
 * Navigate with: ProviderProfile { providerId: string }
 */
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { ProviderCardContent } from '../../../../shared/components/ProviderCardContent';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { useQuery } from '@tanstack/react-query';
import { fetchProviderById } from '../../../providers/data/providersApi';
import type { Provider } from '../../../providers/domain/types';
import { providerRoleToServiceType } from '../../../map/utils/providerToServiceType';
import { t } from '../../../../shared/i18n/t';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';

type Route = RouteProp<CustomerStackParamList, 'ProviderProfile'>;

export function ProviderProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const providerId = route.params?.providerId ?? '';

  const { data: provider, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => fetchProviderById(providerId),
    enabled: !!providerId,
  });

  const handleRequestService = useCallback(
    (p: Provider) => {
      const serviceType = providerRoleToServiceType(p.role);
      if (serviceType) {
        navigation.navigate('Request', { serviceType, providerId: p.id });
      }
    },
    [navigation]
  );

  if (!providerId) {
    return (
      <ScreenWrapper>
        <AppHeader title={t('profile.title')} onBack={() => navigation.goBack()} />
        <View style={styles.placeholder} />
      </ScreenWrapper>
    );
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <AppHeader title={t('profile.title')} onBack={() => navigation.goBack()} />
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (isError || !provider) {
    return (
      <ScreenWrapper>
        <AppHeader title={t('profile.title')} onBack={() => navigation.goBack()} />
        <ErrorWithRetry message={error instanceof Error ? error.message : t('error.network')} onRetry={() => refetch()} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader title={provider.name} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <ProviderCardContent
          provider={provider}
          onRequestService={handleRequestService}
          onOpenMap={undefined}
          onCall={undefined}
          onChat={undefined}
          requestServiceDisabled={false}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1 },
  content: { flex: 1, padding: 16 },
});
