/**
 * Lightweight animation configs and hooks using React Native Animated.
 * Use for button/card scale, screen fade-in, toast, list items.
 * On web, useNativeDriver is false for layout/opacity/transform compatibility.
 */
import { useEffect, useRef } from 'react';
import { Animated, Platform } from 'react-native';

/** false on web to avoid "native driver not supported" */
const useNativeDriver = Platform.OS !== 'web';

/** Spring config for press feedback (buttons, cards) — subtle, quick */
export const springPress = {
  friction: 6,
  tension: 160,
  useNativeDriver: useNativeDriver as true,
};

/** Slightly bouncier spring for list items */
export const springListItem = {
  friction: 8,
  tension: 180,
  useNativeDriver: useNativeDriver as true,
};

/** Spring for marker / emphasis — a bit more bounce */
export const springMarker = {
  friction: 4,
  tension: 200,
  useNativeDriver: useNativeDriver as true,
};

/** Scale down value on press */
export const PRESS_SCALE = 0.97;

/** Scale for list items (softer press, Turo-style) */
export const LIST_ITEM_PRESS_SCALE = 0.985;

/** Duration for fade-in (ms) */
export const FADE_IN_DURATION = 320;

/** Duration for toast enter (ms) — smooth Turo-style slide */
export const TOAST_ENTER_DURATION = 280;

/** Duration for toast exit (ms) */
export const TOAST_EXIT_DURATION = 220;

/**
 * Returns animated values for a simple screen fade-in (opacity + slight translateY).
 * Call from screen component and attach to root content.
 */
export function useScreenFadeIn(opts?: { duration?: number; translateY?: number }) {
  const duration = opts?.duration ?? FADE_IN_DURATION;
  const translateY = opts?.translateY ?? 8;
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(translateY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        useNativeDriver,
      }),
    ]).start();
  }, [opacity, translate, duration]);

  return {
    style: {
      opacity,
      transform: [{ translateY: translate }],
    },
  };
}

/**
 * Returns scale animated value and handlers for press feedback.
 * Use for list items, notification cards, etc.
 */
export function usePressScaleAnimation(scaleWhenPressed = LIST_ITEM_PRESS_SCALE) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: scaleWhenPressed,
      friction: springListItem.friction,
      tension: springListItem.tension,
      useNativeDriver,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: springListItem.friction,
      tension: springListItem.tension,
      useNativeDriver,
    }).start();
  };

  return { scale, onPressIn, onPressOut };
}
