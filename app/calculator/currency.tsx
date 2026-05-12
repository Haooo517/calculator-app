import { Stack } from 'expo-router';
import { ArrowsClockwise, CurrencyDollar } from 'phosphor-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mascot } from '../../components/Mascot';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CURRENCIES = [
  { code: 'twd', label: 'TWD', name: '新台幣' },
  { code: 'usd', label: 'USD', name: '美元' },
  { code: 'jpy', label: 'JPY', name: '日圓' },
  { code: 'cny', label: 'CNY', name: '人民幣' },
  { code: 'eur', label: 'EUR', name: '歐元' },
  { code: 'krw', label: 'KRW', name: '韓元' },
  { code: 'gbp', label: 'GBP', name: '英鎊' },
  { code: 'hkd', label: 'HKD', name: '港幣' },
  { code: 'sgd', label: 'SGD', name: '新加坡幣' },
  { code: 'aud', label: 'AUD', name: '澳幣' },
  { code: 'thb', label: 'THB', name: '泰銖' },
];

const ENDPOINT = (from: string) =>
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`;

const formatMoney = (n: number) => {
  if (!isFinite(n)) return '—';
  if (n >= 100) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { maximumFractionDigits: 4 });
};

export default function CurrencyCalculator() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('twd');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  const load = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(ENDPOINT(code));
      if (!resp.ok) throw new Error('network');
      const data = await resp.json();
      setRates(data[code] ?? null);
      setUpdated(data.date ?? null);
    } catch {
      setError('無法取得匯率，請檢查網路連線');
      setRates(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(from);
  }, [from, load]);

  const value = parseFloat(amount);
  const fromInfo = CURRENCIES.find((c) => c.code === from);

  const results = useMemo(() => {
    if (!rates || isNaN(value)) return [];
    return CURRENCIES.filter((c) => c.code !== from).map((c) => ({
      ...c,
      result: value * (rates[c.code] ?? 0),
      rate: rates[c.code] ?? 0,
    }));
  }, [rates, value, from]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff8ed' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title: '匯率換算',
          headerRight: () => (
            <TouchableOpacity onPress={() => load(from)} disabled={loading} style={{ paddingHorizontal: 8 }}>
              {loading ? (
                <ActivityIndicator color="#8d6e00" />
              ) : (
                <ArrowsClockwise size={20} color="#2d2520" weight="bold" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>匯率換算</Text>
        <Text style={styles.subtitle}>
          {updated ? `匯率日期 ${updated}` : '即時匯率'}
        </Text>

        <View style={styles.amountCard}>
          <View style={styles.amountRow}>
            <CurrencyDollar size={26} color="#8d6e00" weight="fill" />
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="100"
              placeholderTextColor="#c8b8a8"
              keyboardType="decimal-pad"
              maxLength={10}
            />
            <Text style={styles.amountUnit}>{fromInfo?.label}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>從</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pills}
        >
          {CURRENCIES.map((c) => {
            const active = c.code === from;
            return (
              <TouchableOpacity
                key={c.code}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setFrom(c.code)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{c.label}</Text>
                <Text style={[styles.pillName, active && styles.pillNameActive]}>{c.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {error ? (
          <View style={styles.errorCard}>
            <Mascot expression="sad" color="#c2456a" size={48} />
            <Text style={[styles.errorText, { marginTop: 4 }]}>{error}</Text>
            <TouchableOpacity onPress={() => load(from)} style={styles.retryBtn}>
              <Text style={styles.retryText}>重試</Text>
            </TouchableOpacity>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.placeholderCard}>
            <Mascot
              expression={loading ? 'thinking' : 'sleepy'}
              color="#a3897a"
              size={48}
            />
            <Text style={[styles.placeholderText, { marginTop: 4 }]}>
              {loading ? '正在載入匯率' : '輸入金額看換算'}
            </Text>
          </View>
        ) : (
          <View style={styles.results}>
            {results.map((r) => (
              <View key={r.code} style={styles.resultRow}>
                <View style={styles.resultLeft}>
                  <Text style={styles.resultLabel}>{r.label}</Text>
                  <Text style={styles.resultName}>{r.name}</Text>
                </View>
                <View style={styles.resultRight}>
                  <Text style={styles.resultValue}>{formatMoney(r.result)}</Text>
                  <Text style={styles.resultRate}>
                    1 {fromInfo?.label} = {formatMoney(r.rate)}
                  </Text>
                </View>
              </View>
            ))}
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
  subtitle: { fontFamily: 'Fredoka_400Regular', fontSize: 13, color: C.muted, marginBottom: 22, textAlign: 'center' },
  amountCard: {
    backgroundColor: C.accentBg, borderRadius: 24, padding: 18, marginBottom: 18,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 3,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amountInput: {
    flex: 1, fontFamily: 'Fredoka_700Bold', fontSize: 36, color: C.accent, letterSpacing: -1, padding: 0,
  },
  amountUnit: { fontFamily: 'Fredoka_700Bold', fontSize: 20, color: C.accent, opacity: 0.8 },
  sectionLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 12, color: C.muted, marginLeft: 8, marginBottom: 8, letterSpacing: 0.5 },
  pills: { flexDirection: 'row', gap: 8, paddingBottom: 4, paddingRight: 8, marginBottom: 16 },
  pill: {
    backgroundColor: C.card, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, alignItems: 'center',
    shadowColor: C.hint, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
  },
  pillActive: { backgroundColor: C.accent },
  pillLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 14, color: C.text, letterSpacing: 0.5 },
  pillLabelActive: { color: '#fff' },
  pillName: { fontFamily: 'Fredoka_400Regular', fontSize: 10, color: C.muted, marginTop: 1 },
  pillNameActive: { color: 'rgba(255,255,255,0.85)' },
  results: {
    backgroundColor: C.card, borderRadius: 24, padding: 4,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: C.divider,
  },
  resultLeft: {},
  resultLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: C.text, letterSpacing: 0.5 },
  resultName: { fontFamily: 'Fredoka_400Regular', fontSize: 11, color: C.muted, marginTop: 2 },
  resultRight: { alignItems: 'flex-end' },
  resultValue: { fontFamily: 'Fredoka_700Bold', fontSize: 20, color: C.accent, letterSpacing: -0.3 },
  resultRate: { fontFamily: 'Fredoka_400Regular', fontSize: 10, color: C.muted, marginTop: 2 },
  placeholderCard: {
    backgroundColor: C.card, borderRadius: 24, padding: 36, alignItems: 'center', gap: 10,
    borderWidth: 2, borderColor: C.divider, borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: C.hint },
  errorCard: {
    backgroundColor: '#ffc4d4', borderRadius: 24, padding: 24, alignItems: 'center', gap: 12,
  },
  errorText: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: '#c2456a', textAlign: 'center' },
  retryBtn: { backgroundColor: '#c2456a', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  retryText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 14, color: '#fff' },
});
