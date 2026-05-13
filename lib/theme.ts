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
  | 'cyberpunk'
  | 'tech'
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
  // optional font overrides
  font?: {
    display?: string; // big headlines / brand
    mono?: string;    // monospace used by mascot
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
  font: {
    display: 'PixelifySans_700Bold',
    mono: 'PixelifySans_700Bold',
  },
  categoryPalette: {
    favorites: { bg: '#ffd4e8', accent: '#ff3a80' },
    life: { bg: '#c8e8ff', accent: '#2090ff' },
    science: { bg: '#c8ffd8', accent: '#10b850' },
    wealth: { bg: '#fff0a0', accent: '#e8a010' },
    gambling: { bg: '#f0c4ff', accent: '#9030d8' },
    health: { bg: '#ffc4d0', accent: '#ff4070' },
    design: { bg: '#ffd0b8', accent: '#ff7020' },
    time: { bg: '#d0d0ff', accent: '#5050e8' },
    education: { bg: '#ffe4b0', accent: '#d88010' },
    cooking: { bg: '#ffd0c0', accent: '#ff4020' },
    game: { bg: '#c4ffc4', accent: '#30b020' },
  },
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
  // 11 distinct coffee / chocolate / nut tones
  categoryPalette: {
    favorites: { bg: '#1a0f08', accent: '#3d2418' }, // espresso
    life: { bg: '#6b4423', accent: '#f4e0c8' }, // latte
    science: { bg: '#4a3a18', accent: '#d4b86a' }, // matcha mocha
    wealth: { bg: '#7a4a18', accent: '#ffc878' }, // caramel
    gambling: { bg: '#1a0e04', accent: '#a05828' }, // dark chocolate
    health: { bg: '#5a2418', accent: '#e89878' }, // rose mocha
    design: { bg: '#6a3a1a', accent: '#e8b070' }, // hazelnut
    time: { bg: '#a07a4a', accent: '#fff0d8' }, // cappuccino
    education: { bg: '#3a2010', accent: '#a88060' }, // walnut
    cooking: { bg: '#5a2010', accent: '#c84830' }, // brick red
    game: { bg: '#3a3020', accent: '#a0c878' }, // pistachio
  },
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
    mono: 'PressStart2P_400Regular',
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

const cyberpunk: Theme = {
  id: 'cyberpunk',
  name: '賽博龐克（暗）',
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
  font: {
    display: 'ShareTechMono_400Regular',
    mono: 'ShareTechMono_400Regular',
  },
  categoryPalette: {
    favorites: { bg: '#0f2a50', accent: '#00d4ff' },
    life: { bg: '#1a3560', accent: '#5ad4ff' },
    science: { bg: '#0a2a50', accent: '#00b8e8' },
    wealth: { bg: '#1a3055', accent: '#80e0ff' },
    gambling: { bg: '#1a2545', accent: '#a0c8ff' },
    health: { bg: '#1a4060', accent: '#5ae0e0' },
    design: { bg: '#0a3060', accent: '#00c8d8' },
    time: { bg: '#0f2a55', accent: '#a0e8ff' },
    education: { bg: '#1a3555', accent: '#5acce0' },
    cooking: { bg: '#1a3a5a', accent: '#00e0c8' },
    game: { bg: '#0f3055', accent: '#00d8e0' },
  },
};

const tech: Theme = {
  id: 'tech',
  name: '科技感（亮）',
  isDark: false,
  isPremium: true,
  bg: '#f5f7fa',
  cardBg: '#ffffff',
  inputBg: '#eef2f6',
  text: '#0a1929',
  textMuted: '#5a7090',
  hint: '#a0b0c0',
  divider: '#dde4ec',
  brandColor: '#0070f3',
  radius: 14,
  lcdFrame: '#ffffff',
  lcdScreen: '#eef5fb',
  lcdBorder: '#cce0f0',
  lcdText: '#0070f3',
  lcdLed: '#00d4ff',
  lcdBrandColor: '#0a1929',
  font: {
    display: 'ShareTechMono_400Regular',
  },
  // pure white + bright blue Apple-style
  categoryPalette: {
    favorites: { bg: '#e8f4ff', accent: '#0070f3' },
    life: { bg: '#dceeff', accent: '#0090f5' },
    science: { bg: '#d8f0ff', accent: '#00a0e0' },
    wealth: { bg: '#e0f0ff', accent: '#3080ff' },
    gambling: { bg: '#ddebfc', accent: '#5070d0' },
    health: { bg: '#e8f4ff', accent: '#0090d0' },
    design: { bg: '#e0eeff', accent: '#4070ff' },
    time: { bg: '#dceeff', accent: '#3070e0' },
    education: { bg: '#e4f0ff', accent: '#1070d8' },
    cooking: { bg: '#e8f4ff', accent: '#0080c8' },
    game: { bg: '#dcefff', accent: '#00a0ff' },
  },
};

const modern: Theme = {
  id: 'modern',
  name: '現代感（暗）',
  isDark: true,
  isPremium: true,
  bg: '#0a0a0a',
  cardBg: '#1a1a1a',
  inputBg: '#262626',
  text: '#f5e8b8',
  textMuted: '#a89878',
  hint: '#5a5040',
  divider: '#262626',
  brandColor: '#d4af37',
  radius: 6,
  lcdFrame: '#1a1a1a',
  lcdScreen: '#0a0a0a',
  lcdBorder: '#d4af37',
  lcdText: '#f5d878',
  lcdLed: '#ffd060',
  font: {
    display: 'Fraunces_700Bold',
  },
  categoryPalette: {
    favorites: { bg: '#1f1a0e', accent: '#ffd060' },
    life: { bg: '#1a1612', accent: '#e8c878' },
    science: { bg: '#1c1815', accent: '#d4a040' },
    wealth: { bg: '#221c0e', accent: '#ffd870' },
    gambling: { bg: '#1a1410', accent: '#b88c30' },
    health: { bg: '#1c1612', accent: '#dab050' },
    design: { bg: '#1f1a10', accent: '#e8c870' },
    time: { bg: '#1a1612', accent: '#c0a060' },
    education: { bg: '#221c10', accent: '#dcb850' },
    cooking: { bg: '#1c1810', accent: '#cc9030' },
    game: { bg: '#1c1810', accent: '#e0a830' },
  },
};

const THEMES_RECORD: Record<ThemeId, Theme> = {
  'classic-light': classicLight,
  'classic-dark': classicDark,
  candy,
  chocolate,
  cat,
  haooo,
  cyberpunk,
  tech,
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
