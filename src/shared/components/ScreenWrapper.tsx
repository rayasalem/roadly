import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme, spacing } from '../theme';

type ScreenWrapperProps = {
  children: React.ReactNode;
  /** Background color; defaults to theme background (respects light/dark). */
  backgroundColor?: string;
  edges?: Edge[];
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Rendered below content, full width (no horizontal padding). Use for BottomNavBar. */
  bottomNav?: React.ReactNode;
};

export function ScreenWrapper({
  children,
  backgroundColor,
  edges = ['top', 'bottom'],
  padded = true,
  contentStyle,
  bottomNav,
}: ScreenWrapperProps) {
  const { colors } = useTheme();
  const bg = backgroundColor ?? colors.background;
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]} edges={edges}>
      <View style={styles.column}>
        <View style={[styles.content, padded && styles.padded, contentStyle]}>{children}</View>
        {bottomNav != null ? <View style={styles.bottomNavWrap}>{bottomNav}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  bottomNavWrap: {
    width: '100%',
    alignSelf: 'stretch',
  },
});

