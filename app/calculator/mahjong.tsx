import { Stack } from 'expo-router';
import { Check, Crown, Minus, Plus, Trash, TrendUp } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { FocusInput } from '../../components/FocusInput';
import { Mascot } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useMahjongMatch } from '../../lib/mahjongMatch';
import { useTheme } from '../../lib/theme';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type TaiItem = { id: string; label: string; tai: number };
type Section = { title: string; items: TaiItem[] };

const PLAYERS = [0, 1, 2, 3];

const SECTIONS: Section[] = [
  {
    title: '基本台',
    items: [
      { id: 'banker', label: '莊家', tai: 1 },
      { id: 'pure', label: '門清', tai: 1 },
      { id: 'kong-flower', label: '槓上開花', tai: 1 },
      { id: 'last-draw', label: '海底撈月', tai: 1 },
      { id: 'last-discard', label: '河底撈魚', tai: 1 },
      { id: 'rob-kong', label: '搶槓胡', tai: 1 },
    ],
  },
  {
    title: '牌型',
    items: [
      { id: 'pingu', label: '平胡', tai: 2 },
      { id: 'three-hidden', label: '三暗刻', tai: 2 },
      { id: 'all-pung', label: '碰碰胡', tai: 4 },
      { id: 'all-need', label: '全求人', tai: 4 },
      { id: 'half-color', label: '混一色', tai: 4 },
      { id: 'four-hidden', label: '四暗刻', tai: 5 },
      { id: 'pure-color', label: '清一色', tai: 8 },
      { id: 'all-honors', label: '字一色', tai: 8 },
      { id: 'five-hidden', label: '五暗刻', tai: 8 },
    ],
  },
  {
    title: '特殊',
    items: [
      { id: 'small-three', label: '小三元', tai: 4 },
      { id: 'big-three', label: '大三元', tai: 8 },
      { id: 'small-four', label: '小四喜', tai: 8 },
      { id: 'seven-rob', label: '七搶一', tai: 8 },
      { id: 'eight-immortals', label: '八仙過海', tai: 8 },
      { id: 'earth-han', label: '地胡', tai: 16 },
      { id: 'big-four', label: '大四喜', tai: 16 },
      { id: 'heaven-han', label: '天胡', tai: 24 },
    ],
  },
];

export default function MahjongCalculator() {
  const { theme } = useTheme();
  const { match, setName, addRound, removeRound, clearMatch } = useMahjongMatch();

  const [winner, setWinner] = useState(0);
  const [selfDraw, setSelfDraw] = useState(true);
  const [loser, setLoser] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [chain, setChain] = useState(0);
  const [flowers, setFlowers] = useState(0);
  const [basePerTai, setBasePerTai] = useState('10');

  const toggle = (id: string) => {
    haptics.selection();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalTai = useMemo(() => {
    let total = 0;
    SECTIONS.forEach((s) =>
      s.items.forEach((i) => {
        if (selected.has(i.id)) total += i.tai;
      })
    );
    return total + chain + flowers;
  }, [selected, chain, flowers]);

  const base = Math.max(0, parseFloat(basePerTai) || 0);
  const pointsPerLoser = totalTai * base; // 每一家應付給胡牌者的錢

  // 計算該輪四人淨分（零和）
  // 自摸：三家各付 pointsPerLoser，胡者收 3×
  // 放槍：放槍者一家付 3×pointsPerLoser，胡者收 3×（台灣規則：包牌）
  const roundScores = useMemo(() => {
    const scores: [number, number, number, number] = [0, 0, 0, 0];
    if (totalTai <= 0) return scores;
    if (selfDraw) {
      PLAYERS.forEach((i) => {
        if (i === winner) scores[i] = pointsPerLoser * 3;
        else scores[i] = -pointsPerLoser;
      });
    } else {
      if (loser === null || loser === winner) return scores;
      scores[winner] = pointsPerLoser * 3;
      scores[loser] = -pointsPerLoser * 3;
    }
    return scores;
  }, [totalTai, selfDraw, winner, loser, pointsPerLoser]);

  const canRecord = totalTai > 0 && base > 0 && (selfDraw || (loser !== null && loser !== winner));

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
    const hasLead = match.rounds.length > 0 && max !== secondMax;
    return { totals, wins, leader: hasLead ? leader : -1, lead: max - secondMax };
  }, [match.rounds]);

  const handleRecord = () => {
    if (!canRecord) return;
    haptics.success();
    addRound({ scores: roundScores, winner, tai: totalTai, selfDraw, loser: selfDraw ? null : loser });
    setSelected(new Set());
    setChain(0);
    setFlowers(0);
    setLoser(null);
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

  const mascotExpr = stats.leader >= 0 && stats.lead >= base * 16 ? 'excited' : 'happy';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '麻將' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>麻將計分</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>選胡家、台數、自摸或放槍，逐輪累計</Text>

        {/* 累計統計 */}
        <View style={[styles.statsCard, { backgroundColor: C.accentBg }]}>
          <View style={styles.statsHead}>
            <Mascot expression={mascotExpr} color={C.accent} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statsTitle}>累計戰績</Text>
              <Text style={styles.statsSub}>
                共 {match.rounds.length} 局
                {stats.leader >= 0 ? ` · ${match.names[stats.leader]} 領先` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            {PLAYERS.map((idx) => {
              const total = stats.totals[idx];
              const isLeader = stats.leader === idx;
              return (
                <View key={idx} style={[styles.statCell, isLeader && styles.statCellLeader]}>
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
                  <Text style={styles.statWins}>{stats.wins[idx]} 胡</Text>
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
                <FocusInput
                  style={[styles.nameInput, { color: theme.text }]}
                  value={match.names[idx]}
                  onChangeText={(t) => setName(idx, t)}
                  placeholder={['東', '南', '西', '北'][idx]}
                  placeholderTextColor={theme.hint}
                  maxLength={6}
                />
              </View>
            ))}
          </View>
        </View>

        {/* 本輪設定 */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>誰胡牌</Text>
        <View style={styles.pickRow}>
          {PLAYERS.map((idx) => {
            const active = winner === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.pickBtn, { backgroundColor: theme.cardBg }, active && styles.pickBtnActive]}
                onPress={() => {
                  haptics.selection();
                  setWinner(idx);
                  if (loser === idx) setLoser(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.pickText, { color: theme.text }, active && styles.pickTextActive]} numberOfLines={1}>
                  {match.names[idx]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>胡牌方式</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, { backgroundColor: theme.cardBg }, selfDraw && styles.modeBtnActive]}
            onPress={() => {
              haptics.selection();
              setSelfDraw(true);
              setLoser(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeText, { color: theme.text }, selfDraw && styles.modeTextActive]}>自摸</Text>
            <Text style={[styles.modeHint, { color: theme.textMuted }, selfDraw && styles.modeHintActive]}>三家付</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, { backgroundColor: theme.cardBg }, !selfDraw && styles.modeBtnActive]}
            onPress={() => {
              haptics.selection();
              setSelfDraw(false);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeText, { color: theme.text }, !selfDraw && styles.modeTextActive]}>放槍</Text>
            <Text style={[styles.modeHint, { color: theme.textMuted }, !selfDraw && styles.modeHintActive]}>一家付</Text>
          </TouchableOpacity>
        </View>

        {!selfDraw && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>誰放槍</Text>
            <View style={styles.pickRow}>
              {PLAYERS.filter((i) => i !== winner).map((idx) => {
                const active = loser === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.pickBtn, { backgroundColor: theme.cardBg }, active && styles.pickBtnLoser]}
                    onPress={() => {
                      haptics.selection();
                      setLoser(idx);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pickText, { color: theme.text }, active && styles.pickTextLoser]} numberOfLines={1}>
                      {match.names[idx]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* 台數總計 */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>本局台數</Text>
          <Text style={styles.totalValue}>
            {totalTai}
            <Text style={styles.totalUnit}> 台</Text>
          </Text>
          {base > 0 && totalTai > 0 && (
            <Text style={styles.totalPoints}>每家 ${pointsPerLoser.toLocaleString()}</Text>
          )}
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
            <View style={[styles.itemList, { backgroundColor: theme.cardBg }]}>
              {section.items.map((item) => {
                const active = selected.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemRow, active && styles.itemRowActive]}
                    onPress={() => toggle(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkBox, active && styles.checkBoxActive]}>
                      {active && <Check size={14} color="#fff" weight="bold" />}
                    </View>
                    <Text style={[styles.itemLabel, { color: theme.text }, active && styles.itemLabelActive]}>
                      {item.label}
                    </Text>
                    <View style={[styles.taiBadge, { backgroundColor: theme.divider }, active && styles.taiBadgeActive]}>
                      <Text style={[styles.taiTextBadge, { color: theme.textMuted }, active && styles.taiTextActive]}>
                        {item.tai} 台
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>連莊 / 花牌</Text>
          {[
            { label: '連莊台數', value: chain, set: setChain, max: 20, hint: '連 N 拉 N，直接填總台' },
            { label: '花牌數量', value: flowers, set: setFlowers, max: 8, hint: '每朵相應花 1 台' },
          ].map((s) => (
            <View key={s.label} style={[styles.stepperCard, { backgroundColor: theme.cardBg }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepperLabel, { color: theme.text }]}>{s.label}</Text>
                <Text style={[styles.stepperHint, { color: theme.textMuted }]}>{s.hint}</Text>
              </View>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={[styles.stepBtn, s.value <= 0 && styles.stepBtnDisabled]}
                  onPress={() => {
                    haptics.selection();
                    s.set(Math.max(0, s.value - 1));
                  }}
                  activeOpacity={0.7}
                  disabled={s.value <= 0}
                >
                  <Minus size={18} color="#6a3da8" weight="bold" />
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: theme.text }]}>{s.value}</Text>
                <TouchableOpacity
                  style={[styles.stepBtn, s.value >= s.max && styles.stepBtnDisabled]}
                  onPress={() => {
                    haptics.selection();
                    s.set(Math.min(s.max, s.value + 1));
                  }}
                  activeOpacity={0.7}
                  disabled={s.value >= s.max}
                >
                  <Plus size={18} color="#6a3da8" weight="bold" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>每台底注</Text>
          <View style={[styles.baseCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.basePrefix, { color: theme.hint }]}>$</Text>
            <FocusInput
              style={[styles.baseInput, { color: theme.text }]}
              value={basePerTai}
              onChangeText={setBasePerTai}
              placeholder="10"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={6}
            />
            <Text style={[styles.baseSuffix, { color: theme.hint }]}>/ 台</Text>
          </View>
        </View>

        {canRecord ? (
          <TouchableOpacity style={styles.recordBtn} onPress={handleRecord} activeOpacity={0.85}>
            <TrendUp size={20} color="#fff" weight="bold" />
            <Text style={styles.recordBtnText}>
              記錄這局（{match.names[winner]} +{roundScores[winner]}）
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.hintCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Text style={[styles.hintText, { color: theme.hint }]}>
              {base <= 0
                ? '請填每台底注'
                : totalTai <= 0
                ? '請勾選台數（至少 1 台）'
                : '放槍時請選誰放槍'}
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
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyMeta, { color: theme.textMuted }]}>
                      {match.names[r.winner]} 胡 {r.tai}台 · {r.selfDraw ? '自摸' : `${r.loser !== null ? match.names[r.loser] : ''}放槍`}
                    </Text>
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
  shadowRadius: 6,
  elevation: 2,
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 32, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontFamily: 'Fredoka_400Regular', fontSize: 14, marginBottom: 22, textAlign: 'center' },
  sectionTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 15, marginBottom: 10, marginLeft: 4 },
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
  statTotal: { fontFamily: 'Fredoka_700Bold', fontSize: 22, letterSpacing: -0.5, marginTop: 2 },
  statWins: { fontFamily: 'Fredoka_500Medium', fontSize: 11, color: '#8a7a6c', marginTop: 1 },
  // names
  namesCard: { borderRadius: 20, padding: 16, marginBottom: 18, ...cardShadow },
  cardLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 15, marginBottom: 10 },
  namesGrid: { flexDirection: 'row', gap: 8 },
  nameInputWrap: { flex: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 8 },
  nameInput: { fontFamily: 'Fredoka_600SemiBold', fontSize: 14, textAlign: 'center', padding: 0 },
  // winner / mode / loser pickers
  pickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  pickBtn: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', ...cardShadow },
  pickBtnActive: { backgroundColor: C.accent },
  pickBtnLoser: { backgroundColor: '#c2456a' },
  pickText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 14 },
  pickTextActive: { color: '#fff', fontFamily: 'Fredoka_700Bold' },
  pickTextLoser: { color: '#fff', fontFamily: 'Fredoka_700Bold' },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modeBtn: { flex: 1, borderRadius: 16, paddingVertical: 12, alignItems: 'center', ...cardShadow },
  modeBtnActive: { backgroundColor: C.accent },
  modeText: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  modeTextActive: { color: '#fff' },
  modeHint: { fontFamily: 'Fredoka_500Medium', fontSize: 11, marginTop: 2 },
  modeHintActive: { color: 'rgba(255,255,255,0.85)' },
  // tai total
  totalCard: {
    backgroundColor: C.accentBg,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  totalLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 13, color: C.accent, opacity: 0.8 },
  totalValue: { fontFamily: 'Fredoka_700Bold', fontSize: 48, color: C.accent, letterSpacing: -2, lineHeight: 54 },
  totalUnit: { fontSize: 20 },
  totalPoints: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16, color: C.accent, opacity: 0.85, marginTop: 4 },
  section: { marginBottom: 18 },
  itemList: { borderRadius: 20, padding: 4, ...cardShadow },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 12,
  },
  itemRowActive: { backgroundColor: '#f7eeff' },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#d8c5e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxActive: { backgroundColor: C.accent, borderColor: C.accent },
  itemLabel: { flex: 1, fontFamily: 'Fredoka_500Medium', fontSize: 15 },
  itemLabelActive: { fontFamily: 'Fredoka_700Bold', color: C.accent },
  taiBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  taiBadgeActive: { backgroundColor: C.accent },
  taiTextBadge: { fontFamily: 'Fredoka_600SemiBold', fontSize: 12 },
  taiTextActive: { color: '#fff' },
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    marginBottom: 8,
    gap: 10,
    ...cardShadow,
  },
  stepperLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15 },
  stepperHint: { fontFamily: 'Fredoka_400Regular', fontSize: 11, marginTop: 2 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.35 },
  stepperValue: { fontFamily: 'Fredoka_700Bold', fontSize: 20, width: 30, textAlign: 'center' },
  baseCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 16,
    gap: 6,
    ...cardShadow,
  },
  basePrefix: { fontFamily: 'Fredoka_500Medium', fontSize: 18 },
  baseInput: { fontFamily: 'Fredoka_700Bold', fontSize: 28, textAlign: 'center', minWidth: 70, padding: 0 },
  baseSuffix: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
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
  historyMeta: { fontFamily: 'Fredoka_500Medium', fontSize: 12, marginBottom: 4 },
  historyScores: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  historyScore: { fontFamily: 'Fredoka_700Bold', fontSize: 13 },
  historyName: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
  deleteBtn: { padding: 4 },
});
