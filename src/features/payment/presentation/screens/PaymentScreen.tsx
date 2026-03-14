/**
 * Payment: payment methods, add card, default method.
 * Customer-only.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { useUIStore } from '../../../../store/uiStore';

export function PaymentScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const toast = useUIStore((s) => s.toast);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <AppHeader title={t('customer.payment')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} rightIcon="none" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator>
        <TouchableOpacity style={[styles.addCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => toast({ type: 'info', message: t('customer.addPaymentComingSoon') ?? 'Add payment method coming soon.' })} activeOpacity={0.85}>
          <MaterialCommunityIcons name="credit-card-plus-outline" size={28} color={colors.primary} />
          <Text style={[styles.addCardText, { color: colors.primary }]}>{t('customer.addPaymentMethod')}</Text>
        </TouchableOpacity>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('customer.paymentHint')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addCardText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
  hint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    marginTop: spacing.md,
  },
});
