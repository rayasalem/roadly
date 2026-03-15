import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
} from '@expo-google-fonts/tajawal';
import { colors } from '../theme/colors';
import { spacing } from '../theme';

const FONT_LOAD_TIMEOUT_MS = 12000;

type Props = { children: React.ReactNode };

/** Web: no font loading (avoids 6000ms timeout + Tracking Prevention blocking storage). */
function FontLoaderWeb({ children }: Props) {
  return <>{children}</>;
}

/** Native: load Poppins + Tajawal then render app. */
function FontLoaderNative({ children }: Props) {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const showApp = fontsLoaded || !!fontError || timedOut;

  if (!showApp) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Loads Poppins (EN) and Tajawal (AR) on native before rendering.
 * On web: render immediately to avoid 6000ms timeout and Tracking Prevention blocking font storage.
 */
export const FontLoader = Platform.OS === 'web' ? FontLoaderWeb : FontLoaderNative;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
});
