/**
 * Rental: rental history (completed bookings).
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

export function RentalHistoryScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title={t('rental.history')} onBack={() => navigation.goBack()} rightIcon="none" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.empty, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons name="history" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('rental.noHistory')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl },
  empty: { borderRadius: 16, padding: spacing.xxl, alignItems: 'center' },
  emptyTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.body, marginTop: spacing.md },
});
