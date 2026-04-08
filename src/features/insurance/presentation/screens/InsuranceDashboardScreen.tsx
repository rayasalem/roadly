/**
 * لوحة تحكم مزود التأمين — نفس مستوى تجربة لوحات الميكانيكي/التأجير (بطاقة بطل، توفر، حالات، CTA).
 */
import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AppHeader } from '../../../../shared/components/AppHeader';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { AmbientSurface, DashboardSectionHeader } from '../../../../shared/components/dashboard';
import type { NavTabId } from '../../../../shared/navigation/navTabs';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import { trailingChevronForLocale } from '../../../../shared/i18n/rtlUtils';
import { useLocaleStore } from '../../../../store/localeStore';
import type { InsuranceStackParamList } from '../../../../navigation/InsuranceStack';
import { useProviderProfile } from '../../../profile/hooks/useProviderProfile';
import { useProviderLocationSync } from '../../../profile/hooks/useProviderLocationSync';
import { updateProviderAvailability } from '../../../profile/data/providerProfileApi';
import { useAuthStore } from '../../../../store/authStore';
import { useUIStore } from '../../../../store/uiStore';

const THEME = ROLE_THEMES.insurance;
const AMBIENT_TINT = 'rgba(124, 58, 237, 0.1)';

type Nav = NativeStackNavigationProp<InsuranceStackParamList, 'InsuranceDashboard'>;

export function InsuranceDashboardScreen() {
  useProviderLocationSync();
  const locale = useLocaleStore((s) => s.locale);
  const trailingChevron = trailingChevronForLocale(locale);
  const navigation = useNavigation<Nav>();
  const toast = useUIStore((s) => s.toast);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { profile, refetch: refetchProfile } = useProviderProfile(user?.role ?? null, user?.name ?? '');

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

  const handleTab = useCallback(
    (tab: NavTabId) => {
      if (tab === 'Home') navigation.navigate('InsuranceDashboard');
      else if (tab === 'Profile') navigation.navigate('Profile');
      else if (tab === 'Chat') navigation.navigate('Chat');
      else if (tab === 'Requests') navigation.navigate('InsuranceRequests');
    },
    [navigation]
  );

  return (
    <ScreenWrapper responsiveNav bottomNavConfig={{ activeTab: 'Home', onSelect: handleTab, dark: true }}>
      <View style={styles.shell}>
        <AmbientSurface tint={AMBIENT_TINT} />
        <AppHeader
          title={t('insurance.dashboard.title')}
          centerLogo
          dark
          rightIcon="bell"
          onRightPress={() => navigation.navigate('Notifications')}
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassCard role="insurance" style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={[styles.heroAvatarCircle, { backgroundColor: THEME.primaryLight }]}>
                <MaterialCommunityIcons name="shield-check" size={28} color={THEME.primary} />
              </View>
              <View style={styles.heroTextCol}>
                <AppText variant="title3" style={styles.heroTitle}>
                  {t('insurance.dashboard.title')}
                </AppText>
                <AppText variant="body" color={colors.textSecondary}>
                  {t('insurance.dashboard.subtitle')}
                </AppText>
              </View>
              <View style={styles.heroStatusPill}>
                <View
                  style={[
                    styles.heroStatusDot,
                    { backgroundColor: isAvailable ? THEME.primary : colors.textMuted },
                  ]}
                />
                <AppText
                  variant="caption"
                  style={{ color: isAvailable ? THEME.primary : colors.textMuted }}
                >
                  {isAvailable ? t('map.status.available') : t('map.status.busy')}
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
                    isAvailable && { backgroundColor: colors.primaryContrast },
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
                  {t('map.status.busy')}
                </AppText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.mapQuick, { borderColor: THEME.primary + '55' }]}
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="map-search-outline" size={20} color={THEME.primary} />
              <AppText variant="callout" style={[styles.mapQuickText, { color: THEME.primary }]}>
                {t('insurance.dashboard.mapCta')}
              </AppText>
              <MaterialCommunityIcons name={trailingChevron} size={22} color={THEME.primary} />
            </TouchableOpacity>
          </GlassCard>

          <DashboardSectionHeader
            title={t('insurance.dashboard.plansCta')}
            subtitle={t('insurance.plans.subtitle')}
          />
          <PressableCard onPress={() => navigation.navigate('InsurancePlans')} style={styles.card}>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="file-document-outline" size={26} color={THEME.primary} />
              <AppText variant="title3" style={styles.cardTitle}>
                {t('insurance.dashboard.plansCta')}
              </AppText>
            </View>
          </PressableCard>

          <DashboardSectionHeader
            title={t('insurance.dashboard.requestsCta')}
            subtitle={t('insurance.requests.subtitle')}
          />
          <PressableCard onPress={() => navigation.navigate('InsuranceRequests')} style={styles.card}>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={26} color={THEME.primary} />
              <AppText variant="title3" style={styles.cardTitle}>
                {t('insurance.dashboard.requestsCta')}
              </AppText>
            </View>
          </PressableCard>

          <Button
            title={t('insurance.plans.requestCta')}
            onPress={() => navigation.navigate('InsuranceRequests')}
            fullWidth
            size="lg"
            style={styles.primaryCta}
          />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, position: 'relative', overflow: 'hidden' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heroCard: { padding: spacing.lg, marginBottom: spacing.lg },
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
  },
  heroTextCol: { flex: 1, marginHorizontal: spacing.md },
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
  heroStatusDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  heroChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
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
  availabilityChipOn: { backgroundColor: THEME.primary },
  availabilityChipOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  availabilityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  availabilityChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
    color: colors.text,
  },
  availabilityChipTextOn: { color: colors.primaryContrast },
  availabilityChipTextOff: { color: colors.textSecondary },
  mapQuick: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    gap: spacing.sm,
    ...shadows.sm,
  },
  mapQuickText: { flex: 1, fontFamily: typography.fontFamily.semibold },
  card: { marginBottom: spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardTitle: { flex: 1, fontFamily: typography.fontFamily.semibold },
  primaryCta: { marginTop: spacing.lg },
});
