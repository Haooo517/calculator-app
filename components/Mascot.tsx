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
  | 'sad';

type Face = { hat: string; leftHand: string; rightHand: string; eyes: string };

// All eyes are exactly 5 monospace cells: eye + space + mouth + space + eye.
// Mouth char lives at index 2 so blink can preserve it.
const FACES: Record<MascotExpression, Face> = {
  default: { hat: 'π', leftHand: '\\', rightHand: '/', eyes: '. U .' },
  happy: { hat: 'π', leftHand: '~', rightHand: '~', eyes: '^ U ^' },
  excited: { hat: 'π', leftHand: '/', rightHand: '\\', eyes: '* o *' },
  thinking: { hat: '?', leftHand: '\\', rightHand: '/', eyes: '. ~ o' },
  sleepy: { hat: 'Z', leftHand: '_', rightHand: '_', eyes: '- ~ -' },
  drowsy: { hat: 'z', leftHand: '_', rightHand: '_', eyes: '- U -' },
  surprised: { hat: '!', leftHand: '/', rightHand: '\\', eyes: 'O o O' },
  love: { hat: '*', leftHand: '~', rightHand: '~', eyes: 'o u o' },
  cool: { hat: 'π', leftHand: '<', rightHand: '>', eyes: '= u =' },
  sad: { hat: 'π', leftHand: '\\', rightHand: '/', eyes: '. _ .' },
};

const DEFAULT_MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

type Props = {
  expression?: MascotExpression;
  size?: number;
  color?: string;
  fontFamily?: string;
  bob?: boolean;
  autoBlink?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Mascot({
  expression = 'default',
  size = 56,
  color = '#2d3d20',
  fontFamily,
  bob = true,
  autoBlink = true,
  style,
}: Props) {
  const [blinking, setBlinking] = useState(false);
  const bobAnim = useRef(new Animated.Value(0)).current;

  // auto blink — only when eyes are open (not sleepy/drowsy)
  useEffect(() => {
    if (!autoBlink) return;
    if (expression === 'sleepy' || expression === 'drowsy') return;

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

  // When blinking: replace the two eye positions with '-' but keep the mouth (index 2).
  const eyesStr = blinking ? `- ${face.eyes[2]} -` : face.eyes;
  const fullLine = `${face.leftHand}[ ${eyesStr} ]${face.rightHand}`;

  const hatSize = size * 0.32;
  const faceSize = size * 0.42;
  const monoFamily = fontFamily ?? DEFAULT_MONO_FONT;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }, style]}>
      <Text
        style={[
          styles.line,
          { fontSize: hatSize, color, lineHeight: hatSize * 1.05 },
        ]}
      >
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
