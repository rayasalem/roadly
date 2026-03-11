/**
 * Mechanic: edit my services (mock list + add).
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { Button } from '../../../../shared/components/Button';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';

const THEME = ROLE_THEMES.mechanic;
const MOCK_SERVICES = ['إصلاح الإطارات', 'فحص المحرك', 'تغيير الزيت', 'بطارية السيارة'];

export function MechanicServicesScreen() {
  const navigation = useNavigation();
  const [services] = useState(MOCK_SERVICES);

  return (
    <View style={styles.root}>
      <AppHeader title={t('mechanic.myServices')} onBack={() => navigation.goBack()} rightIcon="none" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard role="mechanic">
          {services.map((s) => (
            <View key={s} style={styles.row}>
              <Text style={styles.serviceText}>{s}</Text>
            </View>
          ))}
        </GlassCard>
        <Button
          title="إضافة خدمة (بيانات تجريبية)"
          onPress={() => {}}
          variant="outline"
          fullWidth
          style={styles.addBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl },
  row: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  serviceText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.body, color: colors.text },
  addBtn: { marginTop: spacing.lg },
});
