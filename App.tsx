import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from './src/shared/providers/AppProviders';

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <AppProviders />
  </GestureHandlerRootView>
);

export default App;
