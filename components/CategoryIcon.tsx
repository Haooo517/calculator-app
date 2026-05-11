import {
  Calculator,
  Dice5,
  Flask,
  HeartBeat,
  Wallet,
  Wrench,
} from 'phosphor-react-native';

const ICONS = {
  basic: Calculator,
  science: Flask,
  wealth: Wallet,
  gambling: Dice5,
  health: HeartBeat,
  life: Wrench,
} as const;

type Props = {
  id: string;
  size?: number;
  color?: string;
};

export function CategoryIcon({ id, size = 32, color = '#f5f1e8' }: Props) {
  const Icon = ICONS[id as keyof typeof ICONS] ?? Calculator;
  return <Icon size={size} color={color} weight="duotone" />;
}
