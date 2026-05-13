import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CaretRight, Hand, PushPin } from 'phosphor-react-native';
import { useTheme } from '../lib/theme';
import { Mascot, MascotExpression } from './Mascot';

const KEY = 'allcu_onboarding_done';

type StepType =
  | { kind: 'intro'; text: string; expression: MascotExpression }
  | { kind: 'lcd'; text: string }
  | { kind: 'tap'; text: string }
  | { kind: 'category'; text: string }
  | { kind: 'pin'; text: string }
  | { kind: 'outro'; text: string; expression: MascotExpression };

const STEPS: StepType[] = [
  { kind: 'intro', text: '哈囉！歡迎使用 Allculator！', expression: 'excited' },
  { kind: 'intro', text: '我是你的計算小助理，歐古！', expression: 'happy' },
  { kind: 'lcd', text: '我會住在首頁上面這個小螢幕，跟你聊天～' },
  { kind: 'tap', text: '戳戳我，我會擺各種表情給你看！' },
  { kind: 'category', text: '下面是 11 種分類，點進去就有對應的計算機。' },
  { kind: 'pin', text: '常用的工具點右邊的釘子，會出現在最上面的「釘選」分類。' },
  { kind: 'outro', text: '右上角的齒輪可以換主題、調設定。那就開始用吧！', expression: 'happy' },
];

const SAMPLE_CATEGORIES = [
  { name: '生活', en: 'LIFESTYLE', bg: '#b8d8ff', accent: '#2c5fa8' },
  { name: '科學', en: 'SCIENCE', bg: '#b8e6d2', accent: '#2d8765' },
  { name: '健康', en: 'HEALTH', bg: '#ffc4d4', accent: '#c2456a' },
];

export function Onboarding() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
  const [tapDemoExpression, setTapDemoExpression] = useState<MascotExpression>('default');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v !== 'done') {
        setVisible(true);
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      }
    });
  }, [fade]);

  useEffect(() => {
    stepAnim.setValue(0);
    Animated.timing(stepAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step, stepAnim]);

  const finish = () => {
    AsyncStorage.setItem(KEY, 'done').catch(() => {});
    Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setVisible(false);
      setStep(0);
    });
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  const onTapDemo = () => {
    const opts: MascotExpression[] = ['happy', 'excited', 'surprised', 'love', 'cool'];
    const pick = opts[Math.floor(Math.random() * opts.length)];
    setTapDemoExpression(pick);
  };

  if (!visible) return null;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const scaleIn = stepAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const opacityIn = stepAnim;
  const lcdZoom = stepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: current.kind === 'lcd' ? [0.35, 1] : [1, 1],
  });

  return (
    <Modal transparent animationType="none" visible={visible} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={next} />
        <Animated.View
          style={[
            styles.dialog,
            { backgroundColor: theme.cardBg, opacity: opacityIn, transform: [{ scale: scaleIn }] },
          ]}
        >
          <View style={styles.illustration}>
            {current.kind === 'intro' || current.kind === 'outro' ? (
              <View style={[styles.illustrationBg, { backgroundColor: theme.inputBg }]}>
                <Mascot expression={current.expression} size={72} color={theme.text} fontFamily={theme.font?.mono} />
              </View>
            ) : current.kind === 'lcd' ? (
              <Animated.View style={{ transform: [{ scale: lcdZoom }] }}>
                <LcdPreview />
              </Animated.View>
            ) : current.kind === 'tap' ? (
              <TapDemo expression={tapDemoExpression} onTap={onTapDemo} />
            ) : current.kind === 'category' ? (
              <CategoryPreview />
            ) : (
              <PinPreview />
            )}
          </View>

          <Text style={[styles.text, { color: theme.text }]}>{current.text}</Text>

          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === step ? theme.brandColor : theme.divider,
                    width: i === step ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.btnRow}>
            {!isLast && (
              <TouchableOpacity onPress={finish} style={styles.skipBtn} activeOpacity={0.6}>
                <Text style={[styles.skipText, { color: theme.textMuted }]}>略過</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: theme.brandColor }]}
              onPress={next}
              activeOpacity={0.85}
            >
              <Text style={styles.nextText}>{isLast ? '開始用！' : '下一步'}</Text>
              {!isLast && <CaretRight size={14} color="#fff" weight="bold" />}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function LcdPreview() {
  const { theme } = useTheme();
  return (
    <View style={[styles.lcdFrame, { backgroundColor: theme.lcdFrame }]}>
      <View
        style={[styles.lcdScreen, { backgroundColor: theme.lcdScreen, borderColor: theme.lcdBorder }]}
      >
        <Mascot expression="default" size={48} color={theme.lcdText} fontFamily={theme.font?.mono} />
        <Text
          style={[
            styles.lcdText,
            { color: theme.lcdText, fontFamily: 'Fredoka_600SemiBold' },
          ]}
        >
          {'> 嗨！我是歐古▎'}
        </Text>
      </View>
      <View style={styles.lcdBrandRow}>
        <View style={[styles.lcdLed, { backgroundColor: theme.lcdLed }]} />
        <Text style={[styles.lcdBrand, { color: theme.brandColor }]}>ALLCULATOR</Text>
      </View>
    </View>
  );
}

function TapDemo({ expression, onTap }: { expression: MascotExpression; onTap: () => void }) {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={[styles.illustrationBg, { backgroundColor: theme.inputBg }]}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <TouchableOpacity activeOpacity={0.7} onPress={onTap}>
          <Mascot expression={expression} size={72} color={theme.text} fontFamily={theme.font?.mono} />
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.tapHint}>
        <Hand size={14} color={theme.textMuted} weight="fill" />
        <Text style={[styles.tapHintText, { color: theme.textMuted }]}>戳我看看</Text>
      </View>
    </View>
  );
}

function CategoryPreview() {
  const { theme } = useTheme();
  return (
    <View style={[styles.illustrationBg, { backgroundColor: theme.inputBg, padding: 12 }]}>
      {SAMPLE_CATEGORIES.map((cat) => (
        <View
          key={cat.name}
          style={[styles.catRow, { backgroundColor: theme.cardBg }]}
        >
          <View style={[styles.catIcon, { backgroundColor: cat.bg }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.catName, { color: theme.text }]}>{cat.name}</Text>
            <Text style={[styles.catSub, { color: cat.accent }]}>{cat.en}</Text>
          </View>
          <CaretRight size={14} color={theme.hint} weight="bold" />
        </View>
      ))}
    </View>
  );
}

function PinPreview() {
  const { theme } = useTheme();
  const wiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 400, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(800),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [wiggle]);

  const rotate = wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] });
  const accent = '#c4623a';

  return (
    <View style={[styles.illustrationBg, { backgroundColor: theme.inputBg, padding: 12 }]}>
      <View style={[styles.pinRow, { backgroundColor: theme.cardBg }]}>
        <View style={[styles.pinDot, { backgroundColor: '#b8e6d2' }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.pinTitle, { color: theme.text }]}>BMI 計算</Text>
          <Text style={[styles.pinSub, { color: theme.textMuted }]}>身體質量指數</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <PushPin size={20} color={accent} weight="fill" />
        </Animated.View>
      </View>
      <Text style={[styles.pinHint, { color: theme.textMuted }]}>← 點圖示就會釘起來</Text>
    </View>
  );
}

export async function resetOnboarding() {
  await AsyncStorage.removeItem(KEY);
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  illustration: {
    width: '100%',
    minHeight: 180,
    marginBottom: 18,
  },
  illustrationBg: {
    width: '100%',
    minHeight: 180,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  text: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    minHeight: 52,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    marginBottom: 18,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  skipBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.5,
  },
  // LCD preview
  lcdFrame: {
    width: '100%',
    borderRadius: 18,
    padding: 10,
  },
  lcdScreen: {
    borderRadius: 10,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
    minHeight: 110,
  },
  lcdText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  lcdBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  lcdLed: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  lcdBrand: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  // Tap demo
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tapHintText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 12,
  },
  // Category preview
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    gap: 10,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  catName: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
  },
  catSub: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 1,
  },
  // Pin preview
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 12,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pinTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
  },
  pinSub: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 11,
    marginTop: 1,
  },
  pinHint: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },
});
