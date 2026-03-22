import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  render,
  type RenderOptions,
} from '@testing-library/react-native';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function AllProviders({ children }: PropsWithChildren) {
    return (
      <View style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </View>
    );
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient },
) {
  const { queryClient: qc, ...rest } = options ?? {};
  const client = qc ?? createTestQueryClient();
  return render(ui, { wrapper: createWrapper(client), ...rest });
}

export * from '@testing-library/react-native';
