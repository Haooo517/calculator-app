import { Stack } from 'expo-router';
import { Crown, Minus, Plus, Trash, TrendUp } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Mascot } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useBig2Match } from '../../lib/big2Match';
import { useTheme } from '../../lib/theme';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const PLAYERS = [0, 1, 2, 3];
const MIN = 0;
const MAX = 13;

const getMultiplier = (cards: number) => {
  if (cards >= 13) return { factor: 4, label: '四倍' };
  if (cards >= 10) return { factor: 3, label: '三倍' };
  if (cards >= 8) return { factor: 2, label: '雙倍' };
  return { factor: 1, label: '' };
};

const multStyle = (factor: number) => {
  if (factor === 4) return { backgroundColor: '#6a3da8' };
  if (factor === 3) return { backgroundColor: '#c2456a' };
  return { backgroundColor: '#c4623a' };
};

export default function Big2Calculator() {
  const { theme } = useTheme();
  const { match, setName, addRound, removeRound, clearMatch } = useBig2Match();
  const [cards, setCards] = useState<number[]>([5, 5, 5, 0]);
  const [base, setBase] = useState('1');

  const adjust = (idx: number, delta: number) => {
    haptics.selection();
    setCards((prev) => prev.map((v, i) => (i === idx ? Math.max(MIN, Math.min(MAX, v + delta)) : v)));
  };

  const baseNum = Math.max(1, parseFloat(base) || 1);

  // 該輪四人淨分（正=贏、負=輸），零和
  const round = useMemo(() => {
    const zeros = cards.filter((c) => c === 0).length;
    if (zeros !== 1) return null;

    const winnerIdx = cards.findIndex((c) => c === 0);
    const losses = cards.map((c, idx) => {
      if (idx === winnerIdx) return 0;
      const m = getMultiplier(c);
      return c * baseNum * m.factor;
    });
    const total = losses.reduce((a, b) => a + b, 0);
    const scores = losses.map((l, idx) => (idx === winnerIdx ? total : -l)) as [
      number,
      number,
      number,
      number
    ];
    return { winnerIdx, losses, total, scores };
  }, [cards, baseNum]);

  // 累計統計
  const stats = useMemo(() => {
    const totals = [0, 0, 0, 0];
    const wins = [0, 0, 0, 0];
    for (const r of match.rounds) {
      r.scores.forEach((s, i) => {
        totals[i] += s;
        if (s > 0) wins[i] += 1;
      });
    }
    let leader = -1;
    let max = -Infinity;
    let secondMax = -Infinity;
    totals.forEach((t, i) => {
      if (t > max) {
        secondMax = max;
        max = t;
        leader = i;
      } else if (t > secondMax) {
        secondMax = t;
      }
    });
    // 全部 0（沒紀錄或都打平）時不標領先
    const hasLead = match.rounds.length > 0 && max !== secondMax;
    const lead = max - secondMax;
    return { totals, wins, leader: hasLead ? leader : -1, lead };
  }, [match.rounds]);

  const handleRecord = () => {
    if (!round) return;
    haptics.success();
    addRound(round.scores, baseNum);
    setCards([5, 5, 5, 0]);
  };

  const handleRemove = (id: string) => {
    haptics.light();
    removeRound(id);
  };

  const handleClear = () => {
    Alert.alert('結束本局', '會清空所有輪次紀錄（玩家名稱保留），確定嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: () => {
          haptics.warning();
          clearMatch();
        },
      },
    ]);
  };

  const mascotExpr = stats.leader >= 0 && stats.lead >= 50 ? 'excited' : 'happy';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '大老二' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>大老二計分</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>逐輪記錄每人輸贏，自動累計整局</Text>

        {/* 累計統計 */}
        <View style={[styles.statsCard, { backgroundColor: C.accentBg }]}>
          <View style={styles.statsHead}>
            <Mascot expression={mascotExpr} color={C.accent} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statsTitle}>累計戰績</Text>
              <Text style={styles.statsSub}>
                共 {match.rounds.length} 輪
                {stats.leader >= 0 ? ` · ${match.names[stats.leader]} 領先` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            {PLAYERS.map((idx) => {
              const total = stats.totals[idx];
              const isLeader = stats.leader === idx;
              return (
                <View
                  key={idx}
                  style={[styles.statCell, isLeader && styles.statCellLeader]}
                >
                  <View style={styles.statNameRow}>
                    {isLeader && <Crown size={13} color="#8d6e00" weight="fill" />}
                    <Text style={[styles.statName, isLeader && styles.statNameLeader]} numberOfLines={1}>
                      {match.names[idx]}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.statTotal,
                      { color: total > 0 ? '#2d8765' : total < 0 ? '#c2456a' : C.accent },
                    ]}
                  >
                    {total > 0 ? '+' : ''}
                    {total}
                  </Text>
                  <Text style={styles.statWins}>{stats.wins[idx]} 勝</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 玩家名稱 */}
        <View style={[styles.namesCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardLabel, { color: theme.text }]}>玩家名稱</Text>
          <View style={styles.namesGrid}>
            {PLAYERS.map((idx) => (
              <View key={idx} style={[styles.nameInputWrap, { backgroundColor: theme.inputBg }]}>
                <TextInput
                  style={[styles.nameInput, { color: theme.text }]}
                  value={match.names[idx]}
                  onChangeText={(t) => setName(idx, t)}
                  placeholder={`玩家${idx + 1}`}
                  placeholderTextColor={theme.hint}
                  maxLength={6}
                />
              </View>
            ))}
          </View>
        </View>

        {/* 本輪輸入 */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>本輪</Text>
        <View style={[styles.baseCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.baseLabel, { color: theme.text }]}>底注</Text>
          <View style={styles.baseInputWrap}>
            <Text style={[styles.basePrefix, { color: theme.hint }]}>$</Text>
            <TextInput
              style={[styles.baseInput, { color: theme.text }]}
              value={base}
              onChangeText={setBase}
              placeholder="1"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={6}
            />
            <Text style={[styles.baseSuffix, { color: theme.hint }]}>/ 張</Text>
          </View>
        </View>

        <View style={styles.players}>
          {PLAYERS.map((idx) => {
            const c = cards[idx];
            const m = getMultiplier(c);
            const isWinner = round?.winnerIdx === idx;
            const loss = round?.losses[idx] ?? 0;

            return (
              <View
                key={idx}
                style={[styles.playerCard, { backgroundColor: theme.cardBg }, isWinner && styles.playerCardWinner]}
              >
                <View style={styles.playerHead}>
                  <View style={styles.playerNameWrap}>
                    {isWinner && <Crown size={18} color="#8d6e00" weight="fill" />}
                    <Text
                      style={[styles.playerName, { color: theme.text }, isWinner && styles.playerNameWinner]}
                      numberOfLines={1}
                    >
                      {match.names[idx]}
                    </Text>
                  </View>
                  {isWinner ? (
                    <Text style={styles.winnerPayout}>+{round!.total}</Text>
                  ) : c > 0 ? (
                    <View style={styles.lossWrap}>
                      <Text style={styles.lossValue}>−{loss}</Text>
                      {m.factor > 1 && (
                        <View style={[styles.multBadge, multStyle(m.factor)]}>
                          <Text style={styles.multText}>{m.label}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={[styles.idleText, { color: theme.hint }]}>贏家</Text>
                  )}
                </View>

                <View style={[styles.stepperRow, { backgroundColor: theme.inputBg }]}>
                  <TouchableOpacity
                    style={[styles.stepBtn, c <= MIN && styles.stepBtnDisabled]}
                    onPress={() => adjust(idx, -1)}
                    activeOpacity={0.7}
                    disabled={c <= MIN}
                  >
                    <Minus size={20} color="#6a3da8" weight="bold" />
                  </TouchableOpacity>

                  <View style={styles.countWrap}>
                    <Text style={[styles.countValue, { color: theme.text }]}>{c}</Text>
                    <Text style={[styles.countLabel, { color: theme.textMuted }]}>張</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.stepBtn, c >= MAX && styles.stepBtnDisabled]}
                    onPress={() => adjust(idx, 1)}
                    activeOpacity={0.7}
                    disabled={c >= MAX}
                  >
                    <Plus size={20} color="#6a3da8" weight="bold" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {round ? (
          <TouchableOpacity style={styles.recordBtn} onPress={handleRecord} activeOpacity={0.85}>
            <TrendUp size={20} color="#fff" weight="bold" />
            <Text style={styles.recordBtnText}>
              記錄這輪（{match.names[round.winnerIdx]} +{round.total}）
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.hintCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Text style={[styles.hintText, { color: theme.hint }]}>
              {cards.filter((c) => c === 0).length === 0
                ? '把贏家的張數調成 0'
                : '只能有一位贏家（張數為 0）'}
            </Text>
          </View>
        )}

        {/* 歷史紀錄 */}
        {match.rounds.length > 0 && (
          <>
            <View style={styles.historyHead}>
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>歷史紀錄</Text>
              <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
                <Text style={styles.clearText}>結束本局</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.historyCard, { backgroundColor: theme.cardBg }]}>
              {match.rounds.map((r, i) => (
                <View
                  key={r.id}
                  style={[styles.historyRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.divider }]}
                >
                  <View style={styles.roundBadge}>
                    <Text style={styles.roundBadgeText}>{i + 1}</Text>
                  </View>
                  <View style={styles.historyScores}>
                    {r.scores.map((s, pi) => (
                      <Text key={pi} style={styles.historyScore}>
                        <Text style={[styles.historyName, { color: theme.textMuted }]}>{match.names[pi]} </Text>
                        <Text style={{ color: s > 0 ? '#2d8765' : s < 0 ? '#c2456a' : theme.hint }}>
                          {s > 0 ? '+' : ''}
                          {s}
                        </Text>
                      </Text>
                    ))}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(r.id)}
                    style={styles.deleteBtn}
                    activeOpacity={0.6}
                    hitSlop={8}
                  >
                    <Trash size={18} color={theme.hint} weight="bold" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 倍率規則 */}
        <View style={[styles.ruleCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.ruleTitle, { color: theme.text }]}>倍率規則</Text>
          {[
            { range: '0 – 7 張', label: '一倍', color: '#8a7a6c' },
            { range: '8 – 9 張', label: '雙倍 ×2', color: '#c4623a' },
            { range: '10 – 12 張', label: '三倍 ×3', color: '#c2456a' },
            { range: '13 張', label: '四倍 ×4', color: '#6a3da8' },
          ].map((r) => (
            <View key={r.range} style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: r.color }]} />
              <Text style={[styles.ruleRange, { color: theme.text }]}>{r.range}</Text>
              <Text style={[styles.ruleLabel, { color: r.color }]}>{r.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  hint: '#a3897a',
  accentBg: '#d4baf0',
  accent: '#6a3da8',
};

const cardShadow = {
  shadowColor: C.hint,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

const styles = StyleSheet.create({
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
    marginBottom: 22,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 4,
  },
  // stats
  statsCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  statsHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  statsTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: C.accent },
  statsSub: { fontFamily: 'Fredoka_500Medium', fontSize: 13, color: C.accent, opacity: 0.8, marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCell: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  statCellLeader: { backgroundColor: '#ffe082' },
  statNameRow: { flexDirection: 'row', alignItems: 'center', gap: 3, maxWidth: '100%' },
  statName: { fontFamily: 'Fredoka_600SemiBold', fontSize: 12, color: C.accent },
  statNameLeader: { color: '#8d6e00' },
  statTotal: { fontFamily: 'Fredoka_700Bold', fontSize: 24, letterSpacing: -0.5, marginTop: 2 },
  statWins: { fontFamily: 'Fredoka_500Medium', fontSize: 11, color: '#8a7a6c', marginTop: 1 },
  // names
  namesCard: { borderRadius: 20, padding: 16, marginBottom: 18, ...cardShadow },
  cardLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 15, marginBottom: 10 },
  namesGrid: { flexDirection: 'row', gap: 8 },
  nameInputWrap: { flex: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 8 },
  nameInput: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    textAlign: 'center',
    padding: 0,
  },
  // base
  baseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 12,
    ...cardShadow,
  },
  baseLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15 },
  baseInputWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  basePrefix: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
  baseInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    textAlign: 'right',
    minWidth: 36,
    padding: 0,
  },
  baseSuffix: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
  // players
  players: { gap: 10, marginBottom: 14 },
  playerCard: { borderRadius: 20, padding: 14, ...cardShadow },
  playerCardWinner: { backgroundColor: '#ffe082' },
  playerHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerNameWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  playerName: { fontFamily: 'Fredoka_700Bold', fontSize: 17 },
  playerNameWinner: { color: '#8d6e00' },
  winnerPayout: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#8d6e00' },
  lossWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lossValue: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#c2456a' },
  multBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  multText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 11, color: '#fff', letterSpacing: 0.5 },
  idleText: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.35 },
  countWrap: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: 4 },
  countValue: { fontFamily: 'Fredoka_700Bold', fontSize: 28, letterSpacing: -0.5 },
  countLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
  // record button
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.accent,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 18,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  recordBtnText: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#fff' },
  hintCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  hintText: { fontFamily: 'Fredoka_500Medium', fontSize: 13, textAlign: 'center' },
  // history
  historyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  clearText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 14, color: '#c2456a' },
  historyCard: { borderRadius: 20, paddingHorizontal: 14, marginBottom: 18, ...cardShadow },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  roundBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBadgeText: { fontFamily: 'Fredoka_700Bold', fontSize: 13, color: C.accent },
  historyScores: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  historyScore: { fontFamily: 'Fredoka_700Bold', fontSize: 13 },
  historyName: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
  deleteBtn: { padding: 4 },
  // rules
  ruleCard: { borderRadius: 20, padding: 18, ...cardShadow },
  ruleTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 15, marginBottom: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 12 },
  ruleDot: { width: 8, height: 8, borderRadius: 4 },
  ruleRange: { fontFamily: 'Fredoka_500Medium', fontSize: 13, width: 90 },
  ruleLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 13 },
});
