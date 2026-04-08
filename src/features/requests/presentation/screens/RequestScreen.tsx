/**
 * Service request screen: quick form (create) + current request status.
 * Logic in useRequestService; display in QuickRequestForm, RequestStatusCard, RequestConfirmationModal.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { AmbientSurface, DashboardEmptyState } from '../../../../shared/components/dashboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';

import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { ScreenFadeIn } from '../../../../shared/components/ScreenFadeIn';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { AppText } from '../../../../shared/components/AppText';
import type { NavTabId } from '../../../../shared/navigation/navTabs';
import { QuickRequestForm } from '../components/QuickRequestForm';
import { RequestStatusCard } from '../components/RequestStatusCard';
import { RequestConfirmationModal } from '../components/RequestConfirmationModal';
import { spacing, typography } from '../../../../shared/theme';
import { colors } from '../../../../shared/theme/colors';
import { t } from '../../../../shared/i18n/t';
import { useUIStore } from '../../../../store/uiStore';
import { useNetworkStore } from '../../../../store/networkStore';
import { useOfflineQueueStore } from '../../../../store/offlineQueueStore';
import { useRequest } from '../../hooks/useRequest';
import { useRequestService } from '../../hooks/useRequestService';
import { useUserLocation } from '../../../location/hooks/useUserLocation';
import { rateRequest } from '../../data/requestApi';
import type { ServiceType } from '../../domain/types';
import { isValidServiceType, getInitialServiceType } from '../../utils/requestParams';

type Props = NativeStackScreenProps<CustomerStackParamList, 'Request'>;
type RequestParams = {
  serviceType?: ServiceType;
  providerId?: string | null;
  requestId?: string;
  description?: string;
};

export function RequestScreen({ route, navigation }: Props) {
  const params = (route.params ?? {}) as RequestParams;
  const rawServiceType = params.serviceType;
  const providerIdFromParams = params.providerId ?? null;
  const paramRequestId = params.requestId ?? null;
  const paramDescription = params.description?.trim() ?? '';
  const initialServiceType = useMemo(() => getInitialServiceType(rawServiceType), [rawServiceType]);

  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);
  const [preferredTime, setPreferredTime] = useState('');
  const [serviceDescription, setServiceDescription] = useState(paramDescription);
  const [requestId, setRequestId] = useState<string | null>(paramRequestId);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);

  const isViewingExisting = Boolean(paramRequestId);
  const isInvalidParams =
    !isViewingExisting && rawServiceType != null && !isValidServiceType(rawServiceType);

  const toast = useUIStore((s) => s.toast);
  const isOnline = useNetworkStore((s) => s.isOnline);
  const enqueueCreateRequest = useOfflineQueueStore((s) => s.enqueueCreateRequest);
  const { coords, fetchLocation } = useUserLocation();
  const requestService = useRequestService({
    serviceType,
    serviceDescription,
    providerIdFromParams,
    coords,
    enabled: !isViewingExisting,
  });
  const createMutation = requestService.createMutation;
  const { data: request, isLoading, refetch, updateStatus, isUpdating } = useRequest(requestId);
  const rateMutation = useMutation({ mutationFn: rateRequest });

  useEffect(() => {
    if (paramRequestId) setRequestId(paramRequestId);
  }, [paramRequestId]);
  useEffect(() => {
    if (rawServiceType && isValidServiceType(rawServiceType)) setServiceType(rawServiceType);
  }, [rawServiceType]);
  useEffect(() => {
    if (paramDescription && !paramRequestId) setServiceDescription(paramDescription);
  }, [paramDescription, paramRequestId]);
  useEffect(() => {
    if (!isInvalidParams) return;
    toast({ type: 'error', message: t('request.invalidParams') });
    if (navigation.canGoBack()) navigation.goBack();
  }, [isInvalidParams, navigation, toast]);
  useEffect(() => {
    if (!coords) void fetchLocation();
  }, [coords, fetchLocation]);

  const handleCreate = useCallback(() => {
    setRequestId(null);
    if (!coords) {
      toast({ type: 'error', message: t('request.locationRequired') });
      return;
    }
    if (!isOnline) {
      enqueueCreateRequest({
        serviceType,
        origin: coords,
        providerId: requestService.providerId ?? null,
        description: serviceDescription?.trim() || undefined,
      });
      toast({
        type: 'info',
        message: t('request.offlineQueued'),
        durationMs: 3500,
      });
      return;
    }
    requestService.handleCreate(
      (id) => {
        setRequestId(id);
        setShowConfirmation(true);
        toast({ type: 'success', message: t('request.createdSuccess'), durationMs: 3000 });
      },
      (error) => {
        toast({ type: 'error', message: error?.message ?? t('error.network') });
      }
    );
  }, [coords, enqueueCreateRequest, isOnline, requestService, serviceDescription, serviceType, toast]);

  const handleUpdateStatus = useCallback(
    (status: import('../../domain/types').RequestStatus) => {
      if (!requestId) return;
      if (!isOnline) {
        toast({ type: 'error', message: t('request.offlineCannotUpdate') });
        return;
      }
      updateStatus(status, {
        onSuccess: () => toast({ type: 'success', message: t('request.statusUpdated') }),
      });
    },
    [isOnline, requestId, updateStatus, toast]
  );

  const handleCloseConfirmation = useCallback(() => {
    setShowConfirmation(false);
    navigation.navigate('Map');
  }, [navigation]);

  const handleSubmitRating = useCallback(() => {
    if (!requestId || ratingStars < 1) return;
    rateMutation.mutate(
      { requestId, rating: ratingStars },
      {
        onSuccess: () => {
          setHasRated(true);
          toast({ type: 'success', message: t('request.ratingSubmitted') });
        },
        onError: (e) => toast({ type: 'error', message: (e as Error).message }),
      }
    );
  }, [requestId, ratingStars, rateMutation, toast]);

  const handleTab = useCallback(
    (tab: NavTabId) => {
      if (tab === 'Home') navigation.navigate('Map');
      else if (tab === 'Profile') navigation.navigate('Profile');
      else if (tab === 'Chat') navigation.navigate('Chat');
      else if (tab === 'Requests') navigation.navigate('RequestHistory');
    },
    [navigation]
  );

  if (isInvalidParams) {
    return (
      <ScreenWrapper>
        <AppHeader title={t('request.title')} onBack={() => navigation.goBack()} />
        <View style={styles.fallbackContainer}>
          <DashboardEmptyState
            icon="alert-circle-outline"
            title={t('request.invalidParams')}
            subtitle={t('request.subtitle')}
            ctaTitle={t('notFound.goHome')}
            onCtaPress={() => navigation.goBack()}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper responsiveNav bottomNavConfig={{ activeTab: 'Home', onSelect: handleTab }}>
      <AppHeader
        title={t('request.title')}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        onProfile={() => navigation.navigate('Profile')}
      />
      <ScreenFadeIn style={styles.fade}>
        <View style={styles.requestShell}>
          <AmbientSurface />
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
              {t('request.subtitle')}
            </AppText>

          {!isViewingExisting && serviceType && (
            <View style={styles.section}>
              <QuickRequestForm
                serviceType={serviceType}
                onServiceTypeChange={setServiceType}
                locationLabel={
                  coords
                    ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                    : t('request.location') + '…'
                }
                serviceDescription={serviceDescription}
                onServiceDescriptionChange={setServiceDescription}
                preferredTime={preferredTime}
                onPreferredTimeChange={setPreferredTime}
                nearestProvider={requestService.nearestSuggested}
                suggestedProviders={
                  serviceDescription.trim() ? requestService.suggestedProviders : []
                }
                distanceKm={requestService.distanceKm}
                isCreating={createMutation.isPending}
                onCreateRequest={handleCreate}
                createError={createMutation.error?.message ?? null}
                providerOfflineMessage={
                  requestService.isProvidersError ? t('request.apiUnavailable') : null
                }
                locationRequiredError={!coords}
                isOffline={!isOnline}
              />
            </View>
          )}

          <View style={styles.section}>
            <RequestStatusCard
              request={request}
              requestId={requestId}
              isLoading={isLoading}
              isCreating={createMutation.isPending}
              onRetry={() => refetch()}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={isUpdating}
              hasRated={hasRated}
              ratingStars={ratingStars}
              onRatingChange={setRatingStars}
              onSubmitRating={handleSubmitRating}
              isSubmittingRating={rateMutation.isPending}
              onViewTracking={(id) => navigation.navigate('LiveTracking', { requestId: id })}
            />
          </View>
          </ScrollView>
        </View>
      </ScreenFadeIn>

      <RequestConfirmationModal visible={showConfirmation} onClose={handleCloseConfirmation} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  fade: {
    flex: 1,
  },
  requestShell: { flex: 1, position: 'relative', overflow: 'hidden' },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  section: { marginBottom: spacing.lg },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});
