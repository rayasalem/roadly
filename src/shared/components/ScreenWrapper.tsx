import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme';

type ScreenWrapperProps = {
  children: React.ReactNode;
  /**
   * Background color for the whole screen. Defaults to canvas background.
   */
  backgroundColor?: string;
  /**
   * Edges for SafeAreaView. Defaults to top + bottom.
   */
  edges?: Edge[];
  /**
   * Apply standard horizontal/vertical padding. Defaults to true.
   */
  padded?: boolean;
  /**
   * Additional styles for the content container.
   */
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Standard screen layout wrapper:
 * - SafeAreaView with consistent background
 * - Optional standard padding
 * - Inner content container for layout
 */
export function ScreenWrapper({
  children,
  backgroundColor = colors.background,
  edges = ['top', 'bottom'],
  padded = true,
  contentStyle,
}: ScreenWrapperProps) {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor }]} edges={edges}>
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

