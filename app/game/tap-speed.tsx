import { Stack } from 'expo-router';
import { ArrowClockwise, Hand, Timer } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { useTheme } from '../../lib/theme';

const DURATION = 10;

export default function TapSpeed() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [best, setBest] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setPhase('playing');
    setTaps(0);
    setTimeLeft(DURATION);
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const startedAt = Date.now();
    tickRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = Math.max(0, DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (tickRef.current) clearInterval(tickRef.current);
        setPhase('done');
        setBest((b) => Math.max(b, taps));
      }
    }, 50);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase, taps]);

  const tap = () => {
    if (phase !== 'playing') return;
    setTaps((t) => t + 1);
  };

  const tps = phase === 'done' ? (taps / DURATION).toFixed(1) : '0.0';

  const accent = '#5a8a30';
  const bgAccent = '#c4e8a8';

  const endExpression: MascotExpression =
    taps >= 80 ? 'excited' : taps >= 50 ? 'happy' : taps >= 30 ? 'default' : 'sleepy';

  if (phase === 'idle') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '手速測試' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression="cool" color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>手速測試</Text>
          <Text style={[styles.heroSub, { color: accent }]}>10 秒，能按幾下？</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.infoRow}>
            <Timer size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>10 秒倒數</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <Hand size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>盡量瘋狂連點圓圈</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: accent }]} onPress={start} activeOpacity={0.85}>
          <Text style={styles.startText}>開始</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '手速測試' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression={endExpression} color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>結束！</Text>
        </View>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>總點擊數</Text>
          <Text style={[styles.scoreValue, { color: accent }]}>{taps}</Text>
          <Text style={[styles.scoreSub, { color: theme.textMuted }]}>
            平均每秒 {tps} 下 · 紀錄 {best}
          </Text>
        </View>
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: accent }]} onPress={start} activeOpacity={0.85}>
          <ArrowClockwise size={18} color="#fff" weight="bold" />
          <Text style={styles.startText}>再玩一次</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: '手速測試' }} />
      <View style={styles.playArea}>
        <View style={[styles.timerCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.timerLabel, { color: theme.textMuted }]}>剩餘</Text>
          <Text style={[styles.timerValue, { color: theme.text }]}>{timeLeft.toFixed(1)}s</Text>
          <Text style={[styles.timerCount, { color: accent }]}>{taps}</Text>
        </View>
        <TouchableOpacity
          style={[styles.tapTarget, { backgroundColor: accent }]}
          onPress={tap}
          activeOpacity={0.7}
        >
          <Text style={styles.tapText}>點！</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  heroCard: {
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 28, letterSpacing: -0.5 },
  heroSub: { fontFamily: 'Fredoka_500Medium', fontSize: 14, opacity: 0.85, marginTop: 4 },
  infoCard: {
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  infoText: { fontFamily: 'Fredoka_500Medium', fontSize: 15 },
  divider: { height: 1, marginHorizontal: 16 },
  startBtn: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: { fontFamily: 'Fredoka_700Bold', fontSize: 17, color: '#fff', letterSpacing: 0.5 },
  scoreCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  scoreLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
  scoreValue: { fontFamily: 'Fredoka_700Bold', fontSize: 96, letterSpacing: -4, lineHeight: 100 },
  scoreSub: { fontFamily: 'Fredoka_400Regular', fontSize: 13, marginTop: 6 },
  playArea: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  timerCard: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  timerLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
  timerValue: { fontFamily: 'Fredoka_700Bold', fontSize: 44, letterSpacing: -1.5 },
  timerCount: { fontFamily: 'Fredoka_700Bold', fontSize: 64, letterSpacing: -2, marginTop: 4 },
  tapTarget: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5a8a30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  tapText: { fontFamily: 'Fredoka_700Bold', fontSize: 64, color: '#fff', letterSpacing: -1 },
});
