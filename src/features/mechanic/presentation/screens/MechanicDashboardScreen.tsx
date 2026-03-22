/**
 * Mechanic dashboard: glassmorphism stats, filter, accept/decline, FAB map, bottom sheet.
 */
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { AppText } from '../../../../shared/components/AppText';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { useUIStore } from '../../../../store/uiStore';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { StatCard } from '../../../../shared/components/StatCard';
import { Button } from '../../../../shared/components/Button';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import type { MechanicStackParamList } from '../../../../navigation/MechanicStack';
import {
  useMechanicDashboard,
  type MechanicJob,
  type MechanicRequestStatus,
} from '../../hooks/useMechanicDashboard';
import { useProviderProfile } from '../../../profile/hooks/useProviderProfile';
import { useProviderLocationSync } from '../../../profile/hooks/useProviderLocationSync';
import { updateProviderAvailability } from '../../../profile/data/providerProfileApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROLES } from '../../../../shared/constants/roles';
import { useAuthStore } from '../../../../store/authStore';
import { openExternalMap } from '../../../../shared/utils/navigation';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'MechanicDashboard'>;
const THEME = ROLE_THEMES.mechanic;

const FILTER_OPTIONS: Array<MechanicRequestStatus | 'all'> = [
  'all',
  'new',
  'on_the_way',
  'in_garage',
];

function getFilterLabel(f: MechanicRequestStatus | 'all'): string {
  if (f === 'all') return t('mechanic.filterAll');
  if (f === 'new') return t('mechanic.filterNew');
  if (f === 'on_the_way') return t('mechanic.filterOnTheWay');
  return t('mechanic.filterInGarage');
}

const MechanicJobCard = memo(function MechanicJobCard({
  job,
  onPress,
  onAccept,
  onDecline,
  onNavigate,
}: {
  job: MechanicJob;
  onPress: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onNavigate?: () => void;
}) {
  return (
    <PressableCard onPress={onPress} style={styles.jobCard}>
      <View style={styles.jobRow}>
        <View style={[styles.jobIcon, { backgroundColor: THEME.primaryLight }]}>
          <MaterialCommunityIcons name="wrench-outline" size={20} color={THEME.primary} />
        </View>
        <View style={styles.jobMain}>
          <AppText variant="body" weight="semibold" numberOfLines={1} style={styles.jobTitle}>{job.title}</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.jobMeta}>{job.distance} • ETA {job.eta}</AppText>
        </View>
        <StatusBadge
          label={job.status.replace('_', ' ')}
          variant={job.status === 'new' ? 'pending' : job.status === 'on_the_way' ? 'active' : 'completed'}
          pulse={job.status === 'new'}
          size="sm"
        />
      </View>
      <View style={styles.actionRow}>
        <Button title={t('mechanic.decline')} onPress={onDecline} variant="outline" size="sm" />
        <View style={styles.actionSpacer} />
        <Button title={t('home.action.navigate') ?? 'Navigate'} onPress={onNavigate} variant="ghost" size="sm" />
        <View style={styles.actionSpacer} />
        <Button title={t('mechanic.accept')} onPress={onAccept} variant="accent" size="sm" />
      </View>
    </PressableCard>
  );
});

export function MechanicDashboardScreen() {
  useProviderLocationSync();
  const navigation = useNavigation<Nav>();
  const toast = useUIStore((s) => s.toast);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedJob, setSelectedJob] = useState<MechanicJob | null>(null);
  const {
    stats,
    jobs,
    requesters,
    statusFilter,
    setStatusFilter,
    isLoading,
    isError,
    error,
    refetch,
    acceptJob,
    declineJob,
    completeJob,
    isAccepting,
    isDeclining,
    isCompleting,
  } = useMechanicDashboard();
  const actionLoading = isAccepting || isDeclining || isCompleting;

  const user = useAuthStore((s) => s.user ?? null);
  const role = user?.role ?? null;
  const displayName = user?.name ?? 'Mechanic';
  const { profile, refetch: refetchProfile } = useProviderProfile(role, displayName);
  const queryClient = useQueryClient();

  const availabilityMutation = useMutation({
    mutationFn: (nextAvailable: boolean) => updateProviderAvailability(nextAvailable),
    onSuccess: (data) => {
      void refetchProfile();
      void queryClient.invalidateQueries({ queryKey: ['provider', 'me'] });
    },
    onError: (error: unknown) => {
      toast({ type: 'error', message: error instanceof Error ? error.message : t('common.error') });
    },
  });

  const isAvailable = profile?.isAvailable ?? true;

  const handleTab = useCallback(
    (tab: NavTabId) => {
      if (tab === 'Home') {
        navigation.navigate('MechanicDashboard');
      } else if (tab === 'Profile') {
        navigation.navigate('Profile');
      } else if (tab === 'Chat') {
        (navigation as any).navigate('Chat');
      } else if (tab === 'Notifications') {
        (navigation as any).navigate('Notifications');
      } else if (tab === 'Settings') {
        (navigation as any).navigate('Settings');
      }
    },
    [navigation],
  );

  const openProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleJobPress = useCallback((job: MechanicJob) => {
    setSelectedJob(job);
  }, []);

  const handleNavigate = useCallback((job: MechanicJob) => {
    const anyJob = job as any;
    const origin = anyJob.origin as { latitude: number; longitude: number } | undefined;
    if (!origin) return;
    void openExternalMap(origin.latitude, origin.longitude);
  }, []);

  useEffect(() => {
    if (selectedJob) bottomSheetRef.current?.present();
  }, [selectedJob]);

  const handleAccept = useCallback(
    async (job: MechanicJob) => {
      const requestId = job.requestId ?? job.id;
      bottomSheetRef.current?.dismiss();
      setSelectedJob(null);
      try {
        await acceptJob(requestId);
        toast({ type: 'success', message: t('mechanic.accepted') });
        refetch();
      } catch (e) {
        toast({ type: 'error', message: e instanceof Error ? e.message : t('common.error') });
      }
    },
    [acceptJob, toast, navigation],
  );

  const handleDecline = useCallback(
    async (job: MechanicJob) => {
      const requestId = job.requestId ?? job.id;
      bottomSheetRef.current?.dismiss();
      setSelectedJob(null);
      try {
        await declineJob(requestId);
        toast({ type: 'info', message: t('mechanic.declined') });
      } catch (e) {
        toast({ type: 'error', message: e instanceof Error ? e.message : t('common.error') });
      }
    },
    [declineJob, toast],
  );

  const handleComplete = useCallback(
    async (job: MechanicJob) => {
      const requestId = job.requestId ?? job.id;
      bottomSheetRef.current?.dismiss();
      setSelectedJob(null);
      try {
        await completeJob(requestId);
        toast({ type: 'success', message: t('mechanic.completed') });
      } catch (e) {
        toast({ type: 'error', message: e instanceof Error ? e.message : t('common.error') });
      }
    },
    [completeJob, toast],
  );

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorWithRetry message={error?.message ?? ''} onRetry={() => refetch()} testID="mechanic-dashboard-retry" />;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <AppHeader
          title={t('mechanic.dashboard.title')}
          rightIcon="profile"
          onProfile={openProfile}
        />
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListHeaderComponent={
            <>
              <GlassCard role="mechanic" style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroAvatarCircle}>
                    <MaterialCommunityIcons name="account-wrench" size={28} color={THEME.primary} />
                  </View>
                  <View style={styles.heroTextCol}>
                    <AppText variant="title3" style={styles.heroTitle}>
                      {t('mechanic.dashboard.title')}
                    </AppText>
                    <AppText variant="body" color={colors.textSecondary}>
                      {t('mechanic.whoRequestedMe')}
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
                      {isAvailable ? t('map.status.available') : t('mechanic.unavailable')}
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
                      {t('mechanic.unavailable')}
                    </AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                  <StatCard
                    value={jobs.filter((j) => j.status === 'new').length}
                    label={t('mechanic.stats.newRequests') ?? 'New requests'}
                    accentColor={THEME.primary}
                  />
                  <StatCard
                    value={jobs.filter((j) => j.status === 'on_the_way' || j.status === 'in_garage').length}
                    label={t('mechanic.stats.activeRequests') ?? 'Active requests'}
                    accentColor={THEME.primary}
                  />
                  <StatCard
                    value={stats.jobsToday}
                    label={t('mechanic.stats.completedJobs') ?? 'Completed jobs'}
                    accentColor={THEME.primary}
                  />
                </View>
              </GlassCard>

              <AppText variant="title3" style={styles.sectionTitle}>{t('mechanic.whoRequestedMe')}</AppText>
              <GlassCard role="mechanic">
                {requesters.map((r) => (
                  <View key={r.id} style={styles.requesterRow}>
                    <View style={styles.requesterMain}>
                      <Text style={styles.requesterName}>{r.customerName}</Text>
                      <Text style={styles.requesterMeta}>{r.serviceType} • {r.time}</Text>
                    </View>
                    <View style={[styles.requesterPill, { backgroundColor: THEME.primaryLight }]}>
                      <Text style={[styles.requesterPillText, { color: THEME.primary }]}>{r.status}</Text>
                    </View>
                  </View>
                ))}
              </GlassCard>

              <View style={styles.actionCardsRow}>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('MechanicServices')} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="wrench" size={24} color={THEME.primary} />
                  <AppText variant="title3" style={styles.actionCardTitle}>{t('mechanic.myServices')}</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('MechanicSkills')} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="certificate-outline" size={24} color={THEME.primary} />
                  <AppText variant="title3" style={styles.actionCardTitle}>{t('mechanic.mySkills')}</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('MechanicJobHistory')} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={THEME.primary} />
                  <AppText variant="title3" style={styles.actionCardTitle}>{t('mechanic.jobHistory')}</AppText>
                </TouchableOpacity>
              </View>

              <View style={styles.filterRow}>
                {FILTER_OPTIONS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
                    onPress={() => setStatusFilter(f)}
                  >
                    <AppText variant="callout" style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
                      {getFilterLabel(f)}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <AppText variant="title3" style={styles.sectionTitle}>{t('mechanic.requestsList') ?? 'Requests'}</AppText>
            </>
          }
          renderItem={({ item: job }) => (
            <MechanicJobCard
              job={job}
              onPress={() => handleJobPress(job)}
              onAccept={() => handleAccept(job)}
              onDecline={() => handleDecline(job)}
              onNavigate={() => handleNavigate(job)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="wrench-outline" size={48} color={colors.textMuted} />
              <AppText variant="body" color={colors.textMuted} style={styles.emptyText}>{t('mechanic.noJobs')}</AppText>
            </View>
          }
        />
      </SafeAreaView>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={[280]}
        enablePanDownToClose
        onDismiss={() => { blurActiveElementForA11y(); setSelectedJob(null); }}
        backgroundStyle={styles.sheetBg}
      >
        <View style={styles.sheetContent}>
          {selectedJob ? (
            <>
              <AppText variant="title3" style={styles.sheetTitle}>{selectedJob.title}</AppText>
              <AppText variant="callout" color={colors.textSecondary} style={styles.sheetMeta}>{selectedJob.distance} • ETA {selectedJob.eta}</AppText>
              <View style={styles.sheetBadgeWrap}>
                <StatusBadge
                  label={selectedJob.status.replace('_', ' ')}
                  variant={selectedJob.status === 'new' ? 'pending' : selectedJob.status === 'on_the_way' ? 'active' : 'completed'}
                  pulse={selectedJob.status === 'new'}
                  size="sm"
                />
              </View>
              <View style={styles.sheetActions}>
                {(selectedJob.status === 'new' || selectedJob.status === 'on_the_way') && (
                  <>
                    <Button
                      title={t('mechanic.decline')}
                      onPress={() => handleDecline(selectedJob)}
                      variant="outline"
                      fullWidth
                      disabled={actionLoading}
                      loading={isDeclining}
                    />
                    <View style={styles.sheetGap} />
                  </>
                )}
                {selectedJob.status === 'new' && (
                  <Button
                    title={t('mechanic.accept')}
                    onPress={() => handleAccept(selectedJob)}
                    fullWidth
                    disabled={actionLoading}
                    loading={isAccepting}
                  />
                )}
                {(selectedJob.status === 'on_the_way' || selectedJob.status === 'in_garage') && (
                  <Button
                    title={t('mechanic.complete')}
                    onPress={() => handleComplete(selectedJob)}
                    fullWidth
                    disabled={actionLoading}
                    loading={isCompleting}
                  />
                )}
              </View>
            </>
          ) : null}
        </View>
      </BottomSheetModal>

      <View style={styles.bottomNavWrap}>
        <BottomNavBar activeTab="Home" onSelect={handleTab} dark />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
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
    borderRadius: 26,
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
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  availabilityLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
  },
  availabilityChips: { flexDirection: 'row', gap: spacing.sm },
  availabilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    ...shadows.sm,
  },
  availabilityChipOn: { backgroundColor: colors.primary },
  availabilityChipOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  availabilityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  availabilityChipText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.caption.fontSize, color: colors.text },
  availabilityChipTextOn: { color: colors.primaryContrast },
  availabilityChipTextOff: { color: colors.textSecondary },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
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
  mapBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.primaryContrast,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  filterChipActive: {
    backgroundColor: THEME.primary,
  },
  filterText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.primaryContrast,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
    marginBottom: spacing.md,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  requesterMain: { flex: 1, minWidth: 0 },
  requesterName: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.body.fontSize, color: colors.text },
  requesterMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xs },
  requesterPill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2, borderRadius: radii.full },
  requesterPillText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.caption.fontSize },
  actionCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.card,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    minWidth: 100,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  actionCardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.text,
    marginTop: spacing.sm,
  },
  jobCard: {
    marginBottom: spacing.card,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  jobMain: { flex: 1, minWidth: 0 },
  jobTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
  },
  jobMeta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.full,
  },
  statusText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    alignItems: 'center',
  },
  actionSpacer: { width: spacing.sm },
  fabWrap: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
  },
  fabWrapPulse: Platform.select({
    web: { boxShadow: '0px 0px 12px rgba(34,197,94,0.7)', elevation: 8 },
    default: {
      shadowColor: THEME.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
    },
  }),
  sheetBg: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    ...shadows.lg,
  },
  sheetContent: {
    padding: spacing.md,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sheetMeta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sheetBadgeWrap: { marginBottom: spacing.md },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sheetGap: { width: spacing.sm },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  mapLinkText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.bodySmall.fontSize,
    color: THEME.primary,
  },
  bottomNavWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
