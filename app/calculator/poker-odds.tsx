import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useTheme } from '../../lib/theme';

// ===== 牌的表示：0-51，rank = card % 13（0=2 … 12=A），suit = floor(card / 13) =====
const RANK_LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUIT_LABELS = ['♠', '♥', '♦', '♣'];
const SUIT_RED = [false, true, true, false];

const rankOf = (c: number) => (c % 13) + 2; // 2..14
const suitOf = (c: number) => Math.floor(c / 13);

// ===== 7 張牌評分：分類 ×15^5 + 5 個 tiebreaker（越大越強）=====
const CAT = { SF: 8, QUADS: 7, FULL: 6, FLUSH: 5, STRAIGHT: 4, TRIPS: 3, TWO_PAIR: 2, PAIR: 1, HIGH: 0 };

// 從不重複的 rank 陣列（含 wheel 處理）找最大順子頂張，沒有回傳 0
const straightTop = (ranksDesc: number[]): number => {
  const set = new Set(ranksDesc);
  if (set.has(14)) set.add(1); // A 可當 1
  const uniq = [...set].sort((a, b) => b - a);
  let run = 1;
  for (let i = 1; i < uniq.length; i++) {
    const prev = uniq[i - 1];
    const cur = uniq[i];
    if (prev - cur === 1) {
      run += 1;
      if (run >= 5) return uniq[i] + 4;
    } else {
      run = 1;
    }
  }
  return 0;
};

const encode = (cat: number, ks: number[]): number => {
  let v = cat;
  for (let i = 0; i < 5; i++) v = v * 15 + (ks[i] ?? 0);
  return v;
};

function evaluate7(cards: number[]): number {
  const rankCount: Record<number, number> = {};
  const suitCards: number[][] = [[], [], [], []];
  for (const c of cards) {
    const r = rankOf(c);
    rankCount[r] = (rankCount[r] ?? 0) + 1;
    suitCards[suitOf(c)].push(r);
  }
  const ranksDesc = Object.keys(rankCount).map(Number).sort((a, b) => b - a);

  // 同花 / 同花順
  let flushRanks: number[] | null = null;
  for (const s of suitCards) {
    if (s.length >= 5) {
      flushRanks = [...s].sort((a, b) => b - a);
      break;
    }
  }
  if (flushRanks) {
    const sfTop = straightTop(flushRanks);
    if (sfTop) return encode(CAT.SF, [sfTop]);
  }

  // 四條 / 葫蘆 / 三條 / 對子統計
  const quads: number[] = [];
  const trips: number[] = [];
  const pairs: number[] = [];
  for (const r of ranksDesc) {
    const n = rankCount[r] ?? 0;
    if (n === 4) quads.push(r);
    else if (n === 3) trips.push(r);
    else if (n === 2) pairs.push(r);
  }

  if (quads.length) {
    const q = quads[0];
    const kicker = ranksDesc.find((r) => r !== q) ?? 0;
    return encode(CAT.QUADS, [q, kicker]);
  }
  if (trips.length >= 2) return encode(CAT.FULL, [trips[0], trips[1]]);
  if (trips.length === 1 && pairs.length >= 1) return encode(CAT.FULL, [trips[0], pairs[0]]);
  if (flushRanks) return encode(CAT.FLUSH, flushRanks.slice(0, 5));

  const st = straightTop(ranksDesc);
  if (st) return encode(CAT.STRAIGHT, [st]);

  if (trips.length === 1) {
    const ks = ranksDesc.filter((r) => r !== trips[0]).slice(0, 2);
    return encode(CAT.TRIPS, [trips[0], ...ks]);
  }
  if (pairs.length >= 2) {
    const kicker = ranksDesc.find((r) => r !== pairs[0] && r !== pairs[1]) ?? 0;
    return encode(CAT.TWO_PAIR, [pairs[0], pairs[1], kicker]);
  }
  if (pairs.length === 1) {
    const ks = ranksDesc.filter((r) => r !== pairs[0]).slice(0, 3);
    return encode(CAT.PAIR, [pairs[0], ...ks]);
  }
  return encode(CAT.HIGH, ranksDesc.slice(0, 5));
}

// ===== Monte Carlo =====
type SimResult = { win: number; tie: number; lose: number; iterations: number };

function simulate(hero: number[], board: number[], opponents: number): SimResult {
  const used = new Set([...hero, ...board]);
  const deck: number[] = [];
  for (let c = 0; c < 52; c++) if (!used.has(c)) deck.push(c);

  const iterations = Math.max(1500, Math.min(5000, Math.floor(12000 / opponents)));
  const need = opponents * 2 + (5 - board.length);
  let win = 0;
  let tie = 0;

  for (let it = 0; it < iterations; it++) {
    // 部分 Fisher–Yates：只洗需要的張數
    for (let i = 0; i < need; i++) {
      const j = i + Math.floor(Math.random() * (deck.length - i));
      const tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
    let idx = 0;
    const fullBoard = [...board];
    while (fullBoard.length < 5) fullBoard.push(deck[idx++]);

    const heroScore = evaluate7([...hero, ...fullBoard]);
    let beaten = false;
    let tied = false;
    for (let o = 0; o < opponents; o++) {
      const oppScore = evaluate7([deck[idx], deck[idx + 1], ...fullBoard]);
      idx += 2;
      if (oppScore > heroScore) {
        beaten = true;
        break;
      }
      if (oppScore === heroScore) tied = true;
    }
    if (beaten) continue;
    if (tied) tie += 1;
    else win += 1;
  }
  return { win, tie, lose: iterations - win - tie, iterations };
}

// ===== 畫面 =====
type Slot = { kind: 'hero' | 'board'; index: number };

const BOARD_LABELS = ['翻牌', '翻牌', '翻牌', '轉牌', '河牌'];

export default function PokerOdds() {
  const { theme } = useTheme();
  const [hero, setHero] = useState<(number | null)[]>([null, null]);
  const [board, setBoard] = useState<(number | null)[]>([null, null, null, null, null]);
  const [opponents, setOpponents] = useState(1);
  const [picking, setPicking] = useState<Slot | null>({ kind: 'hero', index: 0 });
  const [computing, setComputing] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);

  const accent = '#6a3da8';
  const pastel = '#d4baf0';

  const usedCards = useMemo(() => {
    const s = new Set<number>();
    [...hero, ...board].forEach((c) => {
      if (c !== null) s.add(c);
    });
    return s;
  }, [hero, board]);

  const heroReady = hero[0] !== null && hero[1] !== null;
  const boardCards = board.filter((c): c is number => c !== null);

  // 點 slot：空的 → 進入選牌；有牌 → 清掉
  const tapSlot = (slot: Slot) => {
    haptics.light();
    setResult(null);
    const list = slot.kind === 'hero' ? hero : board;
    if (list[slot.index] !== null) {
      const next = [...list];
      next[slot.index] = null;
      if (slot.kind === 'hero') setHero(next);
      else setBoard(next);
      setPicking(slot);
    } else {
      setPicking(slot);
    }
  };

  // 選牌後自動跳到下一個空 slot（手牌優先，再公共牌）
  const advancePicking = (h: (number | null)[], b: (number | null)[]) => {
    const hi = h.findIndex((c) => c === null);
    if (hi >= 0) return setPicking({ kind: 'hero', index: hi });
    const bi = b.findIndex((c) => c === null);
    if (bi >= 0) return setPicking({ kind: 'board', index: bi });
    setPicking(null);
  };

  const pickCard = (card: number) => {
    if (usedCards.has(card) || !picking) return;
    haptics.light();
    setResult(null);
    if (picking.kind === 'hero') {
      const next = [...hero];
      next[picking.index] = card;
      setHero(next);
      advancePicking(next, board);
    } else {
      const next = [...board];
      next[picking.index] = card;
      setBoard(next);
      advancePicking(hero, next);
    }
  };

  const compute = () => {
    if (!heroReady || computing) return;
    haptics.soft();
    setComputing(true);
    setResult(null);
    // 讓 UI 先更新再跑模擬
    setTimeout(() => {
      const r = simulate(hero as number[], boardCards, opponents);
      setResult(r);
      setComputing(false);
      haptics.success();
    }, 50);
  };

  const winPct = result ? (result.win / result.iterations) * 100 : 0;
  const tiePct = result ? (result.tie / result.iterations) * 100 : 0;
  const losePct = result ? (result.lose / result.iterations) * 100 : 0;

  const expression: MascotExpression = !result
    ? 'thinking'
    : winPct >= 60
    ? 'excited'
    : winPct >= 40
    ? 'happy'
    : winPct >= 25
    ? 'default'
    : 'sad';

  const renderSlot = (slot: Slot, card: number | null, label?: string) => {
    const active = picking?.kind === slot.kind && picking.index === slot.index;
    return (
      <View key={`${slot.kind}-${slot.index}`} style={styles.slotWrap}>
        <TouchableOpacity
          style={[
            styles.slot,
            { backgroundColor: theme.cardBg, borderColor: active ? accent : theme.divider },
            active && styles.slotActive,
          ]}
          onPress={() => tapSlot(slot)}
          activeOpacity={0.7}
        >
          {card !== null ? (
            <>
              <Text style={[styles.slotRank, { color: SUIT_RED[suitOf(card)] ? '#c2456a' : theme.text }]}>
                {RANK_LABELS[card % 13]}
              </Text>
              <Text style={[styles.slotSuit, { color: SUIT_RED[suitOf(card)] ? '#c2456a' : theme.text }]}>
                {SUIT_LABELS[suitOf(card)]}
              </Text>
            </>
          ) : (
            <Text style={[styles.slotEmpty, { color: theme.hint }]}>＋</Text>
          )}
        </TouchableOpacity>
        {label ? <Text style={[styles.slotLabel, { color: theme.hint }]}>{label}</Text> : null}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: '撲克勝率' }} />

      <Text style={[styles.title, { color: theme.text }]}>德州撲克勝率</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        選你的手牌（公共牌可留空），歐古幫你模擬幾千局
      </Text>

      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>我的手牌</Text>
        <View style={styles.slotRow}>
          {hero.map((c, i) => renderSlot({ kind: 'hero', index: i }, c))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textMuted, marginTop: 14 }]}>
          公共牌（選填）
        </Text>
        <View style={styles.slotRow}>
          {board.map((c, i) => renderSlot({ kind: 'board', index: i }, c, BOARD_LABELS[i]))}
        </View>
      </View>

      {/* 選牌器 */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
          {picking ? '點一張牌放進框框' : '點上面的框框換牌'}
        </Text>
        {SUIT_LABELS.map((suit, s) => (
          <View key={suit} style={styles.pickerRow}>
            <Text style={[styles.pickerSuit, { color: SUIT_RED[s] ? '#c2456a' : theme.text }]}>{suit}</Text>
            <View style={styles.pickerCells}>
              {RANK_LABELS.map((label, r) => {
                const card = s * 13 + r;
                const used = usedCards.has(card);
                return (
                  <TouchableOpacity
                    key={card}
                    style={[
                      styles.pickerCell,
                      { backgroundColor: theme.inputBg },
                      used && { opacity: 0.25 },
                    ]}
                    disabled={used || !picking}
                    onPress={() => pickCard(card)}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[styles.pickerCellText, { color: SUIT_RED[s] ? '#c2456a' : theme.text }]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      {/* 對手人數 */}
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>對手人數</Text>
        <View style={styles.oppRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.oppChip,
                { backgroundColor: opponents === n ? accent : theme.inputBg },
              ]}
              onPress={() => {
                haptics.light();
                setOpponents(n);
                setResult(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.oppChipText, { color: opponents === n ? '#fff' : theme.text }]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.computeBtn, { backgroundColor: heroReady ? accent : theme.divider }]}
        onPress={compute}
        disabled={!heroReady || computing}
        activeOpacity={0.85}
      >
        {computing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.computeText}>
            {heroReady ? '計算勝率' : '先選兩張手牌'}
          </Text>
        )}
      </TouchableOpacity>

      {result ? (
        <View style={[styles.resultCard, { backgroundColor: pastel }]}>
          <Mascot expression={expression} color={accent} size={56} />
          <Text style={[styles.winValue, { color: accent }]}>{winPct.toFixed(1)}%</Text>
          <Text style={[styles.winLabel, { color: accent }]}>獲勝機率</Text>

          <View style={styles.barTrack}>
            <View style={[styles.barSeg, { flex: Math.max(winPct, 0.5), backgroundColor: accent }]} />
            <View style={[styles.barSeg, { flex: Math.max(tiePct, 0.5), backgroundColor: '#8d6e00' }]} />
            <View style={[styles.barSeg, { flex: Math.max(losePct, 0.5), backgroundColor: '#c2456a' }]} />
          </View>
          <View style={styles.legendRow}>
            <Text style={[styles.legend, { color: accent }]}>贏 {winPct.toFixed(1)}%</Text>
            <Text style={[styles.legend, { color: '#8d6e00' }]}>平手 {tiePct.toFixed(1)}%</Text>
            <Text style={[styles.legend, { color: '#c2456a' }]}>輸 {losePct.toFixed(1)}%</Text>
          </View>
          <Text style={[styles.simNote, { color: accent }]}>
            模擬 {result.iterations.toLocaleString()} 局 · {opponents} 位對手 · 結果僅供參考
          </Text>
        </View>
      ) : (
        <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
          <Mascot expression="sleepy" color={theme.hint} size={52} />
          <Text style={[styles.placeholderText, { color: theme.hint }]}>
            選好手牌按「計算勝率」，歐古就開始發牌
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  slotRow: { flexDirection: 'row', gap: 8 },
  slotWrap: { alignItems: 'center' },
  slot: {
    width: 50,
    height: 66,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: { borderStyle: 'dashed' },
  slotRank: { fontFamily: 'Fredoka_700Bold', fontSize: 18, lineHeight: 22 },
  slotSuit: { fontSize: 16, lineHeight: 18 },
  slotEmpty: { fontFamily: 'Fredoka_500Medium', fontSize: 22 },
  slotLabel: { fontFamily: 'Fredoka_400Regular', fontSize: 10, marginTop: 4 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  pickerSuit: { fontSize: 16, width: 20, textAlign: 'center' },
  pickerCells: { flex: 1, flexDirection: 'row', gap: 3 },
  pickerCell: {
    flex: 1,
    aspectRatio: 0.8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCellText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 11 },
  oppRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  oppChip: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oppChipText: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  computeBtn: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  computeText: { fontFamily: 'Fredoka_700Bold', fontSize: 17, color: '#fff', letterSpacing: 0.5 },
  resultCard: {
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  winValue: { fontFamily: 'Fredoka_700Bold', fontSize: 56, letterSpacing: -2, marginTop: 8 },
  winLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15, marginBottom: 14 },
  barTrack: {
    flexDirection: 'row',
    width: '100%',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barSeg: { height: '100%' },
  legendRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  legend: { fontFamily: 'Fredoka_600SemiBold', fontSize: 12 },
  simNote: { fontFamily: 'Fredoka_400Regular', fontSize: 11, opacity: 0.8 },
  placeholderCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14, textAlign: 'center' },
});
