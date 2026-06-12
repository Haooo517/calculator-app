import { Stack } from 'expo-router';
import { ArrowClockwise, EyeSlash, Timer, Trophy } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useBestScore } from '../../lib/scores';
import { useTheme } from '../../lib/theme';

const TARGETS = [5, 7, 10, 15];
const MIN_STOP_MS = 500; // 防誤觸：開始後 0.5 秒內按停不算

export default function BlindTimer() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [target, setTarget] = useState(10);
  const [actual, setActual] = useState(0);
  const { best, report } = useBestScore('blind-timer', 'low');
  const [newBest, setNewBest] = useState(false);
  const startedAtRef = useRef(0);

  const accent = '#5a8a30';
  const bgAccent = '#c4e8a8';

  const start = useCallback(() => {
    haptics.soft();
    startedAtRef.current = Date.now();
    setNewBest(false);
    setPhase('playing');
  }, []);

  const stop = useCallback(() => {
    const elapsedMs = Date.now() - startedAtRef.current;
    if (elapsedMs < MIN_STOP_MS) return; // 太快按到，當作誤觸忽略
    haptics.light();
    setActual(elapsedMs / 1000);
    setPhase('done');
  }, []);

  const errSec = Math.abs(actual - target);
  const errPct = target > 0 ? (errSec / target) * 100 : 0;
  // 分數 = 誤差百分比（1 位小數），越低越好
  const score = Math.round(errPct * 10) / 10;

  // 結束時回報成績，破紀錄給 success 觸感
  useEffect(() => {
    if (phase !== 'done') return;
    const isNew = report(score);
    setNewBest(isNew);
    if (isNew) haptics.success();
  }, [phase, report, score]);

  const verdict: { text: string; expression: MascotExpression } =
    errPct < 3
      ? { text: '神準！', expression: 'excited' }
      : errPct < 8
        ? { text: '很有時間感', expression: 'happy' }
        : errPct < 15
          ? { text: '還行還行', expression: 'default' }
          : { text: '歐古都暈了', expression: 'dizzy' };

  if (phase === 'idle') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '盲計時' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression="cool" color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>盲計時</Text>
          <Text style={[styles.heroSub, { color: accent }]}>你的體內時鐘準嗎？</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.infoRow}>
            <Timer size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>按開始後心裡默數，覺得到了就按停</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <EyeSlash size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>不能看時鐘！</Text>
          </View>
          {best !== null && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.infoRow}>
                <Trophy size={20} color={accent} weight="fill" />
                <Text style={[styles.infoText, { color: theme.text }]}>目前最佳誤差 {best.toFixed(1)}%</Text>
              </View>
            </>
          )}
        </View>
        <Text style={[styles.chipLabel, { color: theme.textMuted }]}>目標秒數</Text>
        <View style={styles.chipRow}>
          {TARGETS.map((t) => {
            const selected = t === target;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.chip,
                  selected
                    ? { backgroundColor: accent, borderColor: accent }
                    : { backgroundColor: theme.cardBg, borderColor: theme.divider },
                ]}
                onPress={() => {
                  haptics.light();
                  setTarget(t);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: selected ? '#fff' : theme.text }]}>{t} 秒</Text>
              </TouchableOpacity>
            );
          })}
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
        <Stack.Screen options={{ title: '盲計時' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression={verdict.expression} color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>{verdict.text}</Text>
        </View>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>實際秒數</Text>
          <Text style={[styles.scoreValue, { color: accent }]}>{actual.toFixed(2)}</Text>
          <Text style={[styles.scoreSub, { color: theme.textMuted }]}>
            目標 {target} 秒 · 誤差 {actual >= target ? '+' : '-'}
            {errSec.toFixed(2)} 秒（{errPct.toFixed(1)}%）
            {best !== null && !newBest ? ` · 最佳 ${best.toFixed(1)}%` : ''}
          </Text>
          {newBest && (
            <View style={[styles.newBestPill, { backgroundColor: accent }]}>
              <Trophy size={14} color="#fff" weight="fill" />
              <Text style={styles.newBestText}>新紀錄！</Text>
            </View>
          )}
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
      <Stack.Screen options={{ title: '盲計時' }} />
      <View style={styles.playArea}>
        <View style={[styles.targetCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.targetLabel, { color: theme.textMuted }]}>心裡默數，到了就停</Text>
          <Text style={[styles.targetValue, { color: theme.text }]}>目標 {target} 秒</Text>
        </View>
        <Mascot expression="thinking" color={accent} size={56} />
        <TouchableOpacity style={[styles.stopBtn, { backgroundColor: accent }]} onPress={stop} activeOpacity={0.7}>
          <Text style={styles.stopText}>停！</Text>
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
    marginBottom: 20,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  infoText: { fontFamily: 'Fredoka_500Medium', fontSize: 15, flex: 1 },
  divider: { height: 1, marginHorizontal: 16 },
  chipLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 13, marginBottom: 8, marginLeft: 4 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  chipText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16 },
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
  scoreValue: { fontFamily: 'Fredoka_700Bold', fontSize: 80, letterSpacing: -3, lineHeight: 88 },
  scoreSub: { fontFamily: 'Fredoka_400Regular', fontSize: 13, marginTop: 6, textAlign: 'center' },
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
  playArea: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  targetCard: {
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
  targetLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
  targetValue: { fontFamily: 'Fredoka_700Bold', fontSize: 40, letterSpacing: -1 },
  stopBtn: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5a8a30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  stopText: { fontFamily: 'Fredoka_700Bold', fontSize: 64, color: '#fff', letterSpacing: -1 },
});
