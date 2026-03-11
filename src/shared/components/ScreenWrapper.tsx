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
};

export function ScreenWrapper({
  children,
  backgroundColor,
  edges = ['top', 'bottom'],
  padded = true,
  contentStyle,
}: ScreenWrapperProps) {
  const { colors } = useTheme();
  const bg = backgroundColor ?? colors.background;
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]} edges={edges}>
      <View style={[styles.content, padded && styles.padded, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
});

