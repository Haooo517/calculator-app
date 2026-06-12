import { Stack } from 'expo-router';
import { ArrowClockwise, Eye, MapPin, Trophy } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useBestScore } from '../../lib/scores';
import { useTheme } from '../../lib/theme';

const ROUNDS = 5;
const DOT = 22; // 點的直徑
const EDGE = 30; // 點離遊戲區邊緣的最小距離
const MIN_DIST = 80; // 藍紅兩點最小間距
const SHOW_MS = 1500; // 紅點顯示時間
const REVEAL_MS = 800; // 揭曉停留時間
const RED = '#c2456a';
const BLUE = '#2c5fa8';

type Pt = { x: number; y: number };
type Size = { w: number; h: number };

export default function Distance() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [round, setRound] = useState(1);
  const [errors, setErrors] = useState<number[]>([]);
  const [dots, setDots] = useState<{ blue: Pt; red: Pt } | null>(null);
  const [guess, setGuess] = useState<Pt | null>(null);
  const [stage, setStage] = useState<'show' | 'guess' | 'reveal'>('show');
  const [areaSize, setAreaSize] = useState<Size | null>(null);
  const { best, report } = useBestScore('distance', 'low');
  const [newBest, setNewBest] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accent = '#5a8a30';
  const bgAccent = '#c4e8a8';

  // 離開頁面時清掉排程
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const start = useCallback(() => {
    haptics.soft();
    if (timerRef.current) clearTimeout(timerRef.current);
    setErrors([]);
    setRound(1);
    setDots(null);
    setGuess(null);
    setStage('show');
    setNewBest(false);
    setPhase('playing');
  }, []);

  // 回合開始：等遊戲區量到尺寸後隨機擺點，1.5 秒後藏紅點
  useEffect(() => {
    if (phase !== 'playing' || !areaSize || dots) return;
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const place = (): Pt => ({
      x: rand(EDGE, Math.max(EDGE, areaSize.w - EDGE)),
      y: rand(EDGE, Math.max(EDGE, areaSize.h - EDGE)),
    });
    const blue = place();
    let red = place();
    let attempts = 0;
    while (Math.hypot(red.x - blue.x, red.y - blue.y) < MIN_DIST && attempts < 60) {
      red = place();
      attempts++;
    }
    setDots({ blue, red });
    setStage('show');
    timerRef.current = setTimeout(() => setStage('guess'), SHOW_MS);
  }, [phase, areaSize, dots]);

  const onTap = (x: number, y: number) => {
    if (phase !== 'playing' || stage !== 'guess' || !dots) return;
    haptics.light();
    const err = Math.round(Math.hypot(x - dots.red.x, y - dots.red.y));
    setGuess({ x, y });
    setErrors((prev) => [...prev, err]);
    setStage('reveal');
    timerRef.current = setTimeout(() => {
      if (round >= ROUNDS) {
        setPhase('done');
      } else {
        setRound((r) => r + 1);
        setDots(null);
        setGuess(null);
        setStage('show');
      }
    }, REVEAL_MS);
  };

  const sum = errors.reduce((a, b) => a + b, 0);
  // 分數 = 平均誤差 px（整數），越低越好
  const avg = errors.length > 0 ? Math.round(sum / errors.length) : 0;

  // 結束時回報成績，破紀錄給 success 觸感
  useEffect(() => {
    if (phase !== 'done' || errors.length !== ROUNDS) return;
    const score = Math.round(errors.reduce((a, b) => a + b, 0) / ROUNDS);
    const isNew = report(score);
    setNewBest(isNew);
    if (isNew) haptics.success();
  }, [phase, errors, report]);

  const verdict: { text: string; expression: MascotExpression } =
    avg < 20
      ? { text: '神準！', expression: 'excited' }
      : avg < 40
        ? { text: '空間感很好', expression: 'happy' }
        : avg < 70
          ? { text: '還行還行', expression: 'default' }
          : { text: '歐古都暈了', expression: 'dizzy' };

  const dotStyle = (p: Pt, color: string) => ({
    position: 'absolute' as const,
    left: p.x - DOT / 2,
    top: p.y - DOT / 2,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: color,
  });

  if (phase === 'idle') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '盲測距離' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression="cool" color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>盲測距離</Text>
          <Text style={[styles.heroSub, { color: accent }]}>記得住紅點的位置嗎？</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.infoRow}>
            <Eye size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>兩個點會出現 1.5 秒</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <MapPin size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              藍點留著、紅點會消失，憑記憶點出紅點原本的位置
            </Text>
          </View>
          {best !== null && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.infoRow}>
                <Trophy size={20} color={accent} weight="fill" />
                <Text style={[styles.infoText, { color: theme.text }]}>目前最佳平均誤差 {best} px</Text>
              </View>
            </>
          )}
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
        <Stack.Screen options={{ title: '盲測距離' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression={verdict.expression} color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>{verdict.text}</Text>
        </View>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>平均誤差</Text>
          <Text style={[styles.scoreValue, { color: accent }]}>{avg}</Text>
          <Text style={[styles.scoreSub, { color: theme.textMuted }]}>
            px{best !== null && !newBest ? ` · 最佳 ${best} px` : ''}
          </Text>
          {newBest && (
            <View style={[styles.newBestPill, { backgroundColor: accent }]}>
              <Trophy size={14} color="#fff" weight="fill" />
              <Text style={styles.newBestText}>新紀錄！</Text>
            </View>
          )}
        </View>
        <View style={[styles.roundCard, { backgroundColor: theme.cardBg }]}>
          {errors.map((e, i) => (
            <View key={i}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
              <View style={styles.roundRow}>
                <Text style={[styles.roundLabel, { color: theme.textMuted }]}>第 {i + 1} 回合</Text>
                <Text style={[styles.roundValue, { color: theme.text }]}>{e} px</Text>
              </View>
            </View>
          ))}
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
      <Stack.Screen options={{ title: '盲測距離' }} />
      <View style={styles.playWrap}>
        <View style={[styles.statusCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.statusText, { color: theme.text }]}>
            第 {round}/{ROUNDS} 回合
          </Text>
          <Text style={[styles.statusText, { color: theme.textMuted }]}>累計誤差 {sum} px</Text>
        </View>
        <Pressable
          style={[styles.gameArea, { backgroundColor: theme.cardBg }]}
          onLayout={(e) =>
            setAreaSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
          }
          onPress={(e) => onTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
        >
          {dots && <View style={dotStyle(dots.blue, BLUE)} />}
          {dots && stage !== 'guess' && <View style={dotStyle(dots.red, RED)} />}
          {guess && stage === 'reveal' && <View style={dotStyle(guess, accent)} />}
          <View style={styles.hintWrap} pointerEvents="none">
            <Text style={[styles.hintText, { color: theme.textMuted }]}>
              {stage === 'show'
                ? '記住紅點的位置…'
                : stage === 'guess'
                  ? '紅點原本在哪？點出位置'
                  : `誤差 ${errors[errors.length - 1] ?? 0} px`}
            </Text>
          </View>
        </Pressable>
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
  infoText: { fontFamily: 'Fredoka_500Medium', fontSize: 15, flex: 1 },
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
  newBestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  newBestText: { fontFamily: 'Fredoka_700Bold', fontSize: 13, color: '#fff' },
  roundCard: {
    borderRadius: 20,
    padding: 4,
    marginBottom: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  roundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  roundLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
  roundValue: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15 },
  playWrap: { flex: 1, padding: 20, gap: 14 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statusText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15 },
  gameArea: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hintWrap: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
});
