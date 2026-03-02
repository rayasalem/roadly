/**
 * Register — single purpose: create account.
 * Same premium layout as Login: title, subtitle, form, primary CTA, link to Login.
 */
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { t } from '../../../../shared/i18n/t';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography } from '../../../../shared/theme';
import { useUIStore } from '../../../../store/uiStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const toast = useUIStore((s) => s.toast);
  const showLoader = useUIStore((s) => s.showLoader);
  const hideLoader = useUIStore((s) => s.hideLoader);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError(t('auth.error.requiredAll'));
      return;
    }
    showLoader();
    try {
      await new Promise((r) => setTimeout(r, 450));
      toast({ type: 'success', message: t('common.notImplemented') });
      navigation.replace('Home');
    } catch {
      setError(t('auth.error.generic'));
    } finally {
      hideLoader();
    }
  }, [name, email, password, hideLoader, navigation, showLoader, toast]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.brand} accessibilityRole="header">
            {t('app.name')}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">
            {t('auth.register.title')}
          </Text>
          <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>

          <View style={styles.form}>
            <Input
              label={t('auth.register.placeholder.name')}
              value={name}
              onChangeText={setName}
              placeholder={t('auth.register.placeholder.name')}
              autoComplete="name"
              textContentType="name"
              leftAdornment={
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />
            <Input
              label={t('auth.login.placeholder.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.login.placeholder.email')}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              hint="Email will be used to contact you."
              leftAdornment={
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />
            <Input
              label={t('auth.login.placeholder.password')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.login.placeholder.password')}
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              error={error ?? undefined}
              leftAdornment={
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />

            <Button
              title={t('auth.register.cta')}
              onPress={onSubmit}
              disabled={!name.trim() || !email.trim() || !password}
              fullWidth
              size="lg"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.hasAccount')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel={t('auth.login.title')}
          >
            <Text style={styles.linkPrimary}>{t('auth.login.title')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.authBackground,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    justifyContent: 'center',
  },
  hero: {
    marginBottom: spacing.xxl,
  },
  brand: {
    color: colors.primary,
    fontSize: typography.fontSize.title1,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
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
  title: {
    color: colors.text,
    fontSize: typography.fontSize.title1,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.callout,
    lineHeight: typography.fontSize.callout * typography.lineHeight.normal,
    marginBottom: spacing.xl,
  },
  form: {
    gap: 0,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
    minHeight: 44,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.callout,
  },
  linkPrimary: {
    color: colors.primary,
    fontSize: typography.fontSize.callout,
    fontWeight: typography.fontWeight.semibold,
  },
});
