/**
 * Ratings: rate past services; list of completed jobs with rating CTA.
 * Customer-only.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

export function RatingsScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <AppHeader title={t('customer.ratings')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} rightIcon="none" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator>
        <View style={[styles.empty, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons name="star-outline" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('customer.ratingsEmpty')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{t('customer.ratingsEmptySubtitle')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  empty: {
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.title3,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
  },
});
