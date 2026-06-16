import {
  Acorn,
  Anchor,
  Atom,
  Bird,
  Bone,
  BowlFood,
  Bug,
  Butterfly,
  Calculator,
  Carrot,
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
  FlowerLotus,
  FlowerTulip,
  GameController,
  Gift,
  GraduationCap,
  HandHeart,
  Heart,
  Heartbeat,
  Horse,
  HouseLine,
  IconWeight,
  Leaf,
  Lightning,
  MagicWand,
  Moon,
  MoonStars,
  MusicNote,
  Palette,
  PawPrint,
  Pizza,
  PokerChip,
  PottedPlant,
  PushPin,
  Rabbit,
  Rainbow,
  Sailboat,
  ShootingStar,
  Shrimp,
  SoccerBall,
  Sparkle,
  Star,
  Sun,
  Sword,
  TennisBall,
  Tree,
  Wallet,
  Waves,
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
  // 動物
  Cat, Dog, Rabbit, Bird, Fish, PawPrint, Bone, Butterfly, Horse, Shrimp, Bug,
  // 植物 / 自然
  Flower, FlowerLotus, FlowerTulip, Leaf, Tree, PottedPlant, Acorn, Carrot,
  Sun, Moon, MoonStars, Wind, Drop, Rainbow, Waves,
  // 魔法 / 奇幻
  Star, Heart, HandHeart, Sparkle, Crown, Sword, Lightning, MagicWand, ShootingStar, Atom,
  // 海洋
  Anchor, Sailboat,
  // 其他
  Cherries, Pizza, MusicNote, BowlFood, Gift, TennisBall, SoccerBall,
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
