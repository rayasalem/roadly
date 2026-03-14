/**
 * Provider avatar: lazy-loads provider.photo; on error or missing, shows placeholder.
 * Memoized to avoid unnecessary re-renders in lists.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LazyImage } from './LazyImage';

export interface ProviderAvatarProps {
  photoUri?: string | null;
  size?: number;
  themeColor?: string;
}

function ProviderAvatarInner({ photoUri, size = 56, themeColor = colors.primary }: ProviderAvatarProps) {
  const showImage = photoUri && typeof photoUri === 'string' && photoUri.trim().length > 0;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }, { backgroundColor: colors.greenLight }]}>
      {showImage ? (
        <LazyImage uri={photoUri} size={size} resizeMode="cover" containerStyle={styles.imageWrap} />
      ) : (
        <MaterialCommunityIcons name="account" size={size * 0.55} color={themeColor} />
      )}
    </View>
  );
}

export const ProviderAvatar = memo(ProviderAvatarInner);

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageWrap: {
    backgroundColor: colors.background,
  },
});
