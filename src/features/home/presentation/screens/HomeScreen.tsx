/**
 * Customer Home — modern automotive dashboard:
 * compact map preview, services row, nearby providers, quick actions.
 */
import React, { useRef, useEffect, memo, useMemo, useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  Linking,
  ActivityIndicator,
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
import { Button } from '../../../../shared/components/Button';
import { UberStyleCard } from '../../../../shared/components/UberStyleCard';
import { UberSectionTitle } from '../../../../shared/components/UberSectionTitle';
import { ProviderCard } from '../../../../shared/components/ProviderCard';
import { useUserLocation } from '../../../location/hooks/useUserLocation';
import { haversineDistanceKm } from '../../../location/data/haversine';
import { useNearbyProviders } from '../../../providers/hooks/useNearbyProviders';
import type { Provider } from '../../../providers/domain/types';
import { DEFAULT_MAP_CENTER, toRegion } from '../../../map/utils/mapHelpers';
import { ACTIVE_OPACITY, HIT_SLOP_DEFAULT } from '../../../../shared/constants/ux';

type Nav = NativeStackNavigationProp<CustomerStackParamList, 'Home'>;

const MAP_HEIGHT = Math.round(Dimensions.get('window').height * 0.38);

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const { coords, isLoading: isLocating, error: locationError, fetchLocation } = useUserLocation();

  const center = coords ?? DEFAULT_MAP_CENTER;
  const region = useMemo(() => toRegion(center), [center]);

  const nearbyParams = useMemo(
    () =>
      coords
        ? {
            latitude: coords.latitude,
            longitude: coords.longitude,
            radiusKm: 10,
            availableOnly: true,
            role: undefined,
            page: 1,
            limit: 10,
          }
        : null,
    [coords],
  );
  const {
    data: nearbyData,
    isLoading: isLoadingProviders,
  } = useNearbyProviders(nearbyParams, true, false);
  const nearbyProviders = (nearbyData?.items ?? []) as Provider[];

  const useNativeDriver = Platform.OS !== 'web';
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver, speed: 24, bounciness: 7 }),
    ]).start();
  }, [fade, translateY, useNativeDriver]);

  useEffect(() => {
    if (!coords && !locationError) void fetchLocation();
  }, [coords, locationError, fetchLocation]);

  const handleTab = useCallback((tab: NavTabId) => {
    if (tab === 'Home') navigation.navigate('Map');
    else if (tab === 'Profile') navigation.navigate('Profile');
    else if (tab === 'Chat') navigation.navigate('Chat');
    else if (tab === 'Notifications') navigation.navigate('Notifications');
    else if (tab === 'Settings') safeNavigateToSettings(navigation);
  }, [navigation]);

  const handleViewProfile = useCallback(() => navigation.navigate('Profile'), [navigation]);
  const onRequestProvider = useCallback((p: Provider) => {
    const serviceType = p.role === 'car_rental' ? 'rental' : p.role === 'mechanic_tow' ? 'tow' : 'mechanic';
    navigation.navigate('Request', { serviceType, providerId: p.id });
  }, [navigation]);

  const [selectedServiceType, setSelectedServiceType] = useState<'mechanic' | 'tow' | 'rental' | null>(null);

  return (
    <ScreenWrapper bottomNav={<BottomNavBar activeTab="Home" onSelect={handleTab} dark />}>
      <AppHeader
        title={t('home.startJourney')}
        centerLogo
        dark
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
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
          {/* Uber-style: Hero headline */}
          <View style={[styles.section, styles.sectionFirst]}>
            <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
          </View>

          {/* Uber-style: Single request card (Pickup + Service type) */}
          <View style={[styles.section, styles.uberRequestCardWrap]}>
            <UberStyleCard
              rows={[
                {
                  label: t('home.pickupLabel'),
                  value: coords
                    ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                    : (t('request.location') ?? 'Location') + '…',
                  isOrigin: true,
                },
                {
                  label: t('home.serviceTypeLabel'),
                  value: selectedServiceType
                    ? (selectedServiceType === 'mechanic'
                        ? (t('services.mechanic') ?? 'Mechanic')
                        : selectedServiceType === 'tow'
                        ? (t('services.tow') ?? 'Tow')
                        : (t('services.rental') ?? 'Rental'))
                    : (t('map.filter.all') ?? 'All'),
                  isOrigin: false,
                  onPress: () => navigation.navigate('Map'),
                  rightIcon: 'chevron-right',
                },
              ]}
              showDividers
            />
            <Button
              title={t('home.ctaSeePrices')}
              variant="uber"
              size="lg"
              fullWidth
              onPress={() => {
                if (selectedServiceType)
                  navigation.navigate('Request', { serviceType: selectedServiceType });
                else navigation.navigate('Map');
              }}
              style={styles.uberCtaBtn}
            />
          </View>

          {/* Section: Map preview (compact) */}
          <View style={[styles.section]}>
            <Text style={styles.sectionTitle}>{t('map.title') ?? 'Map'}</Text>
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              hitSlop={HIT_SLOP_DEFAULT}
              style={styles.mapCard}
              onPress={() => navigation.navigate('Map')}
            >
              <View style={styles.mapHeaderRow}>
                <View style={styles.mapHeaderTitleWrap}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={18} color={colors.primary} />
                  <Text style={styles.mapHeaderTitle}>{t('home.mapPreviewTitle') ?? t('map.title')}</Text>
                </View>
                <View style={styles.mapHeaderPill}>
                  <MaterialCommunityIcons name="map-search-outline" size={16} color={colors.primary} />
                  <Text style={styles.mapHeaderPillText}>
                    {t('home.mapPreviewCta') ?? t('home.action.openMap')}
                  </Text>
                </View>
              </View>
              <View style={styles.mapPreviewWrap}>
                <View style={styles.mapFallback}>
                  <MaterialCommunityIcons name="map" size={24} color={colors.primary} />
                  <Text style={styles.mapOverlayText}>
                    {t('home.mapPreviewSubtitle') ?? 'Open the full map to see nearby providers.'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

          {locationError ? (
            <View style={styles.locationErrorCard}>
              <MaterialCommunityIcons name="map-marker-off-outline" size={32} color={colors.error} />
              <Text style={styles.locationErrorTitle}>
                {t('map.locationDeniedTitle') ?? 'Location needed'}
              </Text>
              <Text style={styles.locationErrorMessage}>
                {locationError.trim() || (t('home.locationError') ?? 'Enable location to see nearby services.')}
              </Text>
              <View style={styles.locationErrorActions}>
                {(Platform.OS === 'ios' || Platform.OS === 'android') && (
                  <Button
                    title={t('map.openSettings') ?? 'Open Settings'}
                    onPress={() => Linking.openSettings()}
                    variant="outline"
                    size="sm"
                    style={styles.locationErrorBtn}
                  />
                )}
                <Button
                  title={t('common.retry') ?? 'Retry'}
                  onPress={() => fetchLocation()}
                  size="sm"
                  style={styles.locationErrorBtn}
                />
              </View>
            </View>
            ) : null}
          </View>

          {/* Section 2: Services */}
          <View style={styles.section}>
            <UberSectionTitle title={t('home.servicesTitle') ?? 'Services'} />
            <View style={styles.sectionTitleSpacer} />
            <View style={styles.serviceRow}>
            <TouchableOpacity
              style={[styles.serviceCard, selectedServiceType === 'mechanic' && styles.serviceCardSelected]}
              activeOpacity={ACTIVE_OPACITY}
              hitSlop={HIT_SLOP_DEFAULT}
              onPress={() => setSelectedServiceType('mechanic')}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: 'rgba(34,197,94,0.08)' }]}>
                <MaterialCommunityIcons name="wrench" size={20} color={colors.primary} />
              </View>
              <Text style={styles.serviceTitle}>
                {t('services.mechanic') ?? 'Mechanic'}
              </Text>
              <Text style={styles.serviceSubtitle}>
                {t('home.services.mechanic.subtitle') ??
                  'Get a mechanic to your location quickly.'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.serviceCard, selectedServiceType === 'tow' && styles.serviceCardSelected]}
              activeOpacity={ACTIVE_OPACITY}
              hitSlop={HIT_SLOP_DEFAULT}
              onPress={() => setSelectedServiceType('tow')}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: 'rgba(34,197,94,0.08)' }]}>
                <MaterialCommunityIcons name="tow-truck" size={20} color={colors.primary} />
              </View>
              <Text style={styles.serviceTitle}>{t('services.tow') ?? 'Tow Truck'}</Text>
              <Text style={styles.serviceSubtitle}>
                {t('home.services.tow.subtitle') ??
                  'Request a tow truck for breakdowns and accidents.'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.serviceCard, selectedServiceType === 'rental' && styles.serviceCardSelected]}
              activeOpacity={ACTIVE_OPACITY}
              hitSlop={HIT_SLOP_DEFAULT}
              onPress={() => setSelectedServiceType('rental')}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: 'rgba(34,197,94,0.08)' }]}>
                <MaterialCommunityIcons name="car-estate" size={20} color={colors.primary} />
              </View>
              <Text style={styles.serviceTitle}>{t('services.rental') ?? 'Car Rental'}</Text>
              <Text style={styles.serviceSubtitle}>
                {t('home.services.rental.subtitle') ??
                  'Rent a car near you for flexible trips.'}
              </Text>
            </TouchableOpacity>
            </View>
          </View>

          {/* Section 3: Promo banner */}
          <View style={styles.section}>
            <View style={styles.promoCard}>
              <View style={styles.promoTextCol}>
                <Text style={styles.promoTitle}>
                  {t('home.promoTitle') ?? 'خدمة الطريق جاهزة في أي وقت'}
                </Text>
                <Text style={styles.promoSubtitle}>
                  {t('home.promoSubtitle') ?? 'اطلب ميكانيكي، ونش أو سيارة إيجار خلال دقائق فقط.'}
                </Text>
                <Button
                  title={t('home.promoCta') ?? 'إنشاء طلب الآن'}
                  onPress={() => navigation.navigate('Request', { serviceType: selectedServiceType ?? 'mechanic' })}
                  size="sm"
                  fullWidth={false}
                  style={styles.promoBtn}
                />
              </View>
              <View style={styles.promoIconWrap}>
                <MaterialCommunityIcons name="car-info" size={40} color={colors.primaryContrast} />
              </View>
            </View>
          </View>

          {/* Section 4: Nearby Providers */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <UberSectionTitle title={t('home.nearbyServicesTitle') ?? 'Services Near You'} />
            </View>
            <TouchableOpacity
              style={styles.sectionLink}
              activeOpacity={ACTIVE_OPACITY}
              hitSlop={HIT_SLOP_DEFAULT}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.sectionLinkText}>
                {t('home.viewOnMap') ?? 'View on map'}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {isLoadingProviders && nearbyProviders.length === 0 ? (
            <View style={styles.nearbyLoading}>
              <ActivityIndicator size="small" color={colors.primary} style={styles.nearbyLoadingSpinner} />
              <Text style={styles.nearbyLoadingText}>
                {t('home.loadingNearby') ?? 'Finding nearby services…'}
              </Text>
            </View>
          ) : nearbyProviders.length === 0 ? (
            <View style={styles.emptyNearby}>
              <MaterialCommunityIcons
                name="map-marker-radius-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text style={styles.emptyNearbyTitle}>
                {t('home.noNearbyTitle') ?? 'No nearby services yet'}
              </Text>
              <Text style={styles.emptyNearbySubtitle}>
                {t('home.noNearbySubtitle') ??
                  'Open the map to search another area or enable location to see providers near you.'}
              </Text>
              <TouchableOpacity
                style={[styles.chipBtn, { borderColor: colors.border }]}
                activeOpacity={ACTIVE_OPACITY}
                hitSlop={HIT_SLOP_DEFAULT}
                onPress={() => {
                  if (!coords) fetchLocation();
                  else navigation.navigate('Map');
                }}
              >
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.chipBtnText}>
                  {t('home.refreshLocation') ?? 'Update location'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chipBtn, styles.chipBtnSecondary, { borderColor: colors.border }]}
                activeOpacity={ACTIVE_OPACITY}
                hitSlop={HIT_SLOP_DEFAULT}
                onPress={() => navigation.navigate('Map')}
              >
                <MaterialCommunityIcons name="map" size={16} color={colors.primary} />
                <Text style={styles.chipBtnText}>{t('home.viewOnMap') ?? 'View on map'}</Text>
              </TouchableOpacity>
            </View>
            ) : (
            nearbyProviders.slice(0, 5).map((p) => {
              const distanceKm = coords && p.location && typeof (p.location as { latitude?: number }).latitude === 'number'
                ? haversineDistanceKm(coords, p.location as { latitude: number; longitude: number })
                : null;
              return (
                <View key={p.id} style={styles.providerCardWrap}>
                  <ProviderCard
                    provider={p}
                    distanceKm={distanceKm}
                    onPress={(provider) => navigation.navigate('Request', { providerId: provider.id, serviceType: provider.role === 'car_rental' ? 'rental' : provider.role === 'mechanic_tow' ? 'tow' : 'mechanic' })}
                    onRequest={onRequestProvider}
                    requestLabel={t('home.requestService') ?? 'Request'}
                  />
                </View>
              );
            })
          )}
          </View>

          {/* Section 5: Quick Actions */}
          <View style={styles.section}>
            <UberSectionTitle title={t('home.quickActionsTitle') ?? 'Quick Actions'} />
            <View style={styles.sectionTitleSpacer} />
            <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickAction}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => navigation.navigate('Map')}
            >
              <MaterialCommunityIcons name="magnify" size={20} color={colors.primary} />
              <Text style={styles.quickActionText}>
                {t('home.searchLocation') ?? 'Search location'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => navigation.navigate('Map')}
            >
              <MaterialCommunityIcons name="map" size={20} color={colors.primary} />
              <Text style={styles.quickActionText}>
                {t('home.openFullMap') ?? 'Open full map'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => navigation.navigate('RequestHistory')}
            >
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.quickActionText}>
                {t('home.myRequests') ?? 'My requests'}
              </Text>
            </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </ScreenWrapper>
  );
}

const BOTTOM_NAV_HEIGHT = 72;
const EXTRA_SCROLL_PADDING = spacing.lg;
const SECTION_SPACING = spacing.lg;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: colors.uberBackground ?? colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: BOTTOM_NAV_HEIGHT + EXTRA_SCROLL_PADDING,
    flexGrow: 1,
    backgroundColor: colors.uberBackground ?? colors.background,
  },
  section: {
    marginTop: SECTION_SPACING,
    marginBottom: 0,
  },
  sectionFirst: {
    marginTop: 0,
  },
  heroTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  uberRequestCardWrap: {
    marginTop: 0,
  },
  uberCtaBtn: {
    marginTop: spacing.md,
  },
  serviceCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  mapCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginTop: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mapHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mapHeaderTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
  },
  mapHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.background,
  },
  mapHeaderPillText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
  },
  mapPreviewWrap: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  mapFallback: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlayChip: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.94)',
    gap: spacing.xs,
  },
  mapOverlayText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
  },
  locationErrorCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    ...shadows.sm,
  },
  locationErrorTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.titleSmall.fontSize,
    color: colors.text,
    marginTop: spacing.sm,
  },
  locationErrorMessage: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  locationErrorActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  locationErrorBtn: {
    minWidth: 120,
  },
  nearbyLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  nearbyLoadingSpinner: {
    marginRight: 0,
  },
  nearbyLoadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    color: colors.textSecondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionTitleSpacer: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  sectionLinkText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.card,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  serviceIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  serviceTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  serviceSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
  },
  emptyNearby: {
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  emptyNearbyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptyNearbySubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  chipBtnText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
    color: colors.primary,
  },
  chipBtnSecondary: {
    marginTop: spacing.sm,
  },
  providerCardWrap: {
    marginBottom: spacing.card,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.card,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  quickActionText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.presets.caption.fontSize,
    color: colors.text,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    ...shadows.md,
  },
  promoTextCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  promoTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.presets.body.fontSize,
    color: colors.primaryContrast,
    marginBottom: spacing.xs,
  },
  promoSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.sm,
  },
  promoBtn: {
    alignSelf: 'flex-start',
    minHeight: 40,
  },
  promoIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
