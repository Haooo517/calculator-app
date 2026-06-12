import { Stack } from 'expo-router';
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
import { Mascot } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useTheme } from '../../lib/theme';

const ACCENT_BG = '#d4baf0';
const ACCENT = '#6a3da8';

// 組合數 C(n, k)：乘法迴圈，避免階乘溢位
const comb = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) {
    r = (r * (n - k + i)) / i;
  }
  return Math.round(r);
};

const formatInt = (n: number) =>
  Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

// 機率轉百分比字串（保留 2 位有效數字的科學記號感，如 0.0000072）
const formatPercent = (p: number): string => {
  const pct = p * 100;
  if (pct >= 1) return pct.toFixed(0);
  const exp = Math.floor(Math.log10(pct));
  const decimals = Math.min(30, Math.max(2, 1 - exp));
  return pct.toFixed(decimals);
};

type PresetId = 'big' | 'power' | '539' | 'custom';

const PRESETS: Array<{ id: PresetId; label: string; desc: string }> = [
  { id: 'big', label: '大樂透', desc: '49 選 6 全中' },
  { id: 'power', label: '威力彩', desc: '38 選 6＋第二區 8 選 1' },
  { id: '539', label: '今彩539', desc: '39 選 5 全中' },
  { id: 'custom', label: '自訂', desc: '自己設 n 選 k' },
];

const COMPARES: Array<{ label: string; sub: string; odds: number }> = [
  { label: '被閃電擊中', sub: '一年內約 1 / 1,000,000', odds: 1_000_000 },
  { label: '高爾夫一桿進洞', sub: '業餘球友約 1 / 12,500', odds: 12_500 },
  { label: '連擲 23 次硬幣全正面', sub: '約 1 / 8,388,608', odds: 8_388_608 },
];

const compareCopy = (jackpotOdds: number, itemOdds: number): string => {
  const ratio = jackpotOdds / itemOdds;
  if (ratio >= 1.5) {
    const times = ratio >= 10 ? formatInt(ratio) : ratio.toFixed(1);
    return `比中頭獎容易 ${times} 倍`;
  }
  if (ratio <= 1 / 1.5) {
    const inv = 1 / ratio;
    const times = inv >= 10 ? formatInt(inv) : inv.toFixed(1);
    return `比中頭獎還難 ${times} 倍`;
  }
  return '跟中頭獎差不多難';
};

export default function LotteryCalculator() {
  const { theme } = useTheme();
  const [preset, setPreset] = useState<PresetId>('big');
  const [customN, setCustomN] = useState('');
  const [customK, setCustomK] = useState('');
  const [tickets, setTickets] = useState('10');

  const pickPreset = (id: PresetId) => {
    haptics.light();
    setPreset(id);
  };

  // 頭獎機率 = 1 / odds
  const odds = useMemo<number | null>(() => {
    if (preset === 'big') return comb(49, 6);
    if (preset === 'power') return comb(38, 6) * 8;
    if (preset === '539') return comb(39, 5);
    const n = parseInt(customN, 10);
    const k = parseInt(customK, 10);
    if (isNaN(n) || isNaN(k) || n < 1 || k < 1 || n > 99 || k > n) return null;
    return comb(n, k);
  }, [preset, customN, customK]);

  const multi = useMemo(() => {
    if (odds === null) return null;
    const n = parseInt(tickets, 10);
    if (isNaN(n) || n < 1) return null;
    return { n, equivalent: Math.max(1, Math.round(odds / n)) };
  }, [odds, tickets]);

  const presetDesc = PRESETS.find((p) => p.id === preset)?.desc ?? '';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '樂透機率' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>頭獎有多難中？</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>選一種彩券，看看機率有多迷你</Text>

        <View style={styles.chipRow}>
          {PRESETS.map((p) => {
            const active = p.id === preset;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, { backgroundColor: active ? ACCENT : theme.cardBg }]}
                onPress={() => pickPreset(p.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : theme.text }]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {preset === 'custom' && (
          <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.text }]}>號碼池</Text>
              <View style={styles.customWrap}>
                <TextInput
                  style={[styles.customInput, { color: theme.text, backgroundColor: theme.inputBg }]}
                  value={customN}
                  onChangeText={setCustomN}
                  placeholder="42"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.customJoin, { color: theme.textMuted }]}>選</Text>
                <TextInput
                  style={[styles.customInput, { color: theme.text, backgroundColor: theme.inputBg }]}
                  value={customK}
                  onChangeText={setCustomK}
                  placeholder="6"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>
            <Text style={[styles.customHint, { color: theme.hint }]}>n 最多 99，k 不能比 n 大喔</Text>
          </View>
        )}

        {odds !== null ? (
          <View style={styles.mainCard}>
            <Mascot expression="surprised" color={ACCENT} size={56} />
            <Text style={styles.mainLabel}>{presetDesc}・頭獎機率</Text>
            <Text style={styles.mainValue}>1 / {formatInt(odds)}</Text>
            <Text style={styles.mainPercent}>約 {formatPercent(1 / odds)}%</Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>填好 n 和 k 就會出現機率</Text>
          </View>
        )}

        <View style={[styles.multiCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>多買幾注有用嗎？</Text>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>買幾注</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={tickets}
                onChangeText={setTickets}
                placeholder="10"
                placeholderTextColor={theme.hint}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={[styles.suffix, { color: theme.hint }]}>注</Text>
            </View>
          </View>
          {multi && odds !== null && (
            <View style={[styles.multiResult, { borderTopColor: theme.divider }]}>
              <Text style={[styles.multiText, { color: theme.textMuted }]}>
                機率變成 {formatInt(multi.n)} / {formatInt(odds)}
              </Text>
              <Text style={[styles.multiBig, { color: ACCENT }]}>約等於 1 / {formatInt(multi.equivalent)}</Text>
            </View>
          )}
        </View>

        {odds !== null && (
          <View style={[styles.compareCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>跟這些事比一比</Text>
            {COMPARES.map((c) => (
              <View key={c.label} style={styles.compareRow}>
                <View style={styles.compareLeft}>
                  <Text style={[styles.compareLabel, { color: theme.text }]}>{c.label}</Text>
                  <Text style={[styles.compareSub, { color: theme.textMuted }]}>{c.sub}</Text>
                </View>
                <View style={[styles.compareTag, { backgroundColor: ACCENT_BG }]}>
                  <Text style={[styles.compareTagText, { color: ACCENT }]}>{compareCopy(odds, c.odds)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.footnote, { color: theme.hint }]}>
          ※ 機率僅供參考，理性購彩，小賭怡情
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  chipText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
  inputCard: {
    borderRadius: 24,
    padding: 6,
    paddingBottom: 12,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  label: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    width: 72,
  },
  customWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  customInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    textAlign: 'center',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 62,
  },
  customJoin: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
  },
  customHint: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    paddingHorizontal: 18,
  },
  mainCard: {
    backgroundColor: ACCENT_BG,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  mainLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: ACCENT,
    opacity: 0.8,
    marginTop: 10,
  },
  mainValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 40,
    color: ACCENT,
    letterSpacing: -1,
    lineHeight: 48,
    textAlign: 'center',
  },
  mainPercent: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 16,
    color: ACCENT,
    marginTop: 4,
    opacity: 0.85,
  },
  placeholderCard: {
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  multiCard: {
    borderRadius: 24,
    padding: 14,
    paddingTop: 18,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 6,
  },
  input: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    textAlign: 'right',
    minWidth: 80,
    padding: 0,
  },
  suffix: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 15,
  },
  multiResult: {
    borderTopWidth: 1,
    marginHorizontal: 6,
    paddingTop: 12,
    paddingBottom: 6,
    alignItems: 'center',
    gap: 2,
  },
  multiText: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
  },
  multiBig: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  compareCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 10,
  },
  compareLeft: {
    flex: 1,
    gap: 2,
  },
  compareLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
  compareSub: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
  },
  compareTag: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  compareTagText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 12,
  },
  footnote: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
