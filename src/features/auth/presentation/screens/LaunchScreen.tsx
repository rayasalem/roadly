/**
 * Launch screen — shown once at app start.
 * Simple green background with logo, then automatically navigates to Login.
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

type Props = NativeStackScreenProps<RootStackParamList, 'Launch'>;

export function LaunchScreen({ navigation }: Props) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Login');
    }, 1200);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.logo}>{t('app.name')}</Text>
        <ActivityIndicator size="small" color={colors.primaryDark} style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.authBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  logo: {
    color: colors.primaryDark,
    fontSize: typography.fontSize.title1,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  spinner: {
    marginTop: spacing.md,
  },
});

