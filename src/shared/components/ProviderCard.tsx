/**
 * Reusable provider card for lists and map bottom sheet.
 * Modern layout:
 * - Avatar / profile placeholder
 * - Name + service badge
 * - Rating + distance
 * - Small CTA button
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, typography, radii } from '../theme';
import { Card } from './Card';
import { Button } from './Button';

export interface ProviderCardProps {
  title: string;
  subtitle?: string; // e.g. role label
  distanceText?: string;
  rating?: number;
  ratingCount?: number;
  isAvailable?: boolean;
  onPress?: () => void;
  onRequest?: () => void;
  requestLabel?: string;
}

export const ProviderCard = React.memo(function ProviderCard({
  title,
  subtitle,
  distanceText,
  rating,
  ratingCount,
  isAvailable = true,
  onPress,
  onRequest,
  requestLabel = 'Request service',
}: ProviderCardProps) {
  const showRating = typeof rating === 'number';

  return (
    <Card onPress={onPress} variant="elevated" padding="lg">
      <View style={styles.row}>
        {/* Avatar / profile placeholder */}
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account-outline" size={22} color={colors.textSecondary} />
        </View>

        {/* Main content */}
        <View style={styles.main}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            {showRating && (
              <View style={styles.rating}>
                <MaterialCommunityIcons name="star" size={14} color={colors.warning} />
                <Text style={styles.ratingText}>{rating?.toFixed(1)}</Text>
                {ratingCount != null && (
                  <Text style={styles.ratingCount}>({ratingCount})</Text>
                )}
              </View>
            )}
            {distanceText ? (
              <Text style={styles.distance}>{distanceText}</Text>
            ) : null}
            {!isAvailable && <Text style={styles.unavailable}>Unavailable</Text>}
          </View>
        </View>

        {/* CTA */}
        {onRequest && (
          <View style={styles.cta}>
            <Button
              title={requestLabel}
              variant="accent"
              size="sm"
              onPress={onRequest}
              fullWidth
            />
          </View>
        )}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.full,
    backgroundColor: colors.background,
  },
  badgeText: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  ratingText: {
    fontSize: typography.fontSize.caption,
    color: colors.text,
  },
  ratingCount: {
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
  },
  distance: {
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
  },
  unavailable: {
    fontSize: typography.fontSize.caption,
    color: colors.error,
  },
  cta: {
    width: 110,
  },
});
