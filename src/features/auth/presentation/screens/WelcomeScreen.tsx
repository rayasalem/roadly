/**
 * Welcome / Landing — single purpose: route to Login or Register.
 * Premium layout: brand, subtitle, two clear CTAs, balanced spacing.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { Button } from '../../../../shared/components/Button';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { t } from '../../../../shared/i18n/t';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography } from '../../../../shared/theme';

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
    paddingVertical: spacing.xxxl,
    justifyContent: 'center',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  brand: {
    color: colors.text,
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.body,
    lineHeight: typography.fontSize.body * typography.lineHeight.relaxed,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
});
