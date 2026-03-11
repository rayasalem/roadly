/**
 * Dolores Park–style bottom card: large image, star rating, status, vibrant green Directions button.
 * Pixel-perfect: border-radius 25px+, soft shadows. Directions green #00D67D.
 */
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../../shared/components/AppText';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, shadows } from '../../../../shared/theme';

const CARD_RADIUS = 28;
const DIRECTIONS_GREEN = '#00D67D';

export interface LocationInfoCardProps {
  title: string;
  subtitle?: string;
  imageUri?: string | null;
  rating?: number;
  reviewCount?: number;
  status?: string;
  onDirectionsPress: () => void;
}

export function LocationInfoCard({
  title,
  subtitle,
  imageUri,
  rating = 4.5,
  reviewCount,
  status,
  onDirectionsPress,
}: LocationInfoCardProps) {
  return (
    <View style={styles.card}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons name="image-outline" size={48} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.content}>
        <AppText variant="title3" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.textSecondary} style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
        <View style={styles.row}>
          <View style={styles.starRow}>
            <MaterialCommunityIcons name="star" size={18} color={colors.warning} />
            <AppText variant="callout" style={styles.rating}>{rating.toFixed(1)}</AppText>
            {reviewCount != null && reviewCount > 0 && (
              <AppText variant="caption" color={colors.textMuted} style={styles.reviewCount}>
                ({reviewCount})
              </AppText>
            )}
          </View>
          {status ? (
            <AppText variant="caption" color={colors.textSecondary}>{status}</AppText>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={onDirectionsPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Directions"
        >
          <MaterialCommunityIcons name="directions" size={22} color="#fff" />
          <AppText variant="callout" style={styles.directionsText}>Directions</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    ...shadows.lg,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.background,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.title3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rating: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
    color: colors.text,
  },
  reviewCount: {
    marginLeft: spacing.xs,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: DIRECTIONS_GREEN,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    ...shadows.sm,
  },
  directionsText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
    color: '#fff',
  },
});
