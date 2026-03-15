/**
 * Dark teal floating dock, Plus FAB, and 4 circular icons in a semi-circle arc.
 * Pixel-perfect: border-radius 25px+, soft shadows.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../../shared/theme/colors';
import { spacing, shadows, radii } from '../../../../shared/theme';

const DOCK_BG = '#1A313C';
const FAB_SIZE = 56;
const ICON_CIRCLE_SIZE = 44;
const BORDER_RADIUS = 28;

export type ArcIconId = 'mechanic' | 'tow' | 'rental' | 'all';

const ARC_ICONS: { id: ArcIconId; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'mechanic', icon: 'wrench' },
  { id: 'tow', icon: 'tow-truck' },
  { id: 'rental', icon: 'car-side' },
  { id: 'all', icon: 'circle-double' },
];

export interface MapDockWithFABProps {
  activeId: ArcIconId | null;
  onArcIconPress: (id: ArcIconId) => void;
  onFABPress: () => void;
  onDockTabPress?: (tab: 'home' | 'notifications' | 'bookmark' | 'settings') => void;
  /** When true, dock is in flow below content (no overlay). Icons stay above nav bar. */
  inFlow?: boolean;
}

export function MapDockWithFAB({
  activeId,
  onArcIconPress,
  onFABPress,
  onDockTabPress,
  inFlow = false,
}: MapDockWithFABProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, spacing.md);

  return (
    <View style={[inFlow ? styles.wrapperInFlow : styles.wrapper, { paddingBottom: bottomPad, pointerEvents: 'box-none' }]}>
      {/* 4 icons in semi-circle arc above FAB */}
      <View style={[styles.arcRow, { pointerEvents: 'box-none' }]}>
        {ARC_ICONS.map((item, index) => {
          const isActive = activeId === item.id;
          const isMiddle = index === 1 || index === 2;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.arcIcon,
                isMiddle && styles.arcIconRaised,
                isActive && styles.arcIconActive,
              ]}
              onPress={() => onArcIconPress(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.id}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={22}
                color={isActive ? colors.primaryContrast : colors.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Plus FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onFABPress}
        accessibilityRole="button"
        accessibilityLabel="Main action"
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Dark teal dock */}
      <View style={styles.dock}>
        {(onDockTabPress ? ['home', 'notifications', 'bookmark', 'settings'] : ['home', 'notifications', 'bookmark', 'settings']).map(
          (tab, i) => {
            const icon = tab === 'home' ? 'home' : tab === 'notifications' ? 'bell-outline' : tab === 'bookmark' ? 'bookmark-outline' : 'cog-outline';
            return (
              <TouchableOpacity
                key={tab}
                style={styles.dockTab}
                onPress={() => onDockTabPress?.(tab as any)}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name={icon as any} size={24} color={colors.primaryContrast} />
              </TouchableOpacity>
            );
          }
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  wrapperInFlow: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  arcRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  arcIcon: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  arcIconRaised: {
    marginBottom: -6,
  },
  arcIconActive: {
    backgroundColor: colors.primary,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -FAB_SIZE / 2,
    zIndex: 1,
    ...shadows.lg,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: DOCK_BG,
    paddingTop: spacing.md + FAB_SIZE / 2,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    minHeight: 72,
    width: '100%',
    ...shadows.lg,
  },
  dockTab: {
    padding: spacing.sm,
  },
});
