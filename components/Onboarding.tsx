import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../lib/theme';
import { Mascot, MascotExpression } from './Mascot';

const KEY = 'allcu_onboarding_done';

type Step = {
  text: string;
  expression: MascotExpression;
};

const STEPS: Step[] = [
  { text: '哈囉！歡迎使用 Allculator！', expression: 'excited' },
  { text: '我是你的計算小助理，歐古！', expression: 'happy' },
  { text: '上面有 11 種類型分類，點進去就能用對應的計算機。', expression: 'default' },
  { text: '常用的工具可以「釘選」，會出現在最上面的釘選分類。', expression: 'wink' },
  { text: '想換主題或調整設定，點右上角齒輪。', expression: 'cool' },
  { text: '無聊時可以戳我幾下喔～', expression: 'cute' },
];

export function Onboarding() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const fade = useState(new Animated.Value(0))[0];

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v !== 'done') {
        setVisible(true);
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      }
    });
  }, [fade]);

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

  if (!visible) return null;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={next} />
        <View style={[styles.dialog, { backgroundColor: theme.cardBg }]}>
          <View style={[styles.mascotWrap, { backgroundColor: theme.lcdScreen, borderColor: theme.lcdBorder }]}>
            <Mascot expression={current.expression} size={64} color={theme.lcdText} />
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
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

export async function resetOnboarding() {
  await AsyncStorage.removeItem(KEY);
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
    elevation: 8,
  },
  mascotWrap: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 18,
  },
  text: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
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
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
