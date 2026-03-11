/**
 * Theme context: provides unified theme to the tree.
 * Use useTheme() from theme for scheme-aware colors; this provider ensures a single theme source.
 */
import React, { createContext, useContext, type ReactNode } from 'react';
import type { UnifiedTheme } from './unifiedTheme';
import { useTheme } from './unifiedTheme';

const ThemeContext = createContext<UnifiedTheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): UnifiedTheme {
  const context = useContext(ThemeContext);
  const fallback = useTheme();
  return context ?? fallback;
}
