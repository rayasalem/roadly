import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { RootNavigator } from '../../navigation/RootNavigator';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GlobalOverlayHost } from '../components/GlobalOverlayHost';
import { createQueryClient } from '../services/query/queryClient';
import { HttpEventsBinder } from './HttpEventsBinder';

export function AppProviders() {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <HttpEventsBinder />
              <RootNavigator />
              <GlobalOverlayHost />
            </NavigationContainer>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

