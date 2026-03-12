/**
 * Help & Support: FAQ, contact, feedback.
 * Customer-only.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

export function HelpSupportScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title={t('customer.helpSupport')} onBack={() => navigation.goBack()} rightIcon="none" />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={[styles.row, { backgroundColor: colors.surface }]} activeOpacity={0.85}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
});
