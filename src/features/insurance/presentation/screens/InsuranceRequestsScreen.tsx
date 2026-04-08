/**
 * إدارة طلبات التأمين الواردة لمزود التأمين (قبول / إلغاء عبر حالات الطلب).
 */
import React, { useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppHeader } from '../../../../shared/components/AppHeader';
import { AppText } from '../../../../shared/components/AppText';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { Button } from '../../../../shared/components/Button';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import type { NavTabId } from '../../../../shared/navigation/navTabs';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import type { StringKey } from '../../../../shared/i18n/strings';
import type { InsuranceStackParamList } from '../../../../navigation/InsuranceStack';
import { useProviderRequests } from '../../../requests/hooks/useProviderRequests';
import type { ServiceRequest } from '../../../requests/domain/types';
import { getRequestStatusTheme } from '../../../requests/constants/requestStatusTheme';

type Nav = NativeStackNavigationProp<InsuranceStackParamList, 'InsuranceRequests'>;

function isInsuranceRequest(r: ServiceRequest): boolean {
  return r.serviceType === 'insurance';
}

export function InsuranceRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const { requests, isLoading, isError, refetch, updateStatus, isUpdating } = useProviderRequests();

  const insuranceRequests = useMemo(() => requests.filter(isInsuranceRequest), [requests]);

  const handleTab = useCallback(
    (tab: NavTabId) => {
      if (tab === 'Home') navigation.navigate('InsuranceDashboard');
      else if (tab === 'Profile') navigation.navigate('Profile');
      else if (tab === 'Chat') navigation.navigate('Chat');
      else if (tab === 'Requests') return;
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: ServiceRequest }) => {
      const theme = getRequestStatusTheme(item.status);
      const label = t(theme.labelKey as StringKey);
      const canAccept = item.status === 'pending';
      return (
        <View style={styles.card}>
          <AppText variant="callout" style={styles.idText}>
            #{item.id.slice(0, 8)}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {item.customerName ?? t('request.customer')}
          </AppText>
          <View style={[styles.badge, { backgroundColor: theme.color + '22' }]}>
            <AppText variant="caption" style={{ color: theme.color }}>
              {label}
            </AppText>
          </View>
          {canAccept ? (
            <View style={styles.actions}>
              <Button title={t('providerReg.accept')} size="sm" onPress={() => updateStatus(item.id, 'accepted')} loading={isUpdating} />
              <Button
                title={t('providerReg.decline')}
                variant="outline"
                size="sm"
                onPress={() => updateStatus(item.id, 'cancelled')}
                loading={isUpdating}
              />
            </View>
          ) : null}
        </View>
      );
    },
    [updateStatus, isUpdating]
  );

  return (
    <ScreenWrapper responsiveNav bottomNavConfig={{ activeTab: 'Requests', onSelect: handleTab, dark: true }}>
      <AppHeader title={t('insurance.requests.title')} onBack={() => navigation.goBack()} />
      {isLoading ? (
        <View style={styles.centered}>
          <LoadingSpinner />
        </View>
      ) : isError ? (
        <ErrorWithRetry message={t('error.network')} onRetry={() => refetch()} />
      ) : insuranceRequests.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="title3" style={styles.emptyTitle}>
            {t('insurance.requests.empty')}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center>
            {t('insurance.requests.subtitle')}
          </AppText>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <AppText variant="callout" color={colors.primary}>
              {t('common.retry')}
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={insuranceRequests}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  idText: { fontFamily: typography.fontFamily.semibold, marginBottom: spacing.xs },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.full, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  empty: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { marginBottom: spacing.sm, textAlign: 'center' },
  retryBtn: { marginTop: spacing.lg },
});
