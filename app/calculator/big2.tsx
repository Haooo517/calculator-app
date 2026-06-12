import { Stack } from 'expo-router';
import { Crown, Minus, Plus } from 'phosphor-react-native';
import { Mascot } from '../../components/Mascot';
import { useTheme } from '../../lib/theme';
import { useMemo, useState } from 'react';
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

const PLAYERS = [1, 2, 3, 4];
const MIN = 0;
const MAX = 13;

const getMultiplier = (cards: number) => {
  if (cards >= 13) return { factor: 4, label: '四倍' };
  if (cards >= 10) return { factor: 3, label: '三倍' };
  if (cards >= 8) return { factor: 2, label: '雙倍' };
  return { factor: 1, label: '' };
};

export default function Big2Calculator() {
  const { theme } = useTheme();
  const [cards, setCards] = useState<number[]>([5, 5, 5, 0]);
  const [base, setBase] = useState('1');

  const adjust = (idx: number, delta: number) => {
    setCards((prev) => prev.map((v, i) => (i === idx ? Math.max(MIN, Math.min(MAX, v + delta)) : v)));
  };

  const baseNum = Math.max(1, parseFloat(base) || 1);

  const summary = useMemo(() => {
    const zeros = cards.filter((c) => c === 0).length;
    if (zeros !== 1) return null;

    const winnerIdx = cards.findIndex((c) => c === 0);
    const losses = cards.map((c, idx) => {
      if (idx === winnerIdx) return 0;
      const m = getMultiplier(c);
      return c * baseNum * m.factor;
    });
    const total = losses.reduce((a, b) => a + b, 0);
    return { winnerIdx, losses, total };
  }, [cards, baseNum]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '大老二點數' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>大老二計分</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>輸入每人剩餘張數，自動算誰勝、誰賠</Text>

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
          {PLAYERS.map((p, idx) => {
            const c = cards[idx];
            const m = getMultiplier(c);
            const isWinner = summary?.winnerIdx === idx;
            const loss = summary?.losses[idx] ?? 0;

            return (
              <View
                key={p}
                style={[
                  styles.playerCard,
                  { backgroundColor: theme.cardBg },
                  isWinner && styles.playerCardWinner,
                ]}
              >
                <View style={styles.playerHead}>
                  <View style={styles.playerNameWrap}>
                    {isWinner && <Crown size={18} color="#8d6e00" weight="fill" />}
                    <Text style={[styles.playerName, { color: theme.text }, isWinner && styles.playerNameWinner]}>
                      玩家 {p}
                    </Text>
                  </View>
                  {isWinner ? (
                    <Text style={styles.winnerPayout}>+{summary!.total} 點</Text>
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
                    <Text style={[styles.idleText, { color: theme.hint }]}>未開始</Text>
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

        {summary ? (
          <View style={styles.totalCard}>
            <Mascot expression="excited" color="#6a3da8" size={56} />
            <View style={{ flex: 1 }}>
              <Text style={styles.totalLabel}>玩家 {summary.winnerIdx + 1} 勝出</Text>
              <Text style={styles.totalValue}>共贏 {summary.total} 點</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="thinking" color={theme.hint} size={48} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 4 }]}>
              {cards.filter((c) => c === 0).length === 0
                ? '把贏家的張數調成 0'
                : '只能有一位贏家（張數為 0）'}
            </Text>
          </View>
        )}

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

const multStyle = (factor: number) => {
  if (factor === 4) return { backgroundColor: '#6a3da8' };
  if (factor === 3) return { backgroundColor: '#c2456a' };
  return { backgroundColor: '#c4623a' };
};

const C = {
  hint: '#a3897a',
  accentBg: '#d4baf0',
  accent: '#6a3da8',
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
  baseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  baseLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
  },
  baseInputWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  basePrefix: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  baseInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    textAlign: 'right',
    minWidth: 36,
    padding: 0,
  },
  baseSuffix: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
  },
  players: {
    gap: 10,
    marginBottom: 18,
  },
  playerCard: {
    borderRadius: 22,
    padding: 16,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  playerCardWinner: {
    backgroundColor: '#ffe082',
  },
  playerHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
  },
  playerNameWinner: {
    color: '#8d6e00',
  },
  winnerPayout: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#8d6e00',
  },
  lossWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lossValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#c2456a',
  },
  multBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  multText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
  },
  idleText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
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
  stepBtnDisabled: {
    opacity: 0.35,
  },
  countWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 4,
  },
  countValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  countLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.accentBg,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  totalLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    color: C.accent,
    opacity: 0.85,
  },
  totalValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: C.accent,
    letterSpacing: -0.5,
  },
  placeholderCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    textAlign: 'center',
  },
  ruleCard: {
    borderRadius: 22,
    padding: 18,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  ruleTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 15,
    marginBottom: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  ruleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ruleRange: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    width: 90,
  },
  ruleLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
  },
});
