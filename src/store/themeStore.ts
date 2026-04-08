/**
 * Theme (color scheme) state for light/dark mode.
 * Persists preference; use useTheme() for resolved colors in components.
 */
import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage } from 'zustand/middleware';

export type ColorSchemePreference = 'light' | 'dark' | 'system';

type ThemeState = {
  colorSchemePreference: ColorSchemePreference;
  setColorSchemePreference: (pref: ColorSchemePreference) => void;
};

const getStorage = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    return {
      getItem: (name: string) => localStorage.getItem(name),
      setItem: (name: string, value: string) => localStorage.setItem(name, value),
      removeItem: (name: string) => localStorage.removeItem(name),
    };
  } catch {
    return undefined;
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorSchemePreference: 'system',
      setColorSchemePreference: (colorSchemePreference) => set({ colorSchemePreference }),
    }),
    {
      name: 'mechnow-theme',
      storage: createJSONStorage(() => getStorage() ?? { getItem: () => null, setItem: () => {}, removeItem: () => {} }) as unknown as PersistStorage<{
        colorSchemePreference: ColorSchemePreference;
      }>,
      partialize: (s) => ({ colorSchemePreference: s.colorSchemePreference }),
    }
  )
);
