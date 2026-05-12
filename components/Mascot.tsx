import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

const MONO_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export type MascotExpression =
  | 'default'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'sleepy'
  | 'wink'
  | 'surprised'
  | 'love'
  | 'cool'
  | 'cute'
  | 'sad';

type Face = { hat: string; eyes: string; mouth: string };

const FACES: Record<MascotExpression | 'blink', Face> = {
  default: { hat: 'π', eyes: '·     ·', mouth: 'U' },
  blink: { hat: 'π', eyes: '−     −', mouth: 'U' },
  happy: { hat: 'π', eyes: '^     ^', mouth: 'U' },
  excited: { hat: 'π', eyes: '*     *', mouth: 'o' },
  thinking: { hat: 'π', eyes: '·     o', mouth: '~' },
  sleepy: { hat: 'π', eyes: '—     —', mouth: '~' },
  wink: { hat: 'π', eyes: '·     ;', mouth: 'U' },
  surprised: { hat: 'π', eyes: 'O     O', mouth: 'o' },
  love: { hat: 'π', eyes: '♥     ♥', mouth: 'u' },
  cool: { hat: 'π', eyes: '▬     ▬', mouth: 'u' },
  cute: { hat: 'π', eyes: '★     ★', mouth: 'v' },
  sad: { hat: 'π', eyes: '·     ·', mouth: '∩' },
};

type Props = {
  expression?: MascotExpression;
  size?: number;
  color?: string;
  bob?: boolean;
  autoBlink?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Mascot({
  expression = 'default',
  size = 56,
  color = '#2d3d20',
  bob = true,
  autoBlink = true,
  style,
}: Props) {
  const [current, setCurrent] = useState<MascotExpression | 'blink'>(expression);
  const bobAnim = useRef(new Animated.Value(0)).current;

  // sync current state when expression prop changes
  useEffect(() => {
    setCurrent(expression);
  }, [expression]);

  // auto blink loop
  useEffect(() => {
    if (!autoBlink) return;
    if (expression === 'sleepy') return;

    let timer: ReturnType<typeof setTimeout>;
    let alive = true;

    const schedule = () => {
      const wait = 2400 + Math.random() * 2600;
      timer = setTimeout(() => {
        if (!alive) return;
        setCurrent('blink');
        timer = setTimeout(() => {
          if (!alive) return;
          setCurrent(expression);
          schedule();
        }, 130);
      }, wait);
    };
    schedule();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [expression, autoBlink]);

  // bob animation
  useEffect(() => {
    if (!bob) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, bobAnim]);

  const translateY = bobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  const face = FACES[current];

  const hatSize = size * 0.32;
  const eyeSize = size * 0.42;
  const mouthSize = size * 0.4;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }, style]}>
      <Text
        style={[styles.line, { fontSize: hatSize, color, lineHeight: hatSize * 1.05 }]}
      >
        {face.hat}
      </Text>
      <Text
        style={[styles.mono, { fontSize: eyeSize, color, lineHeight: eyeSize * 1.1 }]}
      >
        {`⌈  ${face.eyes}  ⌉`}
      </Text>
      <Text
        style={[styles.mono, { fontSize: mouthSize, color, lineHeight: mouthSize * 1.1 }]}
      >
        {`⌊     ${face.mouth}     ⌋`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  line: {
    fontFamily: 'Fredoka_700Bold',
    textAlign: 'center',
  },
  mono: {
    fontFamily: MONO_FONT,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0,
  },
});
