import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Mascot } from './Mascot';

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

  return (
    <View style={styles.frame}>
      <View style={styles.screen}>
        <View style={styles.scanlines} pointerEvents="none" />
        <Mascot size={56} style={styles.mascot} />
        <View style={styles.textRow}>
          <Text style={styles.prompt}>{'>'}</Text>
          <Text style={styles.text} numberOfLines={1}>{text}</Text>
          <BlinkingCursor />
        </View>
      </View>
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
