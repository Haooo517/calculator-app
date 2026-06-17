import { Stack } from 'expo-router';
import { ArrowClockwise, ArrowsLeftRight, Calculator, Trophy } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useBestScore } from '../../lib/scores';
import { useTheme } from '../../lib/theme';

const ROWS = 13; // 閘門排數
const START_VALUE = 3;
const ROW_GAP = 200; // 每排閘門之間的垂直間距（px）
const BASE_SPEED = 150; // 起始捲動速度（px/秒）
const SPEED_GAIN = 16; // 每通過一排，速度增量（px/秒）
const TOKEN_LINE = 0.78; // token 中心落在跑道高度的比例（越大越靠下）

type Op = {
  label: string; // 顯示文字，如「× 2」
  apply: (n: number) => number;
  trap?: boolean; // 陷阱運算（會讓數字變小），上紅色
};

type Row = {
  left: Op;
  right: Op;
  consumed: boolean; // 是否已套用過（避免重複觸發）
};

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
  { label: '− 20', apply: (n) => Math.max(1, n - 20), trap: true },
  { label: '÷ 2', apply: (n) => Math.max(1, Math.floor(n / 2)), trap: true },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// 產生一排閘門：保證左右運算不同、且不會兩個都明顯爛
function makeRow(): Row {
  const r = Math.random();
  const add = pick(ADD_OPS);
  const mul = pick(MUL_OPS);
  // 70% 給「加 vs 乘」這種需要心算的對比；30% 摻一個陷阱讓玩家不能無腦選
  if (r < 0.7) {
    return Math.random() < 0.5
      ? { left: add, right: mul, consumed: false }
      : { left: mul, right: add, consumed: false };
  }
  const good = Math.random() < 0.5 ? add : mul;
  const trap = pick(TRAP_OPS);
  return Math.random() < 0.5
    ? { left: good, right: trap, consumed: false }
    : { left: trap, right: good, consumed: false };
}

function makeRows(): Row[] {
  return Array.from({ length: ROWS }, makeRow);
}

// 易讀數字：≥ 10000 加千分位
function fmt(n: number): string {
  return n >= 10000 ? n.toLocaleString('en-US') : String(n);
}

export default function Gates() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [rows, setRows] = useState<Row[]>([]);
  const [value, setValue] = useState(START_VALUE);
  const [cleared, setCleared] = useState(0); // 已通過排數（顯示進度）
  const [lane, setLane] = useState<0 | 1>(0); // 0 左道 / 1 右道
  const [scroll, setScroll] = useState(0); // 捲動距離（px），驅動重繪
  const [flash, setFlash] = useState<{ row: number; side: 0 | 1 } | null>(null); // 剛通過的閘門高亮

  const { best, report } = useBestScore('gates', 'high');
  const [newBest, setNewBest] = useState(false);

  // 即時迴圈用的 ref（不觸發 render）
  const rowsRef = useRef<Row[]>([]);
  const laneRef = useRef<0 | 1>(0);
  const valueRef = useRef(START_VALUE);
  const clearedRef = useRef(0);
  const scrollRef = useRef(0);
  const lastTsRef = useRef(0);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackHRef = useRef(0);
  const [trackH, setTrackH] = useState(0);
  const [trackW, setTrackW] = useState(0);

  // 動畫值
  const laneX = useRef(new Animated.Value(0)).current; // token 橫移（0 左 / 1 右）
  const pop = useRef(new Animated.Value(1)).current; // 數字彈跳

  const accent = '#5a8a30';
  const accentTrap = '#c2553a';
  const bgAccent = '#c4e8a8';

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout;
    trackHRef.current = height;
    setTrackH(height);
    setTrackW(width);
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      clearInterval(rafRef.current);
      rafRef.current = null;
    }
    if (endTimerRef.current) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    haptics.soft();
    const fresh = makeRows();
    rowsRef.current = fresh;
    laneRef.current = 0;
    valueRef.current = START_VALUE;
    clearedRef.current = 0;
    scrollRef.current = 0;
    lastTsRef.current = Date.now();
    setRows(fresh);
    setValue(START_VALUE);
    setCleared(0);
    setLane(0);
    setScroll(0);
    setFlash(null);
    setNewBest(false);
    pop.setValue(1);
    laneX.setValue(0);
    setPhase('playing');
  }, [laneX, pop]);

  const switchLane = useCallback(
    (next: 0 | 1) => {
      if (laneRef.current === next) return;
      laneRef.current = next;
      setLane(next);
      haptics.selection();
      Animated.spring(laneX, {
        toValue: next,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }).start();
    },
    [laneX]
  );

  // 套用某排某道的運算
  const applyGate = useCallback(
    (rowIdx: number, side: 0 | 1) => {
      const row = rowsRef.current[rowIdx];
      if (!row || row.consumed) return;
      row.consumed = true;
      const op = side === 0 ? row.left : row.right;
      const nextVal = op.apply(valueRef.current);
      valueRef.current = nextVal;
      setValue(nextVal);
      clearedRef.current += 1;
      setCleared(clearedRef.current);
      setFlash({ row: rowIdx, side });
      haptics.light();
      // 數字彈一下
      pop.setValue(0.72);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 130, useNativeDriver: true }).start();
    },
    [pop]
  );

  // 即時捲動迴圈：用 Date.now() 算 delta，推進 scrollRef，逐排做碰撞判定
  useEffect(() => {
    if (phase !== 'playing') return;
    lastTsRef.current = Date.now();
    rafRef.current = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - lastTsRef.current) / 1000); // 夾住分頁切換造成的大跳
      lastTsRef.current = now;

      const speed = BASE_SPEED + clearedRef.current * SPEED_GAIN;
      scrollRef.current += speed * dt;
      const s = scrollRef.current;
      setScroll(s);

      const h = trackHRef.current;
      const tokenY = h * TOKEN_LINE;

      // 第 i 排初始在跑道上方 ROW_GAP*(i+1) 處，往下捲 s，當下 Y = -ROW_GAP*(ROWS-i)... 用相對排序
      // 這裡讓最後一排在 scroll 抵達 ROWS*ROW_GAP 時剛好掃過 token
      for (let i = 0; i < rowsRef.current.length; i++) {
        const row = rowsRef.current[i];
        if (row.consumed) continue;
        const rowY = rowYAt(i, s, h, tokenY);
        if (rowY >= tokenY) {
          applyGate(i, laneRef.current);
        }
      }

      // 全部通過 → 停捲動，短暫停留讓最後的數字彈跳/高亮看得到再進結算
      if (clearedRef.current >= ROWS) {
        if (rafRef.current) {
          clearInterval(rafRef.current);
          rafRef.current = null;
        }
        endTimerRef.current = setTimeout(() => setPhase('done'), 350);
      }
    }, 16);

    return () => stopLoop();
  }, [phase, applyGate, stopLoop]);

  // 卸載保險：清掉 interval
  useEffect(() => stopLoop, [stopLoop]);

  // 結束時回報成績，破紀錄給 success 觸感
  useEffect(() => {
    if (phase !== 'done') return;
    const isNew = report(valueRef.current);
    setNewBest(isNew);
    if (isNew) haptics.success();
  }, [phase, report]);

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
          <Text style={[styles.heroSub, { color: accent }]}>切換跑道，把數字衝到最大！</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.infoRow}>
            <ArrowsLeftRight size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              歐古會一直往前衝！閘門一排排迎面而來，點左 / 右切換跑道
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <Calculator size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              選讓數字變最大的閘門通過——但哪個划算要用算的！（×倍 vs ＋大數）
            </Text>
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
            從 {START_VALUE} 開始，衝過 {ROWS} 排閘門
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

  // playing：即時跑道
  const h = trackH;
  const tokenY = h * TOKEN_LINE;
  // 對齊閘門格子中心：格子排有左右 padding GATE_PAD + 中間 gap GATE_GAP，兩個等寬 flex 格子
  const cellW = (trackW - GATE_PAD * 2 - GATE_GAP) / 2;
  const leftCenter = GATE_PAD + cellW / 2; // 左道（左格中心）
  const rightCenter = GATE_PAD + cellW + GATE_GAP + cellW / 2; // 右道（右格中心）
  const tokenLeft = leftCenter - TOKEN_SIZE / 2;
  const laneShift = rightCenter - leftCenter;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: '閘門衝刺' }} />
      {/* 頂部：目前數字 + 進度 */}
      <View style={[styles.hud, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.hudLabel, { color: theme.textMuted }]}>
          第 {Math.min(cleared + 1, ROWS)}/{ROWS} 排 · 目前數字
        </Text>
        <Animated.Text
          style={[styles.hudValue, { color: accent, transform: [{ scale: pop }] }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {fmt(value)}
        </Animated.Text>
      </View>

      {/* 跑道 */}
      <View style={styles.trackWrap} onLayout={onTrackLayout}>
        {/* 中央分隔虛線 */}
        <View style={[styles.laneDivider, { backgroundColor: theme.divider }]} pointerEvents="none" />

        {/* 閘門排 */}
        {h > 0 &&
          rows.map((row, i) => {
            const rowY = rowYAt(i, scroll, h, tokenY);
            // 只畫進視野附近的排，省繪製
            if (rowY < -GATE_H - 20 || rowY > h + 40) return null;
            const leftActive = flash?.row === i && flash.side === 0;
            const rightActive = flash?.row === i && flash.side === 1;
            return (
              <View key={i} style={[styles.gateRow, { top: rowY }]} pointerEvents="none">
                <GateCell op={row.left} active={leftActive} accent={accent} trapColor={accentTrap} />
                <GateCell op={row.right} active={rightActive} accent={accent} trapColor={accentTrap} />
              </View>
            );
          })}

        {/* token：歐古，固定在跑道下方，橫移在左右道之間（translateX 0→laneShift = 左道→右道） */}
        {h > 0 && trackW > 0 && (
          <Animated.View
            style={[
              styles.token,
              {
                top: tokenY - TOKEN_SIZE / 2,
                left: tokenLeft,
                transform: [
                  {
                    translateX: laneX.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, laneShift],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <View style={[styles.tokenGlow, { backgroundColor: bgAccent }]}>
              <Mascot expression="cool" color={accent} size={44} bob={false} autoBlink={false} />
            </View>
          </Animated.View>
        )}
      </View>

      {/* 左右點擊區 */}
      <View style={styles.tapRow} pointerEvents="box-none">
        <Pressable style={styles.tapHalf} onPress={() => switchLane(0)}>
          <View style={[styles.laneBtn, lane === 0 && { backgroundColor: accent }]}>
            <Text style={[styles.laneBtnText, { color: lane === 0 ? '#fff' : accent }]}>← 左道</Text>
          </View>
        </Pressable>
        <Pressable style={styles.tapHalf} onPress={() => switchLane(1)}>
          <View style={[styles.laneBtn, lane === 1 && { backgroundColor: accent }]}>
            <Text style={[styles.laneBtnText, { color: lane === 1 ? '#fff' : accent }]}>右道 →</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// token 尺寸與閘門排版尺寸（px）
const TOKEN_SIZE = 64;
const GATE_H = 92;
const GATE_PAD = 14; // 閘門排左右內距
const GATE_GAP = 14; // 左右閘門之間間距

// 計算第 i 排當下在跑道內的 Y（中心）。
// scroll 從 0 增長；讓第 i 排在 scroll = (i+1)*ROW_GAP 時，其中心抵達 tokenY。
function rowYAt(i: number, scroll: number, _h: number, tokenY: number): number {
  return tokenY - (i + 1) * ROW_GAP + scroll;
}

// 單一閘門格子
function GateCell({
  op,
  active,
  accent,
  trapColor,
}: {
  op: Op;
  active: boolean;
  accent: string;
  trapColor: string;
}) {
  const base = op.trap ? trapColor : accent;
  return (
    <View
      style={[
        styles.gate,
        { backgroundColor: base, shadowColor: base },
        active && styles.gateActive,
      ]}
    >
      <Text style={styles.gateOp}>{op.label}</Text>
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

  // HUD
  hud: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hudLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
  hudValue: { fontFamily: 'Fredoka_700Bold', fontSize: 56, letterSpacing: -2, lineHeight: 62 },

  // 跑道
  trackWrap: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  laneDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
    opacity: 0.5,
  },
  gateRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: GATE_PAD,
    gap: GATE_GAP,
  },
  gate: {
    flex: 1,
    height: GATE_H,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  gateActive: {
    transform: [{ scale: 1.08 }],
    shadowOpacity: 0.5,
  },
  gateOp: { fontFamily: 'Fredoka_700Bold', fontSize: 30, color: '#fff', letterSpacing: -1 },

  // token（left 由內聯計算成左道中心，translateX 滑到右道）
  token: {
    position: 'absolute',
    width: TOKEN_SIZE,
    alignItems: 'center',
  },
  tokenGlow: {
    width: TOKEN_SIZE,
    height: TOKEN_SIZE,
    borderRadius: TOKEN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5a8a30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
  },

  // 左右點擊區
  tapRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    gap: 14,
  },
  tapHalf: { flex: 1 },
  laneBtn: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#5a8a30',
  },
  laneBtnText: { fontFamily: 'Fredoka_700Bold', fontSize: 18, letterSpacing: 0.5 },
});
