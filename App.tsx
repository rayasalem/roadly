import React from 'react';
import { Platform, type ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from './src/shared/providers/AppProviders';
import { applyRtlFromLocale } from './src/shared/i18n/applyRtl';
import { getLocale } from './src/store/localeStore';
import { WebRootErrorBoundary } from './WebRootErrorBoundary';

try {
  applyRtlFromLocale(getLocale());
} catch (e) {
  // Avoid blank screen if RTL/bootstrap throws before React mounts (e.g. unusual web env).
  // eslint-disable-next-line no-console
  console.warn('[App] applyRtlFromLocale failed:', e);
}

/** Full viewport on web (html/body are 100% height via public/index.html reset). */
const rootStyle: ViewStyle = {
  flex: 1,
  ...(Platform.OS === 'web' ? { minHeight: '100%' } : {}),
};

const App = () => (
  <WebRootErrorBoundary>
    <GestureHandlerRootView style={rootStyle}>
      <AppProviders />
    </GestureHandlerRootView>
  </WebRootErrorBoundary>
);

export default App;
