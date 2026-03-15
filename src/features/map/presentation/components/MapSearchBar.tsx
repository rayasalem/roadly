import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../../shared/components/AppText';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ACTIVE_OPACITY } from '../../../../shared/constants/ux';
import { t } from '../../../../shared/i18n/t';

interface MapSearchBarProps {
  query: string;
  onQueryChange: (t: string) => void;
  onFocus?: () => void;
  onVoicePress?: () => void;
  suggestions: Array<{ id: string; description: string; latitude: number; longitude: number }>;
  onSelectSuggestion: (p: { id: string; description: string; latitude: number; longitude: number }) => void;
  showSuggestions: boolean;
}

export function MapSearchBar(p: MapSearchBarProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.searchWrap, { backgroundColor: colors.surface }, shadows.sm]}>
        <MaterialCommunityIcons name="magnify" size={22} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={t('map.searchHerePlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={p.query}
          onChangeText={p.onQueryChange}
          onFocus={p.onFocus}
        />
        <TouchableOpacity style={styles.micButton} onPress={p.onVoicePress ?? (() => {})} accessible accessibilityLabel={t('map.voiceSearch') ?? 'Voice search'}>
          <MaterialCommunityIcons name="microphone" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      {p.showSuggestions && p.suggestions.length > 0 && (
        <View style={[styles.suggestionsBox, { backgroundColor: colors.surface }, shadows.lg]}>
          {p.suggestions.slice(0, 6).map((s) => (
            <TouchableOpacity key={s.id} style={styles.suggestionRow} onPress={() => p.onSelectSuggestion(s)} activeOpacity={ACTIVE_OPACITY}>
              <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
              <AppText variant="callout" numberOfLines={1} style={[styles.suggestionText, { color: colors.text }]}>{s.description}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: radii.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  input: { flex: 1, marginLeft: spacing.sm, fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.callout },
  micButton: { padding: spacing.xs, marginLeft: spacing.xs },
  suggestionsBox: { position: 'absolute', top: '100%', left: spacing.xs, right: spacing.xs, marginTop: spacing.xs, borderRadius: radii.lg, maxHeight: 220, zIndex: 10 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, gap: spacing.sm },
  suggestionText: { flex: 1 },
});
