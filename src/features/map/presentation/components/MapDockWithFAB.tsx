/**
 * Service-type arc, main FAB, and quick dock tabs. Themed to match app colors.
 */
import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, type LayoutChangeEvent } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, shadows } from '../../../../shared/theme';

const FAB_SIZE = 56;
const ICON_CIRCLE_SIZE = 44;
const BORDER_RADIUS = 28;

export type ArcIconId = 'mechanic' | 'tow' | 'rental' | 'insurance' | 'all';

const ARC_ICONS: { id: ArcIconId; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'mechanic', icon: 'wrench' },
  { id: 'tow', icon: 'tow-truck' },
  { id: 'rental', icon: 'car-side' },
  { id: 'insurance', icon: 'shield-check' },
  { id: 'all', icon: 'circle-double' },
];

export interface MapDockWithFABProps {
  activeId: ArcIconId | null;
  onArcIconPress: (id: ArcIconId) => void;
  onFABPress: () => void;
  onDockTabPress?: (tab: 'home' | 'notifications' | 'bookmark' | 'settings') => void;
  /** When true, dock is in flow below content (no overlay). Icons stay above nav bar. */
  inFlow?: boolean;
  /** Report full wrapper height (for ScrollView padding above the dock). */
  onLayoutHeight?: (height: number) => void;
}

export function MapDockWithFAB({
  activeId,
  onArcIconPress,
  onFABPress,
  onDockTabPress,
  inFlow = false,
  onLayoutHeight,
}: MapDockWithFABProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, spacing.md);
  const dockBg = colors.uberNav ?? colors.navDark ?? colors.primary;
  const onDockLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      if (h > 0) onLayoutHeight?.(h);
    },
    [onLayoutHeight],
  );

  return (
    <View
      style={[inFlow ? styles.wrapperInFlow : styles.wrapper, { paddingBottom: bottomPad, pointerEvents: 'box-none' }]}
      onLayout={onLayoutHeight ? onDockLayout : undefined}
    >
      <View style={[styles.arcRow, { pointerEvents: 'box-none' }]}>
        {ARC_ICONS.map((item, index) => {
          const isActive = activeId === item.id;
          const isMiddle = index === 1 || index === 2;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.arcIcon,
                { backgroundColor: colors.surface },
                isMiddle && styles.arcIconRaised,
                isActive && { backgroundColor: colors.primary },
              ]}
              onPress={() => onArcIconPress(item.id)}
              activeOpacity={0.82}
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={onFABPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Main action"
      >
        <MaterialCommunityIcons name="plus" size={28} color={colors.primaryContrast} />
      </TouchableOpacity>

      <View style={[styles.dock, { backgroundColor: dockBg }]}>
        {['home', 'notifications', 'bookmark', 'settings'].map((tab) => {
          const icon =
            tab === 'home'
              ? 'home'
              : tab === 'notifications'
                ? 'bell-outline'
                : tab === 'bookmark'
                  ? 'bookmark-outline'
                  : 'cog-outline';
          return (
            <TouchableOpacity
              key={tab}
              style={styles.dockTab}
              onPress={() => onDockTabPress?.(tab as any)}
              activeOpacity={0.75}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name={icon as any} size={24} color={colors.uberTextOnDark ?? colors.primaryContrast} />
            </TouchableOpacity>
          );
        })}
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
    zIndex: 20,
    ...(Platform.OS === 'android' ? { elevation: 16 } : {}),
  },
  wrapperInFlow: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 12,
    ...(Platform.OS === 'android' ? { elevation: 14 } : {}),
  },
  arcRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  arcIcon: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  arcIconRaised: {
    marginBottom: -6,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
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
