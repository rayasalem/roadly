/**
 * Quick request form: service type dropdown, location (auto-filled, editable),
 * optional preferred time, ETA from nearest provider, Confirm button.
 */
import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { useLocaleStore } from '../../../../store/localeStore';
import { trailingChevronForLocale } from '../../../../shared/i18n/rtlUtils';
import { useDebouncedValue } from '../../../../shared/hooks/useDebouncedValue';
import type { ServiceType } from '../../domain/types';
import type { Provider } from '../../../providers/domain/types';

export const SERVICE_TYPE_OPTIONS: { value: ServiceType; labelKey: string }[] = [
  { value: 'mechanic', labelKey: 'request.types.mechanic' },
  { value: 'tow', labelKey: 'request.types.tow' },
  { value: 'rental', labelKey: 'request.types.rental' },
  { value: 'insurance', labelKey: 'request.types.insurance' },
  { value: 'battery', labelKey: 'request.types.battery' },
  { value: 'tire', labelKey: 'request.types.tire' },
  { value: 'oil_change', labelKey: 'request.types.oil_change' },
];

/** Rough ETA in minutes: base + travel (e.g. 2 min/km). */
export function estimateEtaMinutes(distanceKm: number): number {
  return Math.max(5, 5 + Math.round(distanceKm * 2.5));
}

export interface QuickRequestFormProps {
  serviceType: ServiceType;
  onServiceTypeChange: (t: ServiceType) => void;
  locationLabel: string;
  onLocationPress?: () => void;
  /** Optional service description; used to suggest/filter providers. */
  serviceDescription: string;
  onServiceDescriptionChange: (v: string) => void;
  preferredTime: string;
  onPreferredTimeChange: (v: string) => void;
  nearestProvider: Provider | null;
  /** When description is used, show these suggested providers (nearest first). */
  suggestedProviders?: Provider[];
  distanceKm: number | null;
  isCreating: boolean;
  onCreateRequest: () => void;
  createError: string | null;
  providerOfflineMessage?: string | null;
  /** When true, show inline error under location (e.g. location not yet available). */
  locationRequiredError?: boolean;
  isOffline?: boolean;
}

export function QuickRequestForm({
  serviceType,
  onServiceTypeChange,
  locationLabel,
  onLocationPress,
  preferredTime,
  onPreferredTimeChange,
  serviceDescription,
  onServiceDescriptionChange,
  nearestProvider,
  suggestedProviders = [],
  distanceKm,
  isCreating,
  onCreateRequest,
  createError,
  providerOfflineMessage,
  locationRequiredError = false,
  isOffline = false,
}: QuickRequestFormProps) {
  const { colors } = useTheme();
  const locale = useLocaleStore((s) => s.locale);
  const trailingChevron = trailingChevronForLocale(locale);
  const etaMinutes = distanceKm != null ? estimateEtaMinutes(distanceKm) : null;
  const [serviceFilter, setServiceFilter] = React.useState('');
  const debouncedServiceFilter = useDebouncedValue(serviceFilter, 200);
  const filteredServiceOptions = React.useMemo(() => {
    const q = debouncedServiceFilter.trim().toLowerCase();
    if (!q) return SERVICE_TYPE_OPTIONS;
    return SERVICE_TYPE_OPTIONS.filter(
      (opt) => t(opt.labelKey).toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [debouncedServiceFilter]);

  return (
    <View style={styles.root}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <AppText variant="title3" style={[styles.cardTitle, { color: colors.text }]}>
          {t('request.serviceType')}
        </AppText>
        <TextInput
          style={[styles.filterInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          placeholder={t('request.serviceTypeFilterPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={serviceFilter}
          onChangeText={setServiceFilter}
        />
        <View style={[styles.dropdownWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <MaterialCommunityIcons name="wrench" size={20} color={colors.textSecondary} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {filteredServiceOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: serviceType === opt.value ? colors.primary : colors.surface },
                ]}
                onPress={() => onServiceTypeChange(opt.value)}
              >
                <AppText
                  variant="caption"
                  style={{ color: serviceType === opt.value ? colors.primaryContrast : colors.text }}
                >
                  {t(opt.labelKey)}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <AppText variant="caption" style={[styles.label, { color: colors.textSecondary }]}>
          {t('request.serviceDescription')} ({t('common.optional')})
        </AppText>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          placeholder={t('request.serviceDescriptionPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={serviceDescription}
          onChangeText={onServiceDescriptionChange}
        />

        <AppText variant="caption" style={[styles.label, { color: colors.textSecondary }]}>
          {t('request.location')}
        </AppText>
        <TouchableOpacity
          style={[styles.inputRow, { borderColor: locationRequiredError ? colors.error : colors.border, backgroundColor: colors.background }]}
          onPress={onLocationPress}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
          <AppText variant="body" numberOfLines={1} style={[styles.locationText, { color: colors.text }]}>
            {locationLabel}
          </AppText>
          <MaterialCommunityIcons name={trailingChevron} size={20} color={colors.textMuted} />
        </TouchableOpacity>
        {locationRequiredError && (
          <AppText variant="caption" style={[styles.inlineError, { color: colors.error }]}>
            {t('request.locationRequired')}
          </AppText>
        )}

        <AppText variant="caption" style={[styles.label, { color: colors.textSecondary }]}>
          {t('request.preferredTime')} ({t('common.optional')})
        </AppText>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          placeholder={t('request.preferredTimePlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={preferredTime}
          onChangeText={onPreferredTimeChange}
        />

        {nearestProvider && (
          <View style={[styles.etaRow, { backgroundColor: colors.infoLight, borderColor: colors.info }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.info} />
            <View style={styles.etaTextWrap}>
              <AppText variant="callout" style={{ color: colors.text }}>
                {t('request.nearestProvider')}: {nearestProvider.name}
              </AppText>
              {etaMinutes != null && (
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  {t('request.eta')} ~{etaMinutes} {t('request.etaMinutes')}
                </AppText>
              )}
            </View>
          </View>
        )}

        {serviceType !== 'insurance' && serviceDescription.trim()
          ? suggestedProviders.length > 0 && (
              <View
                style={[styles.suggestedWrap, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <AppText variant="caption" style={[styles.label, { color: colors.textSecondary }]}>
                  {t('request.suggestedProviders')}
                </AppText>
                {suggestedProviders.slice(0, 4).map((p) => (
                  <View key={p.id} style={styles.suggestedRow}>
                    <AppText variant="callout" numberOfLines={1} style={{ color: colors.text }}>
                      {p.name}
                    </AppText>
                  </View>
                ))}
              </View>
            )
          : null}

          {providerOfflineMessage && (
            <View style={[styles.messageRow, { backgroundColor: colors.warningLight }]}>
              <MaterialCommunityIcons name="alert-outline" size={18} color={colors.warning} />
              <AppText variant="caption" style={{ color: colors.text, flex: 1 }}>
                {providerOfflineMessage}
              </AppText>
            </View>
          )}

          {createError && (
            <AppText variant="caption" style={[styles.errorText, { color: colors.error }]}>
              {createError}
            </AppText>
          )}
      </View>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        {isOffline ? (
          <AppText variant="caption" style={[styles.offlineHint, { color: colors.warning }]}>
            {t('request.offlineQueuedHint')}
          </AppText>
        ) : null}
        <Button
          testID="request-confirm"
          variant="uber"
          title={t('request.requestNow')}
          onPress={onCreateRequest}
          disabled={isCreating || locationRequiredError}
          loading={isCreating}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  footer: {
    paddingTop: spacing.md,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  cardTitle: {
    marginBottom: spacing.sm,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  filterInput: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    marginBottom: spacing.sm,
  },
  inlineError: {
    marginTop: spacing.xs,
    marginBottom: 0,
  },
  dropdownWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  locationText: { flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  etaTextWrap: { flex: 1 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    gap: spacing.sm,
  },
  suggestedWrap: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  suggestedRow: {
    paddingVertical: spacing.xs,
  },
  errorText: { marginTop: spacing.sm },
  confirmBtn: { marginTop: spacing.lg },
  offlineHint: { marginBottom: spacing.sm },
});
