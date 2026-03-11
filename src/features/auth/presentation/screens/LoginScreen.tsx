/**
 * Login — مثل التصميم المرسل: قسم علوي داكن + موجة، ثم أبيض مع النموذج.
 * شعارنا سيارات: أيقونة سيارة في الهيدر بدل الورقة.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { t } from '../../../../shared/i18n/t';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii } from '../../../../shared/theme';
import { useUIStore } from '../../../../store/uiStore';
import { useAuthStore, type AuthUser } from '../../../../store/authStore';
import { ROLES, ROLE_LABELS, type Role } from '../../../../shared/constants/roles';
import { APP_ENV } from '../../../../shared/constants/env';
import { login } from '../../data/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const toast = useUIStore((s) => s.toast);
  const showLoader = useUIStore((s) => s.showLoader);
  const hideLoader = useUIStore((s) => s.hideLoader);
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(12)).current;
  const useNativeDriver = Platform.OS !== 'web';
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver }),
      Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver }),
    ]).start();
  }, [fade, slideY, useNativeDriver]);

  const onSubmit = useCallback(async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError(t('auth.error.required'));
      return;
    }
    showLoader();
    try {
      const result = await login({ email: email.trim(), password });
      await setSession({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken ?? null,
      });
      toast({ type: 'success', message: t('auth.login.success') });
      navigation.replace('App');
    } catch (e) {
      const message = e instanceof Error ? e.message : t('auth.error.generic');
      setError(message);
      toast({ type: 'error', message });
    } finally {
      hideLoader();
    }
  }, [email, password, hideLoader, navigation, setSession, showLoader, toast]);

  const handleMockLogin = useCallback(
    async (role: Role) => {
      if (APP_ENV === 'production') return;
      try {
        const user: AuthUser = {
          id: `mock-${role}`,
          name: ROLE_LABELS[role],
          email: `${role}@mock.roadly.dev`,
          role,
        };
        await setSession({
          user,
          accessToken: `mock-access-${role}`,
          refreshToken: null,
        });
        toast({
          type: 'success',
          message: `تم تسجيل الدخول كـ ${ROLE_LABELS[role]} (بيانات تجريبية)`,
        });
        navigation.replace('App');
      } catch (e) {
        toast({
          type: 'error',
          message: e instanceof Error ? e.message : t('auth.error.generic'),
        });
      }
    },
    [navigation, setSession, toast],
  );

  return (
    <View style={styles.container}>
      {/* قسم علوي داكن + زر رجوع + أيقونة سيارة */}
      <View style={styles.topDark}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.carIconWrap}>
          <MaterialCommunityIcons name="car-side" size={32} color={colors.primary} />
        </View>
      </View>

      {/* موجة بيضاء + محتوى النموذج */}
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
            <Animated.View style={[styles.header, { opacity: fade, transform: [{ translateY: slideY }] }]}>
              <View style={styles.titleRow}>
                <AppText variant="title1" style={styles.title}>{t('auth.welcomeBack')}</AppText>
                <MaterialCommunityIcons name="car-side" size={22} color={colors.primary} />
              </View>
              <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>{t('auth.loginToAccount')}</AppText>
            </Animated.View>

            <Animated.View style={[styles.form, { opacity: fade }]}>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="email-outline" size={20} color={colors.primaryDark} />
                <TextInput
                  testID="login-email"
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => { setEmail(text); clearError(); }}
                  placeholder={t('auth.login.placeholder.email')}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={colors.primaryDark} />
                <TextInput
                  testID="login-password"
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => { setPassword(text); clearError(); }}
                  placeholder={t('auth.login.placeholder.password')}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={styles.eyeBtn}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.primaryDark}
                  />
                </TouchableOpacity>
              </View>
              {error ? <AppText testID="login-error" variant="callout" style={styles.errorText}>{error}</AppText> : null}

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.rememberRow} accessibilityRole="checkbox">
                  <MaterialCommunityIcons name="checkbox-marked-outline" size={22} color={colors.primary} />
                  <AppText variant="callout" style={styles.rememberText}>{t('auth.rememberMe')}</AppText>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button">
                  <AppText variant="callout" style={styles.forgotLink}>{t('auth.login.forgot')}</AppText>
                </TouchableOpacity>
              </View>

              <Button
                testID="login-submit"
                title={t('auth.login.title')}
                onPress={onSubmit}
                disabled={!email.trim() || !password}
                fullWidth
                size="lg"
                style={styles.loginBtn}
              />
            </Animated.View>

            <View style={styles.footer}>
              <AppText variant="body" style={styles.footerText}>{t('auth.noAccount')}</AppText>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                accessibilityRole="button"
                accessibilityLabel={t('auth.signUp')}
              >
                <AppText variant="callout" weight="semibold" style={styles.footerLink}>{t('auth.signUp')}</AppText>
              </TouchableOpacity>
            </View>

            {APP_ENV === 'development' && (
              <View style={styles.mockSection}>
                <AppText variant="title3" style={styles.mockTitle}>تجربة الأدوار (بيانات تجريبية)</AppText>
                <View style={styles.mockRow}>
                  {[ROLES.USER, ROLES.MECHANIC, ROLES.MECHANIC_TOW, ROLES.CAR_RENTAL, ROLES.ADMIN].map(
                    (role) => (
                      <TouchableOpacity
                        key={role}
                        style={styles.mockChip}
                        onPress={() => handleMockLogin(role)}
                        accessibilityRole="button"
                        accessibilityLabel={`Login as ${ROLE_LABELS[role]}`}
                      >
                        <MaterialCommunityIcons
                          name={
                            role === ROLES.USER
                              ? 'account'
                              : role === ROLES.CAR_RENTAL
                              ? 'car-estate'
                              : role === ROLES.ADMIN
                              ? 'shield-account'
                              : 'wrench-outline'
                          }
                          size={16}
                          color={colors.primary}
                        />
                        <AppText variant="caption" weight="medium" style={styles.mockChipText}>{ROLE_LABELS[role]}</AppText>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>
            )}
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    minHeight: 56,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.presets.title.fontSize,
    lineHeight: typography.presets.title.lineHeight,
    color: colors.authTopDark,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xl,
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
  loginBtn: {
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xl,
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
  mockSection: {
    marginTop: spacing.xl,
  },
  mockTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  mockRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.background,
  },
  mockChipText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.text,
  },
});
