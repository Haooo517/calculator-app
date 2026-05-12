import {
  Calculator,
  Clock,
  CookingPot,
  Flask,
  GameController,
  GraduationCap,
  Heartbeat,
  HouseLine,
  Palette,
  PokerChip,
  PushPin,
  Wallet,
} from 'phosphor-react-native';

const ICONS = {
  favorites: PushPin,
  life: HouseLine,
  science: Flask,
  wealth: Wallet,
  gambling: PokerChip,
  health: Heartbeat,
  design: Palette,
  time: Clock,
  education: GraduationCap,
  cooking: CookingPot,
  game: GameController,
} as const;

type Props = {
  id: string;
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
};

export function CategoryIcon({ id, size = 32, color = '#2d2520', weight = 'fill' }: Props) {
  const Icon = ICONS[id as keyof typeof ICONS] ?? Calculator;
  return <Icon size={size} color={color} weight={weight} />;
}
