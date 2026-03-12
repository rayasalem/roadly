/**
 * Live Tracking: active request ETA, provider location, map link.
 * Customer-only; shown when a request is in progress.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';

type Route = RouteProp<CustomerStackParamList, 'LiveTracking'>;

export function LiveTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const requestId = route.params?.requestId;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader
        title={t('customer.liveTracking')}
        onBack={() => navigation.goBack()}
        rightIcon="none"
      />
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons name="map-marker-path" size={48} color={colors.primary} style={styles.icon} />
          <Text style={[styles.title, { color: colors.text }]}>{t('customer.liveTrackingTitle')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('customer.liveTrackingSubtitle')}</Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="map" size={22} color={colors.primaryContrast} />
            <Text style={[styles.btnText, { color: colors.primaryContrast }]}>{t('map.openMap')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  card: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
  },
  icon: { marginBottom: spacing.md },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.title3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  btnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
});
