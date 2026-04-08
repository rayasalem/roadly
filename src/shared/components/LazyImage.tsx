/**
 * Lazy-loading image: shows placeholder until loaded, avoids blocking main thread.
 * Use in lists and map markers for smoother scrolling on mid-range devices.
 */
import React, { memo, useState, useCallback } from 'react';
import { View, Image, StyleSheet, ImageStyle, ViewStyle, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export interface LazyImageProps {
  uri: string | null | undefined;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  size?: number;
  /** Placeholder when no uri or not yet loaded. */
  placeholder?: React.ReactNode;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

function LazyImageInner({
  uri,
  style,
  containerStyle,
  size = 56,
  placeholder,
  resizeMode = 'cover',
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = uri && uri.trim().length > 0 && !failed;
  const showPlaceholder = !showImage || !loaded;

  const onLoad = useCallback(() => setLoaded(true), []);
  const onError = useCallback(() => setFailed(true), []);

  const sizeStyle = size ? { width: size, height: size, borderRadius: size / 2 } : undefined;
  const defaultPlaceholder = (
    <View style={[styles.placeholder, sizeStyle]}>
      <MaterialCommunityIcons name="account" size={size ? size * 0.5 : 28} color={colors.textMuted} />
    </View>
  );

  return (
    <View style={[styles.container, sizeStyle, containerStyle]}>
      {showPlaceholder && (placeholder ?? defaultPlaceholder)}
      {showImage && (
        <Image
          source={{ uri }}
          style={[styles.image, sizeStyle, style]}
          resizeMode={resizeMode}
          onLoad={onLoad}
          onError={onError}
          {...(Platform.OS === 'android' ? { resizeMethod: 'resize' as const } : {})}
        />
      )}
    </View>
  );
}

export const LazyImage = memo(LazyImageInner, (prev, next) => {
  return (
    prev.uri === next.uri &&
    prev.size === next.size &&
    prev.resizeMode === next.resizeMode &&
    prev.style === next.style &&
    prev.containerStyle === next.containerStyle
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  placeholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
