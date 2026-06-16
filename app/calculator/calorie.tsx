import { Stack } from 'expo-router';
import { Fire } from 'phosphor-react-native';
import { Mascot } from '../../components/Mascot';
import { useTheme } from '../../lib/theme';
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

type Gender = 'male' | 'female';

const ACTIVITIES = [
  { id: 1.2, label: '久坐', sub: '幾乎不動' },
  { id: 1.375, label: '輕度', sub: '每週 1-3 次' },
  { id: 1.55, label: '中度', sub: '每週 3-5 次' },
  { id: 1.725, label: '高度', sub: '每週 6-7 次' },
  { id: 1.9, label: '非常高', sub: '體力勞動' },
];

const fmt = (n: number) => Math.round(n).toLocaleString();

export default function CalorieCalculator() {
  const { theme } = useTheme();
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState(1.375);

  const result = useMemo(() => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!a || !h || !w) return null;
    const bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * activity;
    return {
      bmr,
      tdee,
      cut: tdee - 500,
      maintain: tdee,
      bulk: tdee + 300,
    };
  }, [gender, age, height, weight, activity]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: '熱量計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>每日熱量</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>知道自己一天該吃多少</Text>

        <View style={styles.genderRow}>
          {(['male', 'female'] as Gender[]).map((g) => {
            const active = gender === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, { backgroundColor: theme.cardBg }, active && styles.genderBtnActive]}
                onPress={() => setGender(g)}
                activeOpacity={0.75}
              >
                <Text style={[styles.genderText, { color: theme.text }, active && styles.genderTextActive]}>
                  {g === 'male' ? '男生' : '女生'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          {[
            { label: '年齡', value: age, onChange: setAge, unit: '歲', ph: '25' },
            { label: '身高', value: height, onChange: setHeight, unit: 'cm', ph: '170' },
            { label: '體重', value: weight, onChange: setWeight, unit: 'kg', ph: '60' },
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
                    maxLength={5}
                  />
                  <Text style={[styles.suffix, { color: theme.hint }]}>{f.unit}</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>活動量</Text>
        <View style={styles.activityList}>
          {ACTIVITIES.map((a) => {
            const active = activity === a.id;
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.actBtn, { backgroundColor: theme.cardBg }, active && styles.actBtnActive]}
                onPress={() => setActivity(a.id)}
                activeOpacity={0.75}
              >
                <View>
                  <Text style={[styles.actLabel, { color: theme.text }, active && styles.actLabelActive]}>{a.label}</Text>
                  <Text style={[styles.actSub, { color: theme.textMuted }, active && styles.actSubActive]}>{a.sub}</Text>
                </View>
                <Text style={[styles.actFactor, { color: theme.hint }, active && styles.actFactorActive]}>×{a.id}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {result ? (
          <>
            <View style={styles.mainCard}>
              <Mascot expression="happy" color="#c2456a" size={56} />
              <Text style={[styles.mainLabel, { marginTop: 8 }]}>每日所需 (TDEE)</Text>
              <Text style={styles.mainValue}>
                {fmt(result.tdee)}
                <Text style={styles.kcal}> kcal</Text>
              </Text>
              <Text style={styles.mainSub}>基礎代謝 (BMR) {fmt(result.bmr)} kcal</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>減脂</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{fmt(result.cut)}</Text>
                <Text style={[styles.statUnit, { color: theme.hint }]}>kcal</Text>
              </View>
              <View style={[styles.statCard, styles.statCardCenter]}>
                <Text style={[styles.statLabel, styles.statLabelCenter]}>維持</Text>
                <Text style={[styles.statValue, styles.statValueCenter]}>{fmt(result.maintain)}</Text>
                <Text style={[styles.statUnit, styles.statUnitCenter]}>kcal</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>增肌</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{fmt(result.bulk)}</Text>
                <Text style={[styles.statUnit, { color: theme.hint }]}>kcal</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={48} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 4 }]}>填好上面資料就會出現結果</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  hint: '#a3897a',
  accentBg: '#ffc4d4', accent: '#c2456a',
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 32, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontFamily: 'Fredoka_400Regular', fontSize: 14, marginBottom: 22, textAlign: 'center' },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  genderBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center',
    shadowColor: C.hint, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1,
  },
  genderBtnActive: { backgroundColor: C.accent },
  genderText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15 },
  genderTextActive: { color: '#fff' },
  card: {
    borderRadius: 24, padding: 6, marginBottom: 16,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  label: { fontFamily: 'Fredoka_600SemiBold', fontSize: 17, width: 64 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6 },
  input: { fontFamily: 'Fredoka_700Bold', fontSize: 28, textAlign: 'right', minWidth: 70, padding: 0 },
  suffix: { fontFamily: 'Fredoka_500Medium', fontSize: 15 },
  divider: { height: 1, marginHorizontal: 18 },
  sectionLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 13, marginLeft: 8, marginBottom: 10, letterSpacing: 0.5 },
  activityList: { gap: 8, marginBottom: 18 },
  actBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  actBtnActive: { backgroundColor: C.accent },
  actLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16 },
  actLabelActive: { color: '#fff' },
  actSub: { fontFamily: 'Fredoka_400Regular', fontSize: 12, marginTop: 2 },
  actSubActive: { color: 'rgba(255,255,255,0.85)' },
  actFactor: { fontFamily: 'Fredoka_700Bold', fontSize: 15 },
  actFactorActive: { color: '#fff' },
  mainCard: {
    backgroundColor: C.accentBg, borderRadius: 28, padding: 26, alignItems: 'center', marginBottom: 12,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  mainIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  mainLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: C.accent, opacity: 0.85 },
  mainValue: { fontFamily: 'Fredoka_700Bold', fontSize: 56, color: C.accent, letterSpacing: -2, lineHeight: 60 },
  kcal: { fontSize: 24 },
  mainSub: { fontFamily: 'Fredoka_500Medium', fontSize: 13, color: C.accent, opacity: 0.7, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, borderRadius: 18, padding: 14, alignItems: 'center', gap: 2,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  statCardCenter: { backgroundColor: '#ffe082' },
  statLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 13 },
  statLabelCenter: { color: '#8d6e00' },
  statValue: { fontFamily: 'Fredoka_700Bold', fontSize: 22, letterSpacing: -0.3 },
  statValueCenter: { color: '#8d6e00' },
  statUnit: { fontFamily: 'Fredoka_500Medium', fontSize: 11 },
  statUnitCenter: { color: '#8d6e00', opacity: 0.7 },
  placeholderCard: {
    borderRadius: 28, padding: 36, alignItems: 'center', gap: 10,
    borderWidth: 2, borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
});
