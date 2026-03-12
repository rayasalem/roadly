/**
 * Provider avatar: loads provider.photo; on error or missing, shows placeholder icon.
 * Use for map cards, bottom sheet, and profile.
 */
import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export interface ProviderAvatarProps {
  photoUri?: string | null;
  size?: number;
  themeColor?: string;
}

export function ProviderAvatar({ photoUri, size = 56, themeColor = colors.primary }: ProviderAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = photoUri && typeof photoUri === 'string' && photoUri.trim().length > 0 && !failed;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }, { backgroundColor: colors.greenLight }]}>
      {showImage ? (
        <Image
          source={{ uri: photoUri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <MaterialCommunityIcons name="account" size={size * 0.55} color={themeColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    backgroundColor: colors.background,
  },
});
