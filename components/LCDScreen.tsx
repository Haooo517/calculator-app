import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mascot, MascotExpression } from './Mascot';

const TAP_EXPRESSIONS: MascotExpression[] = [
  'happy', 'excited', 'thinking', 'wink', 'surprised', 'love', 'cool', 'cute',
];

const getTimeExpression = (): MascotExpression => {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return 'happy';     // 早上
  if (h >= 11 && h < 18) return 'default';  // 白天
  if (h >= 18 && h < 22) return 'cool';     // 傍晚
  return 'sleepy';                           // 晚上 / 半夜
};

const MESSAGES = [
  '嗨！我是歐古！',
  '我的英文名字是 Allcu 喔！',
  '今天想算什麼？',
  '挑一個工具吧！',
  '什麼都能算給你！',
];

const TYPE_MS = 100;
const ERASE_MS = 45;
const HOLD_MS = 1400;
const PRE_NEXT_MS = 280;

function useTypewriter() {
  const [text, setText] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'idle' | 'erasing'>('typing');

  useEffect(() => {
    const current = MESSAGES[msgIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), TYPE_MS);
      } else {
        timer = setTimeout(() => setPhase('idle'), HOLD_MS);
      }
    } else if (phase === 'idle') {
      timer = setTimeout(() => setPhase('erasing'), HOLD_MS);
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), ERASE_MS);
      } else {
        timer = setTimeout(() => {
          setMsgIdx((i) => (i + 1) % MESSAGES.length);
          setPhase('typing');
        }, PRE_NEXT_MS);
      }
    }

    return () => clearTimeout(timer);
  }, [text, phase, msgIdx]);

  return text;
}

function BlinkingCursor() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, []);
  return <Text style={[styles.cursor, { opacity: visible ? 1 : 0 }]}>▎</Text>;
}

export function LCDScreen() {
  const text = useTypewriter();
  const [expression, setExpression] = useState<MascotExpression>(getTimeExpression);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearPendingTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  // 每分鐘檢查時段是否變了
  useEffect(() => {
    const id = setInterval(() => setExpression(getTimeExpression()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => clearPendingTimeouts(), []);

  const handleTap = () => {
    clearPendingTimeouts();

    // 睡著時被點：驚醒 → 搖頭環顧 → 慢慢閉眼睡回去
    if (expression === 'sleepy') {
      setExpression('surprised');

      timeouts.current.push(
        setTimeout(() => {
          setExpression('default');
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: -5, duration: 90, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 5, duration: 120, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -4, duration: 110, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 3, duration: 110, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 90, useNativeDriver: true }),
          ]).start();
        }, 380)
      );

      timeouts.current.push(setTimeout(() => setExpression('drowsy'), 1500));
      timeouts.current.push(setTimeout(() => setExpression('sleepy'), 1950));
      return;
    }

    // 其他時候：換隨機表情，3 秒後回到時段表情
    const others = TAP_EXPRESSIONS.filter((e) => e !== expression);
    const pick = others[Math.floor(Math.random() * others.length)];
    setExpression(pick);
    timeouts.current.push(
      setTimeout(() => setExpression(getTimeExpression()), 2800)
    );
  };

  return (
    <View style={styles.frame}>
      <TouchableOpacity style={styles.screen} onPress={handleTap} activeOpacity={0.92}>
        <View style={styles.scanlines} pointerEvents="none" />
        <Animated.View style={[styles.mascot, { transform: [{ translateX: shakeAnim }] }]}>
          <Mascot expression={expression} size={56} />
        </Animated.View>
        <View style={styles.textRow}>
          <Text style={styles.prompt}>{'>'}</Text>
          <Text style={styles.text} numberOfLines={1}>{text}</Text>
          <BlinkingCursor />
        </View>
      </TouchableOpacity>
      <View style={styles.brandRow}>
        <View style={styles.ledWrap}>
          <View style={styles.led} />
          <Text style={styles.brand}>ALLCULATOR</Text>
        </View>
        <Text style={styles.sparkle}>✦ V1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#ffd4ba',
    borderRadius: 26,
    padding: 14,
    marginBottom: 28,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  screen: {
    backgroundColor: '#d8e0b8',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    minHeight: 152,
    borderWidth: 2,
    borderColor: '#aabd8a',
    overflow: 'hidden',
    alignItems: 'center',
  },
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.04,
  },
  mascot: {
    marginBottom: 10,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  prompt: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#3d4f25',
  },
  text: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    color: '#2d3d20',
    letterSpacing: 0.5,
  },
  cursor: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#2d3d20',
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 2,
  },
  ledWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  led: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4dd882',
    shadowColor: '#4dd882',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  brand: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 12,
    color: '#c4623a',
    letterSpacing: 2,
  },
  sparkle: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 11,
    color: '#c4623a',
    opacity: 0.7,
    letterSpacing: 1,
  },
});
