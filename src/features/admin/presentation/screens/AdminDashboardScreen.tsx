/**
 * Admin Full Control: single page with tabs (Mechanic / Tow / Rental).
 * Each panel: stats, filter chips, Material-style list, Open Map / Edit / Add actions, Bottom Sheet for detail.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { AppHeader } from '../../../../shared/components/AppHeader';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { StatCard } from '../../../../shared/components/StatCard';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { FAB } from '../../../../shared/components/FAB';
import { Button } from '../../../../shared/components/Button';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import { useUIStore } from '../../../../store/uiStore';
import { blurActiveElementForA11y } from '../../../../shared/utils/domA11y';
import type { AdminStackParamList } from '../../../../navigation/AdminStack';
import {
  useAdminDashboard,
  type AdminProviderRole,
  type AdminMechanicRequest,
  type AdminMechanicFilter,
  type AdminTowRequest,
  type AdminTowFilter,
  type AdminRentalVehicle,
  type AdminRentalFilter,
} from '../../hooks/useAdminDashboard';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;
const THEME = ROLE_THEMES.admin;

const BAR_MAX = 80;
const BAR_WIDTH = 24;

type SheetPayload =
  | { type: 'mechanic'; item: AdminMechanicRequest }
  | { type: 'tow'; item: AdminTowRequest }
  | { type: 'rental'; item: AdminRentalVehicle }
  | null;

function mechanicFilterLabel(f: AdminMechanicFilter): string {
  if (f === 'all') return t('mechanic.filterAll');
  if (f === 'new') return t('mechanic.filterNew');
  if (f === 'on_the_way') return t('mechanic.filterOnTheWay');
  return t('mechanic.filterInGarage');
}
function towFilterLabel(f: AdminTowFilter): string {
  if (f === 'all') return t('tow.filterAll');
  if (f === 'active') return t('tow.filterActive');
  return t('tow.filterQueued');
}
function rentalFilterLabel(f: AdminRentalFilter): string {
  if (f === 'all') return t('mechanic.filterAll');
  if (f === 'available') return t('rental.available');
  if (f === 'rented') return t('rental.rented');
  return t('rental.maintenance');
}

export function AdminDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const toast = useUIStore((s) => s.toast);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [sheetPayload, setSheetPayload] = useState<SheetPayload>(null);

  const openProfile = useCallback(() => navigation.navigate('Profile'), [navigation]);
  const openMap = useCallback(() => navigation.navigate('Map'), [navigation]);

  const handleTab = useCallback(
    (tab: NavTabId) => {
      if (tab === 'Home') navigation.navigate('AdminDashboard');
      else if (tab === 'Profile') navigation.navigate('Profile');
      else if (tab === 'Chat') navigation.navigate('Chat');
      else if (tab === 'Notifications') navigation.navigate('Notifications');
      else if (tab === 'Settings') navigation.navigate('Settings');
    },
    [navigation],
  );

  const {
    stats,
    chartData,
    activeTab,
    setActiveTab,
    mechanicPanel,
    towPanel,
    rentalPanel,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminDashboard();

  const openProviderList = useCallback(() => navigation.navigate('AdminProviderList', { role: activeTab }), [navigation, activeTab]);

  useEffect(() => {
    if (sheetPayload) sheetRef.current?.present();
  }, [sheetPayload]);

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
    setSheetPayload(null);
  }, []);

  const handleEdit = useCallback(() => {
    closeSheet();
    toast({ type: 'info', message: t('admin.edit') + ' – ' + t('common.notImplemented') });
  }, [closeSheet, toast]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorWithRetry message={error?.message ?? ''} onRetry={() => refetch()} testID="admin-dashboard-retry" />;

  const tabs: { id: AdminProviderRole; label: string; icon: string }[] = [
    { id: 'mechanic', label: t('admin.section.mechanics'), icon: 'wrench' },
    { id: 'tow', label: t('admin.section.tow'), icon: 'tow-truck' },
    { id: 'rental', label: t('admin.section.rental'), icon: 'car-estate' },
  ];

  const roleTheme = activeTab === 'mechanic' ? ROLE_THEMES.mechanic : activeTab === 'tow' ? ROLE_THEMES.tow : ROLE_THEMES.rental;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <AppHeader title={t('admin.dashboard.title')} rightIcon="profile" onProfile={openProfile} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Global stats */}
          <GlassCard role="admin">
            <View style={styles.statsGrid}>
              <StatCard value={stats.users} label={t('admin.stats.users')} accentColor={THEME.primary} />
              <StatCard value={stats.providers} label={t('admin.stats.providers')} accentColor={THEME.primary} />
              <StatCard value={stats.requests} label={t('admin.stats.requests')} accentColor={THEME.primary} />
              <StatCard value={stats.revenue} label={t('admin.stats.revenue')} accentColor={THEME.primary} />
            </View>
            {(stats.activeProviders != null || stats.activeRequests != null || stats.completedServices != null) && (
              <View style={[styles.statsGrid, styles.statsGridSecondary]}>
                {stats.activeProviders != null && (
                  <StatCard value={String(stats.activeProviders)} label={t('admin.stats.activeProviders')} accentColor={colors.success} />
                )}
                {stats.activeRequests != null && (
                  <StatCard value={String(stats.activeRequests)} label={t('admin.stats.activeRequests')} accentColor={colors.info} />
                )}
                {stats.completedServices != null && (
                  <StatCard value={String(stats.completedServices)} label={t('admin.stats.completedServices')} accentColor={THEME.primary} />
                )}
              </View>
            )}
          </GlassCard>

          <TouchableOpacity
            style={styles.manageUsersCard}
            onPress={() => navigation.navigate('AdminUsers')}
            activeOpacity={0.85}
            testID="admin-manage-users"
          >
            <MaterialCommunityIcons name="account-group" size={28} color={THEME.primary} />
            <View style={styles.manageUsersTextWrap}>
              <Text style={styles.manageUsersTitle}>{t('admin.manageUsers')}</Text>
              <Text style={styles.manageUsersSubtitle}>{t('admin.usersList')} • {t('admin.editServices')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageUsersCard}
            onPress={openProviderList}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={28} color={THEME.primary} />
            <View style={styles.manageUsersTextWrap}>
              <Text style={styles.manageUsersTitle}>{t('admin.section.providerList')}</Text>
              <Text style={styles.manageUsersSubtitle}>{t('admin.section.mechanics')} • {t('admin.section.tow')} • {t('admin.section.rental')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageUsersCard}
            onPress={() => navigation.navigate('AdminReports')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="chart-box-outline" size={28} color={THEME.primary} />
            <View style={styles.manageUsersTextWrap}>
              <Text style={styles.manageUsersTitle}>{t('admin.reports')}</Text>
              <Text style={styles.manageUsersSubtitle}>{t('admin.reportsEmpty')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageUsersCard}
            onPress={() => navigation.navigate('AdminSystemSettings')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="cog-outline" size={28} color={THEME.primary} />
            <View style={styles.manageUsersTextWrap}>
              <Text style={styles.manageUsersTitle}>{t('admin.systemSettings')}</Text>
              <Text style={styles.manageUsersSubtitle}>{t('admin.systemSettingsHint')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && { backgroundColor: ROLE_THEMES[tab.id].primaryLight, borderColor: ROLE_THEMES[tab.id].primary },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={18}
                  color={activeTab === tab.id ? ROLE_THEMES[tab.id].primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab.id && { color: ROLE_THEMES[tab.id].primary, fontFamily: typography.fontFamily.semibold },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Mechanic panel */}
          {activeTab === 'mechanic' && (
            <>
              <GlassCard role="admin" style={styles.roleCard}>
                <View style={styles.roleStatsRow}>
                  <StatCard value={mechanicPanel.stats.jobsToday} label={t('mechanic.stats.jobsToday')} accentColor={roleTheme.primary} />
                  <StatCard value={mechanicPanel.stats.activeRequests} label={t('admin.activeRequests')} accentColor={roleTheme.primary} />
                  <StatCard value={mechanicPanel.stats.avgRating} label={t('mechanic.stats.rating')} accentColor={roleTheme.primary} />
                </View>
              </GlassCard>
              <Text style={styles.sectionTitle}>{t('admin.requestsAssigned')}</Text>
              <View style={styles.chipRow}>
                {(['all', 'new', 'on_the_way', 'in_garage'] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, mechanicPanel.filter === f && { backgroundColor: roleTheme.primary }]}
                    onPress={() => mechanicPanel.setFilter(f)}
                  >
                    <Text style={[styles.chipText, mechanicPanel.filter === f && styles.chipTextActive]}>
                      {mechanicFilterLabel(f)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {mechanicPanel.requests.map((req) => (
                <PressableCard
                  key={req.id}
                  style={styles.listCard}
                  onPress={() => setSheetPayload({ type: 'mechanic', item: req })}
                >
                  <View style={styles.listRow}>
                    <View style={[styles.listIcon, { backgroundColor: roleTheme.primaryLight }]}>
                      <MaterialCommunityIcons name="wrench" size={20} color={roleTheme.primary} />
                    </View>
                    <View style={styles.listMain}>
                      <Text style={styles.listTitle} numberOfLines={1}>{req.title}</Text>
                      <Text style={styles.listMeta}>{req.customerName} • {req.distance} • ETA {req.eta}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: roleTheme.primaryLight }]}>
                      <Text style={[styles.statusPillText, { color: roleTheme.primary }]}>{req.status.replace('_', ' ')}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <Button title={t('home.action.openMap')} onPress={() => openMap()} variant="outline" size="sm" />
                    <View style={styles.actionGap} />
                    <Button title={t('admin.edit')} onPress={() => setSheetPayload({ type: 'mechanic', item: req })} variant="accent" size="sm" />
                  </View>
                </PressableCard>
              ))}
            </>
          )}

          {/* Tow panel */}
          {activeTab === 'tow' && (
            <>
              <GlassCard role="admin" style={styles.roleCard}>
                <View style={styles.roleStatsRow}>
                  <StatCard value={towPanel.stats.active} label={t('tow.stats.active')} accentColor={roleTheme.primary} />
                  <StatCard value={towPanel.stats.waiting} label={t('tow.stats.waiting')} accentColor={roleTheme.primary} />
                  <StatCard value={towPanel.stats.fleet} label={t('tow.stats.fleet')} accentColor={roleTheme.primary} />
                </View>
              </GlassCard>
              <Text style={styles.sectionTitle}>{t('admin.towingRequests')}</Text>
              <View style={styles.chipRow}>
                {(['all', 'active', 'queued'] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, towPanel.filter === f && { backgroundColor: roleTheme.primary }]}
                    onPress={() => towPanel.setFilter(f)}
                  >
                    <Text style={[styles.chipText, towPanel.filter === f && styles.chipTextActive]}>
                      {towFilterLabel(f)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {towPanel.requests.map((req) => (
                <PressableCard
                  key={req.id}
                  style={styles.listCard}
                  onPress={() => setSheetPayload({ type: 'tow', item: req })}
                >
                  <View style={styles.listRow}>
                    <View style={[styles.listIcon, { backgroundColor: roleTheme.primaryLight }]}>
                      <MaterialCommunityIcons name="tow-truck" size={20} color={roleTheme.primary} />
                    </View>
                    <View style={styles.listMain}>
                      <Text style={styles.listTitle} numberOfLines={1}>{req.title}</Text>
                      <Text style={styles.listMeta}>{req.customerName} • {req.vehicle}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: roleTheme.primaryLight }]}>
                      <Text style={[styles.statusPillText, { color: roleTheme.primary }]}>{req.status}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <Button title={t('home.action.openMap')} onPress={() => openMap()} variant="outline" size="sm" />
                    <View style={styles.actionGap} />
                    <Button title={t('admin.edit')} onPress={() => setSheetPayload({ type: 'tow', item: req })} variant="accent" size="sm" />
                  </View>
                </PressableCard>
              ))}
            </>
          )}

          {/* Rental panel */}
          {activeTab === 'rental' && (
            <>
              <GlassCard role="admin" style={styles.roleCard}>
                <View style={styles.roleStatsRow}>
                  <StatCard value={rentalPanel.stats.total} label={t('rental.stats.total')} accentColor={roleTheme.primary} />
                  <StatCard value={rentalPanel.stats.available} label={t('rental.stats.available')} accentColor={roleTheme.primary} />
                  <StatCard value={rentalPanel.stats.rented} label={t('rental.stats.rented')} accentColor={roleTheme.primary} />
                </View>
              </GlassCard>
              <Text style={styles.sectionTitle}>{t('admin.fleetVehicles')}</Text>
              <View style={styles.chipRow}>
                {(['all', 'available', 'rented', 'maintenance'] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, rentalPanel.filter === f && { backgroundColor: roleTheme.primary }]}
                    onPress={() => rentalPanel.setFilter(f)}
                  >
                    <Text style={[styles.chipText, rentalPanel.filter === f && styles.chipTextActive]}>
                      {rentalFilterLabel(f)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.addVehicleBtn, { backgroundColor: roleTheme.primaryLight }]}
                onPress={() => toast({ type: 'info', message: t('common.notImplemented') })}
              >
                <MaterialCommunityIcons name="plus" size={20} color={roleTheme.primary} />
                <Text style={[styles.addVehicleBtnText, { color: roleTheme.primary }]}>{t('admin.addVehicle')}</Text>
              </TouchableOpacity>
              {rentalPanel.vehicles.map((v) => (
                <PressableCard
                  key={v.id}
                  style={styles.listCard}
                  onPress={() => setSheetPayload({ type: 'rental', item: v })}
                >
                  <View style={styles.listRow}>
                    <View style={[styles.listIcon, { backgroundColor: roleTheme.primaryLight }]}>
                      <MaterialCommunityIcons name="car" size={20} color={roleTheme.primary} />
                    </View>
                    <View style={styles.listMain}>
                      <Text style={styles.listTitle} numberOfLines={1}>{v.name}</Text>
                      <Text style={styles.listMeta}>{v.plate} • {v.price}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: roleTheme.primaryLight }]}>
                      <Text style={[styles.statusPillText, { color: roleTheme.primary }]}>{v.status}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <Button title={t('home.action.openMap')} onPress={() => openMap()} variant="outline" size="sm" />
                    <View style={styles.actionGap} />
                    <Button title={t('admin.updateStatus')} onPress={() => setSheetPayload({ type: 'rental', item: v })} variant="accent" size="sm" />
                  </View>
                </PressableCard>
              ))}
            </>
          )}

          <Text style={styles.chartTitle}>Requests (last 7 days)</Text>
          <GlassCard role="admin">
            <View style={styles.chartRow}>
              {chartData.map((val, i) => (
                <View key={`bar-${i}`} style={styles.barWrap}>
                  <View style={[styles.bar, { height: Math.max(8, (val / BAR_MAX) * 100), backgroundColor: THEME.primary }]} />
                </View>
              ))}
            </View>
          </GlassCard>

          <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.primaryContrast} />
            <Text style={styles.mapBtnText}>{t('home.action.openMap')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <View style={styles.fabWrap}>
        <FAB icon="map-marker-outline" onPress={openMap} role="admin" accessibilityLabel={t('home.action.openMap')} />
      </View>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={[320]}
        enablePanDownToClose
        onDismiss={() => { blurActiveElementForA11y(); setSheetPayload(null); }}
        backgroundStyle={styles.sheetBg}
      >
        <View style={styles.sheetContent}>
          {sheetPayload?.type === 'mechanic' && (
            <>
              <Text style={styles.sheetTitle}>{sheetPayload.item.title}</Text>
              <Text style={styles.sheetMeta}>{sheetPayload.item.customerName} • {sheetPayload.item.distance} • ETA {sheetPayload.item.eta}</Text>
              <Text style={styles.sheetMeta}>Status: {sheetPayload.item.status}</Text>
              <View style={styles.sheetActions}>
                <Button title={t('home.action.openMap')} onPress={openMap} variant="outline" fullWidth />
                <View style={styles.sheetGap} />
                <Button title={t('admin.edit')} onPress={handleEdit} fullWidth />
              </View>
            </>
          )}
          {sheetPayload?.type === 'tow' && (
            <>
              <Text style={styles.sheetTitle}>{sheetPayload.item.title}</Text>
              <Text style={styles.sheetMeta}>{sheetPayload.item.customerName} • {sheetPayload.item.vehicle}</Text>
              <View style={styles.sheetActions}>
                <Button title={t('home.action.openMap')} onPress={openMap} variant="outline" fullWidth />
                <View style={styles.sheetGap} />
                <Button title={t('admin.edit')} onPress={handleEdit} fullWidth />
              </View>
            </>
          )}
          {sheetPayload?.type === 'rental' && (
            <>
              <Text style={styles.sheetTitle}>{sheetPayload.item.name}</Text>
              <Text style={styles.sheetMeta}>{sheetPayload.item.plate} • {sheetPayload.item.price} • {sheetPayload.item.status}</Text>
              <View style={styles.sheetActions}>
                <Button title={t('home.action.openMap')} onPress={openMap} variant="outline" fullWidth />
                <View style={styles.sheetGap} />
                <Button title={t('admin.updateStatus')} onPress={handleEdit} fullWidth />
              </View>
            </>
          )}
        </View>
      </BottomSheetModal>

      <View style={styles.bottomNavWrap}>
        <BottomNavBar activeTab="Home" onSelect={handleTab} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: 120 },
  bottomNavWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  statsGridSecondary: { marginTop: spacing.md },
  manageUsersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: THEME.primary + '40',
    gap: spacing.md,
    ...shadows.sm,
  },
  manageUsersTextWrap: { flex: 1, minWidth: 0 },
  manageUsersTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
  },
  manageUsersSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tabBar: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  tabLabel: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.caption.fontSize, color: colors.text },
  chipTextActive: { color: colors.primaryContrast },
  roleCard: { marginBottom: spacing.md },
  roleStatsRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  sectionTitle: { fontFamily: typography.fontFamily.semibold, fontSize: 18, lineHeight: 24, color: colors.text, marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  chipText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.caption.fontSize, color: colors.text },
  listCard: { marginBottom: spacing.md },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  listIcon: { width: 40, height: 40, borderRadius: radii.lg, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  listMain: { flex: 1, minWidth: 0 },
  listTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.body.fontSize, color: colors.text },
  listMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xs },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2, borderRadius: radii.full },
  statusPillText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.caption.fontSize },
  cardActions: { flexDirection: 'row', marginTop: spacing.md, alignItems: 'center' },
  actionGap: { width: spacing.sm },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  addVehicleBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.bodySmall.fontSize },
  chartTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.titleSmall.fontSize, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: BAR_WIDTH, borderRadius: radii.xs, minHeight: 8 },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: THEME.primary,
    gap: spacing.xs,
  },
  mapBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.bodySmall.fontSize, color: colors.primaryContrast },
  fabWrap: { position: 'absolute', right: spacing.xl, bottom: spacing.xl },
  sheetBg: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, ...shadows.lg },
  sheetContent: { padding: spacing.md },
  sheetTitle: { fontFamily: typography.fontFamily.semibold, fontSize: 18, lineHeight: 24, color: colors.text, marginBottom: spacing.sm },
  sheetMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.bodySmall.fontSize, color: colors.textSecondary, marginBottom: spacing.sm },
  sheetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  sheetGap: { width: spacing.sm },
});
