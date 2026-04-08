import { useWindowDimensions, Platform } from 'react-native';
import { useMemo } from 'react';
import { BREAKPOINT_DESKTOP, CONTENT_MAX_WIDTH, isDesktopWeb } from '../design/layout';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return useMemo(
    () => ({
      width,
      height,
      isDesktop: isDesktopWeb(width),
      isWeb: Platform.OS === 'web',
      contentMaxWidth: CONTENT_MAX_WIDTH,
    }),
    [width, height],
  );
}
