/**
 * Ride-style "Start Your Journey": header, pickup/destination inputs,
 * two dark teal action cards (Nearest Locations, Saved Places), Nearby Riders list, bottom nav.
 */
import React, { useRef, useEffect, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import { safeNavigateToSettings } from '../../../../navigation/navigationRef';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { t } from '../../../../shared/i18n/t';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'Home'>;

const NEARBY_RIDERS = [
  { id: '1', name: 'خدمة طرق طريق سريع', distance: 'على بُعد ٨٠ كم', rating: 5 },
  { id: '2', name: 'ورشة فاست فيكس', distance: 'على بُعد ١٫٢ كم', rating: 4.8 },
  { id: '3', name: 'ونش رودلي ٢٤/٧', distance: 'على بُعد ٢٫٣ كم', rating: 4.6 },
];

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  const useNativeDriver = Platform.OS !== 'web';
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver, speed: 24, bounciness: 7 }),
    ]).start();
  }, [fade, translateY, useNativeDriver]);

  const handleTab = (tab: NavTabId) => {
    if (tab === 'Home') navigation.navigate('Map');
    else if (tab === 'Profile') navigation.navigate('Profile');
    else if (tab === 'Chat') navigation.navigate('Chat');
    else if (tab === 'Notifications') navigation.navigate('Notifications');
    else if (tab === 'Settings') safeNavigateToSettings(navigation);
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title={t('home.startJourney')}
        rightIcon="settings"
        onProfile={() => safeNavigateToSettings(navigation)}
      />
      <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY }] }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Pickup / Destination inputs */}
          <View style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={t('home.pickupPlaceholder')}
                placeholderTextColor={colors.textMuted}
                editable={false}
              />
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
            </View>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={t('home.destinationPlaceholder')}
                placeholderTextColor={colors.textMuted}
                editable={false}
              />
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
            </View>
          </View>

          {/* Quick Request: 1 tap from home */}
          <TouchableOpacity
            style={styles.quickRequest}
            onPress={() => navigation.navigate('Request', { serviceType: 'mechanic' })}
            activeOpacity={0.9}
            testID="home-quick-request"
          >
            <View style={styles.quickRequestIcon}>
              <MaterialCommunityIcons name="flash" size={20} color={colors.primaryContrast} />
            </View>
            <View style={styles.quickRequestTextWrap}>
              <Text style={styles.quickRequestTitle}>{t('home.requestHelpNow') ?? t('map.requestService')}</Text>
              <Text style={styles.quickRequestSubtitle}>{t('request.confirmHint') ?? ''}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.primaryContrast} />
          </TouchableOpacity>

          {/* Service cards: mechanic / tow / rental */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Request', { serviceType: 'mechanic' })}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons name="wrench" size={28} color={colors.primaryContrast} />
              <Text style={styles.serviceCardTitle}>{t('services.mechanic') ?? 'Mechanic'}</Text>
              <Text style={styles.serviceCardSubtitle}>{t('home.services.mechanic.subtitle')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Request', { serviceType: 'tow' })}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons name="tow-truck" size={28} color={colors.primaryContrast} />
              <Text style={styles.serviceCardTitle}>{t('services.tow') ?? 'Tow'}</Text>
              <Text style={styles.serviceCardSubtitle}>{t('home.services.tow.subtitle')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Request', { serviceType: 'rental' })}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons name="car-estate" size={28} color={colors.primaryContrast} />
              <Text style={styles.serviceCardTitle}>{t('services.rental') ?? 'Rental'}</Text>
              <Text style={styles.serviceCardSubtitle}>{t('home.services.rental.subtitle')}</Text>
            </TouchableOpacity>
          </View>

          {/* Nearby Riders */}
          <Text style={styles.sectionTitle}>{t('home.nearbyRiders')}</Text>
          {NEARBY_RIDERS.map((r) => (
            <RiderCard
              key={r.id}
              name={r.name}
              distance={r.distance}
              rating={r.rating}
              onPress={() => navigation.navigate('Request', { serviceType: 'mechanic' })}
            />
          ))}
        </ScrollView>
      </Animated.View>
      <BottomNavBar activeTab="Home" onSelect={handleTab} />
    </ScreenWrapper>
  );
}

type RiderCardProps = {
  name: string;
  distance: string;
  rating: number;
  onPress: () => void;
};

const useNativeDriverWebSafe = Platform.OS !== 'web';

const RiderCard = memo(function RiderCard({ name, distance, rating, onPress }: RiderCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: useNativeDriverWebSafe, speed: 28, bounciness: 6 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: useNativeDriverWebSafe, speed: 28, bounciness: 6 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.riderCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.riderAvatar}>
          <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
        </View>
        <View style={styles.riderInfo}>
          <Text style={styles.riderName} numberOfLines={1}>{name}</Text>
          <View style={styles.riderMeta}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <MaterialCommunityIcons
                  key={i}
                  name="star"
                  size={14}
                  color={i <= rating ? colors.primary : colors.border}
                />
              ))}
            </View>
            <Text style={styles.riderDistance}>{distance}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.riderCta} onPress={onPress}>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.primaryContrast} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

const BOTTOM_NAV_HEIGHT = 72;
const EXTRA_SCROLL_PADDING = 24;

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: BOTTOM_NAV_HEIGHT + EXTRA_SCROLL_PADDING,
    flexGrow: 1,
  },
  quickRequest: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
    ...shadows.sm,
  },
  quickRequestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickRequestTextWrap: {
    flex: 1,
  },
  quickRequestTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.primaryContrast,
    marginBottom: spacing.xs / 2,
  },
  quickRequestSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: 'rgba(255,255,255,0.9)',
  },
  inputRow: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
    paddingVertical: 0,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: colors.navDark,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 120,
    ...shadows.sm,
  },
  serviceCardTitle: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.primaryContrast,
  },
  serviceCardSubtitle: {
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: 'rgba(255,255,255,0.85)',
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.titleSmall.fontSize,
    color: colors.text,
    marginBottom: spacing.md,
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.xl,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  riderInfo: {
    flex: 1,
    minWidth: 0,
  },
  riderName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
  },
  riderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  riderDistance: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
  },
  riderCta: {
    width: 44,
    height: 44,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
