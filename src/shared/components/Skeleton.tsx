import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { spacing } from '../theme';
import { colors } from '../theme/colors';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export const Skeleton = React.memo(function Skeleton({ width = '100%', height = 14, radius = 10, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer, useNativeDriver]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <View style={[styles.base, { width, height, borderRadius: radius }, style]}>
      <Animated.View style={[styles.fill, { opacity }]} />
    </View>
  );
});

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <View style={styles.textWrap}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton lines
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={14}
          style={{ marginBottom: spacing.xs }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
  },
  textWrap: {
    width: '100%',
  },
});

