import { Stack } from 'expo-router';
import { Cake, Clock, Confetti } from 'phosphor-react-native';
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
import { useTheme } from '../../lib/theme';

const today = new Date();

const calcAge = (y: number, m: number, d: number) => {
  const birth = new Date(y, m - 1, d);
  if (isNaN(birth.getTime()) || birth > today) return null;
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return null;

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prev = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMs = today.getTime() - birth.getTime();
  const totalDays = Math.floor(totalMs / 86400000);
  const totalHours = Math.floor(totalMs / 3600000);

  const asianAge = today.getFullYear() - birth.getFullYear() + 1;

  let nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday <= today) nextBday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  const daysToBday = Math.ceil((nextBday.getTime() - today.getTime()) / 86400000);

  return { years, months, days, totalDays, totalHours, asianAge, daysToBday };
};

export default function AgeCalculator() {
  const { theme } = useTheme();
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const result = useMemo(() => {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    if (!y || !m || !d) return null;
    return calcAge(y, m, d);
  }, [year, month, day]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '年齡計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>來算年齡吧</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>輸入你的生日，看看活了多久</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>出生日期</Text>
          <View style={styles.dateRow}>
            <View style={[styles.dateField, { backgroundColor: theme.inputBg }]}>
              <TextInput
                style={[styles.dateInput, { color: theme.text }]}
                value={year}
                onChangeText={setYear}
                placeholder="2000"
                placeholderTextColor={theme.hint}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Text style={[styles.dateUnit, { color: theme.hint }]}>年</Text>
            </View>
            <View style={[styles.dateField, { backgroundColor: theme.inputBg }]}>
              <TextInput
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
              <TextInput
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
            <View style={styles.mainCard}>
              <View style={styles.mainIconWrap}>
                <Cake size={32} color="#2c5fa8" weight="fill" />
              </View>
              <Text style={styles.mainLabel}>實歲</Text>
              <Text style={styles.mainValue}>
                {result.years}
                <Text style={styles.mainUnit}> 歲</Text>
              </Text>
              <Text style={styles.mainSub}>
                {result.months} 個月 {result.days} 天
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>虛歲</Text>
                <Text style={styles.statValue}>{result.asianAge}</Text>
                <Text style={styles.statUnit}>歲</Text>
              </View>
              <View style={styles.statCard}>
                <Confetti size={20} color="#c2456a" weight="fill" />
                <Text style={styles.statLabel}>下個生日</Text>
                <Text style={styles.statValue}>{result.daysToBday}</Text>
                <Text style={styles.statUnit}>天後</Text>
              </View>
            </View>

            <View style={styles.livedCard}>
              <Clock size={24} color="#8d6e00" weight="fill" />
              <View style={{ flex: 1 }}>
                <Text style={styles.livedLabel}>你已經活了</Text>
                <Text style={styles.livedValue}>
                  {result.totalDays.toLocaleString()} 天
                </Text>
                <Text style={styles.livedSub}>
                  約 {result.totalHours.toLocaleString()} 小時
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Cake size={32} color={theme.hint} weight="duotone" />
            <Text style={[styles.placeholderText, { color: theme.hint }]}>填好年月日就會出現結果</Text>
          </View>
        )}
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
  mainCard: {
    backgroundColor: '#b8d8ff',
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
  mainIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mainLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: '#2c5fa8',
    opacity: 0.85,
    marginBottom: 2,
  },
  mainValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 72,
    color: '#2c5fa8',
    letterSpacing: -3,
    lineHeight: 76,
  },
  mainUnit: {
    fontSize: 28,
  },
  mainSub: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: '#2c5fa8',
    opacity: 0.75,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffc4d4',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    gap: 2,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 12,
    color: '#c2456a',
    opacity: 0.85,
    marginTop: 4,
  },
  statValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 36,
    color: '#c2456a',
    letterSpacing: -1,
    lineHeight: 40,
  },
  statUnit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 12,
    color: '#c2456a',
    opacity: 0.75,
  },
  livedCard: {
    backgroundColor: '#ffe082',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  livedLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    color: '#8d6e00',
    opacity: 0.8,
  },
  livedValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: '#8d6e00',
    letterSpacing: -0.5,
  },
  livedSub: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    color: '#8d6e00',
    opacity: 0.7,
  },
  placeholderCard: {
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
});
