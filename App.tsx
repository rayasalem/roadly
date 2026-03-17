import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from './src/shared/providers/AppProviders';

const rootStyle = {
  flex: 1 as const,
  ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
};

const App = () => (
  <GestureHandlerRootView style={rootStyle}>
    <AppProviders />
  </GestureHandlerRootView>
);

export default App;
