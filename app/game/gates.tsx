import { Stack } from 'expo-router';
import { ArrowClockwise, Calculator, FlagCheckered, Trophy } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useBestScore } from '../../lib/scores';
import { useTheme } from '../../lib/theme';

const ROUNDS = 10;
const START_VALUE = 3;

type Op = {
  label: string; // 顯示文字，如「× 2」
  apply: (n: number) => number;
};

type Gate = { left: Op; right: Op };

// 運算池：故意混搭「加大數」與「乘倍率」，划不划算取決於當下數字大小
const ADD_OPS: Op[] = [
  { label: '+ 12', apply: (n) => n + 12 },
  { label: '+ 25', apply: (n) => n + 25 },
  { label: '+ 50', apply: (n) => n + 50 },
  { label: '+ 100', apply: (n) => n + 100 },
];
const MUL_OPS: Op[] = [
  { label: '× 1.5', apply: (n) => Math.floor(n * 1.5) },
  { label: '× 2', apply: (n) => n * 2 },
  { label: '× 3', apply: (n) => n * 3 },
];
const TRAP_OPS: Op[] = [
  { label: '− 20', apply: (n) => Math.max(1, n - 20) },
  { label: '÷ 2', apply: (n) => Math.max(1, Math.floor(n / 2)) },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// 產生一道閘門：保證左右運算不同、且不會兩個都明顯爛
function makeGate(): Gate {
  const r = Math.random();
  // 70% 給「加 vs 乘」這種需要心算的對比；30% 摻一個陷阱讓玩家不能無腦選
  const add = pick(ADD_OPS);
  const mul = pick(MUL_OPS);
  if (r < 0.7) {
    return Math.random() < 0.5 ? { left: add, right: mul } : { left: mul, right: add };
  }
  const good = Math.random() < 0.5 ? add : mul;
  const trap = pick(TRAP_OPS);
  return Math.random() < 0.5 ? { left: good, right: trap } : { left: trap, right: good };
}

function makeGates(): Gate[] {
  return Array.from({ length: ROUNDS }, makeGate);
}

// 易讀數字：≥ 10000 加千分位
function fmt(n: number): string {
  return n >= 10000 ? n.toLocaleString('en-US') : String(n);
}

export default function Gates() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [gates, setGates] = useState<Gate[]>([]);
  const [round, setRound] = useState(0); // 0-based 當前關卡索引
  const [value, setValue] = useState(START_VALUE);
  const { best, report } = useBestScore('gates', 'high');
  const [newBest, setNewBest] = useState(false);
  const lockRef = useRef(false); // 防連點：套用動畫期間鎖住
  const pop = useRef(new Animated.Value(1)).current;

  const accent = '#5a8a30';
  const bgAccent = '#c4e8a8';

  const start = useCallback(() => {
    haptics.soft();
    setGates(makeGates());
    setRound(0);
    setValue(START_VALUE);
    setNewBest(false);
    lockRef.current = false;
    pop.setValue(1);
    setPhase('playing');
  }, [pop]);

  // 結束時回報成績，破紀錄給 success 觸感
  useEffect(() => {
    if (phase !== 'done') return;
    const isNew = report(value);
    setNewBest(isNew);
    if (isNew) haptics.success();
  }, [phase, report, value]);

  const choose = useCallback(
    (side: 'left' | 'right') => {
      if (phase !== 'playing' || lockRef.current) return;
      lockRef.current = true;
      haptics.light();
      const op = side === 'left' ? gates[round].left : gates[round].right;
      setValue((v) => op.apply(v));
      // 數字跳動：縮放彈一下
      pop.setValue(0.7);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
      const next = round + 1;
      // 等彈跳一下再進關，讓數字變化看得到
      setTimeout(() => {
        if (next >= ROUNDS) {
          setPhase('done');
        } else {
          setRound(next);
          lockRef.current = false;
        }
      }, 220);
    },
    [phase, gates, round, pop]
  );

  // 評語 + Mascot 表情分級（依最終數字）
  const endExpression: MascotExpression =
    value > 5000 ? 'excited' : value > 1500 ? 'happy' : value > 500 ? 'default' : 'sleepy';
  const endVerdict =
    value > 5000 ? '數字鬼才！' : value > 1500 ? '心算高手！' : value > 500 ? '還不錯喔～' : '差一點點啦！';

  if (phase === 'idle') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '閘門衝刺' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression="cool" color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>閘門衝刺</Text>
          <Text style={[styles.heroSub, { color: accent }]}>選對閘門，把數字衝到最大！</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.infoRow}>
            <Calculator size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              每關選一個閘門套用到你的數字，{ROUNDS} 關後數字越大越好
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <FlagCheckered size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>哪個划算要用算的！（×倍 vs ＋大數）</Text>
          </View>
          {best !== null && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.infoRow}>
                <Trophy size={20} color={accent} weight="fill" />
                <Text style={[styles.infoText, { color: theme.text }]}>目前最佳紀錄 {fmt(best)}</Text>
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
        <Stack.Screen options={{ title: '閘門衝刺' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression={endExpression} color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>{endVerdict}</Text>
        </View>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>最終數字</Text>
          <Text
            style={[styles.scoreValue, { color: accent }, value >= 100000 && styles.scoreValueSmall]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {fmt(value)}
          </Text>
          <Text style={[styles.scoreSub, { color: theme.textMuted }]}>
            從 {START_VALUE} 開始，闖過 {ROUNDS} 關
            {best !== null && !newBest ? ` · 最佳紀錄 ${fmt(best)}` : ''}
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

  const gate = gates[round];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: '閘門衝刺' }} />
      <View style={styles.playArea}>
        <View style={[styles.valueCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.valueLabel, { color: theme.textMuted }]}>第 {round + 1}/{ROUNDS} 關</Text>
          <Text style={[styles.valueHint, { color: theme.textMuted }]}>目前數字</Text>
          <Animated.Text style={[styles.valueNum, { color: accent, transform: [{ scale: pop }] }]} numberOfLines={1} adjustsFontSizeToFit>
            {fmt(value)}
          </Animated.Text>
        </View>
        <Text style={[styles.prompt, { color: theme.textMuted }]}>選一個閘門通過 ↓</Text>
        <View style={styles.gatesRow}>
          <TouchableOpacity
            style={[styles.gate, { backgroundColor: accent }]}
            onPress={() => choose('left')}
            activeOpacity={0.8}
          >
            <Text style={styles.gateOp}>{gate.left.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gate, { backgroundColor: accent }]}
            onPress={() => choose('right')}
            activeOpacity={0.8}
          >
            <Text style={styles.gateOp}>{gate.right.label}</Text>
          </TouchableOpacity>
        </View>
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
  heroSub: { fontFamily: 'Fredoka_500Medium', fontSize: 14, opacity: 0.85, marginTop: 4, textAlign: 'center' },
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
  scoreValue: { fontFamily: 'Fredoka_700Bold', fontSize: 72, letterSpacing: -3, lineHeight: 80 },
  scoreValueSmall: { fontSize: 56 },
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
    gap: 20,
  },
  valueCard: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  valueLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 15 },
  valueHint: { fontFamily: 'Fredoka_500Medium', fontSize: 13, marginTop: 6 },
  valueNum: { fontFamily: 'Fredoka_700Bold', fontSize: 80, letterSpacing: -3, lineHeight: 88 },
  prompt: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
  gatesRow: { flexDirection: 'row', gap: 16, width: '100%' },
  gate: {
    flex: 1,
    height: 150,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5a8a30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gateOp: { fontFamily: 'Fredoka_700Bold', fontSize: 38, color: '#fff', letterSpacing: -1 },
});
