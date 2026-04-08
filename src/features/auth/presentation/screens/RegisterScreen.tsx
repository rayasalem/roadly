/**
 * Register — مثل التصميم المرسل: قسم علوي داكن + موجة، نموذج أبيض، "Or continue with" + أيقونات اجتماعية.
 * شعارنا سيارات: أيقونة سيارة في الهيدر.
 */
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { t } from '../../../../shared/i18n/t';
import { useLocaleStore } from '../../../../store/localeStore';
import { backChevronForLocale } from '../../../../shared/i18n/rtlUtils';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii } from '../../../../shared/theme';
import { useUIStore } from '../../../../store/uiStore';
import { useAuthStore } from '../../../../store/authStore';
import { register } from '../../data/authApi';
import { ROLES, ROLE_LABELS, type Role } from '../../../../shared/constants/roles';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export function RegisterScreen({ navigation }: Props) {
  const toast = useUIStore((s) => s.toast);
  const showLoader = useUIStore((s) => s.showLoader);
  const hideLoader = useUIStore((s) => s.hideLoader);
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(ROLES.USER);
  const locale = useLocaleStore((s) => s.locale);
  const backIcon = backChevronForLocale(locale);

  const onSubmit = useCallback(async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError(t('auth.error.requiredAll'));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t('auth.emailInvalid'));
      return;
    }
    showLoader();
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      await setSession({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken ?? null,
      });
      toast({ type: 'success', message: t('auth.register.success') });
      navigation.replace('App');
    } catch (e) {
      const message = e instanceof Error ? e.message : t('auth.error.generic');
      setError(message);
      toast({ type: 'error', message });
    } finally {
      hideLoader();
    }
  }, [email, hideLoader, name, navigation, password, setSession, showLoader, toast]);

  const emailValid = isValidEmail(email);

  return (
    <View style={styles.container}>
      <View style={styles.topDark}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <MaterialCommunityIcons name={backIcon} size={28} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.carIconWrap}>
          <MaterialCommunityIcons name="car-side" size={32} color={colors.primary} />
        </View>
      </View>

      <View style={styles.whiteSheet}>
        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <AppText variant="title1" style={styles.title}>{t('auth.register.title')}</AppText>
                <MaterialCommunityIcons name="car-side" size={22} color={colors.primary} />
              </View>
              <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>{t('auth.createNewAccount')}</AppText>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="account-outline" size={20} color={colors.primaryDark} />
                <TextInput
                  testID="register-name"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('auth.register.placeholder.name')}
                  placeholderTextColor={colors.textMuted}
                  autoComplete="name"
                  textContentType="name"
                />
              </View>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="email-outline" size={20} color={colors.primaryDark} />
                <TextInput
                  testID="register-email"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('auth.login.placeholder.email')}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
                {emailValid ? (
                  <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
                ) : null}
              </View>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={colors.primaryDark} />
                <TextInput
                  testID="register-password"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('auth.login.placeholder.password')}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  textContentType="newPassword"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={styles.eyeBtn}
                  accessibilityLabel={showPassword ? t('auth.password.hide') : t('auth.password.show')}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.primaryDark}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.roleRow}>
                {[ROLES.USER, ROLES.MECHANIC, ROLES.MECHANIC_TOW, ROLES.CAR_RENTAL, ROLES.INSURANCE].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, role === r && styles.roleChipActive]}
                    onPress={() => setRole(r)}
                    accessibilityRole="button"
                    accessibilityLabel={ROLE_LABELS[r]}
                  >
                    <MaterialCommunityIcons
                      name={
                        r === ROLES.USER
                          ? 'account-outline'
                          : r === ROLES.CAR_RENTAL
                          ? 'car-estate'
                          : r === ROLES.MECHANIC_TOW
                          ? 'tow-truck'
                          : r === ROLES.INSURANCE
                          ? 'shield-check-outline'
                          : 'wrench-outline'
                      }
                      size={16}
                      color={role === r ? colors.primaryContrast : colors.primaryDark}
                    />
                    <AppText
                      variant="caption"
                      weight="medium"
                      style={role === r ? styles.roleChipTextActive : styles.roleChipText}
                    >
                      {ROLE_LABELS[r]}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
              {error ? <AppText testID="register-error" variant="callout" style={styles.errorText}>{error}</AppText> : null}

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.rememberRow} onPress={() => {}} accessibilityRole="checkbox">
                  <MaterialCommunityIcons name="checkbox-marked-outline" size={22} color={colors.primary} />
                  <AppText variant="callout" style={styles.rememberText}>{t('auth.rememberMe')}</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toast({ type: 'info', message: t('auth.login.forgotComingSoon') })} accessibilityRole="button">
                  <AppText variant="callout" style={styles.forgotLink}>{t('auth.login.forgot')}</AppText>
                </TouchableOpacity>
              </View>

              <Button
                testID="register-submit"
                title={t('auth.register.cta')}
                onPress={onSubmit}
                disabled={!name.trim() || !email.trim() || !password}
                fullWidth
                size="lg"
                style={styles.registerBtn}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <AppText variant="caption" color={colors.textMuted} style={styles.dividerText}>{t('auth.orContinueWith')}</AppText>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} onPress={() => toast({ type: 'info', message: t('common.comingSoon') ?? 'Coming soon.' })} accessibilityRole="button" accessibilityLabel="Facebook">
                <MaterialCommunityIcons name="facebook" size={26} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={() => toast({ type: 'info', message: t('common.comingSoon') ?? 'Coming soon.' })} accessibilityRole="button" accessibilityLabel="Google">
                <MaterialCommunityIcons name="google" size={26} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={() => toast({ type: 'info', message: t('common.comingSoon') ?? 'Coming soon.' })} accessibilityRole="button" accessibilityLabel="Apple">
                <MaterialCommunityIcons name="apple" size={26} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <AppText variant="body" style={styles.footerText}>{t('auth.hasAccount')}</AppText>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel={t('auth.login.title')}
              >
                <AppText variant="callout" weight="semibold" style={styles.footerLink}>{t('auth.login.title')}</AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.authTopDark,
  },
  topDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    minHeight: 56,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carIconWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    overflow: 'hidden',
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.authTopDark,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.lg,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  roleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleChipText: {
    color: colors.text,
  },
  roleChipTextActive: {
    color: colors.primaryContrast,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.authInputBg,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rememberText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  forgotLink: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  registerBtn: {
    marginTop: spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textMuted,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
    minHeight: 44,
  },
  footerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  footerLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.primary,
  },
});
