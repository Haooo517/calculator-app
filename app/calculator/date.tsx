import { Stack } from 'expo-router';
import { CalendarBlank } from 'phosphor-react-native';
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
import { useTheme } from '../../lib/theme';

type Mode = 'gap' | 'offset';

const MODES: { id: Mode; label: string }[] = [
  { id: 'gap', label: '間隔' },
  { id: 'offset', label: '推算' },
];

const parseDate = (y: string, m: string, d: string) => {
  const yi = parseInt(y, 10);
  const mi = parseInt(m, 10);
  const di = parseInt(d, 10);
  if (!yi || !mi || !di) return null;
  const dt = new Date(yi, mi - 1, di);
  if (dt.getFullYear() !== yi || dt.getMonth() !== mi - 1 || dt.getDate() !== di) return null;
  return dt;
};

const formatDate = (d: Date) =>
  `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;

type DateInputProps = {
  year: string; month: string; day: string;
  onYear: (v: string) => void; onMonth: (v: string) => void; onDay: (v: string) => void;
};

const DateInput = ({ year, month, day, onYear, onMonth, onDay }: DateInputProps) => {
  const { theme } = useTheme();
  return (
    <View style={styles.dateRow}>
      <View style={[styles.dateField, { backgroundColor: theme.inputBg }]}>
        <FocusInput style={[styles.dateInput, { color: theme.text }]} value={year} onChangeText={onYear} placeholder="2024" placeholderTextColor={theme.hint} keyboardType="number-pad" maxLength={4} />
        <Text style={[styles.dateUnit, { color: theme.hint }]}>年</Text>
      </View>
      <View style={[styles.dateField, { backgroundColor: theme.inputBg }]}>
        <FocusInput style={[styles.dateInput, { color: theme.text }]} value={month} onChangeText={onMonth} placeholder="1" placeholderTextColor={theme.hint} keyboardType="number-pad" maxLength={2} />
        <Text style={[styles.dateUnit, { color: theme.hint }]}>月</Text>
      </View>
      <View style={[styles.dateField, { backgroundColor: theme.inputBg }]}>
        <FocusInput style={[styles.dateInput, { color: theme.text }]} value={day} onChangeText={onDay} placeholder="1" placeholderTextColor={theme.hint} keyboardType="number-pad" maxLength={2} />
        <Text style={[styles.dateUnit, { color: theme.hint }]}>日</Text>
      </View>
    </View>
  );
};

export default function DateCalculator() {
  const { theme } = useTheme();
  const [mode, setMode] = useState<Mode>('gap');

  const [y1, setY1] = useState('');
  const [m1, setM1] = useState('');
  const [d1, setD1] = useState('');
  const [y2, setY2] = useState('');
  const [m2, setM2] = useState('');
  const [d2, setD2] = useState('');
  const [offset, setOffset] = useState('');

  const gapResult = useMemo(() => {
    if (mode !== 'gap') return null;
    const a = parseDate(y1, m1, d1);
    const b = parseDate(y2, m2, d2);
    if (!a || !b) return null;
    const days = Math.round((b.getTime() - a.getTime()) / 86400000);
    const abs = Math.abs(days);
    return {
      days,
      weeks: Math.floor(abs / 7),
      extraDays: abs % 7,
      yearsApprox: (abs / 365.25).toFixed(2),
      monthsApprox: Math.round(abs / 30.4375),
    };
  }, [mode, y1, m1, d1, y2, m2, d2]);

  const offsetResult = useMemo(() => {
    if (mode !== 'offset') return null;
    const a = parseDate(y1, m1, d1);
    const n = parseInt(offset, 10);
    if (!a || isNaN(n)) return null;
    const target = new Date(a.getTime() + n * 86400000);
    return { target };
  }, [mode, y1, m1, d1, offset]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: '日期計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>日期計算</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>算兩天差幾天，或往後推幾天</Text>

        <View style={[styles.modes, { backgroundColor: theme.inputBg }]}>
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <TouchableOpacity key={m.id} style={[styles.modeBtn, active && styles.modeBtnActive, active && { backgroundColor: theme.cardBg }]} onPress={() => setMode(m.id)} activeOpacity={0.75}>
                <Text style={[styles.modeText, { color: theme.textMuted }, active && styles.modeTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>{mode === 'gap' ? '起始日' : '基準日'}</Text>
          <DateInput year={y1} month={m1} day={d1} onYear={setY1} onMonth={setM1} onDay={setD1} />
        </View>

        {mode === 'gap' ? (
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>結束日</Text>
            <DateInput year={y2} month={m2} day={d2} onYear={setY2} onMonth={setM2} onDay={setD2} />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>加減天數（負數倒推）</Text>
            <View style={[styles.offsetWrap, { backgroundColor: theme.inputBg }]}>
              <FocusInput
                style={[styles.offsetInput, { color: theme.text }]}
                value={offset}
                onChangeText={setOffset}
                placeholder="100"
                placeholderTextColor={theme.hint}
                keyboardType="numbers-and-punctuation"
                maxLength={6}
              />
              <Text style={[styles.offsetUnit, { color: theme.hint }]}>天</Text>
            </View>
          </View>
        )}

        {gapResult ? (
          <View style={styles.resultCard}>
            <View style={styles.resultIconWrap}>
              <CalendarBlank size={32} color="#c4623a" weight="fill" />
            </View>
            <Text style={styles.resultMain}>
              {Math.abs(gapResult.days).toLocaleString()}
              <Text style={styles.resultUnit}> 天</Text>
            </Text>
            <Text style={styles.resultSub}>
              {gapResult.weeks} 週 {gapResult.extraDays} 天 · 約 {gapResult.monthsApprox} 個月 · {gapResult.yearsApprox} 年
            </Text>
          </View>
        ) : offsetResult ? (
          <View style={styles.resultCard}>
            <View style={styles.resultIconWrap}>
              <CalendarBlank size={32} color="#c4623a" weight="fill" />
            </View>
            <Text style={styles.resultLabel}>對應日期</Text>
            <Text style={styles.resultDate}>{formatDate(offsetResult.target)}</Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <CalendarBlank size={32} color={theme.hint} weight="duotone" />
            <Text style={[styles.placeholderText, { color: theme.hint }]}>填好日期就會出現結果</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  accentBg: '#ffd4ba',
  accent: '#c4623a',
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
  modes: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  modeBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  modeBtnActive: { shadowColor: '#a3897a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  modeText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 14 },
  modeTextActive: { color: C.accent },
  card: {
    borderRadius: 24, padding: 20, marginBottom: 12,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  cardLabel: {
    fontFamily: 'Fredoka_600SemiBold', fontSize: 13, marginBottom: 12, letterSpacing: 0.5,
  },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: {
    flex: 1, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6,
  },
  dateInput: { fontFamily: 'Fredoka_700Bold', fontSize: 22, textAlign: 'center', minWidth: 46, padding: 0 },
  dateUnit: { fontFamily: 'Fredoka_500Medium', fontSize: 13 },
  offsetWrap: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 8,
    borderRadius: 16, padding: 18,
  },
  offsetInput: { fontFamily: 'Fredoka_700Bold', fontSize: 32, textAlign: 'center', minWidth: 100, padding: 0 },
  offsetUnit: { fontFamily: 'Fredoka_500Medium', fontSize: 17 },
  resultCard: {
    backgroundColor: C.accentBg, borderRadius: 28, padding: 26, alignItems: 'center', marginTop: 8,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  resultIconWrap: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  resultMain: { fontFamily: 'Fredoka_700Bold', fontSize: 56, color: C.accent, letterSpacing: -2, lineHeight: 60 },
  resultUnit: { fontSize: 26 },
  resultSub: { fontFamily: 'Fredoka_500Medium', fontSize: 13, color: C.accent, opacity: 0.75, marginTop: 4, textAlign: 'center' },
  resultLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: C.accent, opacity: 0.75, marginBottom: 4 },
  resultDate: { fontFamily: 'Fredoka_700Bold', fontSize: 30, color: C.accent, letterSpacing: -0.5 },
  placeholderCard: {
    borderRadius: 28, padding: 36, alignItems: 'center', gap: 10, marginTop: 8,
    borderWidth: 2, borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
});
