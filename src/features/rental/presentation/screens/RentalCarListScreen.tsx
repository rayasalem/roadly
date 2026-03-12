/**
 * Rental: car list (add/edit/remove vehicles).
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

export function RentalCarListScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title={t('rental.carList')} onBack={() => navigation.goBack()} rightIcon="none" />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.85}>
          <MaterialCommunityIcons name="car-plus" size={24} color={colors.primary} />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>{t('rental.addCar')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
  addBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.callout },
});
