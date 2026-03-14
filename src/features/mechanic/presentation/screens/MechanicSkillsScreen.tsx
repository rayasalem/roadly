/**
 * Mechanic: add/edit my skills (mock list + add).
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { Button } from '../../../../shared/components/Button';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { useUIStore } from '../../../../store/uiStore';

const MOCK_SKILLS = ['ميكانيكي عام', 'إصلاح الإطارات', 'تشخيص أعطال المحرك', 'إصلاح المكيّف'];

export function MechanicSkillsScreen() {
  const navigation = useNavigation();
  const toast = useUIStore((s) => s.toast);
  const [skills, setSkills] = useState<string[]>(MOCK_SKILLS);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) {
      toast({ type: 'info', message: t('mechanic.emptySkillWarning') ?? 'أدخل اسم المهارة أولاً.' });
      return;
    }
    if (skills.includes(trimmed)) {
      toast({ type: 'info', message: t('mechanic.skillAlreadyExists') ?? 'هذه المهارة مضافة مسبقاً.' });
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setNewSkill('');
    toast({ type: 'success', message: t('mechanic.skillAdded') ?? 'تم إضافة المهارة بنجاح (محلياً).' });
  };

  return (
    <View style={styles.root}>
      <AppHeader title={t('mechanic.mySkills')} onBack={() => navigation.goBack()} rightIcon="none" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard role="mechanic">
          {skills.map((s) => (
            <View key={s} style={styles.row}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
        </GlassCard>
        <View style={styles.form}>
          <Text style={styles.label}>{t('mechanic.addSkillLabel') ?? 'أضف مهارة جديدة'}</Text>
          <TextInput
            value={newSkill}
            onChangeText={setNewSkill}
            placeholder={t('mechanic.addSkillPlaceholder') ?? 'مثال: كهرباء سيارات'}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
          <Button
            title={t('mechanic.addSkill') ?? 'إضافة مهارة'}
            onPress={handleAddSkill}
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
  skillText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.body, color: colors.text },
  form: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
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
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  addBtn: { marginTop: spacing.md },
});
