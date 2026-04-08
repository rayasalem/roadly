/**
 * Unified empty state: icon, title, subtitle, optional primary CTA.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme';

export type DashboardEmptyStateProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle?: string;
  ctaTitle?: string;
  onCtaPress?: () => void;
  secondaryCtaTitle?: string;
  onSecondaryCtaPress?: () => void;
  iconColor?: string;
  testID?: string;
  style?: object;
};

function DashboardEmptyStateInner({
  icon,
  title,
  subtitle,
  ctaTitle,
  onCtaPress,
  secondaryCtaTitle,
  onSecondaryCtaPress,
  iconColor = colors.textMuted,
  testID,
  style,
}: DashboardEmptyStateProps) {
  return (
    <View style={[styles.wrap, style]} testID={testID}>
      <MaterialCommunityIcons name={icon} size={56} color={iconColor} />
      <AppText variant="title3" center style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="body" color={colors.textSecondary} center style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
      {ctaTitle && onCtaPress ? (
        <Button title={ctaTitle} onPress={onCtaPress} fullWidth size="lg" style={styles.cta} />
      ) : null}
      {secondaryCtaTitle && onSecondaryCtaPress ? (
        <Button
          title={secondaryCtaTitle}
          onPress={onSecondaryCtaPress}
          variant="outline"
          fullWidth
          size="lg"
          style={styles.ctaSecondary}
        />
      ) : null}
    </View>
  );
}

export const DashboardEmptyState = memo(DashboardEmptyStateInner);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: { marginTop: spacing.md },
  subtitle: { marginTop: spacing.sm, maxWidth: 320 },
  cta: { marginTop: spacing.lg, maxWidth: 360, alignSelf: 'stretch' },
  ctaSecondary: { marginTop: spacing.sm, maxWidth: 360, alignSelf: 'stretch' },
});
