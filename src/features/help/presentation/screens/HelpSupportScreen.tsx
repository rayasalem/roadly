/**
 * Help & Support: FAQ, contact, feedback.
 * Customer-only.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { useUIStore } from '../../../../store/uiStore';

export function HelpSupportScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const toast = useUIStore((s) => s.toast);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <AppHeader title={t('customer.helpSupport')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} rightIcon="none" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator>
        <TouchableOpacity style={[styles.row, { backgroundColor: colors.surface }]} onPress={() => toast({ type: 'info', message: t('customer.faqComingSoon') ?? 'FAQ coming soon.' })} activeOpacity={0.85}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.rowText, { color: colors.text }]}>{t('customer.faq')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { backgroundColor: colors.surface }]} onPress={() => Linking.openURL('mailto:support@mechnow.app')} activeOpacity={0.85}>
          <MaterialCommunityIcons name="email-outline" size={24} color={colors.primary} />
          <Text style={[styles.rowText, { color: colors.text }]}>{t('customer.contactUs')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.card,
  },
  rowText: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
});
