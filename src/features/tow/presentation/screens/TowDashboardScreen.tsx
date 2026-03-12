/**
 * Tow dashboard: glass stats, status badges, filter, FAB map, bottom sheet for job detail.
 */
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { AppHeader } from '../../../../shared/components/AppHeader';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { RequestTimeline, type TimelineStep } from '../../../../shared/components/RequestTimeline';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { FAB } from '../../../../shared/components/FAB';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { StatCard } from '../../../../shared/components/StatCard';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import type { TowStackParamList } from '../../../../navigation/TowStack';
import { useTowDashboard, type TowJob, type TowJobStatus } from '../../hooks/useTowDashboard';

type Nav = NativeStackNavigationProp<TowStackParamList, 'TowDashboard'>;
const THEME = ROLE_THEMES.tow;

const FILTER_OPTIONS: Array<TowJobStatus | 'all'> = ['all', 'active', 'queued'];

function getFilterLabel(f: TowJobStatus | 'all'): string {
  if (f === 'all') return t('tow.filterAll');
  if (f === 'active') return t('tow.filterActive');
  return t('tow.filterQueued');
}

const TowJobCard = memo(function TowJobCard({
  job,
  onPress,
  openMap,
}: {
  job: TowJob;
  onPress: () => void;
  openMap: () => void;
}) {
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
      <TouchableOpacity style={styles.mapLink} onPress={openMap}>
        <MaterialCommunityIcons name="map-marker-outline" size={16} color={THEME.primary} />
        <Text style={styles.mapLinkText}>{t('home.action.openMap')}</Text>
      </TouchableOpacity>
    </PressableCard>
  );
});

export function TowDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedJob, setSelectedJob] = useState<TowJob | null>(null);
  const { stats, jobs, requesters, statusFilter, setStatusFilter, isLoading, isError, error, refetch } = useTowDashboard();

  const openMap = useCallback(() => navigation.navigate('Map'), [navigation]);
  const openProfile = useCallback(() => navigation.navigate('Profile'), [navigation]);

  const handleJobPress = useCallback((job: TowJob) => setSelectedJob(job), []);
  useEffect(() => {
    if (selectedJob) bottomSheetRef.current?.present();
  }, [selectedJob]);

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
          <GlassCard role="tow">
            <View style={styles.statsRow}>
              <StatCard value={stats.active} label={t('tow.stats.active')} accentColor={THEME.primary} />
              <StatCard value={stats.waiting} label={t('tow.stats.waiting')} accentColor={THEME.primary} />
              <StatCard value={stats.fleet} label={t('tow.stats.fleet')} accentColor={THEME.primary} />
            </View>
            <TouchableOpacity style={styles.mapBtn} onPress={openMap} activeOpacity={0.85}>
              <MaterialCommunityIcons name="tow-truck" size={18} color={colors.primaryContrast} />
              <Text style={styles.mapBtnText}>{t('home.action.openMap')}</Text>
            </TouchableOpacity>
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

          <Text style={styles.sectionTitle}>{t('tow.todayJobs')}</Text>
            </>
          }
          renderItem={({ item: job }) => (
            <TowJobCard job={job} onPress={() => handleJobPress(job)} openMap={openMap} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="tow-truck" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>{t('tow.noJobs')}</Text>
            </View>
          }
        />
      </SafeAreaView>

      <View style={styles.fabWrap}>
        <FAB icon="map-marker-outline" onPress={openMap} role="tow" accessibilityLabel={t('home.action.openMap')} />
      </View>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={[320]}
        enablePanDownToClose
        onDismiss={() => setSelectedJob(null)}
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
              <TouchableOpacity style={styles.sheetMapBtn} onPress={openMap}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={THEME.primary} />
                <Text style={styles.mapLinkText}>{t('home.action.openMap')}</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
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
    fontSize: typography.presets.titleSmall.fontSize,
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
  jobCard: { marginBottom: spacing.md },
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
  sheetContent: { padding: spacing.xl },
  sheetTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.titleSmall.fontSize, color: colors.text, marginBottom: spacing.xs },
  sheetMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.bodySmall.fontSize, color: colors.textSecondary, marginBottom: spacing.md },
  timelineTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.caption.fontSize, color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  sheetMapBtn: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.bodySmall.fontSize, color: colors.textMuted, marginTop: spacing.md },
});
