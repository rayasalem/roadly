/**
 * Tow dashboard: availability toggle, New/Active/Completed stats, accept/reject requests, view on map.
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
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { RequestTimeline, type TimelineStep } from '../../../../shared/components/RequestTimeline';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { StatCard } from '../../../../shared/components/StatCard';
import { Button } from '../../../../shared/components/Button';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import type { TowStackParamList } from '../../../../navigation/TowStack';
import { useTowDashboard, type TowJob, type TowJobStatus } from '../../hooks/useTowDashboard';
import { useProviderProfile } from '../../../profile/hooks/useProviderProfile';
import { useProviderLocationSync } from '../../../profile/hooks/useProviderLocationSync';
import { updateProviderAvailability } from '../../../profile/data/providerProfileApi';
import { useUIStore } from '../../../../store/uiStore';
import { useAuthStore } from '../../../../store/authStore';

type Nav = NativeStackNavigationProp<TowStackParamList, 'TowDashboard'>;
const THEME = ROLE_THEMES.tow;

const FILTER_OPTIONS: Array<TowJobStatus | 'all'> = ['all', 'active', 'queued'];

function getFilterLabel(f: TowJobStatus | 'all'): string {
  if (f === 'all') return t('tow.filterAll');
  if (f === 'active') return t('tow.filterActive');
  return t('tow.filterQueued');
}

function buildTowTimelineSteps(status: TowJobStatus): TimelineStep[] {
  const requested = { key: 'requested', label: t('tow.stepRequested') ?? 'Requested', done: true, current: false };
  const accepted = { key: 'accepted', label: t('tow.stepAccepted') ?? 'Accepted', done: status === 'active', current: status === 'queued' };
  const onTheWay = { key: 'on_the_way', label: t('tow.stepOnTheWay') ?? 'On the way', done: status === 'active', current: status === 'active' };
  return [requested, accepted, onTheWay];
}

const TowJobCard = memo(function TowJobCard({
  job,
  onPress,
  onAccept,
  onReject,
}: {
  job: TowJob;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const isQueued = job.status === 'queued';
  return (
    <PressableCard onPress={onPress} style={styles.jobCard}>
      <View style={styles.jobRow}>
        <View style={[styles.jobIcon, { backgroundColor: THEME.primaryLight }]}>
          <MaterialCommunityIcons name="tow-truck" size={20} color={THEME.primary} />
        </View>
        <View style={styles.jobMain}>
          <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.jobMeta}>{job.distance} • {job.vehicle}</Text>
        </View>
        <View style={[styles.badge, job.status === 'active' ? styles.badgeActive : styles.badgeQueued]}>
          <Text style={styles.badgeText}>{job.status === 'active' ? t('tow.filterActive') : t('tow.filterQueued')}</Text>
        </View>
      </View>
      {isQueued && onAccept && onReject && (
        <View style={styles.actionRow}>
          <Button title={t('mechanic.decline') ?? 'Reject'} onPress={onReject} variant="outline" size="sm" />
          <View style={styles.actionSpacer} />
          <Button title={t('mechanic.accept') ?? 'Accept'} onPress={onAccept} variant="accent" size="sm" />
        </View>
      )}
    </PressableCard>
  );
});

export function TowDashboardScreen() {
  useProviderLocationSync();
  const navigation = useNavigation<Nav>();
  const toast = useUIStore((s) => s.toast);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user ?? null);
  const role = user?.role ?? null;
  const displayName = user?.name ?? 'Tow';
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
  const [selectedJob, setSelectedJob] = useState<TowJob | null>(null);
  const { stats, jobs, requesters, statusFilter, setStatusFilter, isLoading, isError, error, refetch, acceptJob, rejectJob, isAccepting, isRejecting } = useTowDashboard();

  const openProfile = useCallback(() => navigation.navigate('Profile'), [navigation]);

  const handleTab = useCallback(
    (tab: NavTabId) => {
      if (tab === 'Home') {
        navigation.navigate('TowDashboard');
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

  const handleJobPress = useCallback((job: TowJob) => setSelectedJob(job), []);

  const handleAccept = useCallback(
    async (job: TowJob) => {
      const requestId = job.requestId ?? job.id;
      bottomSheetRef.current?.dismiss();
      setSelectedJob(null);
      try {
        await acceptJob(requestId);
        toast({ type: 'success', message: t('mechanic.accepted') ?? 'Request accepted' });
        navigation.navigate('Map');
      } catch (e) {
        toast({ type: 'error', message: e instanceof Error ? e.message : t('common.error') });
      }
    },
    [acceptJob, toast, refetch],
  );

  const handleReject = useCallback(
    async (job: TowJob) => {
      const requestId = job.requestId ?? job.id;
      bottomSheetRef.current?.dismiss();
      setSelectedJob(null);
      try {
        await rejectJob(requestId);
        toast({ type: 'info', message: t('mechanic.declined') ?? 'Request rejected' });
      } catch (e) {
        toast({ type: 'error', message: e instanceof Error ? e.message : t('common.error') });
      }
    },
    [rejectJob, toast],
  );

  useEffect(() => {
    if (selectedJob) bottomSheetRef.current?.present();
  }, [selectedJob]);

  const actionLoading = isAccepting || isRejecting;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorWithRetry message={error?.message ?? ''} onRetry={() => refetch()} testID="tow-dashboard-retry" />;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <AppHeader title={t('tow.dashboard.title')} rightIcon="profile" onProfile={openProfile} />
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
              <GlassCard role="tow" style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroAvatarCircle}>
                    <MaterialCommunityIcons name="tow-truck" size={26} color={THEME.primary} />
                  </View>
                  <View style={styles.heroTextCol}>
                    <AppText variant="title3" style={styles.heroTitle}>
                      {t('tow.dashboard.title')}
                    </AppText>
                    <AppText variant="body" color={colors.textSecondary}>
                      {t('tow.whoRequestedMe')}
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
                  <StatCard value={stats.waiting} label={t('tow.stats.newRequests') ?? 'New requests'} accentColor={THEME.primary} />
                  <StatCard value={stats.active} label={t('tow.stats.activeRequests') ?? 'Active requests'} accentColor={THEME.primary} />
                  <StatCard value={stats.fleet} label={t('tow.stats.completedJobs') ?? 'Completed jobs'} accentColor={THEME.primary} />
                </View>
              </GlassCard>

          <Text style={styles.sectionTitle}>{t('tow.whoRequestedMe')}</Text>
          <GlassCard role="tow">
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
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('TowServices')} activeOpacity={0.85}>
              <MaterialCommunityIcons name="tow-truck" size={24} color={THEME.primary} />
              <Text style={styles.actionCardTitle}>{t('tow.myServices')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('TowSkills')} activeOpacity={0.85}>
              <MaterialCommunityIcons name="certificate-outline" size={24} color={THEME.primary} />
              <Text style={styles.actionCardTitle}>{t('tow.mySkills')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: THEME.primaryLight }]} onPress={() => navigation.navigate('TowJobHistory')} activeOpacity={0.85}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={24} color={THEME.primary} />
              <Text style={styles.actionCardTitle}>{t('tow.jobHistory')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            {FILTER_OPTIONS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
                onPress={() => setStatusFilter(f)}
              >
                <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
                  {getFilterLabel(f)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('tow.requestsList') ?? 'Requests'}</Text>
            </>
          }
          renderItem={({ item: job }) => (
            <TowJobCard
              job={job}
              onPress={() => handleJobPress(job)}
              onAccept={job.status === 'queued' ? () => handleAccept(job) : undefined}
              onReject={job.status === 'queued' ? () => handleReject(job) : undefined}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="tow-truck" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>{t('tow.noJobs')}</Text>
            </View>
          }
        />
      </SafeAreaView>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={[320]}
        enablePanDownToClose
        onDismiss={() => { blurActiveElementForA11y(); setSelectedJob(null); }}
        backgroundStyle={styles.sheetBg}
      >
        <View style={styles.sheetContent}>
          {selectedJob ? (
            <>
              <Text style={styles.sheetTitle}>{selectedJob.title}</Text>
              <Text style={styles.sheetMeta}>{selectedJob.vehicle} • {selectedJob.distance}</Text>
              <StatusBadge
                label={selectedJob.status === 'active' ? t('tow.filterActive') : t('tow.filterQueued')}
                variant={selectedJob.status === 'active' ? 'active' : 'queued'}
                pulse={selectedJob.status === 'active'}
                size="sm"
              />
              <Text style={styles.timelineTitle}>{t('tow.requestStatus')}</Text>
              <RequestTimeline
                accentColor={THEME.primary}
                steps={buildTowTimelineSteps(selectedJob.status)}
              />
              {selectedJob.status === 'queued' && (
                <View style={styles.sheetActions}>
                  <Button title={t('mechanic.decline') ?? 'Reject'} onPress={() => handleReject(selectedJob)} variant="outline" fullWidth disabled={actionLoading} loading={isRejecting} />
                  <View style={styles.sheetGap} />
                  <Button title={t('mechanic.accept') ?? 'Accept'} onPress={() => handleAccept(selectedJob)} fullWidth disabled={actionLoading} loading={isAccepting} />
                </View>
              )}
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
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  actionSpacer: { width: spacing.sm },
  sheetActions: { marginTop: spacing.md },
  sheetGap: { height: spacing.sm },
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
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  filterChipActive: { backgroundColor: THEME.primary },
  filterText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.caption.fontSize, color: colors.text },
  filterTextActive: { color: colors.primaryContrast },
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
  actionCardsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  actionCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  actionCardTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.bodySmall.fontSize, color: colors.text, marginTop: spacing.sm },
  jobCard: { marginBottom: spacing.card },
  jobRow: { flexDirection: 'row', alignItems: 'center' },
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  jobMain: { flex: 1, minWidth: 0 },
  jobTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.body.fontSize, color: colors.text },
  jobMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xs },
  mapLink: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.xs },
  mapLinkText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.bodySmall.fontSize, color: THEME.primary },
  fabWrap: { position: 'absolute', right: spacing.xl, bottom: spacing.xl },
  sheetBg: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, ...shadows.lg },
  sheetContent: { padding: spacing.md },
  sheetTitle: { fontFamily: typography.fontFamily.semibold, fontSize: 18, lineHeight: 24, color: colors.text, marginBottom: spacing.sm },
  sheetMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.bodySmall.fontSize, color: colors.textSecondary, marginBottom: spacing.md },
  timelineTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.caption.fontSize, color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  sheetMapBtn: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.bodySmall.fontSize, color: colors.textMuted, marginTop: spacing.md },
  bottomNavWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
