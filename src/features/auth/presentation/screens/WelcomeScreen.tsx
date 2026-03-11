/**
 * Welcome — route to Login or Register. Card uses design system radii and shadows.
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
          <Text style={styles.subtitle}>{t('auth.welcome.subtitle')}</Text>

          <View style={styles.actions}>
            <Button
              title={t('auth.login.title')}
              onPress={() => navigation.navigate('Login')}
              fullWidth
              size="lg"
              style={styles.btn}
            />
            <Button
              title={t('auth.register.title')}
              variant="outline"
              onPress={() => navigation.navigate('Register')}
              fullWidth
              size="lg"
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
  btn: {
    marginBottom: 0,
  },
});
