import {
  Bird,
  Calculator,
  Cat,
  Cherries,
  Clock,
  CookingPot,
  Crown,
  Dog,
  Drop,
  Fish,
  Flask,
  Flower,
  GameController,
  GraduationCap,
  Heart,
  Heartbeat,
  HouseLine,
  IconWeight,
  Leaf,
  Lightning,
  Moon,
  MusicNote,
  Palette,
  PawPrint,
  Pizza,
  PokerChip,
  PushPin,
  Rabbit,
  Sparkle,
  Star,
  Sun,
  Sword,
  Tree,
  Wallet,
  Wind,
} from 'phosphor-react-native';
import { ComponentType } from 'react';
import { useTheme } from '../lib/theme';

type PhosphorIcon = ComponentType<{ size?: number; color?: string; weight?: IconWeight }>;

// 完整 icon 註冊表：主題可在 iconOverrides 用字串名稱指定要換成哪個
export const ICON_REGISTRY: Record<string, PhosphorIcon> = {
  // 預設分類 icon
  Calculator, PushPin, HouseLine, Flask, Wallet, PokerChip, Heartbeat,
  Palette, Clock, GraduationCap, CookingPot, GameController,
  // 主題替換選項
  Cat, Dog, Rabbit, Bird, Fish, PawPrint,
  Star, Heart, Sparkle, Crown, Sword, Lightning,
  Flower, Leaf, Tree, Sun, Moon, Wind, Drop,
  Cherries, Pizza, MusicNote,
};

// 預設分類 → icon 名稱（會在 ICON_REGISTRY 中查找）
const DEFAULT_ICONS: Record<string, string> = {
  favorites: 'PushPin',
  life: 'HouseLine',
  science: 'Flask',
  wealth: 'Wallet',
  gambling: 'PokerChip',
  health: 'Heartbeat',
  design: 'Palette',
  time: 'Clock',
  education: 'GraduationCap',
  cooking: 'CookingPot',
  game: 'GameController',
};

type Props = {
  id: string;
  size?: number;
  color?: string;
  weight?: IconWeight;
};

export function CategoryIcon({ id, size = 32, color = '#2d2520', weight = 'fill' }: Props) {
  const { theme } = useTheme();
  const name = theme.iconOverrides?.[id] ?? DEFAULT_ICONS[id] ?? 'Calculator';
  const Icon = ICON_REGISTRY[name] ?? Calculator;
  return <Icon size={size} color={color} weight={weight} />;
}
