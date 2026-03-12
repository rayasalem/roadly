/**
 * Profile: User (simple card + logout) or Provider (avatar, rating, status, services + edit sheet).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { ScreenFadeIn } from '../../../../shared/components/ScreenFadeIn';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { Button } from '../../../../shared/components/Button';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { useAuthStore } from '../../../../store/authStore';
import { useUIStore } from '../../../../store/uiStore';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { colors } from '../../../../shared/theme/colors';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { ROLE_LABELS } from '../../../../shared/constants/roles';
import { t } from '../../../../shared/i18n/t';
import { useProviderProfile } from '../../hooks/useProviderProfile';
import { ROLES } from '../../../../shared/constants/roles';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import { safeNavigateToSettings } from '../../../../navigation/navigationRef';
import { updateProviderAvailability } from '../../data/providerProfileApi';
import { useMutation } from '@tanstack/react-query';

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'Profile'>;

function statusLabel(status: string): string {
  if (status === 'on_the_way') return t('map.status.onTheWay');
  if (status === 'busy') return t('map.status.busy');
  return t('map.status.available');
}

function RatingStars({ value }: { value: number }) {
  const full = Math.floor(Math.min(5, Math.max(0, value)));
  const empty = 5 - full;
  return (
    <View style={styles.starRow}>
      {Array.from({ length: full }, (_, i) => (
        <MaterialCommunityIcons key={`f-${i}`} name="star" size={18} color={colors.warning} />
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <MaterialCommunityIcons key={`e-${i}`} name="star-outline" size={18} color={colors.textMuted} />
      ))}
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const role = user?.role ?? null;
  const isProvider = role === ROLES.MECHANIC || role === ROLES.MECHANIC_TOW || role === ROLES.CAR_RENTAL;

  const {
    isProvider: hookIsProvider,
    profile,
    services,
    availableToAdd,
    addService,
    removeService,
    setServicesList,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorDetail,
    refetch: refetchProfile,
    isRefetching: profileRefetching,
  } = useProviderProfile(role, user?.name ?? '');

  const themeId = role === ROLES.MECHANIC ? 'mechanic' : role === ROLES.MECHANIC_TOW ? 'tow' : role === ROLES.CAR_RENTAL ? 'rental' : 'admin';
  const theme = ROLE_THEMES[themeId];

  useEffect(() => {
    if (sheetOpen) sheetRef.current?.present();
  }, [sheetOpen]);

  const openEditServices = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
    setSheetOpen(false);
  }, []);

  const toast = useUIStore((s) => s.toast);
  const handleSaveServices = useCallback(
    (selected: string[]) => {
      setServicesList(selected);
      closeSheet();
      toast({ type: 'success', message: t('profile.servicesSaved') });
    },
    [setServicesList, closeSheet, toast],
  );

  const availabilityMutation = useMutation({
    mutationFn: (isAvailable: boolean) => updateProviderAvailability(isAvailable),
    onSuccess: () => {
      void refetchProfile();
    },
    onError: (error: unknown) => {
      toast({ type: 'error', message: error instanceof Error ? error.message : t('common.error') });
    },
  });

  const toggleAvailability = useCallback(() => {
    const current = profile?.isAvailable ?? true;
    availabilityMutation.mutate(!current);
  }, [availabilityMutation, profile?.isAvailable]);

  const handleTab = (tab: NavTabId) => {
    if (tab === 'Home') navigation.navigate('Home');
    if (tab === 'Profile') return;
    if (tab === 'Chat') navigation.navigate('Chat');
    if (tab === 'Notifications') navigation.navigate('Notifications');
    if (tab === 'Settings') safeNavigateToSettings(navigation);
  };

  if (!user) {
    return (
      <ScreenWrapper>
        <AppHeader title={t('profile.title')} onBack={() => navigation.goBack()} onProfile={() => safeNavigateToSettings(navigation)} />
        <View style={styles.container} />
      </ScreenWrapper>
    );
  }

  if (isProvider && hookIsProvider && profileLoading) {
    return (
      <ScreenWrapper>
        <AppHeader title={t('profile.title')} onBack={() => navigation.goBack()} onProfile={() => safeNavigateToSettings(navigation)} />
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (isProvider && hookIsProvider && profileError) {
    return (
      <ScreenWrapper>
        <AppHeader title={t('profile.title')} onBack={() => navigation.goBack()} onProfile={() => safeNavigateToSettings(navigation)} />
        <ErrorWithRetry
          message={profileErrorDetail?.message ?? ''}
          onRetry={() => void refetchProfile()}
          isRetrying={profileRefetching}
          testID="profile-retry"
        />
      </ScreenWrapper>
    );
  }

  const displayProfile = profile ?? (isProvider && hookIsProvider ? { id: '', name: user.name, avatarUri: null, rating: 0, status: 'available' as const, phone: '', email: '', reviews: [] } : null);

  if (isProvider && hookIsProvider && displayProfile) {
    return (
      <ScreenWrapper>
        <AppHeader title={t('profile.title')} onBack={() => navigation.goBack()} onProfile={() => safeNavigateToSettings(navigation)} />
        <ScreenFadeIn style={styles.fadeWrap}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard role={themeId} style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              {displayProfile.avatarUri ? (
                <Image source={{ uri: displayProfile.avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.primaryLight }]}>
                  <MaterialCommunityIcons name="account" size={40} color={theme.primary} />
                </View>
              )}
            </View>
            <Text style={styles.profileName}>{displayProfile.name}</Text>
            <Text style={[styles.profileRole, { color: theme.primary }]}>
              {ROLE_LABELS[role]}
            </Text>
            <RatingStars value={displayProfile.rating} />
            <View style={styles.statusRow}>
              <View style={[styles.statusPill, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.statusPillText, { color: theme.primary }]}>
                  {statusLabel((profile?.isAvailable ?? true) ? displayProfile.status : 'busy')}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.availabilityToggle,
                  (profile?.isAvailable ?? true) ? styles.availabilityOn : styles.availabilityOff,
                ]}
                onPress={toggleAvailability}
                disabled={availabilityMutation.isPending}
              >
                <MaterialCommunityIcons
                  name={(profile?.isAvailable ?? true) ? 'toggle-switch' : 'toggle-switch-off-outline'}
                  size={22}
                  color={(profile?.isAvailable ?? true) ? colors.primaryContrast : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.availabilityText,
                    { color: (profile?.isAvailable ?? true) ? colors.primaryContrast : colors.textSecondary },
                  ]}
                >
                  {(profile?.isAvailable ?? true) ? t('map.status.available') : t('map.status.busy')}
                </Text>
              </TouchableOpacity>
            </View>
            {(displayProfile.phone || displayProfile.email) ? (
              <View style={styles.contactRow}>
                {displayProfile.phone ? <Text style={styles.contactText}>{displayProfile.phone}</Text> : null}
                {displayProfile.email ? <Text style={styles.contactText}>{displayProfile.email}</Text> : null}
              </View>
            ) : null}
          </GlassCard>

          <Text style={styles.sectionTitle}>{t('profile.myServices')}</Text>
          <GlassCard role={themeId}>
            {services.map((name) => (
              <PressableCard key={name} style={styles.serviceCard} onPress={() => removeService(name)}>
                <View style={styles.serviceRow}>
                  <MaterialCommunityIcons name="wrench" size={20} color={theme.primary} />
                  <Text style={styles.serviceName}>{name}</Text>
                  <TouchableOpacity onPress={() => removeService(name)} hitSlop={12}>
                    <MaterialCommunityIcons name="close-circle-outline" size={22} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </PressableCard>
            ))}
            <Button
              testID="profile-add-service"
              title={t('profile.addService')}
              onPress={openEditServices}
              variant="outline"
              fullWidth
              style={styles.addBtn}
            />
          </GlassCard>

          <Button
            testID="profile-logout"
            title={t('auth.logout')}
            onPress={() => void logout()}
            variant="outline"
            fullWidth
            size="lg"
            style={styles.logoutBtn}
          />
        </ScrollView>
        </ScreenFadeIn>

        <BottomSheetModal
          ref={sheetRef}
          snapPoints={[400, '70%']}
          enablePanDownToClose
          onDismiss={() => setSheetOpen(false)}
          backgroundStyle={styles.sheetBg}
          handleIndicatorStyle={styles.sheetHandle}
        >
          <EditServicesSheet
            currentServices={services}
            availableToAdd={availableToAdd}
            onSave={handleSaveServices}
            onCancel={closeSheet}
            theme={theme}
          />
        </BottomSheetModal>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader title={t('profile.title')} onBack={() => navigation.goBack()} onProfile={() => safeNavigateToSettings(navigation)} />
      <View style={styles.container}>
        {user && (
          <View style={styles.card}>
            <Text style={styles.label}>{t('profile.name')}</Text>
            <Text style={styles.value}>{user.name}</Text>
            <Text style={styles.label}>{t('profile.email')}</Text>
            <Text style={styles.value}>{user.email}</Text>
            <Text style={styles.label}>{t('profile.role')}</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>
        )}
        {user?.role === ROLES.USER && (
          <Button
            title={t('request.historyTitle') ?? 'My requests'}
            onPress={() => navigation.navigate('RequestHistory')}
            variant="outline"
            fullWidth
            size="lg"
            style={{ marginBottom: spacing.md }}
          />
        )}
        <Button
          title={t('auth.logout')}
          onPress={() => void logout()}
          variant="outline"
          fullWidth
          size="lg"
        />
      </View>
      {user?.role === ROLES.USER && (
        <BottomNavBar activeTab="Profile" onSelect={handleTab} />
      )}
    </ScreenWrapper>
  );
}

function EditServicesSheet({
  currentServices,
  availableToAdd,
  onSave,
  onCancel,
  theme,
}: {
  currentServices: string[];
  availableToAdd: string[];
  onSave: (selected: string[]) => void;
  onCancel: () => void;
  theme: { primary: string; primaryLight: string };
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(currentServices));

  useEffect(() => {
    setSelected(new Set(currentServices));
  }, [currentServices]);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const allOptions = [...currentServices, ...availableToAdd];
  const handleSave = () => onSave(Array.from(selected));
  const handleCancel = () => onCancel();

  return (
    <View style={styles.sheetContent}>
      <Text style={styles.sheetTitle}>{t('profile.myServices')}</Text>
      <Text style={styles.sheetSubtitle}>{t('profile.addService')}</Text>
      <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
        {allOptions.map((name) => {
          const isSelected = selected.has(name);
          return (
            <TouchableOpacity
              key={name}
              style={[styles.sheetRow, isSelected && { backgroundColor: theme.primaryLight }]}
              onPress={() => toggle(name)}
              activeOpacity={0.8}
            >
              <Text style={styles.sheetRowText}>{name}</Text>
              {isSelected ? (
                <MaterialCommunityIcons name="check-circle" size={24} color={theme.primary} />
              ) : (
                <MaterialCommunityIcons name="circle-outline" size={24} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.sheetActions}>
        <Button testID="profile-sheet-cancel" title={t('admin.cancel')} onPress={handleCancel} variant="outline" style={styles.sheetBtn} />
        <Button testID="profile-sheet-save" title={t('admin.save')} onPress={handleSave} variant="primary" style={styles.sheetBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fadeWrap: { flex: 1 },
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatarWrap: { marginBottom: spacing.md },
  avatar: { width: 80, height: 80, borderRadius: radii.xl },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  profileName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.titleSmall.fontSize,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileRole: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.bodySmall.fontSize,
    marginBottom: spacing.sm,
  },
  starRow: { flexDirection: 'row', gap: 2, marginBottom: spacing.sm },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  statusPillText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.caption.fontSize },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  availabilityOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  availabilityOff: {
    backgroundColor: colors.surface,
  },
  availabilityText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
  },
  contactRow: { marginTop: spacing.sm, alignItems: 'center', gap: spacing.xs },
  contactText: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.caption.fontSize, color: colors.textSecondary },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.titleSmall.fontSize,
    color: colors.text,
    marginBottom: spacing.md,
  },
  serviceCard: { marginBottom: spacing.sm },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  serviceName: { flex: 1, fontFamily: typography.fontFamily.medium, fontSize: typography.presets.body.fontSize, color: colors.text },
  addBtn: { marginTop: spacing.md },
  logoutBtn: { marginTop: spacing.xl },
  sheetBg: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, ...shadows.lg },
  sheetHandle: { backgroundColor: colors.border, width: 40 },
  sheetContent: { padding: spacing.xl, flex: 1 },
  sheetTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.presets.title.fontSize, color: colors.text, marginBottom: spacing.xs },
  sheetSubtitle: { fontFamily: typography.fontFamily.regular, fontSize: typography.presets.bodySmall.fontSize, color: colors.textSecondary, marginBottom: spacing.lg },
  sheetList: { maxHeight: 280 },
  sheetListContent: { paddingBottom: spacing.lg },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.xs,
  },
  sheetRowText: { fontFamily: typography.fontFamily.medium, fontSize: typography.presets.body.fontSize, color: colors.text },
  sheetActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  sheetBtn: { flex: 1 },
});
