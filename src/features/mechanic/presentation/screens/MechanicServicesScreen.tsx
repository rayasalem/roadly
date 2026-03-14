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
import { useUIStore } from '../../../../store/uiStore';

const THEME = ROLE_THEMES.mechanic;
const MOCK_SERVICES = ['إصلاح الإطارات', 'فحص المحرك', 'تغيير الزيت', 'بطارية السيارة'];

export function MechanicServicesScreen() {
  const navigation = useNavigation();
  const toast = useUIStore((s) => s.toast);
  const [services, setServices] = useState<string[]>(MOCK_SERVICES);
  const [newService, setNewService] = useState('');

  const handleAddService = () => {
    const trimmed = newService.trim();
    if (!trimmed) {
      toast({ type: 'info', message: t('mechanic.emptyServiceWarning') ?? 'أدخل اسم الخدمة أولاً.' });
      return;
    }
    if (services.includes(trimmed)) {
      toast({ type: 'info', message: t('mechanic.serviceAlreadyExists') ?? 'هذه الخدمة مضافة مسبقاً.' });
      return;
    }
    setServices((prev) => [...prev, trimmed]);
    setNewService('');
    toast({ type: 'success', message: t('mechanic.serviceAdded') ?? 'تم إضافة الخدمة بنجاح (محلياً).' });
  };

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
        <View style={styles.form}>
          <Text style={styles.label}>{t('mechanic.addServiceLabel') ?? 'أضف خدمة جديدة'}</Text>
          <TextInput
            value={newService}
            onChangeText={setNewService}
            placeholder={t('mechanic.addServicePlaceholder') ?? 'مثال: فحص كمبيوتر السيارة'}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
          <Button
            title={t('mechanic.addService') ?? 'إضافة خدمة'}
            onPress={handleAddService}
            fullWidth
            style={styles.addBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md },
  row: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  serviceText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.body, color: colors.text },
  form: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: THEME.cardBackground ?? colors.surface,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  addBtn: { marginTop: spacing.md },
});
