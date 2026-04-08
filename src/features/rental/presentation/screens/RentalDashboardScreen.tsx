/**
 * Rental dashboard: availability toggle, New/Active/Completed stats, bookings, view on map.
 */
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AppHeader } from '../../../../shared/components/AppHeader';
import { AppText } from '../../../../shared/components/AppText';
import {
  DashboardShell,
  DashboardEmptyState,
  DashboardSectionHeader,
} from '../../../../shared/components/dashboard';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { StatCard } from '../../../../shared/components/StatCard';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import { blurActiveElementForA11y } from '../../../../shared/utils/domA11y';
import type { RentalStackParamList } from '../../../../navigation/RentalStack';
import { useUIStore } from '../../../../store/uiStore';
import { useAuthStore } from '../../../../store/authStore';
import { useRentalDashboard, type RentalVehicle, type VehicleStatus, type RentalJob } from '../../hooks/useRentalDashboard';
import { Button } from '../../../../shared/components/Button';
import { useProviderProfile } from '../../../profile/hooks/useProviderProfile';
import { useProviderLocationSync } from '../../../profile/hooks/useProviderLocationSync';
import { updateProviderAvailability } from '../../../profile/data/providerProfileApi';

type Nav = NativeStackNavigationProp<RentalStackParamList, 'RentalDashboard'>;
const THEME = ROLE_THEMES.rental;

function statusLabel(s: VehicleStatus): string {
  if (s === 'available') return t('rental.available');
  if (s === 'rented') return t('rental.rented');
  return t('rental.maintenance');
}

function statusVariant(s: VehicleStatus): 'available' | 'rented' | 'maintenance' {
  if (s === 'available') return 'available';
  if (s === 'rented') return 'rented';
  return 'maintenance';
}

const RentalVehicleCard = memo(function RentalVehicleCard({
  vehicle,
  onPress,
}: {
  vehicle: RentalVehicle;
  onPress: () => void;
}) {
  return (
    <PressableCard onPress={onPress} style={styles.vehicleCard}>
      <View style={styles.vehicleRow}>
        <View style={[styles.vehicleIcon, { backgroundColor: THEME.primaryLight }]}>
          <MaterialCommunityIcons name="car" size={22} color={THEME.primary} />
        </View>
        <View style={styles.vehicleMain}>
          <Text style={styles.vehicleName} numberOfLines={1}>{vehicle.name}</Text>
          <Text style={styles.vehicleMeta}>{vehicle.plate} • {vehicle.price}</Text>
        </View>
        <StatusBadge label={statusLabel(vehicle.status)} variant={statusVariant(vehicle.status)} size="sm" />
      </View>
    </PressableCard>
  );
});

export function RentalDashboardScreen() {
  useProviderLocationSync();
  const navigation = useNavigation<Nav>();
  const toast = useUIStore((s) => s.toast);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user ?? null);
  const role = user?.role ?? null;
  const displayName = user?.name ?? 'Rental';
  const { profile, refetch: refetchProfile } = useProviderProfile(role, displayName);
  const availabilityMutation = useMutation({
    mutationFn: (next: boolean) => updateProviderAvailability(next),
    onSuccess: () => {
      void refetchProfile();
      void queryClient.invalidateQueries({ queryKey: ['provider', 'me'] });
    },
    onError: (err: unknown) => {
      toast({ type: 'error', message: err instanceof Error ? err.message : t('common.error') });
    },
  });
  const isAvailable = profile?.isAvailable ?? true;

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<RentalVehicle | null>(null);
  const { stats, vehicles, bookings, jobs, acceptJob, rejectJob, isAccepting, isRejecting, isLoading, isError, error, refetch } = useRentalDashboard();

  const openProfile = useCallback(() => navigation.navigate('Profile'), [navigation]);

  const handleTab = useCallback(
    (tab: NavTabId) => {
      if (tab === 'Home') {
        navigation.navigate('RentalDashboard');
      } else if (tab === 'Profile') {
        navigation.navigate('Profile');
      } else if (tab === 'Chat') {
        (navigation as any).navigate('Chat');
      } else if (tab === 'Requests') {
        (navigation as any).navigate('RentalBookings');
      }
    },
    [navigation],
  );

  const handleVehiclePress = useCallback((v: RentalVehicle) => {
    setSelectedVehicle(v);
  }, []);
  useEffect(() => {
    if (selectedVehicle) bottomSheetRef.current?.present();
  }, [selectedVehicle]);

  return (
    <DashboardShell
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message ?? ''}
      onRetry={() => refetch()}
      loadingHint={t('common.loading')}
      bottomSlot={
        <View style={styles.bottomNavWrap}>
          <BottomNavBar activeTab="Home" onSelect={handleTab} dark />
        </View>
      }
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <AppHeader title={t('rental.dashboard.title')} rightIcon="profile" onProfile={openProfile} />
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          ListHeaderComponent={
            <>
              <GlassCard role="rental" style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroAvatarCircle}>
                    <MaterialCommunityIcons name="car-estate" size={26} color={THEME.primary} />
                  </View>
                  <View style={styles.heroTextCol}>
                    <AppText variant="title3" style={styles.heroTitle}>
                      {t('rental.dashboard.title')}
                    </AppText>
                    <AppText variant="body" color={colors.textSecondary}>
                      {t('rental.fleetOverview')}
                    </AppText>
                  </View>
                  <View style={styles.heroStatusPill}>
                    <View
                      style={[
                        styles.heroStatusDot,
                        { backgroundColor: isAvailable ? colors.primary : colors.textMuted },
                      ]}
                    />
                    <AppText
                      variant="caption"
                      style={{ color: isAvailable ? colors.primary : colors.textMuted }}
                    >
                      {isAvailable ? t('map.status.available') : t('mechanic.unavailable') ?? 'Unavailable'}
                    </AppText>
                  </View>
                </View>

                <View style={styles.heroChipsRow}>
                  <TouchableOpacity
                    style={[styles.availabilityChip, isAvailable && styles.availabilityChipOn]}
                    onPress={() => !availabilityMutation.isPending && availabilityMutation.mutate(true)}
                    disabled={availabilityMutation.isPending}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.availabilityDot,
                        isAvailable && { backgroundColor: colors.primary },
                      ]}
                    />
                    <AppText
                      variant="callout"
                      style={[
                        styles.availabilityChipText,
                        isAvailable && styles.availabilityChipTextOn,
                      ]}
                    >
                      {t('map.status.available')}
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.availabilityChip, !isAvailable && styles.availabilityChipOff]}
                    onPress={() => !availabilityMutation.isPending && availabilityMutation.mutate(false)}
                    disabled={availabilityMutation.isPending}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.availabilityDot,
                        !isAvailable && { backgroundColor: colors.textMuted },
                      ]}
                    />
                    <AppText
                      variant="callout"
                      style={[
                        styles.availabilityChipText,
                        !isAvailable && styles.availabilityChipTextOff,
                      ]}
                    >
                      {t('mechanic.unavailable') ?? 'Unavailable'}
                    </AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                  <StatCard value={bookings.length} label={t('rental.stats.newRequests') ?? 'New requests'} accentColor={THEME.primary} />
                  <StatCard value={stats.rented} label={t('rental.stats.activeRequests') ?? 'Active requests'} accentColor={THEME.primary} />
                  <StatCard value={stats.total} label={t('rental.stats.completedJobs') ?? 'Completed jobs'} accentColor={THEME.primary} />
                </View>
              </GlassCard>

          <View style={styles.actionCardsRow}>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('RentalServices')} activeOpacity={0.85}>
              <MaterialCommunityIcons name="car-wrench" size={24} color={THEME.primary} />
              <Text style={styles.actionCardTitle}>{t('rental.myServices')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('RentalSkills')} activeOpacity={0.85}>
              <MaterialCommunityIcons name="certificate-outline" size={24} color={THEME.primary} />
              <Text style={styles.actionCardTitle}>{t('rental.mySkills')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('RentalCarList')} activeOpacity={0.85}>
              <MaterialCommunityIcons name="car-multiple" size={24} color={THEME.primary} />
              <Text style={styles.actionCardTitle}>{t('rental.carList')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('RentalBookings')} activeOpacity={0.85}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color={THEME.primary} />
              <Text style={styles.actionCardTitle}>{t('rental.bookings')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('RentalHistory')} activeOpacity={0.85}>
              <MaterialCommunityIcons name="history" size={24} color={THEME.primary} />
              <Text style={styles.actionCardTitle}>{t('rental.history')}</Text>
            </TouchableOpacity>
          </View>

          <DashboardSectionHeader title={t('rental.fleetOverview')} />
            </>
          }
          ListFooterComponent={
            <>
              <DashboardSectionHeader title={t('rental.requestsList') ?? 'Service requests'} />
              <GlassCard role="rental">
                {jobs.length === 0 ? (
                  <DashboardEmptyState
                    icon="calendar-blank-outline"
                    title={t('rental.noBookings') ?? 'No requests yet.'}
                    subtitle={t('rental.addCarHint')}
                    ctaTitle={t('rental.viewRequestOnMap')}
                    onCtaPress={() => navigation.navigate('Map')}
                    style={styles.bookingEmptyState}
                  />
                ) : (
                  jobs.map((job: RentalJob) => (
                    <View key={job.id} style={styles.bookingRow}>
                      <View style={styles.bookingIcon}>
                        <MaterialCommunityIcons name="car-key" size={20} color={THEME.primary} />
                      </View>
                      <View style={styles.bookingMain}>
                        <Text style={styles.bookingTitle}>{job.title}</Text>
                        <Text style={styles.bookingMeta}>{job.eta} • {job.status}</Text>
                      </View>
                      {job.status === 'new' ? (
                        <View style={styles.rentalJobActions}>
                          <Button title={t('mechanic.decline')} onPress={() => rejectJob(job.requestId ?? job.id)} variant="outline" size="sm" />
                          <View style={{ width: 8 }} />
                          <Button title={t('mechanic.accept')} onPress={() => acceptJob(job.requestId ?? job.id)} variant="accent" size="sm" />
                        </View>
                      ) : (
                        <StatusBadge label={job.status} variant={job.status === 'accepted' || job.status === 'on_the_way' ? 'active' : 'completed'} size="sm" />
                      )}
                    </View>
                  ))
                )}
              </GlassCard>
            </>
          }
          renderItem={({ item: v }) => (
            <RentalVehicleCard vehicle={v} onPress={() => handleVehiclePress(v)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="car-off" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>{t('rental.noVehicles')}</Text>
            </View>
          }
        />
      </SafeAreaView>

      <BottomSheetModal ref={bottomSheetRef} snapPoints={[240]} enablePanDownToClose onDismiss={() => { require('../../../../shared/utils/domA11y').blurActiveElementForA11y(); setSelectedVehicle(null); }} backgroundStyle={styles.sheetBg}>
        <View style={styles.sheetContent}>
          {selectedVehicle ? (
            <>
              <Text style={styles.sheetTitle}>{selectedVehicle.name}</Text>
              <Text style={styles.sheetMeta}>{selectedVehicle.plate} • {selectedVehicle.price}</Text>
              <StatusBadge label={statusLabel(selectedVehicle.status)} variant={statusVariant(selectedVehicle.status)} size="sm" />
              {selectedVehicle.status === 'available' && (
                <TouchableOpacity style={styles.bookBtn} onPress={() => toast({ type: 'success', message: t('rental.bookingStarted') })} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="calendar-check" size={20} color={colors.primaryContrast} />
                  <Text style={styles.bookBtnText}>{t('rental.bookNow')}</Text>
                </TouchableOpacity>
              )}
            </>
          ) : null}
        </View>
      </BottomSheetModal>

    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  heroCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  heroAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primaryLight,
  },
  heroTextCol: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  heroTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.titleSmall.fontSize,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  heroStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  heroStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  heroChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  heroMapQuick: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    ...shadows.sm,
  },
  heroMapQuickText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
    color: THEME.primary,
  },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg, paddingVertical: spacing.sm },
  availabilityLabel: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.body.fontSize, color: colors.text },
  availabilityChips: { flexDirection: 'row', gap: spacing.sm },
  availabilityChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.full, backgroundColor: colors.surface, gap: spacing.xs, ...shadows.sm },
  availabilityChipOn: { backgroundColor: colors.primary },
  availabilityChipOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  availabilityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  availabilityChipText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.caption.fontSize, color: colors.text },
  availabilityChipTextOn: { color: colors.primaryContrast },
  availabilityChipTextOff: { color: colors.textSecondary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: THEME.primary,
    gap: spacing.xs,
  },
  mapBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.bodySmall.fontSize, color: colors.primaryContrast },
  actionCardsRow: { flexDirection: 'row', gap: spacing.card, marginBottom: spacing.lg },
  actionCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  actionCardTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.bodySmall.fontSize, color: colors.text, marginTop: spacing.sm },
  vehicleCard: { marginBottom: spacing.md },
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleIcon: { width: 44, height: 44, borderRadius: radii.xl, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  vehicleMain: { flex: 1, minWidth: 0 },
  vehicleName: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.body.fontSize, color: colors.text },
  vehicleMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xs },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2, borderRadius: radii.full },
  statusAvail: { backgroundColor: colors.successLight },
  statusRented: { backgroundColor: colors.warningLight },
  statusMaint: { backgroundColor: colors.errorLight },
  statusText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.caption.fontSize, color: colors.text },
  bookingEmptyState: { paddingVertical: spacing.md },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bookingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  bookingIcon: { width: 40, height: 40, borderRadius: radii.xl, backgroundColor: THEME.primaryLight + '80', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  bookingMain: { flex: 1, minWidth: 0 },
  bookingTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.body.fontSize, color: colors.text },
  bookingMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xs },
  rentalJobActions: { flexDirection: 'row', alignItems: 'center' },
  fabWrap: { position: 'absolute', right: spacing.xl, bottom: spacing.xl },
  sheetBg: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, ...shadows.lg },
  sheetContent: { padding: spacing.md },
  sheetTitle: { fontFamily: typography.fontFamily.semibold, fontSize: 18, lineHeight: 24, color: colors.text, marginBottom: spacing.sm },
  sheetMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.bodySmall.fontSize, color: colors.textSecondary, marginBottom: spacing.md },
  sheetMapBtn: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  sheetMapBtnDisabled: { opacity: 0.6 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    minHeight: 48,
    backgroundColor: THEME.primary,
    gap: spacing.xs,
  },
  bookBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.bodySmall.fontSize, color: colors.primaryContrast },
  mapLinkText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.bodySmall.fontSize, color: THEME.primary },
  bottomNavWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
