import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { haptics } from '../lib/haptics';
import { useTheme } from '../lib/theme';
import { BackgroundPattern } from './BackgroundPattern';
import { Mascot, MascotExpression } from './Mascot';

const TAP_EXPRESSIONS: MascotExpression[] = [
  'happy', 'excited', 'thinking', 'surprised', 'love', 'cool', 'cry', 'dizzy',
];

const getTimeExpression = (): MascotExpression => {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return 'happy';     // 早上
  if (h >= 11 && h < 18) return 'default';  // 白天
  if (h >= 18 && h < 22) return 'cool';     // 傍晚
  return 'sleepy';                           // 晚上 / 半夜
};

const MESSAGES = [
  '圈圈圓圓圈圈～相關計算都需要我～頭上的小帽帽～',
  '我什麼都會算！除了算命以外…因為歐古是相信機率的！',
  '冷知識：allculator 就是把 all 和 calculator 合起來喔！',
  '冷知識：歐古的英文名是 allcu，也就是 allculator 的簡稱喔！',
  '我的眼睛才不是小數點！不然他們就掉到地上了…',
  '《山巔》：「一寺一壺酒，二柳捂衫舞，把酒棄舊衫，而山百世留」',
  '冷知識：歐古戴的帽子是圓周率 π，但歐古不是個 π 郎喔！',
  '我冬天的時候喜歡待在角落，因為那裡有 90 度。',
  '世界上總共有 10 種人，一種懂 2 進位，另一種不懂。',
];

const TYPE_MS = 70;
const ERASE_MS = 25;
const HOLD_MS = 2000;
const PRE_NEXT_MS = 320;

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

function useBlinkingCursor() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, []);
  return visible;
}

export function LCDScreen() {
  const { theme } = useTheme();
  const text = useTypewriter();
  const cursorVisible = useBlinkingCursor();
  const [expression, setExpression] = useState<MascotExpression>(getTimeExpression);
  const tapX = useRef(new Animated.Value(0)).current;
  const tapY = useRef(new Animated.Value(0)).current;
  const tapRot = useRef(new Animated.Value(0)).current;
  const tapScale = useRef(new Animated.Value(1)).current;
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const playTapAnim = (pick: MascotExpression) => {
    const opts = { useNativeDriver: true };
    switch (pick) {
      case 'happy':
        // 開心歪頭擺擺
        Animated.sequence([
          Animated.timing(tapRot, { toValue: 0.5, duration: 220, ...opts }),
          Animated.timing(tapRot, { toValue: -0.5, duration: 280, ...opts }),
          Animated.timing(tapRot, { toValue: 0.3, duration: 240, ...opts }),
          Animated.timing(tapRot, { toValue: 0, duration: 220, ...opts }),
        ]).start();
        break;
      case 'excited':
        // 興奮跳兩下
        Animated.sequence([
          Animated.timing(tapY, { toValue: -14, duration: 180, ...opts }),
          Animated.spring(tapY, { toValue: 0, friction: 4, ...opts }),
          Animated.timing(tapY, { toValue: -10, duration: 160, ...opts }),
          Animated.spring(tapY, { toValue: 0, friction: 4, ...opts }),
        ]).start();
        break;
      case 'surprised':
        // 嚇到縮一下再回來
        Animated.sequence([
          Animated.timing(tapScale, { toValue: 1.2, duration: 120, ...opts }),
          Animated.timing(tapScale, { toValue: 0.95, duration: 100, ...opts }),
          Animated.spring(tapScale, { toValue: 1, friction: 5, ...opts }),
        ]).start();
        break;
      case 'love':
        // 愛心怦怦跳
        Animated.sequence([
          Animated.timing(tapScale, { toValue: 1.15, duration: 200, ...opts }),
          Animated.timing(tapScale, { toValue: 1, duration: 220, ...opts }),
          Animated.timing(tapScale, { toValue: 1.1, duration: 180, ...opts }),
          Animated.timing(tapScale, { toValue: 1, duration: 200, ...opts }),
        ]).start();
        break;
      case 'cool':
        // 酷酷靠在側邊
        Animated.sequence([
          Animated.timing(tapRot, { toValue: 0.35, duration: 320, ...opts }),
          Animated.delay(900),
          Animated.timing(tapRot, { toValue: 0, duration: 300, ...opts }),
        ]).start();
        break;
      case 'thinking':
        // 沉思 — 往左歪然後停住
        Animated.sequence([
          Animated.timing(tapRot, { toValue: -0.4, duration: 350, ...opts }),
          Animated.delay(1200),
          Animated.timing(tapRot, { toValue: 0, duration: 350, ...opts }),
        ]).start();
        break;
      case 'cry':
        // 哭哭 — 整個身體微微下沉並保持更久
        Animated.sequence([
          Animated.timing(tapY, { toValue: 4, duration: 500, ...opts }),
          Animated.delay(3200),
          Animated.timing(tapY, { toValue: 0, duration: 500, ...opts }),
        ]).start();
        break;
      // dizzy 沒有 body transform — 臉的旋轉由 Mascot 內部 SPIN_FRAMES 處理
    }
  };

  const resetTapAnim = () => {
    tapX.setValue(0);
    tapY.setValue(0);
    tapRot.setValue(0);
    tapScale.setValue(1);
  };

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

    // 睡著時被點：驚醒 → 搖頭環顧（頭不動，臉左右晃）→ 慢慢閉眼睡回去
    if (expression === 'sleepy') {
      haptics.heavy(); // 把歐古嚇醒 = 重觸感
      setExpression('surprised');
      // 0.9s 後切換到 shake — Mascot 內部會跑 SHAKE_FRAMES（約 0.8s）
      timeouts.current.push(setTimeout(() => setExpression('shake'), 900));
      // shake 動畫結束（約 9*90 = 810ms）後讓臉回到 default
      timeouts.current.push(setTimeout(() => setExpression('default'), 1750));
      timeouts.current.push(setTimeout(() => setExpression('drowsy'), 3400));
      timeouts.current.push(setTimeout(() => setExpression('sleepy'), 4400));
      return;
    }

    // 其他時候：換隨機表情 + 對應的特殊動畫
    const others = TAP_EXPRESSIONS.filter((e) => e !== expression);
    const pick = others[Math.floor(Math.random() * others.length)];
    // 哭哭給比較重的回饋，其他輕觸
    if (pick === 'cry') haptics.medium();
    else if (pick === 'surprised') haptics.rigid();
    else haptics.soft();
    resetTapAnim();
    setExpression(pick);
    playTapAnim(pick);
    // 哭哭/暈頭動畫比較長，多給一點時間
    const revertDelay = pick === 'cry' ? 4800 : pick === 'dizzy' ? 3200 : 2800;
    timeouts.current.push(
      setTimeout(() => setExpression(getTimeExpression()), revertDelay)
    );
  };

  return (
    <View
      style={[
        styles.frame,
        { backgroundColor: theme.lcdFrame },
        theme.lcdFrameBorder && {
          borderWidth: theme.lcdFrameBorder.width,
          borderColor: theme.lcdFrameBorder.color,
        },
      ]}
    >
      {theme.lcdFramePattern && (
        <BackgroundPattern
          type={theme.lcdFramePattern}
          color={theme.lcdFramePatternColor ?? '#fff'}
          color2={theme.lcdFramePatternColor2}
          opacity={theme.lcdFramePattern === 'candy' ? 1 : 0.65}
        />
      )}
      <TouchableOpacity
        style={[styles.screen, { backgroundColor: theme.lcdScreen, borderColor: theme.lcdBorder }]}
        onPress={handleTap}
        activeOpacity={0.92}
      >
        <View style={styles.scanlines} pointerEvents="none" />
        <Animated.View
          style={[
            styles.mascotWrap,
            {
              transform: [
                { translateX: tapX },
                { translateY: tapY },
                {
                  rotate: tapRot.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-15deg', '15deg'],
                  }),
                },
                { scale: tapScale },
              ],
            },
          ]}
        >
          <Mascot
            expression={expression}
            size={56}
            color={theme.lcdText}
            variant={theme.mascotVariant}
          />
        </Animated.View>
        <Text
          style={[styles.textBlock, { color: theme.lcdText }]}
          numberOfLines={3}
        >
          <Text style={styles.prompt}>{'> '}</Text>
          {text}
          <Text style={[styles.cursor, { opacity: cursorVisible ? 1 : 0 }]}>▎</Text>
        </Text>
      </TouchableOpacity>
      <View style={styles.brandRow}>
        <View style={styles.ledWrap}>
          <View style={[styles.led, { backgroundColor: theme.lcdLed, shadowColor: theme.lcdLed }]} />
          <Text
            style={[
              styles.brand,
              {
                color: theme.lcdBrandColor ?? theme.brandColor,
                fontFamily: theme.font?.display ?? 'Fredoka_700Bold',
              },
            ]}
          >
            ALLCULATOR
          </Text>
        </View>
        <Text style={[styles.sparkle, { color: theme.lcdBrandColor ?? theme.brandColor }]}>
          by haooo
        </Text>
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
    minHeight: 160,
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
  mascotWrap: {
    marginBottom: 10,
  },
  textBlock: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.3,
    lineHeight: 22,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  prompt: {
    fontFamily: 'Fredoka_700Bold',
  },
  cursor: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
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
