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

export type MascotExpression =
  | 'default'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'sleepy'
  | 'drowsy'
  | 'surprised'
  | 'love'
  | 'cool'
  | 'sad'
  | 'cry';

type Face = { hat: string; leftHand: string; rightHand: string; eyes: string };

// All eyes are 5 monospace cells: eye + space + mouth + space + eye.
// Index 2 is the mouth so blink can preserve it.
const FACES: Record<MascotExpression, Face> = {
  default: { hat: 'π', leftHand: '\\', rightHand: '/', eyes: '· U ·' },
  happy: { hat: 'π', leftHand: '\\', rightHand: '|', eyes: '^ U ^' }, // rightHand cycles via wave anim
  excited: { hat: 'π', leftHand: '/', rightHand: '\\', eyes: '* o *' },
  thinking: { hat: '?', leftHand: '\\', rightHand: '/', eyes: '· ~ o' },
  sleepy: { hat: 'Z', leftHand: '_', rightHand: '_', eyes: '— ~ —' },
  drowsy: { hat: 'z', leftHand: '_', rightHand: '_', eyes: '— U —' },
  surprised: { hat: '!', leftHand: '/', rightHand: '\\', eyes: 'O o O' },
  love: { hat: '♡', leftHand: '~', rightHand: '~', eyes: '♡ u ♡' },
  cool: { hat: 'π', leftHand: '<', rightHand: '>', eyes: '▬ u ▬' },
  sad: { hat: 'π', leftHand: '\\', rightHand: '/', eyes: '· ∩ ·' },
  cry: { hat: 'π', leftHand: '\\', rightHand: '/', eyes: 'T ∩ T' },
};

const CRY_FRAMES = [
  '· U ·', // 開心
  '· - ·', // 嘴變平
  '· ∩ ·', // 嘴下垂
  '; ∩ ·', // 左眼一滴
  '· ∩ ;', // 右眼一滴
  '; ∩ ·', // 左眼再一滴
  '· ∩ ;', // 右眼再一滴
  '; ∩ ·', // 多滴
  '· ∩ ;',
  '; ∩ ;', // 兩眼同時流
  '; ∩ ;', // 撐一下
  'T ∩ T', // 嚎啕大哭
];
const CRY_FRAME_MS = 320;

const WAVE_FRAMES = ['|', '/', '_', '/'];

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export type MascotVariant = 'default' | 'cat';

type Props = {
  expression?: MascotExpression;
  size?: number;
  color?: string;
  /** Optional override for the monospace font. Defaults to Menlo / monospace. */
  fontFamily?: string;
  bob?: boolean;
  autoBlink?: boolean;
  variant?: MascotVariant;
  style?: StyleProp<ViewStyle>;
};

export function Mascot({
  expression = 'default',
  size = 56,
  color = '#2d3d20',
  fontFamily,
  bob = true,
  autoBlink = true,
  variant = 'default',
  style,
}: Props) {
  const [blinking, setBlinking] = useState(false);
  const [cryFrame, setCryFrame] = useState(-1);
  const [waveFrame, setWaveFrame] = useState(0);
  const bobAnim = useRef(new Animated.Value(0)).current;

  // auto blink (skip when eyes already closed or crying — handled separately)
  useEffect(() => {
    if (!autoBlink) return;
    if (expression === 'sleepy' || expression === 'drowsy' || expression === 'cry') return;

    let timer: ReturnType<typeof setTimeout>;
    let alive = true;

    const schedule = () => {
      const wait = 2400 + Math.random() * 2600;
      timer = setTimeout(() => {
        if (!alive) return;
        setBlinking(true);
        timer = setTimeout(() => {
          if (!alive) return;
          setBlinking(false);
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

  // cry sequence (7 frames, ~250ms each, ends at full cry)
  useEffect(() => {
    if (expression !== 'cry') {
      setCryFrame(-1);
      return;
    }
    setCryFrame(0);
    let alive = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < CRY_FRAMES.length; i++) {
      timeouts.push(
        setTimeout(() => {
          if (alive) setCryFrame(i);
        }, i * CRY_FRAME_MS)
      );
    }
    return () => {
      alive = false;
      timeouts.forEach(clearTimeout);
    };
  }, [expression]);

  // wave loop for happy
  useEffect(() => {
    if (expression !== 'happy') return;
    setWaveFrame(0);
    const id = setInterval(() => {
      setWaveFrame((f) => (f + 1) % WAVE_FRAMES.length);
    }, 220);
    return () => clearInterval(id);
  }, [expression]);

  // breathing bob
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
  const face = FACES[expression];

  const eyesStr =
    expression === 'cry' && cryFrame >= 0
      ? CRY_FRAMES[cryFrame]
      : blinking
      ? `- ${face.eyes[2]} -`
      : face.eyes;

  const rh = expression === 'happy' ? WAVE_FRAMES[waveFrame] : face.rightHand;
  const leftBracket = variant === 'cat' ? '(' : '[';
  const rightBracket = variant === 'cat' ? ')' : ']';
  const fullLine = `${face.leftHand}${leftBracket} ${eyesStr} ${rightBracket}${rh}`;

  const hatSize = size * 0.32;
  const faceSize = size * 0.42;
  const monoFamily = fontFamily ?? MONO_FONT;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }, style]}>
      <Text style={[styles.line, { fontSize: hatSize, color, lineHeight: hatSize * 1.05 }]}>
        {face.hat}
      </Text>
      <Text
        style={[
          styles.mono,
          {
            fontFamily: monoFamily,
            fontSize: faceSize,
            color,
            lineHeight: faceSize * 1.15,
          },
        ]}
      >
        {fullLine}
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
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0,
  },
});
