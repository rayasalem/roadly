/**
 * Onboarding: 3 slides with engaging copy for customers (mechanics, tow, rentals).
 * Shown once after Launch; then Welcome / Login / Register.
 */
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { arrowForwardForLocale } from '../../../../shared/i18n/rtlUtils';
import { useLocaleStore } from '../../../../store/localeStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const SLIDES = [
  { key: '1', icon: 'wrench' as const, titleKey: 'onboarding.mechanic.title' as const, subtitleKey: 'onboarding.mechanic.subtitle' as const },
  { key: '2', icon: 'tow-truck' as const, titleKey: 'onboarding.tow.title' as const, subtitleKey: 'onboarding.tow.subtitle' as const },
  { key: '3', icon: 'car-estate' as const, titleKey: 'onboarding.rental.title' as const, subtitleKey: 'onboarding.rental.subtitle' as const },
];

export function OnboardingScreen({ navigation }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const arrowForward = arrowForwardForLocale(locale);
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onNext = () => {
    if (index < SLIDES.length - 1) setIndex((i) => i + 1);
    else navigation.replace('Welcome');
  };

  const renderItem = ({ item, index: i }: { item: typeof SLIDES[0]; index: number }) => (
    <View style={styles.slide}>
      <View style={[styles.iconWrap, { backgroundColor: colors.greenLight }]}>
        <MaterialCommunityIcons name={item.icon} size={64} color={colors.primary} />
      </View>
      <Text style={styles.title}>{t(item.titleKey)}</Text>
      <Text style={styles.subtitle}>{t(item.subtitleKey)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        />
        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === index ? colors.primary : colors.border },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>
              {index < SLIDES.length - 1 ? t('onboarding.cta.next') : t('onboarding.cta.getStarted')}
            </Text>
            <MaterialCommunityIcons name={arrowForward} size={22} color={colors.primaryContrast} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  safe: { flex: 1 },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg * 2,
    alignItems: 'center',
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  nextBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
    color: colors.primaryContrast,
  },
});
