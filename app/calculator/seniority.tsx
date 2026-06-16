import { Stack } from 'expo-router';
import { CalendarBlank, Medal } from 'phosphor-react-native';
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

const ACCENT = '#4a5868';
const PASTEL = '#d4d8e0';

const now = new Date();
const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// 加 N 個月，月底溢位時夾到該月最後一天（1/31 +1 月 → 2/28）
const addMonths = (base: Date, months: number) => {
  const y = base.getFullYear();
  const m = base.getMonth() + months;
  const d = base.getDate();
  const lastDay = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(d, lastDay));
};

// 勞基法 §38 特休天數（依年資總月數）
const leaveDays = (totalMonths: number): number => {
  if (totalMonths < 6) return 0;
  if (totalMonths < 12) return 3;
  if (totalMonths < 24) return 7;
  if (totalMonths < 36) return 10;
  if (totalMonths < 60) return 14;
  if (totalMonths < 120) return 15;
  return Math.min(30, 16 + (Math.floor(totalMonths / 12) - 10));
};

// 下一個特休門檻（月數 → 天數）：6個月3天 … 10年起每年+1，加到30天
const MILESTONES: Array<{ months: number; days: number }> = [
  { months: 6, days: 3 },
  { months: 12, days: 7 },
  { months: 24, days: 10 },
  { months: 36, days: 14 },
  { months: 60, days: 15 },
  ...Array.from({ length: 15 }, (_, i) => ({ months: 120 + i * 12, days: 16 + i })),
];

const TABLE = [
  { label: '6 個月 ~ 1 年', days: '3 天', min: 6, max: 12 },
  { label: '1 ~ 2 年', days: '7 天', min: 12, max: 24 },
  { label: '2 ~ 3 年', days: '10 天', min: 24, max: 36 },
  { label: '3 ~ 5 年', days: '14 天', min: 36, max: 60 },
  { label: '5 ~ 10 年', days: '15 天', min: 60, max: 120 },
  { label: '10 年以上', days: '每年 +1 天（上限 30）', min: 120, max: Infinity },
];

const calcSeniority = (y: number, m: number, d: number) => {
  const hire = new Date(y, m - 1, d);
  if (isNaN(hire.getTime()) || hire > todayMid) return null;
  if (hire.getFullYear() !== y || hire.getMonth() !== m - 1 || hire.getDate() !== d) return null;

  let years = todayMid.getFullYear() - hire.getFullYear();
  let months = todayMid.getMonth() - hire.getMonth();
  let days = todayMid.getDate() - hire.getDate();

  if (days < 0) {
    months--;
    const prev = new Date(todayMid.getFullYear(), todayMid.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = years * 12 + months;
  const leave = leaveDays(totalMonths);

  // 找下一個還沒到的門檻
  let nextMilestone: { daysLeft: number; days: number } | null = null;
  for (const ms of MILESTONES) {
    const target = addMonths(hire, ms.months);
    if (target > todayMid) {
      nextMilestone = {
        daysLeft: Math.ceil((target.getTime() - todayMid.getTime()) / 86400000),
        days: ms.days,
      };
      break;
    }
  }

  return { years, months, days, totalMonths, leave, nextMilestone };
};

export default function SeniorityCalculator() {
  const { theme } = useTheme();
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const result = useMemo(() => {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    if (!y || !m || !d) return null;
    return calcSeniority(y, m, d);
  }, [year, month, day]);

  const expression: MascotExpression = !result
    ? 'default'
    : result.years >= 10
      ? 'excited'
      : result.years >= 5
        ? 'cool'
        : result.years >= 1
          ? 'happy'
          : 'default';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '年資計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>來算年資吧</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>輸入到職日，看年資和特休天數</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>到職日期</Text>
          <View style={styles.dateRow}>
            <View style={[styles.dateField, { backgroundColor: theme.inputBg }]}>
              <FocusInput
                style={[styles.dateInput, { color: theme.text }]}
                value={year}
                onChangeText={setYear}
                placeholder="2020"
                placeholderTextColor={theme.hint}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Text style={[styles.dateUnit, { color: theme.hint }]}>年</Text>
            </View>
            <View style={[styles.dateField, { backgroundColor: theme.inputBg }]}>
              <FocusInput
                style={[styles.dateInput, { color: theme.text }]}
                value={month}
                onChangeText={setMonth}
                placeholder="1"
                placeholderTextColor={theme.hint}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.dateUnit, { color: theme.hint }]}>月</Text>
            </View>
            <View style={[styles.dateField, { backgroundColor: theme.inputBg }]}>
              <FocusInput
                style={[styles.dateInput, { color: theme.text }]}
                value={day}
                onChangeText={setDay}
                placeholder="1"
                placeholderTextColor={theme.hint}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.dateUnit, { color: theme.hint }]}>日</Text>
            </View>
          </View>
        </View>

        {result ? (
          <>
            <View style={[styles.resultCard, { backgroundColor: PASTEL }]}>
              <Mascot expression={expression} color={ACCENT} size={56} />
              <Text style={[styles.resultLabel, { color: ACCENT }]}>你的年資</Text>
              <Text style={[styles.resultValue, { color: ACCENT }]}>
                {result.years}
                <Text style={styles.resultUnit}> 年 </Text>
                {result.months}
                <Text style={styles.resultUnit}> 月 </Text>
                {result.days}
                <Text style={styles.resultUnit}> 天</Text>
              </Text>
            </View>

            <View style={[styles.leaveCard, { backgroundColor: theme.cardBg }]}>
              <View style={styles.leaveIconWrap}>
                <CalendarBlank size={26} color={ACCENT} weight="fill" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.leaveLabel, { color: theme.textMuted }]}>目前特休</Text>
                <Text style={[styles.leaveValue, { color: ACCENT }]}>
                  {result.leave}
                  <Text style={styles.leaveUnit}> 天 / 年</Text>
                </Text>
                {result.totalMonths < 6 && (
                  <Text style={[styles.leaveHint, { color: theme.hint }]}>未滿 6 個月，還沒有特休，再撐一下！</Text>
                )}
              </View>
            </View>

            <View style={[styles.milestoneCard, { backgroundColor: theme.cardBg }]}>
              <Medal size={22} color={ACCENT} weight="fill" />
              <Text style={[styles.milestoneText, { color: theme.text }]}>
                {result.nextMilestone
                  ? `再 ${result.nextMilestone.daysLeft} 天 → 升到 ${result.nextMilestone.days} 天特休`
                  : '已達特休上限 30 天，太資深了！'}
              </Text>
            </View>
          </>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint }]}>填好到職年月日就會出現結果</Text>
          </View>
        )}

        <View style={[styles.refCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.refTitle, { color: theme.text }]}>特休對照表（勞基法 §38）</Text>
          {TABLE.map((row) => {
            const current =
              result !== null && result.totalMonths >= row.min && result.totalMonths < row.max;
            return (
              <View key={row.label} style={styles.refRow}>
                <View style={[styles.refDot, { backgroundColor: current ? ACCENT : PASTEL }]} />
                <Text
                  style={[
                    styles.refRange,
                    { color: current ? ACCENT : theme.text },
                    current && styles.refCurrent,
                  ]}
                >
                  {row.label}
                </Text>
                <Text
                  style={[
                    styles.refDays,
                    { color: current ? ACCENT : theme.textMuted },
                    current && styles.refCurrent,
                  ]}
                >
                  {row.days}
                </Text>
              </View>
            );
          })}
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
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateField: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  dateInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    textAlign: 'center',
    minWidth: 50,
    padding: 0,
  },
  dateUnit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  resultCard: {
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  resultLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.85,
  },
  resultValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 44,
    letterSpacing: -1.5,
    lineHeight: 52,
    marginTop: 2,
  },
  resultUnit: {
    fontSize: 20,
  },
  leaveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  leaveIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: PASTEL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
  },
  leaveValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 30,
    letterSpacing: -0.5,
  },
  leaveUnit: {
    fontSize: 15,
  },
  leaveHint: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  milestoneText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    flex: 1,
  },
  placeholderCard: {
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  refCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  refTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
    marginBottom: 12,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  refDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  refRange: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    flex: 1,
  },
  refDays: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
  },
  refCurrent: {
    fontFamily: 'Fredoka_700Bold',
  },
});
