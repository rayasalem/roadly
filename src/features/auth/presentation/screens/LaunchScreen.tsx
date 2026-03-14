/**
 * Launch — green hero, animated logo, headline, tagline, two CTAs.
 * Green gradient feel (primary dark), marketing copy from i18n.
 */
import React, { useRef, useEffect } from 'react';
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
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: false }),
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: false, speed: 24, bounciness: 8 }),
    ]).start();
  }, [logoOpacity, logoScale]);

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
          <Animated.View style={[styles.carAccent, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <MaterialCommunityIcons
              name="car-side"
              size={120}
              color={colors.primaryContrast}
              style={styles.carIcon}
            />
          </Animated.View>
          <Text style={styles.headline} accessibilityRole="header">
            {t('auth.welcomeHeadline')}
          </Text>
          <Text style={styles.tagline}>{t('splash.tagline1')}</Text>
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
              onPress={() => navigation.navigate('Onboarding')}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
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
  tagline: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    color: 'rgba(255,255,255,0.9)',
    maxWidth: 300,
    marginTop: spacing.md,
  },
  bottomSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primaryContrast,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.primaryDark,
  },
  secondaryBtn: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 2,
    borderColor: colors.primaryContrast,
    borderRadius: radii.lg,
  },
  secondaryBtnText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    color: colors.primaryContrast,
  },
});
