import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import React from 'react';

export type ThemeId =
  | 'classic-light'
  | 'classic-dark'
  | 'candy'
  | 'chocolate'
  | 'cat'
  | 'haooo'
  | 'scifi'
  | 'modern';

export type CategoryPalette = { bg: string; accent: string };

export type Theme = {
  id: ThemeId;
  name: string;
  isDark: boolean;
  isPremium: boolean;
  // surfaces
  bg: string;
  cardBg: string;
  inputBg: string;
  // text
  text: string;
  textMuted: string;
  hint: string;
  // misc
  divider: string;
  brandColor: string;
  radius: number;
  // LCD specific
  lcdFrame: string;
  lcdScreen: string;
  lcdBorder: string;
  lcdText: string;
  lcdLed: string;
  lcdBrandColor?: string;
  // optional category color overrides (keyed by category id)
  categoryPalette?: Record<string, CategoryPalette>;
  // optional font overrides (display = headlines / brand)
  font?: {
    display?: string;
  };
};

export function categoryColors(
  theme: Theme,
  id: string,
  fallback: CategoryPalette
): CategoryPalette {
  return theme.categoryPalette?.[id] ?? fallback;
}

const classicLight: Theme = {
  id: 'classic-light',
  name: '歐古經典（亮）',
  isDark: false,
  isPremium: false,
  bg: '#fff8ed',
  cardBg: '#fff',
  inputBg: '#fef5e8',
  text: '#2d2520',
  textMuted: '#8a7a6c',
  hint: '#a3897a',
  divider: '#f1e3d0',
  brandColor: '#c4623a',
  radius: 22,
  lcdFrame: '#ffd4ba',
  lcdScreen: '#d8e0b8',
  lcdBorder: '#aabd8a',
  lcdText: '#2d3d20',
  lcdLed: '#4dd882',
};

const classicDark: Theme = {
  id: 'classic-dark',
  name: '歐古經典（暗）',
  isDark: true,
  isPremium: false,
  bg: '#1a1612',
  cardBg: '#2a231d',
  inputBg: '#3a3128',
  text: '#f5f1e8',
  textMuted: '#a89c8c',
  hint: '#7a6c5a',
  divider: '#3a3128',
  brandColor: '#ff8a5c',
  radius: 22,
  lcdFrame: '#c4623a',
  lcdScreen: '#5a7038',
  lcdBorder: '#7a8a48',
  lcdText: '#e8f0c8',
  lcdLed: '#7df0a0',
  lcdBrandColor: '#fff0e0',
};

const candy: Theme = {
  id: 'candy',
  name: '糖果（亮）',
  isDark: false,
  isPremium: true,
  bg: '#fff0f5',
  cardBg: '#fff',
  inputBg: '#fde4ef',
  text: '#5a2d4d',
  textMuted: '#b58aa3',
  hint: '#d4a8c2',
  divider: '#fce4ee',
  brandColor: '#e91e63',
  radius: 28,
  lcdFrame: '#f8b4d0',
  lcdScreen: '#e8d4f0',
  lcdBorder: '#c8a4d8',
  lcdText: '#5a2d4d',
  lcdLed: '#ff6b9a',
  lcdBrandColor: '#7a1339',
};

const chocolate: Theme = {
  id: 'chocolate',
  name: '巧克力（暗）',
  isDark: true,
  isPremium: true,
  bg: '#2c1810',
  cardBg: '#3d2418',
  inputBg: '#4a2e1e',
  text: '#f4e8da',
  textMuted: '#a88870',
  hint: '#8a6450',
  divider: '#4a2e1e',
  brandColor: '#d4a878',
  radius: 20,
  lcdFrame: '#5a3a24',
  lcdScreen: '#3d2418',
  lcdBorder: '#7a4a30',
  lcdText: '#f4d8a8',
  lcdLed: '#ffb050',
};

const cat: Theme = {
  id: 'cat',
  name: '喵喵（亮）',
  isDark: false,
  isPremium: true,
  bg: '#fef7e0',
  cardBg: '#fff',
  inputBg: '#fdebc0',
  text: '#4a3520',
  textMuted: '#a89070',
  hint: '#c8b090',
  divider: '#f4e8c8',
  brandColor: '#e8843a',
  radius: 26,
  lcdFrame: '#f4c870',
  lcdScreen: '#fff0c8',
  lcdBorder: '#d4a040',
  lcdText: '#4a3520',
  lcdLed: '#ff8a30',
};

const haooo: Theme = {
  id: 'haooo',
  name: 'Haooo（暗）',
  isDark: true,
  isPremium: true,
  bg: '#150b05',
  cardBg: '#241408',
  inputBg: '#33200e',
  text: '#fff0d8',
  textMuted: '#c89868',
  hint: '#7a5840',
  divider: '#3a2418',
  brandColor: '#ff7a30',
  radius: 14,
  lcdFrame: '#ff7a30',
  lcdScreen: '#150b05',
  lcdBorder: '#ff7a30',
  lcdText: '#ffaa50',
  lcdLed: '#ff5a10',
  lcdBrandColor: '#1a0a02',
  font: {
    display: 'PressStart2P_400Regular',
  },
  categoryPalette: {
    favorites: { bg: '#3d1f0a', accent: '#ff7a30' },
    life: { bg: '#2a1810', accent: '#ff9050' },
    science: { bg: '#332010', accent: '#ffaa30' },
    wealth: { bg: '#3a2810', accent: '#ffc060' },
    gambling: { bg: '#3a1a12', accent: '#ff5a3a' },
    health: { bg: '#3a1c14', accent: '#ff7050' },
    design: { bg: '#3a2418', accent: '#ff8a4a' },
    time: { bg: '#2a1d12', accent: '#ffa060' },
    education: { bg: '#3a281a', accent: '#ffb050' },
    cooking: { bg: '#3a1d10', accent: '#ff6030' },
    game: { bg: '#332810', accent: '#ffaa50' },
  },
};

const scifi: Theme = {
  id: 'scifi',
  name: '科幻（暗）',
  isDark: true,
  isPremium: true,
  bg: '#0a1929',
  cardBg: '#0f2540',
  inputBg: '#1a3a5a',
  text: '#c4f0ff',
  textMuted: '#5a8bb5',
  hint: '#3a6585',
  divider: '#1a3a5a',
  brandColor: '#00d4ff',
  radius: 8,
  lcdFrame: '#1a3a5a',
  lcdScreen: '#001a2a',
  lcdBorder: '#00a8d8',
  lcdText: '#00ffd4',
  lcdLed: '#00d4ff',
};

const modern: Theme = {
  id: 'modern',
  name: '現代感（暗）',
  isDark: true,
  isPremium: true,
  bg: '#0f0f0f',
  cardBg: '#1c1c1c',
  inputBg: '#262626',
  text: '#fafafa',
  textMuted: '#a3a3a3',
  hint: '#737373',
  divider: '#262626',
  brandColor: '#fafafa',
  radius: 6,
  lcdFrame: '#262626',
  lcdScreen: '#0a0a0a',
  lcdBorder: '#404040',
  lcdText: '#fafafa',
  lcdLed: '#fafafa',
};

const THEMES_RECORD: Record<ThemeId, Theme> = {
  'classic-light': classicLight,
  'classic-dark': classicDark,
  candy,
  chocolate,
  cat,
  haooo,
  scifi,
  modern,
};

export const ALL_THEMES = Object.values(THEMES_RECORD);
const KEY = 'allcu_theme';
const DEFAULT: ThemeId = 'classic-light';

type ThemeContextValue = {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((val) => {
      if (val && THEMES_RECORD[val as ThemeId]) {
        setThemeIdState(val as ThemeId);
      }
    });
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    AsyncStorage.setItem(KEY, id).catch(() => {});
  };

  const value: ThemeContextValue = {
    theme: THEMES_RECORD[themeId],
    themeId,
    setThemeId,
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // graceful fallback: return classic-light
    return { theme: classicLight, themeId: 'classic-light' as ThemeId, setThemeId: () => {} };
  }
  return ctx;
}
