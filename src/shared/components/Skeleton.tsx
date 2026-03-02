import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export const Skeleton = React.memo(function Skeleton({ width = '100%', height = 14, radius = 10, style }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <View style={[styles.base, { width, height, borderRadius: radius }, style]}>
      <Animated.View style={[styles.fill, { opacity }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
  },
});

