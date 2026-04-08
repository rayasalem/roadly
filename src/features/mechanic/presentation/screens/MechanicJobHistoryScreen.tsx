/**
 * Mechanic Job History — completed jobs from GET /requests/provider.
 * Shows date, service type, status, optional cost/rating when available.
 */
import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import type { MechanicStackParamList } from '../../../../navigation/MechanicStack';
import { useQuery } from '@tanstack/react-query';
import { fetchProviderRequests } from '../../../requests/data/requestApi';
import type { ServiceRequest } from '../../../requests/domain/types';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'MechanicJobHistory'>;
const THEME = ROLE_THEMES.mechanic;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function serviceTypeLabel(type: string): string {
  if (type === 'mechanic') return t('request.types.mechanic');
  if (type === 'tow') return t('request.types.tow');
  if (type === 'rental') return t('request.types.rental');
  return type;
}

export function MechanicJobHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['requests', 'provider'],
    queryFn: fetchProviderRequests,
    staleTime: 60 * 1000,
  });

  const completed = useMemo(
    () => (data?.items ?? []).filter((r: ServiceRequest) => r.status === 'completed') as ServiceRequest[],
    [data?.items],
  );

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <View style={styles.root}>
        <AppHeader title={t('mechanic.jobHistory')} onBack={() => navigation.goBack()} />
        <ErrorWithRetry
          message={error instanceof Error ? error.message : t('common.error')}
          onRetry={() => refetch()}
          testID="mechanic-job-history-retry"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppHeader title={t('mechanic.jobHistory')} onBack={() => navigation.goBack()} />
      <FlatList
        data={completed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>{t('mechanic.noJobHistory')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, shadows.sm]}>
            <View style={[styles.iconWrap, { backgroundColor: THEME.primaryLight }]}>
              <MaterialCommunityIcons name="wrench" size={22} color={THEME.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.serviceType}>{serviceTypeLabel(item.serviceType)}</Text>
              <Text style={styles.date}>{formatDate(item.updatedAt ?? item.createdAt)}</Text>
              {item.priceEstimate != null && (
                <Text style={styles.cost}>{t('common.currency')} {item.priceEstimate}</Text>
              )}
            </View>
            <View style={[styles.statusPill, { backgroundColor: colors.greenLight }]}>
              <Text style={[styles.statusText, { color: colors.primary }]}>{t('request.status.completed')}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardBody: { flex: 1, minWidth: 0 },
  serviceType: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
  },
  date: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cost: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  statusText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.caption.fontSize,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
