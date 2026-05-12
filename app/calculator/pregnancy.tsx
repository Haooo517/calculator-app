import { Stack } from 'expo-router';
import { Baby } from 'phosphor-react-native';
import { Mascot } from '../../components/Mascot';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const today = new Date();
today.setHours(0, 0, 0, 0);

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

export default function PregnancyCalculator() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const result = useMemo(() => {
    const lmp = parseDate(year, month, day);
    if (!lmp) return null;
    if (lmp > today) return null;

    const dueDate = new Date(lmp.getTime() + 280 * 86400000);
    const daysSince = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
    const weeks = Math.floor(daysSince / 7);
    const days = daysSince % 7;
    const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
    const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
    const progress = Math.min(100, Math.max(0, (daysSince / 280) * 100));

    return { dueDate, weeks, days, daysLeft, trimester, progress, isPast: daysLeft < 0 };
  }, [year, month, day]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff8ed' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: '預產期' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>預產期計算</Text>
        <Text style={styles.subtitle}>輸入最後一次月經的第一天</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>最後一次月經</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <TextInput style={styles.dateInput} value={year} onChangeText={setYear} placeholder="2026" placeholderTextColor="#c8b8a8" keyboardType="number-pad" maxLength={4} />
              <Text style={styles.dateUnit}>年</Text>
            </View>
            <View style={styles.dateField}>
              <TextInput style={styles.dateInput} value={month} onChangeText={setMonth} placeholder="1" placeholderTextColor="#c8b8a8" keyboardType="number-pad" maxLength={2} />
              <Text style={styles.dateUnit}>月</Text>
            </View>
            <View style={styles.dateField}>
              <TextInput style={styles.dateInput} value={day} onChangeText={setDay} placeholder="1" placeholderTextColor="#c8b8a8" keyboardType="number-pad" maxLength={2} />
              <Text style={styles.dateUnit}>日</Text>
            </View>
          </View>
        </View>

        {result ? (
          <>
            <View style={styles.mainCard}>
              <Mascot expression="love" color="#c2456a" size={56} />
              <Text style={[styles.mainLabel, { marginTop: 8 }]}>預產期</Text>
              <Text style={styles.mainValue}>{formatDate(result.dueDate)}</Text>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${result.progress}%` }]} />
              </View>
              <Text style={styles.mainSub}>
                {result.isPast ? '已超過預產期' : `還有 ${result.daysLeft} 天`}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>目前週數</Text>
                <Text style={styles.statValue}>{result.weeks}</Text>
                <Text style={styles.statUnit}>週 {result.days} 天</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>孕期</Text>
                <Text style={styles.statValue}>第 {result.trimester}</Text>
                <Text style={styles.statUnit}>孕期</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.placeholderCard}>
            <Mascot expression="sleepy" color="#a3897a" size={48} />
            <Text style={[styles.placeholderText, { marginTop: 4 }]}>填好日期就會出現結果</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  card: '#fff', text: '#2d2520', muted: '#8a7a6c', hint: '#a3897a', divider: '#f1e3d0',
  accentBg: '#ffc4d4', accent: '#c2456a',
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 32, color: C.text, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontFamily: 'Fredoka_400Regular', fontSize: 14, color: C.muted, marginBottom: 22, textAlign: 'center' },
  card: {
    backgroundColor: C.card, borderRadius: 24, padding: 20, marginBottom: 16,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  cardLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 13, color: C.muted, marginBottom: 12, letterSpacing: 0.5 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: {
    flex: 1, backgroundColor: '#fef5e8', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6,
  },
  dateInput: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: C.text, textAlign: 'center', minWidth: 46, padding: 0 },
  dateUnit: { fontFamily: 'Fredoka_500Medium', fontSize: 13, color: C.hint },
  mainCard: {
    backgroundColor: C.accentBg, borderRadius: 28, padding: 26, alignItems: 'center', marginBottom: 12,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  mainIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  mainLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: C.accent, opacity: 0.8, marginBottom: 2 },
  mainValue: { fontFamily: 'Fredoka_700Bold', fontSize: 28, color: C.accent, letterSpacing: -0.5, marginBottom: 14 },
  bar: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', backgroundColor: C.accent, borderRadius: 4 },
  mainSub: { fontFamily: 'Fredoka_500Medium', fontSize: 13, color: C.accent, opacity: 0.8 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 20, padding: 16, alignItems: 'center', gap: 2,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  statLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 12, color: C.muted },
  statValue: { fontFamily: 'Fredoka_700Bold', fontSize: 30, color: C.accent, letterSpacing: -0.5 },
  statUnit: { fontFamily: 'Fredoka_500Medium', fontSize: 12, color: C.hint },
  placeholderCard: {
    backgroundColor: C.card, borderRadius: 28, padding: 36, alignItems: 'center', gap: 10,
    borderWidth: 2, borderColor: C.divider, borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: C.hint },
});
