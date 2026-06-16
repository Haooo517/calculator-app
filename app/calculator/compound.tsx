import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FocusInput } from '../../components/FocusInput';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { useTheme } from '../../lib/theme';

const ACCENT_BG = '#ffe082';
const ACCENT = '#8d6e00';
const GAIN = '#2d8765';
const LOSS = '#c2456a';

const formatMoney = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 0 });

// 月複利終值：n 個月後的資產
const fvAt = (P: number, PMT: number, r: number, n: number): number =>
  r === 0
    ? P + PMT * n
    : P * Math.pow(1 + r, n) + (PMT * (Math.pow(1 + r, n) - 1)) / r;

type Result = {
  fv: number;
  invested: number;
  profit: number;
  P: number;
  PMT: number;
  r: number;
  yearsInt: number;
};

const pickReaction = (profit: number, invested: number): { expression: MascotExpression; tip: string } => {
  const ratio = profit / invested;
  if (ratio >= 2) return { expression: 'excited', tip: '哇！複利的雪球滾超大！' };
  if (ratio >= 0.5) return { expression: 'happy', tip: '穩穩長大中，時間是好朋友' };
  if (ratio > 0) return { expression: 'default', tip: '慢慢來，複利需要時間發酵' };
  return { expression: 'default', tip: '報酬率是 0 的話就只是存錢囉' };
};

export default function CompoundCalculator() {
  const { theme } = useTheme();
  const [principal, setPrincipal] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('20');

  const result = useMemo<Result | null>(() => {
    const P = parseFloat(principal);
    const PMT = monthly === '' ? 0 : parseFloat(monthly);
    const annualRate = parseFloat(rate);
    const yrs = parseFloat(years);
    if (
      isNaN(P) || P < 0 ||
      isNaN(PMT) || PMT < 0 ||
      isNaN(annualRate) || annualRate < 0 ||
      isNaN(yrs) || yrs <= 0 ||
      P + PMT <= 0
    ) {
      return null;
    }
    const r = annualRate / 12 / 100;
    const n = Math.round(yrs * 12);
    const fv = fvAt(P, PMT, r, n);
    const invested = P + PMT * n;
    return { fv, invested, profit: fv - invested, P, PMT, r, yearsInt: Math.floor(yrs) };
  }, [principal, monthly, rate, years]);

  const yearlyRows = useMemo(() => {
    if (!result) return [];
    const { P, PMT, r, yearsInt } = result;
    const rows: Array<{ year: number; value: number }> = [];
    const step = yearsInt > 30 ? 5 : 1;
    for (let y = step; y <= yearsInt; y += step) {
      rows.push({ year: y, value: fvAt(P, PMT, r, y * 12) });
    }
    if (yearsInt > 30 && yearsInt % 5 !== 0) {
      rows.push({ year: yearsInt, value: fvAt(P, PMT, r, yearsInt * 12) });
    }
    return rows;
  }, [result]);

  const reaction = result ? pickReaction(result.profit, result.invested) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '複利計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>來算複利吧</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>小錢滾大錢，看看時間的魔法</Text>

        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          {[
            { label: '期初本金', value: principal, onChange: setPrincipal, suffix: '元', ph: '100000', max: 10 },
            { label: '每月投入', value: monthly, onChange: setMonthly, suffix: '元', ph: '0', max: 9 },
            { label: '年報酬率', value: rate, onChange: setRate, suffix: '%', ph: '7', max: 5 },
            { label: '投資年數', value: years, onChange: setYears, suffix: '年', ph: '20', max: 3 },
          ].map((f, i, arr) => (
            <View key={f.label}>
              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.text }]}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <FocusInput
                    style={[styles.input, { color: theme.text }]}
                    value={f.value}
                    onChangeText={f.onChange}
                    placeholder={f.ph}
                    placeholderTextColor={theme.hint}
                    keyboardType="decimal-pad"
                    maxLength={f.max}
                  />
                  <Text style={[styles.suffix, { color: theme.hint }]}>{f.suffix}</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
            </View>
          ))}
        </View>

        {result && reaction ? (
          <>
            <View style={styles.mainCard}>
              <Mascot expression={reaction.expression} color={ACCENT} size={56} />
              <Text style={styles.mainLabel}>預估終值</Text>
              <Text style={styles.mainValue}>
                <Text style={styles.dollar}>$</Text>
                {formatMoney(result.fv)}
              </Text>
              <Text style={styles.mainTip}>{reaction.tip}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>總投入</Text>
                <Text style={[styles.statValue, { color: ACCENT }]}>${formatMoney(result.invested)}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>總獲利</Text>
                <Text style={[styles.statValue, { color: result.profit >= 0 ? GAIN : LOSS }]}>
                  {result.profit >= 0 ? '+' : '-'}${formatMoney(Math.abs(result.profit))}
                </Text>
              </View>
            </View>

            <View style={[styles.detailCard, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.detailTitle, { color: theme.text }]}>年度資產明細</Text>
              {yearlyRows.map((row) => (
                <View key={row.year} style={styles.detailRow}>
                  <Text style={[styles.detailYear, { color: theme.textMuted }]}>第 {row.year} 年</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>${formatMoney(row.value)}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>填好上面的數字就會出現結果</Text>
          </View>
        )}

        <Text style={[styles.footnote, { color: theme.hint }]}>
          ※ 報酬率為假設值，不代表未來績效，投資一定有風險
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
    marginBottom: 22,
    textAlign: 'center',
  },
  inputCard: {
    borderRadius: 24,
    padding: 6,
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
    width: 88,
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
  divider: {
    height: 1,
    marginHorizontal: 18,
  },
  mainCard: {
    backgroundColor: ACCENT_BG,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 44,
    color: ACCENT,
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  dollar: {
    fontSize: 26,
  },
  mainTip: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    color: ACCENT,
    marginTop: 6,
    opacity: 0.85,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 12,
  },
  statValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  detailCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  detailTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  detailYear: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  detailValue: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.3,
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
  footnote: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
