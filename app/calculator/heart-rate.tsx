import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FocusInput } from '../../components/FocusInput';
import { Mascot } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useTheme } from '../../lib/theme';

type Formula = 'classic' | 'tanaka';

const ACCENT = '#c2456a';
const ACCENT_BG = '#ffc4d4';

const FORMULAS: { id: Formula; label: string; sub: string }[] = [
  { id: 'classic', label: '傳統', sub: '220 − 年齡' },
  { id: 'tanaka', label: 'Tanaka', sub: '208 − 0.7×年齡' },
];

const ZONES = [
  { id: 'z1', name: 'Z1 暖身放鬆', lo: 0.5, hi: 0.6, color: '#2c5fa8' },
  { id: 'z2', name: 'Z2 燃脂耐力', lo: 0.6, hi: 0.7, color: '#2d8765' },
  { id: 'z3', name: 'Z3 有氧進步', lo: 0.7, hi: 0.8, color: '#8d6e00' },
  { id: 'z4', name: 'Z4 無氧閾值', lo: 0.8, hi: 0.9, color: '#c4623a' },
  { id: 'z5', name: 'Z5 極限衝刺', lo: 0.9, hi: 1.0, color: '#c2456a' },
];

const pct = (n: number) => `${Math.round(n * 100)}`;

export default function HeartRateCalculator() {
  const { theme } = useTheme();
  const [age, setAge] = useState('');
  const [formula, setFormula] = useState<Formula>('classic');
  const [rhr, setRhr] = useState('');

  const result = useMemo(() => {
    const a = parseFloat(age);
    if (!a || a <= 0 || a > 120) return null;
    const hrMax = formula === 'classic' ? 220 - a : 208 - 0.7 * a;
    const r = parseFloat(rhr);
    const useKarvonen = !Number.isNaN(r) && r > 0 && r < hrMax;
    const zones = ZONES.map((z) => {
      const lo = useKarvonen ? (hrMax - r) * z.lo + r : hrMax * z.lo;
      const hi = useKarvonen ? (hrMax - r) * z.hi + r : hrMax * z.hi;
      return { ...z, loBpm: Math.round(lo), hiBpm: Math.round(hi) };
    });
    return { hrMax: Math.round(hrMax), useKarvonen, zones };
  }, [age, formula, rhr]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '心率區間' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>心率區間</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>找到最適合你的運動強度</Text>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>最大心率公式</Text>
        <View style={styles.segRow}>
          {FORMULAS.map((f) => {
            const active = formula === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.segBtn,
                  { backgroundColor: active ? ACCENT : theme.cardBg },
                ]}
                onPress={() => {
                  if (formula !== f.id) haptics.light();
                  setFormula(f.id);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.segLabel, { color: active ? '#fff' : theme.text }]}>{f.label}</Text>
                <Text style={[styles.segSub, { color: active ? 'rgba(255,255,255,0.85)' : theme.textMuted }]}>
                  {f.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>年齡</Text>
            <View style={styles.inputWrap}>
              <FocusInput
                style={[styles.input, { color: theme.text }]}
                value={age}
                onChangeText={setAge}
                placeholder="25"
                placeholderTextColor={theme.hint}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={[styles.unit, { color: theme.hint }]}>歲</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>靜止心率</Text>
            <View style={styles.inputWrap}>
              <FocusInput
                style={[styles.input, { color: theme.text }]}
                value={rhr}
                onChangeText={setRhr}
                placeholder="選填"
                placeholderTextColor={theme.hint}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={[styles.unit, { color: theme.hint }]}>bpm</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.caption, { color: theme.hint }]}>
          填了靜止心率，目標區間會改用 Karvonen 公式，估得更貼近你
        </Text>

        {result ? (
          <View style={[styles.resultCard, { backgroundColor: ACCENT_BG }]}>
            <Mascot expression="love" color={ACCENT} size={56} />
            <Text style={[styles.resultLabel, { color: ACCENT, marginTop: 8 }]}>最大心率 HRmax</Text>
            <Text style={[styles.resultValue, { color: ACCENT }]}>
              {result.hrMax}
              <Text style={styles.resultUnit}> bpm</Text>
            </Text>
            <Text style={[styles.resultSub, { color: ACCENT }]}>
              {result.useKarvonen ? '區間以 Karvonen 公式計算' : `用${formula === 'classic' ? '傳統' : ' Tanaka '}公式估算`}
            </Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>
              填上年齡，心率區間馬上出爐
            </Text>
          </View>
        )}

        <View style={[styles.zoneCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.zoneTitle, { color: theme.text }]}>五個訓練區間</Text>
          {ZONES.map((z) => {
            const computed = result?.zones.find((rz) => rz.id === z.id);
            return (
              <View key={z.id} style={styles.zoneRow}>
                <View style={[styles.zoneDot, { backgroundColor: z.color }]} />
                <Text style={[styles.zoneName, { color: theme.text }]}>{z.name}</Text>
                <Text style={[styles.zonePct, { color: theme.textMuted }]}>
                  {pct(z.lo)}–{pct(z.hi)}%
                </Text>
                <Text style={[styles.zoneBpm, { color: computed ? z.color : theme.hint }]}>
                  {computed ? `${computed.loBpm}–${computed.hiBpm}` : '—'}
                </Text>
              </View>
            );
          })}
          <Text style={[styles.zoneFootnote, { color: theme.hint }]}>單位 bpm，數字僅供參考，不舒服就休息</Text>
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
  sectionLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  segRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  segBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  segLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15 },
  segSub: { fontFamily: 'Fredoka_400Regular', fontSize: 12, marginTop: 2 },
  inputCard: {
    borderRadius: 24,
    padding: 6,
    marginBottom: 8,
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
  label: { fontFamily: 'Fredoka_600SemiBold', fontSize: 17, width: 88 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 6,
  },
  input: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    textAlign: 'right',
    minWidth: 70,
    padding: 0,
  },
  unit: { fontFamily: 'Fredoka_500Medium', fontSize: 15 },
  divider: { height: 1, marginHorizontal: 18 },
  caption: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    marginLeft: 8,
    marginBottom: 16,
  },
  resultCard: {
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
  resultLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14, opacity: 0.85 },
  resultValue: { fontFamily: 'Fredoka_700Bold', fontSize: 64, letterSpacing: -2, lineHeight: 68 },
  resultUnit: { fontSize: 24 },
  resultSub: { fontFamily: 'Fredoka_500Medium', fontSize: 13, opacity: 0.7, marginTop: 4 },
  placeholderCard: {
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
  zoneCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  zoneTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 17, marginBottom: 12 },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 10,
  },
  zoneDot: { width: 10, height: 10, borderRadius: 5 },
  zoneName: { fontFamily: 'Fredoka_600SemiBold', fontSize: 14, flex: 1 },
  zonePct: { fontFamily: 'Fredoka_500Medium', fontSize: 13, width: 64, textAlign: 'right' },
  zoneBpm: { fontFamily: 'Fredoka_700Bold', fontSize: 15, width: 82, textAlign: 'right' },
  zoneFootnote: { fontFamily: 'Fredoka_400Regular', fontSize: 11, marginTop: 10 },
});
