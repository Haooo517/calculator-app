import {
  Calculator as LucideCalculator,
  FlaskConical,
  Wallet,
  Dices,
  HeartPulse,
  Wrench,
} from 'lucide-react-native';
import {
  Calculator as PhosphorCalculator,
  Flask,
  Wallet as PhosphorWallet,
  Dice5,
  HeartBeat,
  Wrench as PhosphorWrench,
} from 'phosphor-react-native';
import { Text } from 'react-native';

export type IconStyle = 'emoji' | 'lucide' | 'phosphor';

const EMOJI: Record<string, string> = {
  basic: '🔢',
  science: '🧪',
  wealth: '💰',
  gambling: '🎲',
  health: '💪',
  life: '🛠️',
};

type Props = {
  categoryId: string;
  style: IconStyle;
  size?: number;
  color?: string;
};

export function CategoryIcon({ categoryId, style, size = 40, color = '#fff' }: Props) {
  if (style === 'emoji') {
    return <Text style={{ fontSize: size }}>{EMOJI[categoryId] ?? '❔'}</Text>;
  }

  if (style === 'lucide') {
    const Icon =
      {
        basic: LucideCalculator,
        science: FlaskConical,
        wealth: Wallet,
        gambling: Dices,
        health: HeartPulse,
        life: Wrench,
      }[categoryId] ?? LucideCalculator;
    return <Icon size={size} color={color} strokeWidth={1.75} />;
  }

  const Icon =
    {
      basic: PhosphorCalculator,
      science: Flask,
      wealth: PhosphorWallet,
      gambling: Dice5,
      health: HeartBeat,
      life: PhosphorWrench,
    }[categoryId] ?? PhosphorCalculator;
  return <Icon size={size} color={color} weight="duotone" />;
}
