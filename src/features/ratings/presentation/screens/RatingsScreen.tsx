/**
 * Rating form after completed request: overall, speed, quality, professionalism (1-5 stars) + optional comment.
 * When requestId is passed, shows form; after submit shows "Thanks for your rating".
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { StarRatingRow } from '../components/StarRatingRow';
import { useTheme, spacing, typography, radii } from '../../../../shared/theme';
import { colors } from '../../../../shared/theme/colors';
import { t } from '../../../../shared/i18n/t';
import { useQueryClient } from '@tanstack/react-query';
import { rateRequest } from '../../../requests/data/requestApi';

type RatingsParams = { requestId?: string; providerName?: string };

export function RatingsScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const route = useRoute<RouteProp<{ params: RatingsParams }, 'params'>>();
  const params = route.params ?? {};
  const requestId = params?.requestId;
  const providerName = params?.providerName;

  const { colors: themeColors } = useTheme();
  const [overall, setOverall] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [quality, setQuality] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = overall >= 1;
  const handleSubmit = useCallback(async () => {
    if (!requestId || !canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await rateRequest({
        requestId,
        rating: overall,
        ratingSpeed: speed || undefined,
        ratingQuality: quality || undefined,
        ratingProfessionalism: professionalism || undefined,
        comment: comment.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['ratings', 'provider'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'customer'] });
      setSubmitted(true);
    } catch (e) {
      setError((e as Error).message ?? t('error.network'));
    } finally {
      setSubmitting(false);
    }
  }, [requestId, overall, speed, quality, professionalism, comment, canSubmit, submitting]);

  if (submitted) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
        <AppHeader title={t('customer.ratings')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} rightIcon="none" />
        <View style={[styles.thanksCard, { backgroundColor: themeColors.surface }]}>
          <View style={styles.thanksIconWrap}>
            <MaterialCommunityIcons name="check-circle" size={64} color={colors.success} />
          </View>
          <AppText variant="title3" weight="bold" style={[styles.thanksTitle, { color: themeColors.text }]}>
            {t('rating.thanksTitle')}
          </AppText>
          <AppText variant="body" style={[styles.thanksSubtitle, { color: themeColors.textSecondary }]}>
            {t('rating.thanksSubtitle')}
          </AppText>
          <Button
            title={t('rating.backToRequests')}
            onPress={() => navigation.navigate('RequestHistory')}
            style={styles.thanksBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!requestId) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
        <AppHeader title={t('customer.ratings')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} rightIcon="none" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator>
          <View style={[styles.empty, { backgroundColor: themeColors.surface }]}>
            <MaterialCommunityIcons name="star-outline" size={56} color={colors.textMuted} />
            <AppText variant="title3" weight="semibold" style={[styles.emptyTitle, { color: themeColors.text }]}>
              {t('customer.ratingsEmpty')}
            </AppText>
            <AppText variant="body" style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
              {t('customer.ratingsEmptySubtitle')}
            </AppText>
            <Button title={t('request.historyTitle')} onPress={() => navigation.navigate('RequestHistory')} variant="outline" style={styles.emptyBtn} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <AppHeader title={t('rating.rateRequest')} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} rightIcon="none" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled">
        {providerName ? (
          <AppText variant="callout" style={[styles.providerHint, { color: themeColors.textSecondary }]}>
            {t('rating.forProvider')}: {providerName}
          </AppText>
        ) : null}
        <View style={[styles.formCard, { backgroundColor: themeColors.surface }]}>
          <StarRatingRow label={t('rating.overall')} value={overall} onChange={setOverall} disabled={submitting} />
          <StarRatingRow label={t('rating.speed')} value={speed} onChange={setSpeed} disabled={submitting} />
          <StarRatingRow label={t('rating.quality')} value={quality} onChange={setQuality} disabled={submitting} />
          <StarRatingRow label={t('rating.professionalism')} value={professionalism} onChange={setProfessionalism} disabled={submitting} />
          <View style={styles.commentRow}>
            <AppText variant="callout" style={[styles.commentLabel, { color: themeColors.text }]}>
              {t('rating.commentOptional')}
            </AppText>
            <TextInput
              style={[styles.commentInput, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
              placeholder={t('rating.commentPlaceholder')}
              placeholderTextColor={themeColors.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              editable={!submitting}
            />
          </View>
          {error ? (
            <AppText variant="caption" style={styles.errorText}>{error}</AppText>
          ) : null}
          <Button
            title={submitting ? t('common.sending') ?? 'Sending…' : t('rating.submit')}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            loading={submitting}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxxl },
  providerHint: { marginBottom: spacing.sm },
  formCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  commentRow: { marginTop: spacing.sm, marginBottom: spacing.md },
  commentLabel: { marginBottom: spacing.xs },
  commentInput: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    minHeight: 88,
    textAlignVertical: 'top',
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
  },
  errorText: { color: colors.error, marginBottom: spacing.sm },
  submitBtn: { marginTop: spacing.sm },
  thanksCard: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thanksIconWrap: { marginBottom: spacing.lg },
  thanksTitle: { textAlign: 'center', marginBottom: spacing.xs },
  thanksSubtitle: { textAlign: 'center', marginBottom: spacing.lg },
  thanksBtn: { minWidth: 200 },
  empty: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: { marginTop: spacing.md, marginBottom: spacing.xs },
  emptySubtitle: { textAlign: 'center', marginBottom: spacing.lg },
  emptyBtn: { minWidth: 200 },
});
