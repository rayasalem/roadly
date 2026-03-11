/**
 * Launch — dark hero, headline, two CTAs. Design system spacing, radii, typography.
 * Buttons use scale press feedback (lightweight RN Animated).
 */
import React, { useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii } from '../../../../shared/theme';
import { springPress, PRESS_SCALE } from '../../../../shared/utils/animations';
import { t } from '../../../../shared/i18n/t';

type Props = NativeStackScreenProps<RootStackParamList, 'Launch'>;

export function LaunchScreen({ navigation }: Props) {
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;

  const onPressIn = (s: Animated.Value) => {
    Animated.spring(s, { toValue: PRESS_SCALE, ...springPress }).start();
  };
  const onPressOut = (s: Animated.Value) => {
    Animated.spring(s, { toValue: 1, ...springPress }).start();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topSection}>
          <View style={styles.carAccent}>
            <MaterialCommunityIcons
              name="car-side"
              size={120}
              color={colors.primaryContrast}
              style={styles.carIcon}
            />
          </View>
          <Text style={styles.headline} accessibilityRole="header">
            {t('auth.welcomeHeadline')}
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <Animated.View style={{ transform: [{ scale: scale1 }] }}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.replace('Login')}
              onPressIn={() => onPressIn(scale1)}
              onPressOut={() => onPressOut(scale1)}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel={t('auth.signIn')}
            >
              <Text style={styles.primaryBtnText}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: scale2 }] }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Register')}
              onPressIn={() => onPressIn(scale2)}
              onPressOut={() => onPressOut(scale2)}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel={t('auth.createAccount')}
            >
              <Text style={styles.secondaryBtnText}>{t('auth.createAccount')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.authTopDark,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  carAccent: {
    position: 'absolute',
    top: spacing.xxl,
    right: -20,
    opacity: 0.5,
  },
  carIcon: {
    opacity: 0.15,
  },
  headline: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.presets.display.fontSize,
    lineHeight: typography.presets.display.lineHeight,
    color: colors.primaryContrast,
    maxWidth: 280,
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  primaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: colors.primaryContrast,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.primaryContrast,
  },
  secondaryBtn: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryBtnText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    color: colors.primaryContrast,
  },
});
