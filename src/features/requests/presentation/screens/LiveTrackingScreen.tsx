/**
 * Live Tracking: active request ETA, provider name/location, status. Customer-only.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { useTheme, spacing, typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import type { CustomerStackParamList } from '../../../../navigation/CustomerStack';
import { useRequest } from '../../hooks/useRequest';

type Route = RouteProp<CustomerStackParamList, 'LiveTracking'>;

function statusLabel(status: string): string {
  if (status === 'pending') return t('request.status.pending') ?? 'Pending';
  if (status === 'accepted') return t('request.status.accepted') ?? 'Accepted';
  if (status === 'on_the_way') return t('request.status.on_the_way') ?? 'On the way';
  if (status === 'completed') return t('request.status.completed') ?? 'Completed';
  if (status === 'cancelled') return t('request.status.cancelled') ?? 'Cancelled';
  return status;
}

export function LiveTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const requestId = route.params?.requestId ?? null;
  const { data: request, isLoading } = useRequest(requestId);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <AppHeader
        title={t('customer.liveTracking')}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        rightIcon="none"
      />
      <View style={styles.content}>
        {!requestId ? (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('request.none') ?? 'No active request.'}</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Map')} activeOpacity={0.85}>
              <Text style={[styles.btnText, { color: colors.primaryContrast }]}>{t('map.openMap')}</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading && !request ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : request ? (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="map-marker-path" size={48} color={colors.primary} style={styles.icon} />
            <Text style={[styles.title, { color: colors.text }]}>{t('customer.liveTrackingTitle')}</Text>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('request.status')}: </Text>
              <Text style={[styles.value, { color: colors.text }]}>{statusLabel(request.status)}</Text>
            </View>
            {request.providerName != null && request.providerName !== '' && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('request.provider') ?? 'Provider'}: </Text>
                <Text style={[styles.value, { color: colors.text }]}>{request.providerName}</Text>
              </View>
            )}
            {request.etaMinutes != null && (request.status === 'accepted' || request.status === 'on_the_way') && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('request.eta')}: </Text>
                <Text style={[styles.value, { color: colors.text }]}>{request.etaMinutes} {t('request.etaMinutes') ?? 'min'}</Text>
              </View>
            )}
            {request.providerLocation && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('request.location') ?? 'Location'}: </Text>
                <Text style={[styles.value, { color: colors.text }]}>{request.providerLocation.latitude.toFixed(4)}, {request.providerLocation.longitude.toFixed(4)}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="map" size={22} color={colors.primaryContrast} />
              <Text style={[styles.btnText, { color: colors.primaryContrast }]}>{t('map.openMap')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('request.none') ?? 'Request not found.'}</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Map')} activeOpacity={0.85}>
              <Text style={[styles.btnText, { color: colors.primaryContrast }]}>{t('map.openMap')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  loader: { marginVertical: spacing.xl },
  card: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
  },
  icon: { marginBottom: spacing.md },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  row: { flexDirection: 'row', marginBottom: spacing.sm, flexWrap: 'wrap' },
  label: { fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.body },
  value: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.body },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  btnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
  },
});
