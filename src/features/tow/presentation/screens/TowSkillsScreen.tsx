/**
 * Tow: add/edit my skills (mock list).
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { Button } from '../../../../shared/components/Button';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { useUIStore } from '../../../../store/uiStore';

const MOCK_SKILLS = ['سحب سيارات ثقيلة', 'مركبات خفيفة', 'دراجات نارية', 'مسافات طويلة'];

export function TowSkillsScreen() {
  const navigation = useNavigation();
  const toast = useUIStore((s) => s.toast);
  const [skills] = useState(MOCK_SKILLS);

  return (
    <View style={styles.root}>
      <AppHeader title={t('tow.mySkills')} onBack={() => navigation.goBack()} rightIcon="none" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard role="tow">
          {skills.map((s) => (
            <View key={s} style={styles.row}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
        </GlassCard>
        <Button
          title={t('tow.addSkill') ?? 'Add skill (demo)'}
          onPress={() => toast({ type: 'info', message: t('common.comingSoon') ?? 'Coming soon.' })}
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
  scroll: { padding: spacing.md },
  row: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  skillText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.body, color: colors.text },
  addBtn: { marginTop: spacing.lg },
});
