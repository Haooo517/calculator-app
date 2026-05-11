import { Stack } from 'expo-router';
import { CheckCircle, Coins, TrendDown, TrendUp, Wallet } from 'phosphor-react-native';
import { ComponentType, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const fmt = (n: number) => Math.round(n).toLocaleString();

type Tier = {
  label: string;
  range: string;
  bg: string;
  fg: string;
  tip: string;
};

const classify = (score: number): Tier => {
  if (score >= 85) return { label: '非常棒', range: '85-100', bg: '#b8e6d2', fg: '#2d8765', tip: '理財狀況超優秀，繼續保持！' };
  if (score >= 70) return { label: '良好', range: '70-84', bg: '#fff0a8', fg: '#8d6e00', tip: '已經很穩，再加把勁更好。' };
  if (score >= 50) return { label: '普通', range: '50-69', bg: '#ffd4ba', fg: '#c4623a', tip: '可以多存一點，少花一點。' };
  if (score >= 30) return { label: '需注意', range: '30-49', bg: '#ffc4d4', fg: '#c2456a', tip: '建議調整支出和負債。' };
  return { label: '需改善', range: '0-29', bg: '#d4baf0', fg: '#6a3da8', tip: '建議重新規劃理財。' };
};

type BreakItem = {
  label: string;
  Icon: ComponentType<any>;
  earned: number;
  max: number;
  detail: string;
};

export default function MoneyScoreCalculator() {
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [savings, setSavings] = useState('');
  const [debt, setDebt] = useState('');
  const [monthlySave, setMonthlySave] = useState('');

  const result = useMemo(() => {
    const inc = parseFloat(income);
    const exp = parseFloat(expense);
    const sav = parseFloat(savings);
    const dbt = parseFloat(debt);
    const ms = parseFloat(monthlySave);
    if (isNaN(inc) || isNaN(exp) || isNaN(sav) || isNaN(dbt) || isNaN(ms)) return null;
    if (inc < 0 || exp < 0 || sav < 0 || dbt < 0) return null;

    // 1. 儲蓄率 (30分)
    const saveRate = inc > 0 ? ms / inc : 0;
    let savePoint = 0;
    let saveDetail = '';
    if (saveRate >= 0.3) { savePoint = 30; saveDetail = '超過 30%，超棒'; }
    else if (saveRate >= 0.2) { savePoint = 24; saveDetail = '20-30%，很好'; }
    else if (saveRate >= 0.1) { savePoint = 18; saveDetail = '10-20%，不錯'; }
    else if (saveRate > 0) { savePoint = 9; saveDetail = '0-10%，可加強'; }
    else { savePoint = 0; saveDetail = '沒有儲蓄'; }

    // 2. 緊急預備金 (30分)
    const months = exp > 0 ? sav / exp : 0;
    let emergPoint = 0;
    let emergDetail = '';
    if (months >= 6) { emergPoint = 30; emergDetail = `${months.toFixed(1)} 個月，安全`; }
    else if (months >= 3) { emergPoint = 20; emergDetail = `${months.toFixed(1)} 個月，可以`; }
    else if (months >= 1) { emergPoint = 10; emergDetail = `${months.toFixed(1)} 個月，偏低`; }
    else { emergPoint = 0; emergDetail = `${months.toFixed(1)} 個月，不夠`; }

    // 3. 負債比 (25分)
    const debtRatio = inc > 0 ? dbt / (inc * 12) : Infinity;
    let debtPoint = 0;
    let debtDetail = '';
    if (dbt === 0) { debtPoint = 25; debtDetail = '無負債'; }
    else if (debtRatio < 0.3) { debtPoint = 20; debtDetail = '低於年收入 30%'; }
    else if (debtRatio < 0.5) { debtPoint = 12; debtDetail = '30-50%，偏高'; }
    else if (debtRatio < 1) { debtPoint = 5; debtDetail = '50-100%，太高'; }
    else { debtPoint = 0; debtDetail = '超過年收入，警戒'; }

    // 4. 收支結構 (15分)
    const surplus = inc - exp;
    const surplusRatio = inc > 0 ? surplus / inc : 0;
    let surpPoint = 0;
    let surpDetail = '';
    if (surplusRatio >= 0.2) { surpPoint = 15; surpDetail = '結餘 20%+，很穩'; }
    else if (surplusRatio >= 0.1) { surpPoint = 10; surpDetail = '結餘 10-20%'; }
    else if (surplusRatio > 0) { surpPoint = 5; surpDetail = '小幅結餘'; }
    else { surpPoint = 0; surpDetail = '入不敷出'; }

    const total = savePoint + emergPoint + debtPoint + surpPoint;
    const tier = classify(total);

    const breakdown: BreakItem[] = [
      { label: '儲蓄率', Icon: Coins, earned: savePoint, max: 30, detail: saveDetail },
      { label: '緊急預備金', Icon: Wallet, earned: emergPoint, max: 30, detail: emergDetail },
      { label: '負債比', Icon: TrendDown, earned: debtPoint, max: 25, detail: debtDetail },
      { label: '收支結構', Icon: TrendUp, earned: surpPoint, max: 15, detail: surpDetail },
    ];

    return { total, tier, breakdown };
  }, [income, expense, savings, debt, monthlySave]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff8ed' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: '金錢評分' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>理財健康分數</Text>
        <Text style={styles.subtitle}>填入 5 項數字，看你的金錢健康度</Text>

        <View style={styles.card}>
          {[
            { label: '月收入', value: income, onChange: setIncome, ph: '50000' },
            { label: '月支出', value: expense, onChange: setExpense, ph: '30000' },
            { label: '月儲蓄', value: monthlySave, onChange: setMonthlySave, ph: '10000' },
            { label: '總存款', value: savings, onChange: setSavings, ph: '200000' },
            { label: '總負債', value: debt, onChange: setDebt, ph: '0' },
          ].map((f, i, arr) => (
            <View key={f.label}>
              <View style={styles.inputRow}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={f.value}
                    onChangeText={f.onChange}
                    placeholder={f.ph}
                    placeholderTextColor="#c8b8a8"
                    keyboardType="decimal-pad"
                    maxLength={10}
                  />
                </View>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {result ? (
          <>
            <View style={[styles.mainCard, { backgroundColor: result.tier.bg }]}>
              <View style={styles.mainIconWrap}>
                <CheckCircle size={32} color={result.tier.fg} weight="fill" />
              </View>
              <Text style={[styles.mainLabel, { color: result.tier.fg }]}>你的分數</Text>
              <Text style={[styles.mainValue, { color: result.tier.fg }]}>
                {result.total}
                <Text style={styles.mainUnit}> / 100</Text>
              </Text>
              <Text style={[styles.tierBadge, { color: result.tier.fg }]}>{result.tier.label}</Text>
              <Text style={[styles.tierTip, { color: result.tier.fg }]}>{result.tier.tip}</Text>
            </View>

            <Text style={styles.sectionLabel}>分數明細</Text>
            <View style={styles.breakList}>
              {result.breakdown.map((b) => (
                <View key={b.label} style={styles.breakRow}>
                  <View style={styles.breakHead}>
                    <View style={styles.breakIconWrap}>
                      <b.Icon size={18} color="#8d6e00" weight="fill" />
                    </View>
                    <Text style={styles.breakLabel}>{b.label}</Text>
                    <Text style={styles.breakScore}>
                      {b.earned} / {b.max}
                    </Text>
                  </View>
                  <View style={styles.bar}>
                    <View style={[styles.barFill, { width: `${(b.earned / b.max) * 100}%` }]} />
                  </View>
                  <Text style={styles.breakDetail}>{b.detail}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.placeholderCard}>
            <Wallet size={32} color="#c8b8a8" weight="duotone" />
            <Text style={styles.placeholderText}>填好 5 項數字就會出現分數</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  card: '#fff', text: '#2d2520', muted: '#8a7a6c', hint: '#a3897a', divider: '#f1e3d0',
  accentBg: '#ffe082', accent: '#8d6e00',
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 32, color: C.text, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontFamily: 'Fredoka_400Regular', fontSize: 14, color: C.muted, marginBottom: 22, textAlign: 'center' },
  card: {
    backgroundColor: C.card, borderRadius: 24, padding: 6, marginBottom: 16,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12 },
  label: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15, color: C.text, width: 80 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end', gap: 4 },
  prefix: { fontFamily: 'Fredoka_500Medium', fontSize: 16, color: C.hint },
  input: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: C.text, textAlign: 'right', minWidth: 80, padding: 0 },
  divider: { height: 1, backgroundColor: C.divider, marginHorizontal: 18 },
  mainCard: {
    borderRadius: 28, padding: 28, alignItems: 'center', marginBottom: 18,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  mainIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  mainLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14, opacity: 0.8 },
  mainValue: { fontFamily: 'Fredoka_700Bold', fontSize: 64, letterSpacing: -2, lineHeight: 70 },
  mainUnit: { fontSize: 24 },
  tierBadge: { fontFamily: 'Fredoka_700Bold', fontSize: 22, marginTop: 4 },
  tierTip: { fontFamily: 'Fredoka_400Regular', fontSize: 13, opacity: 0.85, marginTop: 6, textAlign: 'center' },
  sectionLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 13, color: C.muted, marginLeft: 8, marginBottom: 10, letterSpacing: 0.5 },
  breakList: { gap: 10 },
  breakRow: {
    backgroundColor: C.card, borderRadius: 18, padding: 14,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  breakHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  breakIconWrap: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.accentBg, alignItems: 'center', justifyContent: 'center' },
  breakLabel: { flex: 1, fontFamily: 'Fredoka_600SemiBold', fontSize: 14, color: C.text },
  breakScore: { fontFamily: 'Fredoka_700Bold', fontSize: 14, color: C.accent },
  bar: { height: 6, backgroundColor: '#f1e3d0', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: '100%', backgroundColor: C.accent, borderRadius: 3 },
  breakDetail: { fontFamily: 'Fredoka_400Regular', fontSize: 12, color: C.muted, marginLeft: 40 },
  placeholderCard: {
    backgroundColor: C.card, borderRadius: 28, padding: 36, alignItems: 'center', gap: 10,
    borderWidth: 2, borderColor: C.divider, borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: C.hint },
});
