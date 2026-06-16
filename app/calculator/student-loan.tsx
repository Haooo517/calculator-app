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

const EDU_BG = '#e0c890';
const EDU_FG = '#786020';

const formatMoney = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const classify = (monthly: number): { expression: MascotExpression; tip: string } => {
  if (monthly <= 3000) return { expression: 'happy', tip: '月付很輕鬆，安心讀書吧～' };
  if (monthly <= 6000) return { expression: 'default', tip: '還可以負擔，記得按時繳款' };
  return { expression: 'thinking', tip: '壓力有點大，考慮拉長年限？' };
};

export default function StudentLoanCalculator() {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('1.775');
  const [years, setYears] = useState('8');

  const result = useMemo(() => {
    const P = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const yrs = parseFloat(years);
    if (isNaN(P) || P <= 0 || isNaN(annualRate) || annualRate < 0 || isNaN(yrs) || yrs <= 0) {
      return null;
    }
    const r = annualRate / 100 / 12;
    const n = yrs * 12;
    const monthly = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = monthly * n;
    const totalInterest = totalPay - P;
    return { monthly, totalPay, totalInterest };
  }, [amount, rate, years]);

  const status = result ? classify(result.monthly) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '學貸試算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>學貸試算</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>看看畢業後每個月要還多少</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          {[
            { label: '貸款總額', value: amount, onChange: setAmount, suffix: '元', ph: '400000' },
            { label: '年利率', value: rate, onChange: setRate, suffix: '%', ph: '1.775' },
            { label: '還款年限', value: years, onChange: setYears, suffix: '年', ph: '8' },
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
                    maxLength={10}
                  />
                  <Text style={[styles.suffix, { color: theme.hint }]}>{f.suffix}</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
            </View>
          ))}
        </View>

        {result && status ? (
          <>
            <View style={styles.mainCard}>
              <Mascot expression={status.expression} color={EDU_FG} size={56} />
              <Text style={styles.mainLabel}>每月還款</Text>
              <Text style={styles.mainValue}>
                <Text style={styles.dollar}>$</Text>
                {formatMoney(result.monthly)}
              </Text>
              <Text style={styles.mainTip}>{status.tip}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>總繳利息</Text>
                <Text style={styles.statValue}>${formatMoney(result.totalInterest)}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>總還款額</Text>
                <Text style={styles.statValue}>${formatMoney(result.totalPay)}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>
              填好貸款總額就會出現結果
            </Text>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>小提醒</Text>
          <Text style={[styles.infoText, { color: theme.textMuted }]}>
            在學期間及畢業（退伍）後一年內通常是寬限期，只繳利息不還本金。
          </Text>
          <Text style={[styles.infoText, { color: theme.hint }]}>
            實際利率以台灣就學貸款公告為準。
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  card: {
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
  divider: { height: 1, marginHorizontal: 18 },
  mainCard: {
    backgroundColor: EDU_BG,
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
    color: EDU_FG,
    opacity: 0.8,
    marginTop: 10,
  },
  mainValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 52,
    color: EDU_FG,
    letterSpacing: -2,
    lineHeight: 58,
  },
  dollar: { fontSize: 30 },
  mainTip: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    color: EDU_FG,
    marginTop: 8,
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
    color: EDU_FG,
    letterSpacing: -0.5,
  },
  placeholderCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 24,
    padding: 18,
    gap: 8,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
  },
  infoText: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
});
