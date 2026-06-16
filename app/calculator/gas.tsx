import { Stack } from 'expo-router';
import { GasPump } from 'phosphor-react-native';
import { Mascot } from '../../components/Mascot';
import { useTheme } from '../../lib/theme';
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

const fmt = (n: number, d = 2) => Number(n.toFixed(d)).toLocaleString();

export default function GasCalculator() {
  const { theme } = useTheme();
  const [distance, setDistance] = useState('');
  const [fuel, setFuel] = useState('');
  const [price, setPrice] = useState('');

  const result = useMemo(() => {
    const d = parseFloat(distance);
    const f = parseFloat(fuel);
    const p = parseFloat(price);
    if (!d || !f || d <= 0 || f <= 0) return null;
    const efficiency = d / f;
    const consumption = (f / d) * 100;
    const totalCost = !isNaN(p) ? f * p : null;
    const costPerKm = totalCost !== null ? totalCost / d : null;
    return { efficiency, consumption, totalCost, costPerKm };
  }, [distance, fuel, price]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: '油耗計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>油耗計算</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>看你車的油耗跟花費</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          {[
            { label: '行駛距離', value: distance, onChange: setDistance, unit: 'km', ph: '500' },
            { label: '加油量', value: fuel, onChange: setFuel, unit: 'L', ph: '40' },
            { label: '油價', value: price, onChange: setPrice, unit: '元/L', ph: '30' },
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
                    maxLength={8}
                  />
                  <Text style={[styles.suffix, { color: theme.hint }]}>{f.unit}</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
            </View>
          ))}
        </View>

        {result ? (
          <>
            <View style={styles.mainCard}>
              <Mascot expression="cool" color="#2c5fa8" size={56} />
              <Text style={[styles.mainLabel, { marginTop: 8 }]}>每公升可跑</Text>
              <Text style={styles.mainValue}>
                {fmt(result.efficiency)}
                <Text style={styles.unit}> km</Text>
              </Text>
              <Text style={styles.mainSub}>等於 {fmt(result.consumption)} L / 100 km</Text>
            </View>

            {result.totalCost !== null && (
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>總花費</Text>
                  <Text style={styles.statValue}>${fmt(result.totalCost, 0)}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>每公里成本</Text>
                  <Text style={styles.statValue}>${fmt(result.costPerKm!, 2)}</Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={48} />
            <Text style={[styles.placeholderText, { marginTop: 4, color: theme.hint }]}>填好距離跟加油量就會出現結果</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  accentBg: '#b8d8ff', accent: '#2c5fa8',
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
  input: { fontFamily: 'Fredoka_700Bold', fontSize: 28, textAlign: 'right', minWidth: 70, padding: 0 },
  suffix: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
  divider: { height: 1, marginHorizontal: 18 },
  mainCard: {
    backgroundColor: C.accentBg, borderRadius: 28, padding: 26, alignItems: 'center', marginBottom: 12,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  mainIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  mainLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: C.accent, opacity: 0.85 },
  mainValue: { fontFamily: 'Fredoka_700Bold', fontSize: 56, color: C.accent, letterSpacing: -2, lineHeight: 60 },
  unit: { fontSize: 24 },
  mainSub: { fontFamily: 'Fredoka_500Medium', fontSize: 13, color: C.accent, opacity: 0.7, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', gap: 4,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  statLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 12 },
  statValue: { fontFamily: 'Fredoka_700Bold', fontSize: 20, color: C.accent, letterSpacing: -0.3 },
  placeholderCard: {
    borderRadius: 28, padding: 36, alignItems: 'center', gap: 10,
    borderWidth: 2, borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
});
