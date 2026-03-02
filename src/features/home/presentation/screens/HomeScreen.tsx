import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/RootNavigator';
import { Button } from '../../../../shared/components/Button';
import { t, getLocale, setLocale } from '../../../../shared/i18n/t';
import type { Locale } from '../../../../shared/i18n/strings';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { useUIStore } from '../../../../store/uiStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const toast = useUIStore((s) => s.toast);
  const showLoader = useUIStore((s) => s.showLoader);
  const hideLoader = useUIStore((s) => s.hideLoader);

  const [locale, setLocaleState] = useState<Locale>(getLocale());

  // Fade / slide‑up animation for first load
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 24,
        bounciness: 7,
      }),
    ]).start();
  }, [fade, translateY]);

  const onToast = useCallback(() => {
    toast({ type: 'success', message: t('home.toastExample') });
  }, [toast]);

  const onLoader = useCallback(async () => {
    showLoader();
    try {
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      hideLoader();
    }
  }, [hideLoader, showLoader]);

  const toggleLocale = useCallback(() => {
    const next: Locale = locale === 'en' ? 'ar' : 'en';
    setLocale(next);
    setLocaleState(next);
  }, [locale]);

  return (
    <ScreenWrapper>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fade,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingTitle}>{t('home.greeting')}</Text>
            <Text style={styles.greetingSubtitle}>{t('home.subtitle')}</Text>
          </View>
          <TouchableOpacity
            style={styles.langToggle}
            onPress={toggleLocale}
            accessibilityRole="button"
          >
            <Text style={styles.langToggleText}>{t('home.languageToggle')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Services cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.servicesTitle')}</Text>
            <Text style={styles.sectionSubtitle}>{t('home.servicesSubtitle')}</Text>

            <View style={styles.cardsGrid}>
              <ServiceCard
                title={t('home.services.mechanic.title')}
                description={t('home.services.mechanic.subtitle')}
                meta={t('home.services.mechanic.meta')}
                icon="wrench-outline"
                onPress={() => navigation.navigate('Map')}
              />
              <ServiceCard
                title={t('home.services.tow.title')}
                description={t('home.services.tow.subtitle')}
                meta={t('home.services.tow.meta')}
                icon="tow-truck"
                onPress={() => navigation.navigate('Map')}
              />
              <ServiceCard
                title={t('home.services.rental.title')}
                description={t('home.services.rental.subtitle')}
                meta={t('home.services.rental.meta')}
                icon="car-estate"
                onPress={() => navigation.navigate('Map')}
              />
            </View>
          </View>

          {/* Demo actions (toast / loader / map) remain for testing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('common.notImplemented')}</Text>
            <View style={styles.actions}>
              <Button title={t('home.action.toast')} onPress={onToast} />
              <Button title={t('home.action.loader')} variant="outline" onPress={onLoader} />
              <Button title={t('home.action.openMap')} variant="outline" onPress={() => navigation.navigate('Map')} />
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingTitle: {
    fontSize: typography.fontSize.title1,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  greetingSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
  },
  langToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  langToggleText: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
  },
  cardsGrid: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});

type ServiceCardProps = {
  title: string;
  description: string;
  meta: string;
  icon: string;
  onPress: () => void;
};

function ServiceCard({ title, description, meta, icon, onPress }: ServiceCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={serviceStyles.card}
      >
        <View style={serviceStyles.iconWrap}>
          {/* TODO: استبدل بـ MaterialCommunityIcons فعلياً إذا رغبت */}
        </View>
        <Text style={serviceStyles.label}>{title}</Text>
        <Text style={serviceStyles.description}>{description}</Text>
        <Text style={serviceStyles.meta}>{meta}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const serviceStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.sm,
    width: '48%',
    marginBottom: spacing.md,
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
  },
});

