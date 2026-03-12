/**
 * Welcome — marketing copy, Sign Up / Login CTAs. Green theme, card layout.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { Button } from '../../../../shared/components/Button';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { t } from '../../../../shared/i18n/t';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenWrapper backgroundColor={colors.authBackground} padded={false} contentStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.card}>
          <Text style={styles.brand} accessibilityRole="header">
            {t('app.name')}
          </Text>
          <Text style={styles.headline}>{t('welcome.headline')}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

          <View style={styles.actions}>
            <Button
              title={t('welcome.signUp')}
              onPress={() => navigation.navigate('Register')}
              fullWidth
              size="lg"
              style={styles.btnPrimary}
            />
            <Button
              title={t('welcome.login')}
              variant="outline"
              onPress={() => navigation.navigate('Login')}
              fullWidth
              size="lg"
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    ...shadows.md,
  },
  brand: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.presets.display.fontSize,
    lineHeight: typography.presets.display.lineHeight,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  headline: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.title.fontSize,
    lineHeight: typography.presets.title.lineHeight,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    lineHeight: typography.presets.body.lineHeight,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
  btnPrimary: {
    marginBottom: 0,
  },
  btn: {
    marginBottom: 0,
  },
});
