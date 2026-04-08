/**
 * Intentional "coming soon" state for MVP-disabled features (payments, favorites, full support).
 * Greyed card, lock + badge, optional notify CTA — avoids empty or misleading screens.
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, spacing, typography, radii, shadows } from '../theme';
import { t } from '../i18n/t';
import { useUIStore } from '../../store/uiStore';
import { Button } from './Button';

export type MvpFeatureComingSoonVariant = 'full' | 'compact';

export interface MvpFeatureComingSoonProps {
  variant?: MvpFeatureComingSoonVariant;
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  /** Icon inside the greyed dashed preview row (full variant only). */
  previewIconName?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  style?: ViewStyle;
  testID?: string;
}

export function MvpFeatureComingSoon({
  variant = 'full',
  iconName = 'lock-outline',
  previewIconName = 'rocket-launch-outline',
  style,
  testID,
}: MvpFeatureComingSoonProps) {
  const { colors } = useTheme();
  const toast = useUIStore((s) => s.toast);
  const onNotify = useCallback(() => {
    toast({ type: 'success', message: t('mvp.comingSoon.notifyThanks') });
  }, [toast]);

  const badgeText = t('mvp.comingSoon.badge');
  const title = t('mvp.comingSoon.title');
  const description = t('mvp.comingSoon.description');
  const previewLabel = t('mvp.comingSoon.mainActionPreview');

  const mutedIcon = colors.textMuted;
  const cardBorder = colors.border;
  const softSurface = colors.background;

  if (variant === 'compact') {
    return (
      <View
        style={[
          styles.compactRoot,
          {
            backgroundColor: colors.surface,
            borderColor: cardBorder,
            opacity: 0.92,
          },
          style,
        ]}
        testID={testID}
        accessibilityRole="text"
        accessibilityLabel={`${badgeText}. ${title}. ${description}`}
      >
        <View style={styles.compactTopRow}>
          <View style={[styles.compactIconWrap, { backgroundColor: softSurface }]}>
            <MaterialCommunityIcons name={iconName} size={26} color={mutedIcon} />
          </View>
          <View style={styles.compactTextCol}>
            <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={2}>
              {title}
            </Text>
            <Text style={[styles.compactDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {description}
            </Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: softSurface, borderColor: cardBorder }]}>
            <Text style={[styles.badgePillText, { color: colors.textSecondary }]}>{badgeText}</Text>
          </View>
        </View>
        <View style={[styles.compactLockRow, { borderTopColor: cardBorder }]}>
          <MaterialCommunityIcons name="lock-outline" size={16} color={mutedIcon} />
          <Text style={[styles.compactLockHint, { color: colors.textMuted }]}>{previewLabel}</Text>
        </View>
        <Pressable
          onPress={onNotify}
          style={({ pressed }) => [styles.compactNotifyPress, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel={t('mvp.comingSoon.notifyCta')}
        >
          <Text style={[styles.compactNotifyText, { color: colors.primary }]}>{t('mvp.comingSoon.notifyCta')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fullRoot,
        {
          backgroundColor: colors.surface,
          borderColor: cardBorder,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.fullHeaderRow}>
        <View style={[styles.badgePill, { backgroundColor: softSurface, borderColor: cardBorder }]}>
          <MaterialCommunityIcons name="lock-outline" size={14} color={mutedIcon} style={styles.badgeLockIcon} />
          <Text style={[styles.badgePillText, { color: colors.textSecondary }]}>{badgeText}</Text>
        </View>
      </View>

      <View style={[styles.heroIconWrap, { backgroundColor: softSurface }]}>
        <MaterialCommunityIcons name={iconName} size={40} color={mutedIcon} />
      </View>

      <Text style={[styles.fullTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.fullDescription, { color: colors.textSecondary }]}>{description}</Text>

      <View
        style={[styles.previewCard, { borderColor: cardBorder, backgroundColor: softSurface }]}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <MaterialCommunityIcons name={previewIconName} size={22} color={mutedIcon} />
        <Text style={[styles.previewCardText, { color: colors.textMuted }]} numberOfLines={2}>
          {previewLabel}
        </Text>
      </View>

      <Button
        title={t('mvp.comingSoon.notifyCta')}
        variant="outline"
        size="md"
        fullWidth
        onPress={onNotify}
        style={styles.notifyBtn}
        testID={testID ? `${testID}-notify` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullRoot: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.sm,
  },
  fullHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    gap: 4,
  },
  badgeLockIcon: {
    marginRight: -2,
  },
  badgePillText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.caption,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  fullTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.title3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  fullDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: spacing.sm,
    opacity: 0.85,
  },
  previewCardText: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
  },
  notifyBtn: {
    marginTop: 0,
  },
  compactRoot: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.lg,
    ...shadows.sm,
  },
  compactTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  compactIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTextCol: {
    flex: 1,
    minWidth: 0,
  },
  compactTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
    marginBottom: 4,
  },
  compactDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    lineHeight: 18,
  },
  compactLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  compactLockHint: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
  },
  compactNotifyPress: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  compactNotifyText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
});
