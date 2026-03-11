/**
 * Rental dashboard: glass stats, vehicle cards with status, bookings, FAB map.
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
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { FAB } from '../../../../shared/components/FAB';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { StatCard } from '../../../../shared/components/StatCard';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import type { RentalStackParamList } from '../../../../navigation/RentalStack';
import { useUIStore } from '../../../../store/uiStore';
import { useRentalDashboard, type RentalVehicle, type VehicleStatus } from '../../hooks/useRentalDashboard';

type Nav = NativeStackNavigationProp<RentalStackParamList, 'RentalDashboard'>;
const THEME = ROLE_THEMES.rental;

function statusLabel(s: VehicleStatus): string {
  if (s === 'available') return t('rental.available');
  if (s === 'rented') return t('rental.rented');
  return t('rental.maintenance');
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
  const navigation = useNavigation<Nav>();
  const toast = useUIStore((s) => s.toast);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<RentalVehicle | null>(null);
  const { stats, vehicles, bookings, isLoading, isError, error, refetch } = useRentalDashboard();

  const openMap = useCallback(() => navigation.navigate('Map'), [navigation]);
  const openProfile = useCallback(() => navigation.navigate('Profile'), [navigation]);

  const handleVehiclePress = useCallback((v: RentalVehicle) => {
    setSelectedVehicle(v);
  }, []);
  useEffect(() => {
    if (selectedVehicle) bottomSheetRef.current?.present();
  }, [selectedVehicle]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorWithRetry message={error?.message ?? ''} onRetry={() => refetch()} testID="rental-dashboard-retry" />;

  return (
    <View style={styles.root}>
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
          ListHeaderComponent={
            <>
          <GlassCard role="rental">
            <View style={styles.statsRow}>
              <StatCard value={stats.total} label={t('rental.stats.total')} accentColor={THEME.primary} />
              <StatCard value={stats.available} label={t('rental.stats.available')} accentColor={THEME.primary} />
              <StatCard value={stats.rented} label={t('rental.stats.rented')} accentColor={THEME.primary} />
            </View>
            <TouchableOpacity style={styles.mapBtn} onPress={openMap} activeOpacity={0.85}>
              <MaterialCommunityIcons name="car-estate" size={18} color={colors.primaryContrast} />
              <Text style={styles.mapBtnText}>{t('home.action.openMap')}</Text>
            </TouchableOpacity>
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
          </View>

          <Text style={styles.sectionTitle}>{t('rental.fleetOverview')}</Text>
            </>
          }
          ListFooterComponent={
            <>
              <Text style={styles.sectionTitle}>{t('rental.whoRequestedMe')}</Text>
              <GlassCard role="rental">
                {bookings.map((b) => (
              <View key={b.id} style={styles.bookingRow}>
                <View style={styles.bookingIcon}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color={THEME.primary} />
                </View>
                <View style={styles.bookingMain}>
                  <Text style={styles.bookingTitle}>{b.customer}</Text>
                  <Text style={styles.bookingMeta}>{b.vehicle} • {b.time}</Text>
                </View>
              </View>
            ))}
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

      <View style={styles.fabWrap}>
        <FAB icon="map-marker-outline" onPress={openMap} role="rental" accessibilityLabel={t('home.action.openMap')} />
      </View>

      <BottomSheetModal ref={bottomSheetRef} snapPoints={[240]} enablePanDownToClose onDismiss={() => setSelectedVehicle(null)} backgroundStyle={styles.sheetBg}>
        <View style={styles.sheetContent}>
          {selectedVehicle ? (
            <>
              <Text style={styles.sheetTitle}>{selectedVehicle.name}</Text>
              <Text style={styles.sheetMeta}>{selectedVehicle.plate} • {selectedVehicle.price}</Text>
              <StatusBadge label={statusLabel(selectedVehicle.status)} variant={statusVariant(selectedVehicle.status)} size="sm" />
              <TouchableOpacity style={[styles.sheetMapBtn, selectedVehicle.status !== 'available' && styles.sheetMapBtnDisabled]} onPress={openMap} disabled={selectedVehicle.status !== 'available'}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={THEME.primary} />
                <Text style={styles.mapLinkText}>{t('home.action.openMap')}</Text>
              </TouchableOpacity>
              {selectedVehicle.status === 'available' && (
                <TouchableOpacity style={styles.bookBtn} onPress={() => toast({ type: 'success', message: t('rental.bookingStarted') })}>
                  <MaterialCommunityIcons name="calendar-check" size={20} color={colors.primaryContrast} />
                  <Text style={styles.bookBtnText}>{t('rental.bookNow')}</Text>
                </TouchableOpacity>
              )}
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
  sectionTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.titleSmall.fontSize, color: colors.text, marginBottom: spacing.md },
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
  bookingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  bookingIcon: { width: 40, height: 40, borderRadius: radii.xl, backgroundColor: THEME.primaryLight + '80', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  bookingMain: { flex: 1, minWidth: 0 },
  bookingTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.body.fontSize, color: colors.text },
  bookingMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xs },
  fabWrap: { position: 'absolute', right: spacing.xl, bottom: spacing.xl },
  sheetBg: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, ...shadows.lg },
  sheetContent: { padding: spacing.xl },
  sheetTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.titleSmall.fontSize, color: colors.text, marginBottom: spacing.xs },
  sheetMeta: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.bodySmall.fontSize, color: colors.textSecondary, marginBottom: spacing.md },
  sheetMapBtn: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  sheetMapBtnDisabled: { opacity: 0.6 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: THEME.primary,
    gap: spacing.xs,
  },
  bookBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.bodySmall.fontSize, color: colors.primaryContrast },
  mapLinkText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.bodySmall.fontSize, color: THEME.primary },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.bodySmall.fontSize, color: colors.textMuted, marginTop: spacing.md },
});
