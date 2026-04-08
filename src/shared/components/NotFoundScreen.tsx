import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { spacing, typography, radii } from '../theme';
import { AppText } from './AppText';
import { t } from '../i18n/t';

/**
 * Generic 404 screen used as a fallback when navigation points to an unknown route.
 * Must never crash and must always render something.
 */
export function NotFoundScreen() {
  // Avoid hard typing: this screen is injected into multiple role stacks.
  const navigation = useNavigation<any>();

  const goHomeLabel = useMemo(() => t('notFound.goHome'), []);

  const onGoHome = () => {
    try {
      // Try to navigate to common "home" destinations if they exist in the current stack.
      const state = navigation?.getState?.();
      const routeNames: string[] = state?.routeNames ?? [];
      if (routeNames.includes('Map')) return navigation.navigate('Map');
      if (routeNames.includes('InsuranceDashboard')) return navigation.navigate('InsuranceDashboard');
      if (routeNames.includes('ProviderDashboard')) return navigation.navigate('ProviderDashboard');
      if (routeNames.includes('AdminDashboard')) return navigation.navigate('AdminDashboard');
      if (routeNames.includes('Home')) return navigation.navigate('Home');
      if (navigation?.canGoBack?.()) return navigation.goBack();
      return navigation?.reset?.({ index: 0, routes: [{ name: routeNames[0] ?? 'Map' }] });
    } catch {
      // last resort: nothing (still keep UI rendered)
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('notFound.title')}</Text>
      <AppText variant="body" color={colors.textSecondary} center style={styles.subtitle}>
        {t('notFound.subtitle')}
      </AppText>
      <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={onGoHome}>
        <Text style={styles.buttonText}>{goHomeLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.title2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 520,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  buttonText: {
    fontFamily: typography.fontFamily.semibold,
    color: colors.primaryContrast,
    fontSize: typography.fontSize.md,
  },
});

