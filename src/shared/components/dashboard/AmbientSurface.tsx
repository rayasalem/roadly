/**
 * Soft green ambient circle — matches MapScreen / mapScreen.styles visual language.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

const BLOB_SIZE = 420;
const BLOB_TOP = -160;

export type AmbientSurfaceProps = {
  /** Fill color of the decorative blob (default: map-style green mist) */
  tint?: string;
};

export const AmbientSurface = memo(function AmbientSurface({
  tint = 'rgba(34, 197, 94, 0.12)',
}: AmbientSurfaceProps) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={[styles.blob, { backgroundColor: tint }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    top: BLOB_TOP,
    alignSelf: 'center',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
  },
});
