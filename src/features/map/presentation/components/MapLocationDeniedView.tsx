import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { useTheme, spacing } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

interface MapLocationDeniedViewProps {
  onBack: () => void;
  onRetry: () => void;
  onOpenSettings?: () => void;
  /** Optional specific error message (e.g. "Location permission denied") */
  errorMessage?: string | null;
}

export function MapLocationDeniedView({ onBack, onRetry, onOpenSettings, errorMessage }: MapLocationDeniedViewProps) {
  const { colors } = useTheme();
  const canOpenSettings = Platform.OS === 'ios' || Platform.OS === 'android';
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <AppHeader title={t('map.title')} onBack={onBack} />
        <View style={styles.card}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={56} color={colors.textSecondary} />
          <AppText variant="title1" style={[styles.title, { color: colors.text }]}>{t('map.locationDeniedTitle')}</AppText>
          <AppText variant="body" style={[styles.message, { color: colors.textSecondary }]}>
            {errorMessage && errorMessage.trim() ? errorMessage : t('map.locationDeniedMessage')}
          </AppText>
          <AppText variant="callout" style={[styles.instructions, { color: colors.textMuted }]}>{t('map.locationEnableInstructions')}</AppText>
          <View style={styles.actions}>
            {canOpenSettings && onOpenSettings && (
              <Button title={t('map.openSettings')} onPress={onOpenSettings} variant="outline" style={styles.secondaryBtn} />
            )}
            <Button title={t('common.retry')} onPress={onRetry} style={styles.retryBtn} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: spacing.md },
  card: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  title: { marginTop: spacing.lg, marginBottom: spacing.md, fontSize: 24, lineHeight: 30, textAlign: 'center' },
  message: { textAlign: 'center', marginBottom: spacing.md },
  instructions: { textAlign: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', justifyContent: 'center' },
  secondaryBtn: { marginTop: spacing.sm, minWidth: 160 },
  retryBtn: { marginTop: spacing.sm, minWidth: 200 },
});
