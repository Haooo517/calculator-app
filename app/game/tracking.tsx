import { Stack } from 'expo-router';
import { ArrowClockwise, Crosshair, Lightning, Timer, Trophy } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useBestScore } from '../../lib/scores';
import { useTheme } from '../../lib/theme';

const DURATION = 30;
const BLOCK = 56;
const EDGE = 10; // 方塊與遊戲區邊緣的最小間距
const START_INTERVAL = 900;
const MIN_INTERVAL = 350;
const SPEEDUP = 0.95;

export default function Tracking() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [catches, setCatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [pos, setPos] = useState({ x: EDGE, y: EDGE });
  const { best, report } = useBestScore('tracking', 'high');
  const [newBest, setNewBest] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalMsRef = useRef(START_INTERVAL);
  const startedAtRef = useRef(0);
  const areaRef = useRef({ w: 0, h: 0 });

  const randomPos = useCallback(() => {
    const { w, h } = areaRef.current;
    const maxX = Math.max(EDGE, w - BLOCK - EDGE);
    const maxY = Math.max(EDGE, h - BLOCK - EDGE);
    return {
      x: EDGE + Math.random() * (maxX - EDGE),
      y: EDGE + Math.random() * (maxY - EDGE),
    };
  }, []);

  // 重排移動 interval（抓到後速度變快時也用這支重設）
  const scheduleMove = useCallback(() => {
    if (moveRef.current) clearInterval(moveRef.current);
    moveRef.current = setInterval(() => {
      setPos(randomPos());
    }, intervalMsRef.current);
  }, [randomPos]);

  const start = useCallback(() => {
    haptics.soft();
    startedAtRef.current = Date.now();
    intervalMsRef.current = START_INTERVAL;
    setCatches(0);
    setTimeLeft(DURATION);
    setNewBest(false);
    setPhase('playing');
  }, []);

  // 計時：Date.now 錨點放 ref，不受其他 state 影響
  useEffect(() => {
    if (phase !== 'playing') return;
    tickRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const remaining = Math.max(0, DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (tickRef.current) clearInterval(tickRef.current);
        if (moveRef.current) clearInterval(moveRef.current);
        setPhase('done');
      }
    }, 50);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (moveRef.current) clearInterval(moveRef.current);
    };
  }, [phase]);

  // 結束時回報成績，破紀錄給 success 觸感
  useEffect(() => {
    if (phase !== 'done') return;
    const isNew = report(catches);
    setNewBest(isNew);
    if (isNew) haptics.success();
  }, [phase, report, catches]);

  // 遊戲區量到尺寸後，把方塊丟到隨機位置並開始亂跳
  const onAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    areaRef.current = { w: width, h: height };
    setPos(randomPos());
    scheduleMove();
  };

  const catchBlock = () => {
    if (phase !== 'playing') return;
    haptics.light();
    setCatches((c) => c + 1);
    intervalMsRef.current = Math.max(MIN_INTERVAL, intervalMsRef.current * SPEEDUP);
    setPos(randomPos()); // 立刻跳走
    scheduleMove(); // 用新速度重排
  };

  const accent = '#5a8a30';
  const bgAccent = '#c4e8a8';

  const endExpression: MascotExpression =
    catches >= 25 ? 'excited' : catches >= 15 ? 'happy' : catches >= 8 ? 'default' : 'sleepy';
  const endComment =
    catches >= 25
      ? '獵人歐古！'
      : catches >= 15
        ? '反應很不錯喔！'
        : catches >= 8
          ? '有跟上節奏！'
          : '方塊比你快…';

  if (phase === 'idle') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '追物體' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression="surprised" color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>追物體</Text>
          <Text style={[styles.heroSub, { color: accent }]}>抓得到亂跳的方塊嗎？</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.infoRow}>
            <Timer size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>限時 30 秒</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <Crosshair size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>方塊會亂跳，點中越多次越好</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <Lightning size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>越點越快，小心跟不上！</Text>
          </View>
          {best !== null && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.infoRow}>
                <Trophy size={20} color={accent} weight="fill" />
                <Text style={[styles.infoText, { color: theme.text }]}>目前最佳紀錄 {best} 次</Text>
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
        <Stack.Screen options={{ title: '追物體' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression={endExpression} color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>結束！</Text>
          <Text style={[styles.heroSub, { color: accent }]}>{endComment}</Text>
        </View>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>抓到次數</Text>
          <Text style={[styles.scoreValue, { color: accent }]}>{catches}</Text>
          <Text style={[styles.scoreSub, { color: theme.textMuted }]}>
            30 秒內{best !== null && !newBest ? ` · 最佳紀錄 ${best} 次` : ''}
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
      <Stack.Screen options={{ title: '追物體' }} />
      <View style={styles.playContent}>
        <View style={styles.topStats}>
          <View style={[styles.statPill, { backgroundColor: theme.cardBg }]}>
            <Timer size={14} color={accent} weight="fill" />
            <Text style={[styles.statText, { color: theme.text }]}>{timeLeft.toFixed(1)}s</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>抓到</Text>
            <Text style={[styles.statText, { color: accent }]}>{catches}</Text>
          </View>
        </View>
        <View style={styles.gameArea} onLayout={onAreaLayout}>
          <TouchableOpacity
            style={[styles.block, { backgroundColor: accent, left: pos.x, top: pos.y }]}
            onPress={catchBlock}
            activeOpacity={0.7}
          >
            <Mascot expression="surprised" color="#fff" size={36} />
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
  playContent: { flex: 1, padding: 20 },
  topStats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 5,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  statLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 12 },
  statText: { fontFamily: 'Fredoka_700Bold', fontSize: 14 },
  gameArea: { flex: 1 },
  block: {
    position: 'absolute',
    width: BLOCK,
    height: BLOCK,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5a8a30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
