import { Stack } from 'expo-router';
import { Drop } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Mascot } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useTheme } from '../../lib/theme';

const ACCENT = '#c2456a';
const ACCENT_BG = '#ffc4d4';
const DROP_BLUE = '#2c5fa8';
const CUP_ML = 240;
const MAX_DROPS = 12;

const ACTIVITIES = [
  { id: 30, label: '輕鬆', sub: '久坐辦公、活動不多' },
  { id: 35, label: '普通', sub: '常走動、有固定運動' },
  { id: 40, label: '大量流汗', sub: '劇烈運動、戶外勞動' },
];

const TIPS = [
  '起床先喝一杯，幫身體開機',
  '運動前後都要補水，別等口渴才喝',
  '咖啡和茶會利尿，喝了記得多補一點',
];

export default function WaterCalculator() {
  const { theme } = useTheme();
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState(35);
  const [hot, setHot] = useState(false);

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return null;
    const raw = w * activity + (hot ? 500 : 0);
    const ml = Math.round(raw / 50) * 50;
    const cups = Math.round((ml / CUP_ML) * 2) / 2; // 取到半杯
    const fullCups = Math.floor(cups);
    const hasHalf = cups % 1 !== 0;
    return { ml, cups, fullCups, hasHalf };
  }, [weight, activity, hot]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '水分攝取' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>今天喝水了嗎</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>算算一天該喝多少水才夠</Text>

        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>體重</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={weight}
                onChangeText={setWeight}
                placeholder="60"
                placeholderTextColor={theme.hint}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={[styles.unit, { color: theme.hint }]}>kg</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>活動量</Text>
        <View style={styles.activityList}>
          {ACTIVITIES.map((a) => {
            const active = activity === a.id;
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.actBtn, { backgroundColor: active ? ACCENT : theme.cardBg }]}
                onPress={() => {
                  if (activity !== a.id) haptics.light();
                  setActivity(a.id);
                }}
                activeOpacity={0.75}
              >
                <View>
                  <Text style={[styles.actLabel, { color: active ? '#fff' : theme.text }]}>{a.label}</Text>
                  <Text style={[styles.actSub, { color: active ? 'rgba(255,255,255,0.85)' : theme.textMuted }]}>
                    {a.sub}
                  </Text>
                </View>
                <Text style={[styles.actFactor, { color: active ? '#fff' : theme.hint }]}>{a.id} ml/kg</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.toggleCard, { backgroundColor: theme.cardBg }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleLabel, { color: theme.text }]}>今天很熱</Text>
            <Text style={[styles.toggleSub, { color: theme.textMuted }]}>高溫天多補 500ml</Text>
          </View>
          <Switch
            value={hot}
            onValueChange={(v) => {
              haptics.light();
              setHot(v);
            }}
            trackColor={{ false: theme.divider, true: ACCENT }}
            thumbColor="#fff"
          />
        </View>

        {result ? (
          <View style={[styles.resultCard, { backgroundColor: ACCENT_BG }]}>
            <Mascot expression="happy" color={ACCENT} size={56} />
            <Text style={[styles.resultLabel, { color: ACCENT, marginTop: 8 }]}>每日建議攝取量</Text>
            <Text style={[styles.resultValue, { color: ACCENT }]}>
              {result.ml.toLocaleString()}
              <Text style={styles.resultUnit}> ml</Text>
            </Text>
            <Text style={[styles.resultSub, { color: ACCENT }]}>
              約 {result.cups % 1 === 0 ? result.cups : result.cups.toFixed(1)} 杯（240ml）
            </Text>
            <View style={styles.dropRow}>
              {Array.from({ length: Math.min(result.fullCups, MAX_DROPS) }).map((_, i) => (
                <Drop key={`full-${i}`} size={22} color={DROP_BLUE} weight="fill" />
              ))}
              {result.hasHalf && result.fullCups < MAX_DROPS && (
                <View style={{ opacity: 0.4 }}>
                  <Drop size={22} color={DROP_BLUE} weight="fill" />
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>
              填上體重，喝水目標馬上出來
            </Text>
          </View>
        )}

        <View style={[styles.tipCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.tipTitle, { color: theme.text }]}>小提醒</Text>
          {TIPS.map((t) => (
            <View key={t} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: DROP_BLUE }]} />
              <Text style={[styles.tipText, { color: theme.textMuted }]}>{t}</Text>
            </View>
          ))}
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
  label: { fontFamily: 'Fredoka_600SemiBold', fontSize: 17, width: 56 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 6,
  },
  input: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 30,
    textAlign: 'right',
    minWidth: 80,
    padding: 0,
  },
  unit: { fontFamily: 'Fredoka_500Medium', fontSize: 16 },
  sectionLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  activityList: { gap: 8, marginBottom: 16 },
  actBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  actLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16 },
  actSub: { fontFamily: 'Fredoka_400Regular', fontSize: 12, marginTop: 2 },
  actFactor: { fontFamily: 'Fredoka_700Bold', fontSize: 15 },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16 },
  toggleSub: { fontFamily: 'Fredoka_400Regular', fontSize: 12, marginTop: 2 },
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
  resultValue: { fontFamily: 'Fredoka_700Bold', fontSize: 60, letterSpacing: -2, lineHeight: 64 },
  resultUnit: { fontSize: 24 },
  resultSub: { fontFamily: 'Fredoka_500Medium', fontSize: 14, opacity: 0.8, marginTop: 4 },
  dropRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
    maxWidth: 220,
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
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
  tipCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  tipTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 17, marginBottom: 12 },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  tipDot: { width: 8, height: 8, borderRadius: 4 },
  tipText: { fontFamily: 'Fredoka_400Regular', fontSize: 14, flex: 1 },
});
