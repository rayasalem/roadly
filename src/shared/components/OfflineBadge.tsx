import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { radii, spacing, shadows } from '../theme';
import { useNetworkStore } from '../../store/networkStore';

export const OfflineBadge = React.memo(function OfflineBadge() {
  const isOnline = useNetworkStore((s) => s.isOnline);
  if (isOnline) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={styles.badge}>
        <MaterialCommunityIcons name="wifi-off" size={16} color={colors.warning} />
        <AppText variant="caption" style={styles.text}>
          أنت غير متصل بالإنترنت
        </AppText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1100,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.sm,
  },
  text: {
    color: '#7C2D12',
  },
});

