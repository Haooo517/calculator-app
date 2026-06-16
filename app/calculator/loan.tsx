import { Stack } from 'expo-router';
import { Bank } from 'phosphor-react-native';
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
import { useTheme } from '../../lib/theme';

const formatMoney = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 0 });

export default function LoanCalculator() {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');

  const result = useMemo(() => {
    const P = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const yrs = parseFloat(years);
    if (!P || P <= 0 || isNaN(annualRate) || !yrs || yrs <= 0) return null;
    const r = annualRate / 100 / 12;
    const n = yrs * 12;
    const monthly = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
    const totalPay = monthly * n;
    const totalInterest = totalPay - P;
    return { monthly, totalPay, totalInterest };
  }, [amount, rate, years]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: '貸款試算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>貸款試算</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>輸入金額、利率、年數，看每月要還多少</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          {[
            { label: '貸款金額', value: amount, onChange: setAmount, suffix: '元', ph: '1000000' },
            { label: '年利率', value: rate, onChange: setRate, suffix: '%', ph: '2.5' },
            { label: '貸款年數', value: years, onChange: setYears, suffix: '年', ph: '20' },
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

        {result ? (
          <>
            <View style={styles.mainCard}>
              <View style={styles.mainIconWrap}>
                <Bank size={32} color="#8d6e00" weight="fill" />
              </View>
              <Text style={styles.mainLabel}>每月還款</Text>
              <Text style={styles.mainValue}>
                <Text style={styles.dollar}>$</Text>
                {formatMoney(result.monthly)}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>總還款</Text>
                <Text style={styles.statValue}>${formatMoney(result.totalPay)}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>總利息</Text>
                <Text style={styles.statValue}>${formatMoney(result.totalInterest)}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Bank size={32} color={theme.hint} weight="duotone" />
            <Text style={[styles.placeholderText, { color: theme.hint }]}>填好上面三格就會出現結果</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  accentBg: '#ffe082',
  accent: '#8d6e00',
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 32, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontFamily: 'Fredoka_400Regular', fontSize: 14, marginBottom: 22, textAlign: 'center' },
  card: {
    borderRadius: 24, padding: 6, marginBottom: 16,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  label: { fontFamily: 'Fredoka_600SemiBold', fontSize: 17, width: 88 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6 },
  input: { fontFamily: 'Fredoka_700Bold', fontSize: 26, textAlign: 'right', minWidth: 80, padding: 0 },
  suffix: { fontFamily: 'Fredoka_500Medium', fontSize: 15 },
  divider: { height: 1, marginHorizontal: 18 },
  mainCard: {
    backgroundColor: C.accentBg, borderRadius: 28, padding: 26, alignItems: 'center', marginBottom: 12,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  mainIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  mainLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: C.accent, opacity: 0.8 },
  mainValue: { fontFamily: 'Fredoka_700Bold', fontSize: 52, color: C.accent, letterSpacing: -2, lineHeight: 58 },
  dollar: { fontSize: 30 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', gap: 4,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  statLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 12 },
  statValue: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: C.accent, letterSpacing: -0.5 },
  placeholderCard: {
    borderRadius: 28, padding: 36, alignItems: 'center', gap: 10,
    borderWidth: 2, borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
});
