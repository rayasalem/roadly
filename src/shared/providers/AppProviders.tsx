import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { RootNavigator } from '../../navigation/RootNavigator';
import { navigationRef, flushPendingNavigateToLogin } from '../../navigation/navigationRef';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GlobalOverlayHost } from '../components/GlobalOverlayHost';
import { createQueryClient } from '../services/query/queryClient';
import { useTheme, ThemeProvider } from '../theme';
import { FontLoader } from './FontLoader';
import { HttpEventsBinder } from './HttpEventsBinder';
import { LocaleRTLSync } from './LocaleRTLSync';
import { QueryErrorFallback } from './QueryErrorFallback';
import { UnauthorizedHandler } from './UnauthorizedHandler';
import { AuthBootstrap } from './AuthBootstrap';

export function AppProviders() {
  const queryClient = useMemo(() => createQueryClient(), []);
  const { colorScheme } = useTheme();

  return (
    <ErrorBoundary>
      <ThemeProvider>
      <FontLoader>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <BottomSheetModalProvider>
              <NavigationContainer
                ref={navigationRef}
                onReady={flushPendingNavigateToLogin}
              >
                <LocaleRTLSync />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <HttpEventsBinder />
                <QueryErrorFallback />
                <UnauthorizedHandler />
                <AuthBootstrap>
                  <RootNavigator />
                  <GlobalOverlayHost />
                </AuthBootstrap>
              </NavigationContainer>
            </BottomSheetModalProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </FontLoader>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

