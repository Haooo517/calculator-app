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
  | 'modern'
  | 'pixel-arcade'
  | 'minimal'
  | 'retro'
  | 'cartoon'
  | 'doggy'
  | 'aquarium'
  | 'zoo'
  | 'magic'
  | 'flower'
  | 'palace';

export type CategoryPalette = { bg: string; accent: string };

export type Theme = {
  id: ThemeId;
  name: string;
  description?: string; // 主題視窗中的簡短說明
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
  // optional per-category icon overrides — value is a key in ICON_REGISTRY
  iconOverrides?: Record<string, string>;
  // optional font overrides
  font?: {
    display?: string;   // big headlines / brand (Latin-focused themes)
    displayCn?: string; // big headlines for Chinese text (preferred for 中文 titles)
    mono?: string;      // monospace used by mascot
  };
  // optional decorative borders for card surfaces
  cardBorder?: { color: string; width: number };
  iconBoxBorder?: { color: string; width: number };
  // gold-style gradient fill for iconBox
  iconBoxGradient?: string[];
  // mascot rendering variant
  mascotVariant?: 'default' | 'cat';
  // page background overlay pattern
  bgPattern?: 'dots' | 'stripes' | 'grid' | 'waves' | 'sparkle';
  bgPatternColor?: string;
  // overlay pattern inside the LCD frame
  lcdFramePattern?: 'dots' | 'stripes' | 'candy';
  lcdFramePatternColor?: string;
  lcdFramePatternColor2?: string;
  // optional outer border around LCD frame
  lcdFrameBorder?: { color: string; width: number };
  // optional override for the category-page hero background (when category bg is too bright)
  heroBg?: string;
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
  description: '歐古最早的奶油杏桃配色，溫暖好讀的日常款。',
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
  description: '經典的夜晚版本，暖咖啡色配 GameBoy 綠的 LCD。',
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
  description: '粉紅泡泡 + 拐杖糖斜紋 LCD，像走進糖果店。',
  isDark: false,
  isPremium: true,
  bg: '#fff0f5',
  cardBg: '#fff',
  inputBg: '#fde4ef',
  text: '#5a2d4d',
  textMuted: '#9a6f88',
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
  lcdFramePattern: 'candy',
  lcdFramePatternColor: '#ff3060', // 紅色拐杖糖條紋
  lcdFramePatternColor2: '#ffffff', // 白色間隔
  categoryPalette: {
    favorites: { bg: '#ffd4e8', accent: '#ff3a80' },
    life: { bg: '#c8e8ff', accent: '#2090ff' },
    science: { bg: '#c8ffd8', accent: '#0c9842' },
    wealth: { bg: '#fff0a0', accent: '#c88408' },
    gambling: { bg: '#f0c4ff', accent: '#9030d8' },
    health: { bg: '#ffc4d0', accent: '#e83060' },
    design: { bg: '#ffd0b8', accent: '#e85c10' },
    time: { bg: '#d0d0ff', accent: '#5050e8' },
    education: { bg: '#ffe4b0', accent: '#c0700a' },
    cooking: { bg: '#ffd0c0', accent: '#ff4020' },
    game: { bg: '#c4ffc4', accent: '#30b020' },
  },
};

const chocolate: Theme = {
  id: 'chocolate',
  name: '巧克力（暗）',
  description: '層層烘焙的咖啡色，icon 是不同口味的巧克力。',
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
  // iconBox 用比 card 更深一階的咖啡色，提高對比；icon 用不同烘焙度區分
  categoryPalette: {
    favorites: { bg: '#1f1208', accent: '#fde8ce' }, // 奶霜
    life: { bg: '#1f1208', accent: '#f4e0c8' }, // 拿鐵奶白
    science: { bg: '#1f1208', accent: '#d4b86a' }, // 抹茶摩卡
    wealth: { bg: '#1f1208', accent: '#ffc878' }, // 焦糖
    gambling: { bg: '#1f1208', accent: '#c87838' }, // 黑巧克力
    health: { bg: '#1f1208', accent: '#e89878' }, // 玫瑰摩卡
    design: { bg: '#1f1208', accent: '#e8b070' }, // 榛果
    time: { bg: '#1f1208', accent: '#fff0d8' }, // 卡布奇諾
    education: { bg: '#1f1208', accent: '#a88060' }, // 核桃
    cooking: { bg: '#1f1208', accent: '#c84830' }, // 磚紅
    game: { bg: '#1f1208', accent: '#a0c878' }, // 開心果
  },
};

const cat: Theme = {
  id: 'cat',
  name: '喵喵（亮）',
  description: '歐古長出貓耳朵，icon 全換成貓的世界（魚、月亮、貓掌）。',
  isDark: false,
  isPremium: true,
  bg: '#fef5e0',
  cardBg: '#fff',
  inputBg: '#fce8c0',
  text: '#5a3018',
  textMuted: '#9a7252',
  hint: '#d4b890',
  divider: '#f8e4c0',
  brandColor: '#e8843a',
  radius: 26,
  lcdFrame: '#ffb868',
  lcdScreen: '#fff5d8',
  lcdBorder: '#d49040',
  lcdText: '#5a3018',
  lcdLed: '#ff8a30',
  lcdBrandColor: '#7a3a10', // 深棕，在 #ffb868 框上才看得到
  mascotVariant: 'cat',
  // 不同毛色的貓
  categoryPalette: {
    favorites: { bg: '#ffe0b8', accent: '#d46820' }, // 橘貓
    life: { bg: '#f5e8d0', accent: '#8a5828' }, // 虎斑
    science: { bg: '#fff0d8', accent: '#a87838' }, // 米克斯
    wealth: { bg: '#fff8c8', accent: '#c89020' }, // 金吉拉
    gambling: { bg: '#e8d8e0', accent: '#704850' }, // 玳瑁
    health: { bg: '#ffd8d0', accent: '#c85040' }, // 三花
    design: { bg: '#ffc8a0', accent: '#a04018' }, // 暹羅
    time: { bg: '#d8d8d8', accent: '#404040' }, // 黑貓
    education: { bg: '#fff0e8', accent: '#a87060' }, // 賓士
    cooking: { bg: '#ffe8d0', accent: '#b85820' }, // 起司貓
    game: { bg: '#f0f0f0', accent: '#606060' }, // 灰貓
  },
  // 換掉 icon：貓主題要全是貓世界的東西
  iconOverrides: {
    favorites: 'Star',       // 貓最愛的閃亮東西
    health: 'Heart',         // 心心（取代 Heartbeat）
    time: 'Moon',            // 貓是夜行動物
    cooking: 'Fish',         // 罐罐！
    game: 'PawPrint',        // 貓掌印
    science: 'Sparkle',      // 貓眼閃光
  },
};

const HAOOO_BG = '#ffd0b8';
const HAOOO_ORANGE = '#ff7a30';
const haooo: Theme = {
  id: 'haooo',
  name: 'Haooo（暗）',
  description: '黑底配橘色描邊 + Caveat 手寫英文 + 圓潤繁體中文。',
  isDark: true,
  isPremium: true,
  // 純色暗底，但帶橘調咖啡的暖意（不再有點點圖案）
  bg: '#1a0e06',
  cardBg: '#2a1810',
  inputBg: '#3a2010',
  text: '#ffe8c8',
  textMuted: '#e0a060',
  hint: '#a86838',
  divider: '#4a2810',
  brandColor: HAOOO_ORANGE,
  radius: 14,
  lcdFrame: HAOOO_ORANGE,
  lcdScreen: '#080604',
  lcdBorder: HAOOO_ORANGE,
  lcdText: '#ffaa50',
  lcdLed: '#ff5a10',
  lcdBrandColor: '#1a0a02',
  font: {
    display: 'Caveat_700Bold',      // 英文招牌（LCD brand 等）
    displayCn: 'NotoSansTC_700Bold', // 中文標題（正確支援繁體中文）
  },
  cardBorder: { color: HAOOO_ORANGE, width: 1.5 },
  heroBg: '#4a2010', // 燒焦橘棕：所有 accent 顏色都能在上面看清楚
  // 杏桃 icon 底；icon 色都偏暖色家族（橘紅黃為主，少量對比色）
  categoryPalette: {
    favorites: { bg: HAOOO_BG, accent: '#e02040' }, // 深紅
    life: { bg: HAOOO_BG, accent: '#3098ff' }, // 藍（少量對比）
    science: { bg: HAOOO_BG, accent: '#30a040' }, // 綠
    wealth: { bg: HAOOO_BG, accent: '#b87808' }, // 金黃（加深保對比）
    gambling: { bg: HAOOO_BG, accent: '#9040d0' }, // 紫
    health: { bg: HAOOO_BG, accent: '#e85090' }, // 粉（加深保對比）
    design: { bg: HAOOO_BG, accent: '#e06010' }, // 橘（加深保對比）
    time: { bg: HAOOO_BG, accent: '#5060d8' }, // 靛
    education: { bg: HAOOO_BG, accent: '#a86018' }, // 棕
    cooking: { bg: HAOOO_BG, accent: '#ff4020' }, // 橘紅
    game: { bg: HAOOO_BG, accent: '#1a7838' }, // 深森林綠
  },
};

const CYBER_DARK = '#0a0a18';
const CYBER_CARD = '#100a24';
const CYBER_ICON_BG = '#1a0f32';
const NEON_PINK = '#ff2a8a';
const NEON_CYAN = '#00f0ff';
const cyberpunk: Theme = {
  id: 'cyberpunk',
  name: '賽博龐克（暗）',
  description: '深紫底 + 霓虹粉青招牌，每個分類都是不同的霓虹色。',
  isDark: true,
  isPremium: true,
  bg: CYBER_DARK,
  cardBg: CYBER_CARD,
  inputBg: '#1a1438',
  text: '#e8e0ff',
  textMuted: '#9080c8',
  hint: '#5a4a90',
  divider: '#2a1f50',
  brandColor: NEON_PINK,
  radius: 8,
  lcdFrame: '#150828',
  lcdScreen: '#040218',
  lcdBorder: NEON_PINK,
  lcdText: NEON_CYAN,
  lcdLed: NEON_PINK,
  lcdBrandColor: NEON_PINK,
  font: {
    display: 'ShareTechMono_400Regular',
    mono: 'ShareTechMono_400Regular',
  },
  bgPattern: 'grid',
  bgPatternColor: NEON_CYAN,
  cardBorder: { color: '#3a1a5a', width: 1 },
  // 霓虹燈招牌：每個分類一個霓虹色（粉、青、綠、黃、紫、橘…）
  categoryPalette: {
    favorites: { bg: CYBER_ICON_BG, accent: NEON_PINK },       // 霓虹粉
    life: { bg: CYBER_ICON_BG, accent: NEON_CYAN },             // 霓虹青
    science: { bg: CYBER_ICON_BG, accent: '#00ff88' },          // 駭客綠
    wealth: { bg: CYBER_ICON_BG, accent: '#ffd000' },           // 霓虹黃
    gambling: { bg: CYBER_ICON_BG, accent: '#c050ff' },         // 霓虹紫
    health: { bg: CYBER_ICON_BG, accent: '#ff5060' },           // 霓虹紅
    design: { bg: CYBER_ICON_BG, accent: '#ff8800' },           // 霓虹橘
    time: { bg: CYBER_ICON_BG, accent: '#5080ff' },             // 電光藍
    education: { bg: CYBER_ICON_BG, accent: '#a0ff20' },        // 萊姆
    cooking: { bg: CYBER_ICON_BG, accent: '#ff4488' },          // 桃紅
    game: { bg: CYBER_ICON_BG, accent: '#00ffd0' },             // 螢光青
  },
};

const tech: Theme = {
  id: 'tech',
  name: '科技感（亮）',
  description: '純白底 + 藍色點綴，乾淨的科技質感。',
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
    game: { bg: '#dcefff', accent: '#0088e0' },
  },
};

const MODERN_BG = '#0d0a05';
const MODERN_GOLD = '#e8c060';
const MODERN_GOLD_LIGHT = '#fde08a';
const modern: Theme = {
  id: 'modern',
  name: '黑金（暗）',
  description: '全黑底 + 金色細邊，所有 icon 統一金黃。',
  isDark: true,
  isPremium: true,
  bg: '#000000',
  cardBg: MODERN_BG,
  inputBg: '#1a140a',
  text: '#fde08a',
  textMuted: '#a89060',
  hint: '#5a5040',
  divider: '#3a2c14',
  brandColor: MODERN_GOLD_LIGHT,
  radius: 6,
  lcdFrame: '#0a0805',
  lcdScreen: '#000000',
  lcdBorder: MODERN_GOLD,
  lcdText: MODERN_GOLD_LIGHT,
  lcdLed: '#ffd060',
  lcdBrandColor: MODERN_GOLD_LIGHT,
  font: {
    display: 'Fraunces_700Bold',
  },
  // 全部分類同款黑金 — icon 用金色，底維持黑
  categoryPalette: {
    favorites: { bg: MODERN_BG, accent: MODERN_GOLD },
    life: { bg: MODERN_BG, accent: MODERN_GOLD },
    science: { bg: MODERN_BG, accent: MODERN_GOLD },
    wealth: { bg: MODERN_BG, accent: MODERN_GOLD },
    gambling: { bg: MODERN_BG, accent: MODERN_GOLD },
    health: { bg: MODERN_BG, accent: MODERN_GOLD },
    design: { bg: MODERN_BG, accent: MODERN_GOLD },
    time: { bg: MODERN_BG, accent: MODERN_GOLD },
    education: { bg: MODERN_BG, accent: MODERN_GOLD },
    cooking: { bg: MODERN_BG, accent: MODERN_GOLD },
    game: { bg: MODERN_BG, accent: MODERN_GOLD },
  },
  cardBorder: { color: MODERN_GOLD, width: 1.5 },
  iconBoxBorder: { color: MODERN_GOLD, width: 1.5 },
  lcdFrameBorder: { color: MODERN_GOLD, width: 2 },
};

// ===== 像素電玩 (Pixel Arcade) =====
const pixelArcade: Theme = {
  id: 'pixel-arcade',
  name: '像素電玩（暗）',
  description: '經典 GameBoy 綠 LCD + 街機霓虹按鈕色 + 像素字體。',
  isDark: true,
  isPremium: true,
  bg: '#1a0a3a',
  cardBg: '#2a1054',
  inputBg: '#3a1868',
  text: '#fff0a0',
  textMuted: '#a890e8',
  hint: '#6850a8',
  divider: '#3a2068',
  brandColor: '#ffd000',
  radius: 4, // 像素感方角
  lcdFrame: '#3a2068',
  lcdScreen: '#9bbc0f', // 經典 GameBoy 綠
  lcdBorder: '#0a4020',
  lcdText: '#0a4020',
  lcdLed: '#ff3050',
  lcdBrandColor: '#ffd000', // 街機黃，在 #3a2068 紫框上才看得到
  font: { display: 'PressStart2P_400Regular', mono: 'PressStart2P_400Regular' },
  cardBorder: { color: '#ffd000', width: 2 },
  // 街機霓虹色：每格不同霓虹按鈕
  categoryPalette: {
    favorites: { bg: '#2a1054', accent: '#ff3050' },  // 紅按鈕
    life:      { bg: '#2a1054', accent: '#00d8ff' },  // 青按鈕
    science:   { bg: '#2a1054', accent: '#00ff80' },  // 綠按鈕
    wealth:    { bg: '#2a1054', accent: '#ffd000' },  // 黃按鈕
    gambling:  { bg: '#2a1054', accent: '#d800a0' },  // 桃按鈕
    health:    { bg: '#2a1054', accent: '#ff5080' },  // 粉按鈕
    design:    { bg: '#2a1054', accent: '#ff8c00' },  // 橘按鈕
    time:      { bg: '#2a1054', accent: '#80a0ff' },  // 藍按鈕
    education: { bg: '#2a1054', accent: '#c0ff40' },  // 萊姆按鈕
    cooking:   { bg: '#2a1054', accent: '#ff6040' },  // 朱按鈕
    game:      { bg: '#2a1054', accent: '#00ffd0' },  // 螢光青按鈕
  },
  iconOverrides: {
    favorites: 'Star',
    game: 'GameController',
  },
};

// ===== 簡樸 (Minimal) =====
const minimal: Theme = {
  id: 'minimal',
  name: '簡樸（亮）',
  description: '純白底 + 細灰邊，去掉所有裝飾的極簡風。',
  isDark: false,
  isPremium: true,
  bg: '#ffffff',
  cardBg: '#fafafa',
  inputBg: '#f0f0f0',
  text: '#0a0a0a',
  textMuted: '#888',
  hint: '#bbb',
  divider: '#ececec',
  brandColor: '#0a0a0a',
  radius: 10,
  lcdFrame: '#fafafa',
  lcdScreen: '#ffffff',
  lcdBorder: '#e0e0e0',
  lcdText: '#0a0a0a',
  lcdLed: '#0a0a0a',
  lcdBrandColor: '#0a0a0a',
  cardBorder: { color: '#ececec', width: 1 },
  // 通通同色，靠細微深淺區分
  categoryPalette: Object.fromEntries(
    ['favorites','life','science','wealth','gambling','health','design','time','education','cooking','game'].map(
      (k) => [k, { bg: '#f0f0f0', accent: '#0a0a0a' }]
    )
  ),
};

// ===== 復古 70s/80s (Retro) =====
const retro: Theme = {
  id: 'retro',
  name: '復古（亮）',
  description: '70s 暖陽芥末橘 + 斜紋底 + 復古 serif 字體。',
  isDark: false,
  isPremium: true,
  bg: '#fff5e0',
  cardBg: '#fef6e4',
  inputBg: '#fae4c0',
  text: '#3a2a1a',
  textMuted: '#8a6a4a',
  hint: '#bfa080',
  divider: '#e8d4b0',
  brandColor: '#d4732a',
  radius: 18,
  lcdFrame: '#d4a058',
  lcdScreen: '#fef0d0',
  lcdBorder: '#a87830',
  lcdText: '#3a2a1a',
  lcdLed: '#e84a30',
  lcdBrandColor: '#3a2a1a',
  font: { display: 'Fraunces_700Bold' },
  bgPattern: 'stripes',
  bgPatternColor: '#d4a058',
  // 70s 暖陽色系：芥末、橘、藍綠、磚紅
  categoryPalette: {
    favorites: { bg: '#fae0b8', accent: '#d4732a' },
    life:      { bg: '#e0e8d0', accent: '#5a7a4a' },
    science:   { bg: '#d0e0e0', accent: '#2a8a8a' },
    wealth:    { bg: '#fae8a8', accent: '#a87830' },
    gambling:  { bg: '#e8d0d0', accent: '#8a4040' },
    health:    { bg: '#f8d4c8', accent: '#c8503a' },
    design:    { bg: '#fad8b8', accent: '#d46038' },
    time:      { bg: '#e0d0e0', accent: '#7a4a8a' },
    education: { bg: '#f0e0c0', accent: '#8a6020' },
    cooking:   { bg: '#fad0c0', accent: '#c84830' },
    game:      { bg: '#e8e0d0', accent: '#8a7838' },
  },
};

// ===== 美式卡通 (American Cartoon) =====
const cartoon: Theme = {
  id: 'cartoon',
  name: '美式卡通（亮）',
  description: '三原色 + 粗黑邊 + Ben-Day 點點，像漫畫頁。',
  isDark: false,
  isPremium: true,
  bg: '#fff8d8',
  cardBg: '#ffffff',
  inputBg: '#fff0a8',
  text: '#000000',
  textMuted: '#444',
  hint: '#888',
  divider: '#000',
  brandColor: '#ff3050',
  radius: 16,
  lcdFrame: '#ffd000',
  lcdScreen: '#ffffff',
  lcdBorder: '#000',
  lcdText: '#000',
  lcdLed: '#ff3050',
  lcdBrandColor: '#000',
  cardBorder: { color: '#000', width: 2.5 },
  iconBoxBorder: { color: '#000', width: 2 },
  lcdFrameBorder: { color: '#000', width: 3 },
  bgPattern: 'dots',
  bgPatternColor: '#ff3050',
  // 三原色卡通配色
  categoryPalette: {
    favorites: { bg: '#ffd000', accent: '#000' },
    life:      { bg: '#3098ff', accent: '#000' },
    science:   { bg: '#30c850', accent: '#000' },
    wealth:    { bg: '#ffd000', accent: '#000' },
    gambling:  { bg: '#a050d8', accent: '#000' },
    health:    { bg: '#ff5878', accent: '#000' },
    design:    { bg: '#ff8030', accent: '#000' },
    time:      { bg: '#5078e8', accent: '#000' },
    education: { bg: '#ffb030', accent: '#000' },
    cooking:   { bg: '#ff4030', accent: '#000' },
    game:      { bg: '#30c8c8', accent: '#000' },
  },
};

// ===== 狗狗 (Doggy) =====
const doggy: Theme = {
  id: 'doggy',
  name: '狗狗（亮）',
  description: '黃金獵犬奶油色，icon 全是狗（柯基、柴犬、哈士奇毛色）。',
  isDark: false,
  isPremium: true,
  bg: '#fef0d8',
  cardBg: '#fff',
  inputBg: '#fae0c0',
  text: '#4a2818',
  textMuted: '#a87858',
  hint: '#d4b090',
  divider: '#f0d8b8',
  brandColor: '#d48830',
  radius: 24,
  lcdFrame: '#d4a468',
  lcdScreen: '#fff0d8',
  lcdBorder: '#a87038',
  lcdText: '#4a2818',
  lcdLed: '#ff9038',
  lcdBrandColor: '#4a2818', // 深棕，在 #d4a468 框上才看得到
  // 狗狗：乾淨奶油底，不放圖案
  // 各種狗狗的毛色
  categoryPalette: {
    favorites: { bg: '#fad0a0', accent: '#c87030' }, // 黃金獵犬
    life:      { bg: '#f0e0c8', accent: '#8a6038' }, // 柴犬
    science:   { bg: '#fff0d0', accent: '#a87030' }, // 米克斯
    wealth:    { bg: '#fae8a8', accent: '#a87810' }, // 黃金（加深保對比）
    gambling:  { bg: '#e0d8d0', accent: '#605040' }, // 灰
    health:    { bg: '#fad8c8', accent: '#c85838' }, // 柯基
    design:    { bg: '#fac8a0', accent: '#a83820' }, // 紅貴賓
    time:      { bg: '#d0d0c8', accent: '#404040' }, // 黑拉布拉多
    education: { bg: '#fff0e0', accent: '#8a6048' }, // 米格魯
    cooking:   { bg: '#fae0c0', accent: '#a85820' }, // 法鬥
    game:      { bg: '#f0f0e8', accent: '#707060' }, // 哈士奇
  },
  iconOverrides: {
    favorites: 'Dog',
    health: 'Heart',
    game: 'PawPrint',
    cooking: 'PawPrint',
    science: 'PawPrint',
  },
};

// ===== 水族館 (Aquarium) =====
const aquarium: Theme = {
  id: 'aquarium',
  name: '水族館（暗）',
  description: '深海藍 + 珊瑚粉/螢光青，icon 有魚、海星、水滴。',
  isDark: true,
  isPremium: true,
  bg: '#082848',
  cardBg: '#0e3858',
  inputBg: '#185070',
  text: '#d8f0ff',
  textMuted: '#80a8c8',
  hint: '#4a7090',
  divider: '#1a4868',
  brandColor: '#40d8e0',
  radius: 28,
  lcdFrame: '#1a4868',
  lcdScreen: '#0a2848',
  lcdBorder: '#40d8e0',
  lcdText: '#a8e8ff',
  lcdLed: '#ff80c0',
  bgPattern: 'waves',
  bgPatternColor: '#40d8e0',
  // 海洋生物配色
  categoryPalette: {
    favorites: { bg: '#1a4870', accent: '#ffd060' }, // 海星黃
    life:      { bg: '#1a4870', accent: '#80e8ff' }, // 水母青
    science:   { bg: '#1a4870', accent: '#a0ff80' }, // 海藻綠
    wealth:    { bg: '#1a4870', accent: '#ffc830' }, // 金魚
    gambling:  { bg: '#1a4870', accent: '#c878ff' }, // 海葵紫
    health:    { bg: '#1a4870', accent: '#ff80a8' }, // 珊瑚粉
    design:    { bg: '#1a4870', accent: '#ff9050' }, // 小丑魚
    time:      { bg: '#1a4870', accent: '#6090ff' }, // 深海藍
    education: { bg: '#1a4870', accent: '#a0d8c8' }, // 海龜
    cooking:   { bg: '#1a4870', accent: '#ff7080' }, // 鮭魚
    game:      { bg: '#1a4870', accent: '#80f0e0' }, // 熱帶魚
  },
  iconOverrides: {
    favorites: 'Star',     // 海星
    life: 'Drop',
    cooking: 'Fish',
    game: 'Fish',
    health: 'Heart',
    time: 'Drop',
  },
};

// ===== 動物園 (Zoo) =====
const zoo: Theme = {
  id: 'zoo',
  name: '動物園（亮）',
  description: '草原棕黃 + 動物毛色（獅子、老虎、企鵝）。',
  isDark: false,
  isPremium: true,
  bg: '#e8e4d0',
  cardBg: '#fffaf0',
  inputBg: '#f0e8d0',
  text: '#2a2010',
  textMuted: '#7a6840',
  hint: '#a89860',
  divider: '#d8c8a0',
  brandColor: '#d47830',
  radius: 22,
  lcdFrame: '#a87838',
  lcdScreen: '#fff5d8',
  lcdBorder: '#5a3a18',
  lcdText: '#2a2010',
  lcdLed: '#e85020',
  lcdBrandColor: '#fff5d8', // 米白，在 #a87838 棕框上才看得到
  font: { display: 'Fraunces_700Bold' },
  // 動物毛色：獅子金、老虎橘、企鵝黑、熊棕…
  categoryPalette: {
    favorites: { bg: '#fae0a0', accent: '#b07410' }, // 獅子（加深保對比）
    life:      { bg: '#f0e0c0', accent: '#8a6028' }, // 大象
    science:   { bg: '#fae8c8', accent: '#8a7038' }, // 長頸鹿
    wealth:    { bg: '#fae8a0', accent: '#a87810' }, // 黃金（加深保對比）
    gambling:  { bg: '#e8d8c0', accent: '#605040' }, // 灰狼
    health:    { bg: '#fad8c0', accent: '#c85020' }, // 紅毛猩猩
    design:    { bg: '#fac890', accent: '#a83818' }, // 老虎
    time:      { bg: '#d8d8d8', accent: '#202020' }, // 企鵝
    education: { bg: '#fff0e0', accent: '#7a5028' }, // 猴子
    cooking:   { bg: '#fae0a8', accent: '#a86020' }, // 河馬
    game:      { bg: '#e0f0c8', accent: '#5a8030' }, // 鸚鵡
  },
  iconOverrides: {
    favorites: 'PawPrint',
    life: 'Tree',
    health: 'Heart',
    cooking: 'Leaf',
    game: 'Bird',
    education: 'PawPrint',
  },
};

// ===== 魔法 (Magic) =====
const magic: Theme = {
  id: 'magic',
  name: '魔法（暗）',
  description: '深紫底 + 金沙星點 + 魔杖皇冠月亮閃電 icon。',
  isDark: true,
  isPremium: true,
  bg: '#0a0830',
  cardBg: '#161250',
  inputBg: '#241a70',
  text: '#e8d8ff',
  textMuted: '#a098d0',
  hint: '#6058a0',
  divider: '#2a2068',
  brandColor: '#ffc060',
  radius: 16,
  lcdFrame: '#241a70',
  lcdScreen: '#0a0428',
  lcdBorder: '#ffc060',
  lcdText: '#ffd890',
  lcdLed: '#a060ff',
  lcdBrandColor: '#ffc060',
  font: { display: 'Fraunces_700Bold' },
  bgPattern: 'sparkle',
  bgPatternColor: '#ffc060',
  cardBorder: { color: '#a060ff', width: 1 },
  // 魔法元素：金、紫、青、玫瑰金
  categoryPalette: {
    favorites: { bg: '#241a70', accent: '#ffd060' }, // 金
    life:      { bg: '#241a70', accent: '#80e8c8' }, // 翡翠
    science:   { bg: '#241a70', accent: '#a060ff' }, // 紫魔法
    wealth:    { bg: '#241a70', accent: '#ffe080' }, // 黃金
    gambling:  { bg: '#241a70', accent: '#ff60c0' }, // 玫瑰
    health:    { bg: '#241a70', accent: '#ff8898' }, // 心咒
    design:    { bg: '#241a70', accent: '#c8a0ff' }, // 薰衣
    time:      { bg: '#241a70', accent: '#80a8ff' }, // 占星
    education: { bg: '#241a70', accent: '#ffc060' }, // 古卷
    cooking:   { bg: '#241a70', accent: '#ff9050' }, // 火焰
    game:      { bg: '#241a70', accent: '#60ffd0' }, // 仙術
  },
  iconOverrides: {
    favorites: 'Star',
    science: 'Sparkle',
    gambling: 'Crown',
    design: 'Sparkle',
    time: 'Moon',
    game: 'Lightning',
    cooking: 'Lightning',
    education: 'Sword',
  },
};

// ===== 花朵 (Flower) =====
const flower: Theme = {
  id: 'flower',
  name: '花朵（亮）',
  description: '粉色花園 + 手寫字體，icon 全換成花朵跟葉子。',
  isDark: false,
  isPremium: true,
  bg: '#fff0f5',
  cardBg: '#ffffff',
  inputBg: '#fae0e8',
  text: '#5a2840',
  textMuted: '#a87090',
  hint: '#d4a8b8',
  divider: '#fae0e8',
  brandColor: '#e8508a',
  radius: 32, // 花瓣圓潤
  lcdFrame: '#f8c8d8',
  lcdScreen: '#fff8fb',
  lcdBorder: '#d878a0',
  lcdText: '#5a2840',
  lcdLed: '#e84080',
  font: { display: 'Caveat_700Bold' },
  // 花朵：乾淨粉色底，圓潤卡片即是特色
  // 各種花朵的色彩
  categoryPalette: {
    favorites: { bg: '#fad8e4', accent: '#e84080' }, // 玫瑰
    life:      { bg: '#e0f0d8', accent: '#5aa040' }, // 葉子
    science:   { bg: '#e8e0f0', accent: '#8050b0' }, // 薰衣草
    wealth:    { bg: '#fff0c8', accent: '#b8860b' }, // 向日葵（加深保對比）
    gambling:  { bg: '#f0d8f0', accent: '#a050a0' }, // 紫羅蘭
    health:    { bg: '#fae0d8', accent: '#e85838' }, // 鬱金香
    design:    { bg: '#fae8d0', accent: '#d47830' }, // 萬壽菊
    time:      { bg: '#dae8f0', accent: '#4a78a8' }, // 牽牛花
    education: { bg: '#fff0d8', accent: '#c88848' }, // 雞蛋花
    cooking:   { bg: '#fad0c8', accent: '#d84830' }, // 朱槿
    game:      { bg: '#f0e0d8', accent: '#a06848' }, // 鳶尾
  },
  iconOverrides: {
    favorites: 'Flower',
    life: 'Leaf',
    health: 'Flower',
    design: 'Flower',
    science: 'Sparkle',
    cooking: 'Cherries',
    game: 'Leaf',
  },
};

// ===== 宮廷劇 (Palace Drama) =====
const palace: Theme = {
  id: 'palace',
  name: '宮廷（暗）',
  description: '朱紅 + 金邊 + 馬善正書法中文，宮廷劇質感。',
  isDark: true,
  isPremium: true,
  bg: '#3a0a0e',
  cardBg: '#5a1a1e',
  inputBg: '#702a2e',
  text: '#fde8a8',
  textMuted: '#c89858',
  hint: '#8a6028',
  divider: '#702a2e',
  brandColor: '#e8c060',
  radius: 8,
  lcdFrame: '#1a0204',
  lcdScreen: '#0a0102',
  lcdBorder: '#e8c060',
  lcdText: '#fde8a8',
  lcdLed: '#e8c060',
  lcdBrandColor: '#e8c060',
  font: {
    display: 'Fraunces_700Bold',
    displayCn: 'MaShanZheng_400Regular', // 中文用毛筆書法
  },
  cardBorder: { color: '#e8c060', width: 1.5 },
  iconBoxBorder: { color: '#e8c060', width: 1.5 },
  lcdFrameBorder: { color: '#e8c060', width: 2 },
  // 宮廷紅金：朱紅、明黃、翡翠、藏青
  categoryPalette: {
    favorites: { bg: '#5a1a1e', accent: '#e8c060' }, // 金
    life:      { bg: '#5a1a1e', accent: '#fde8a8' }, // 米
    science:   { bg: '#5a1a1e', accent: '#60a878' }, // 翡翠
    wealth:    { bg: '#5a1a1e', accent: '#ffd060' }, // 金黃
    gambling:  { bg: '#5a1a1e', accent: '#e84850' }, // 朱紅
    health:    { bg: '#5a1a1e', accent: '#f8a0a0' }, // 桃花
    design:    { bg: '#5a1a1e', accent: '#e8c098' }, // 象牙
    time:      { bg: '#5a1a1e', accent: '#a0b8d0' }, // 月白
    education: { bg: '#5a1a1e', accent: '#c8a878' }, // 古卷
    cooking:   { bg: '#5a1a1e', accent: '#e87838' }, // 琥珀
    game:      { bg: '#5a1a1e', accent: '#80c098' }, // 翠玉
  },
  iconOverrides: {
    favorites: 'Crown',
    gambling: 'Crown',
    wealth: 'Crown',
    design: 'Sparkle',
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
  'pixel-arcade': pixelArcade,
  minimal,
  retro,
  cartoon,
  doggy,
  aquarium,
  zoo,
  magic,
  flower,
  palace,
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
