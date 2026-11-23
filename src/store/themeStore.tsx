// src/store/themeStore.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { Colors } from '../../constants/theme';

export type ThemeMode = 'dark' | 'light';

export interface AppThemeColors {
  base: string;
  surface: string;
  card: string;
  line: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  segmentActive: string;
  myBubbleBg: string;
  myBubbleBorder: string;
  cyanPrimary: string;
  purpleAi: string;
  blueInfo: string;
  success: string;
  warning: string;
  danger: string;
}

const DARK_PALETTE: AppThemeColors = {
  base: Colors.base,
  surface: Colors.surface,
  card: Colors.card,
  line: Colors.line,
  textPrimary: Colors.textPrimary,
  textSecondary: Colors.textSecondary,
  divider: '#FFFFFF',
  segmentActive: '#253349',
  myBubbleBg: '#123846',
  myBubbleBorder: '#1F637A',
  cyanPrimary: Colors.cyanPrimary,
  purpleAi: Colors.purpleAi,
  blueInfo: Colors.blueInfo,
  success: Colors.success,
  warning: Colors.warning,
  danger: Colors.danger,
};

const LIGHT_PALETTE: AppThemeColors = {
  base: '#F4F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  line: '#D8E1EB',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  divider: '#0F172A',
  segmentActive: '#E2E8F0',
  myBubbleBg: '#E0F2FE',
  myBubbleBorder: '#7DD3FC',
  cyanPrimary: '#0891B2',
  purpleAi: '#7C3AED',
  blueInfo: '#2563EB',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
};

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: AppThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const colors = useMemo(
    () => (themeMode === 'light' ? LIGHT_PALETTE : DARK_PALETTE),
    [themeMode]
  );

  return (
    <ThemeContext.Provider
      value={{ themeMode, setThemeMode, toggleTheme, colors }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used inside a ThemeProvider');
  }
  return ctx;
}