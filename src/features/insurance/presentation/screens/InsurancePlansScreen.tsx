/**
 * عرض خطط التأمين — للعميل: مقارنة + طلب تأمين. لمزود التأمين: مرجع الخطط.
 */
import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppHeader } from '../../../../shared/components/AppHeader';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { Card } from '../../../../shared/components/Card';
import type { NavTabId } from '../../../../shared/navigation/navTabs';
import { colors } from '../../../../shared/theme/colors';
import { spacing, radii, shadows, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { useAuthStore } from '../../../../store/authStore';
import { ROLES } from '../../../../shared/constants/roles';
import { MOCK_INSURANCE_PLANS } from '../../data/mockInsurancePlans';
import type { InsuranceStackParamList } from '../../../../navigation/InsuranceStack';

type Nav = NativeStackNavigationProp<InsuranceStackParamList, 'InsurancePlans'>;

export function InsurancePlansScreen() {
  const navigation = useNavigation<Nav>();
  const role = useAuthStore((s) => s.user?.role ?? null);
  const isCustomer = role === ROLES.USER;

  const handleTab = useCallback(
    (tab: NavTabId) => {
      const nav = navigation as any;
      const names: string[] = nav?.getState?.()?.routeNames ?? [];
      if (tab === 'Home') {
        if (names.includes('InsuranceDashboard')) nav.navigate('InsuranceDashboard');
        else nav.navigate('Map');
      } else if (tab === 'Profile') nav.navigate('Profile');
      else if (tab === 'Chat') nav.navigate('Chat');
      else if (tab === 'Requests') {
        if (names.includes('InsuranceRequests')) nav.navigate('InsuranceRequests');
        else nav.navigate('RequestHistory');
      }
    },
    [navigation]
  );

  const onRequestInsurance = useCallback(
    (plan?: { name: string }) => {
      if (!isCustomer) return;
      const desc = plan ? `${t('insurance.plans.title')}: ${plan.name}` : undefined;
      (navigation as any).navigate('Request', { serviceType: 'insurance', description: desc });
    },
    [navigation, isCustomer]
  );

  return (
    <ScreenWrapper
      responsiveNav
      bottomNavConfig={{
        activeTab: 'Home',
        onSelect: handleTab,
        dark: !isCustomer,
      }}
    >
      <AppHeader
        title={t('insurance.plans.title')}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
          {t('insurance.plans.subtitle')}
        </AppText>

        {MOCK_INSURANCE_PLANS.map((plan) => (
          <Card key={plan.id} variant="elevated" padding="lg" style={styles.card}>
            {plan.featured ? (
              <View style={styles.badge}>
                <AppText variant="caption" style={styles.badgeText}>
                  ⭐
                </AppText>
              </View>
            ) : null}
            <View style={styles.row}>
              <MaterialCommunityIcons name="shield-check" size={28} color={colors.mapInsurance} />
              <View style={styles.planBody}>
                <AppText variant="title3" style={styles.planName}>
                  {plan.name}
                </AppText>
                <AppText variant="callout" color={colors.primary} style={styles.price}>
                  {plan.priceYear} {t('insurance.plan.perYear')}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary} style={styles.covTitle}>
                  {t('insurance.plan.coverageLabel')}
                </AppText>
                {plan.coverage.map((line) => (
                  <AppText key={line} variant="callout" style={styles.covLine}>
                    • {line}
                  </AppText>
                ))}
              </View>
            </View>
            {isCustomer ? (
              <Button
                title={t('insurance.plans.requestCta')}
                onPress={() => onRequestInsurance(plan)}
                fullWidth
                size="lg"
                style={styles.cta}
              />
            ) : null}
          </Card>
        ))}

        {isCustomer ? (
          <Button title={t('insurance.plans.requestCta')} variant="outline" onPress={() => onRequestInsurance()} fullWidth size="lg" />
        ) : (
          <TouchableOpacity style={styles.backDash} onPress={() => (navigation as any).navigate('InsuranceDashboard')} activeOpacity={0.85}>
            <AppText variant="callout" color={colors.primary}>
              {t('insurance.backToDashboard')}
            </AppText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { marginBottom: spacing.lg },
  card: { marginBottom: spacing.md, ...shadows.sm },
  badge: { position: 'absolute', top: spacing.sm, left: spacing.sm, zIndex: 1 },
  badgeText: {},
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  planBody: { flex: 1, minWidth: 0 },
  planName: { fontFamily: typography.fontFamily.semibold, marginBottom: spacing.xs },
  price: { fontFamily: typography.fontFamily.semibold, marginBottom: spacing.sm },
  covTitle: { marginBottom: spacing.xs },
  covLine: { marginBottom: 4 },
  cta: { marginTop: spacing.md },
  backDash: { marginTop: spacing.lg, alignItems: 'center' },
});
