/**
 * Responsive layout tokens (mobile-first; desktop = wide web).
 */
import { Platform } from 'react-native';

/** Min width (px) to treat as desktop shell (side nav). */
export const BREAKPOINT_DESKTOP = 960;

/** Max content width for centered columns on large screens. */
export const CONTENT_MAX_WIDTH = 1200;

/** Side navigation rail width (web desktop). */
export const SIDE_NAV_WIDTH = 260;

export function isDesktopWeb(width: number): boolean {
  return Platform.OS === 'web' && width >= BREAKPOINT_DESKTOP;
}
