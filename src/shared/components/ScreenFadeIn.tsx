/**
 * Wraps screen content with a lightweight fade-in + slight slide-up animation.
 * Uses React Native Animated for consistency (no Reanimated dependency).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useScreenFadeIn } from '../utils/animations';

export interface ScreenFadeInProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Override duration (ms). Default 320. */
  duration?: number;
  /** Override initial translateY (px). Default 8. */
  translateY?: number;
}

export const ScreenFadeIn = React.memo(function ScreenFadeIn({
  children,
  style,
  duration,
  translateY,
}: ScreenFadeInProps) {
  const { style: animStyle } = useScreenFadeIn({ duration, translateY });
  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
});
