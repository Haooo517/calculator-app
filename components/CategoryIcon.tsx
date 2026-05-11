import {
  Calculator,
  Flask,
  Heartbeat,
  PokerChip,
  Wallet,
  Wrench,
} from 'phosphor-react-native';

const ICONS = {
  basic: Calculator,
  science: Flask,
  wealth: Wallet,
  gambling: PokerChip,
  health: Heartbeat,
  life: Wrench,
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
