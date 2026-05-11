import { Stack } from 'expo-router';
import { Clock, GlobeHemisphereEast } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const CITIES = [
  { city: '台北', tz: 'Asia/Taipei', flag: 'TW' },
  { city: '東京', tz: 'Asia/Tokyo', flag: 'JP' },
  { city: '首爾', tz: 'Asia/Seoul', flag: 'KR' },
  { city: '新加坡', tz: 'Asia/Singapore', flag: 'SG' },
  { city: '雪梨', tz: 'Australia/Sydney', flag: 'AU' },
  { city: '巴黎', tz: 'Europe/Paris', flag: 'FR' },
  { city: '倫敦', tz: 'Europe/London', flag: 'GB' },
  { city: '紐約', tz: 'America/New_York', flag: 'US' },
  { city: '洛杉磯', tz: 'America/Los_Angeles', flag: 'US' },
];

const formatTime = (d: Date, tz: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return '--:--';
  }
};

const formatDayDate = (d: Date, tz: string) => {
  try {
    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: tz,
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }).format(d);
  } catch {
    return '';
  }
};

const getOffset = (d: Date, tz: string) => {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      hour12: false,
    });
    const local = parseInt(dtf.format(d), 10);
    const localHere = parseInt(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Taipei',
        hour: '2-digit',
        hour12: false,
      }).format(d),
      10
    );
    let diff = local - localHere;
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;
    return diff;
  } catch {
    return 0;
  }
};

export default function TimezoneCalculator() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const taipei = CITIES[0];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ed' }}>
      <Stack.Screen options={{ title: '時區換算' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>世界時間</Text>
        <Text style={styles.subtitle}>看看世界各地現在幾點</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <GlobeHemisphereEast size={32} color="#2c5fa8" weight="fill" />
          </View>
          <Text style={styles.heroCity}>{taipei.city}</Text>
          <Text style={styles.heroTime}>{formatTime(now, taipei.tz)}</Text>
          <Text style={styles.heroDate}>{formatDayDate(now, taipei.tz)}</Text>
        </View>

        <Text style={styles.sectionLabel}>其他城市</Text>
        <View style={styles.list}>
          {CITIES.slice(1).map((c) => {
            const offset = getOffset(now, c.tz);
            const sign = offset >= 0 ? '+' : '';
            return (
              <View key={c.tz} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Clock size={20} color="#2c5fa8" weight="duotone" />
                  <View>
                    <Text style={styles.rowCity}>{c.city}</Text>
                    <Text style={styles.rowOffset}>台北 {sign}{offset} 小時</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.rowTime}>{formatTime(now, c.tz)}</Text>
                  <Text style={styles.rowDate}>{formatDayDate(now, c.tz)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const C = {
  card: '#fff', text: '#2d2520', muted: '#8a7a6c', hint: '#a3897a', divider: '#f1e3d0',
  accentBg: '#b8d8ff', accent: '#2c5fa8',
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 32, color: C.text, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontFamily: 'Fredoka_400Regular', fontSize: 14, color: C.muted, marginBottom: 22, textAlign: 'center' },
  heroCard: {
    backgroundColor: C.accentBg, borderRadius: 28, padding: 28, alignItems: 'center', marginBottom: 22,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  heroIconWrap: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroCity: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15, color: C.accent, opacity: 0.85, marginBottom: 2 },
  heroTime: { fontFamily: 'Fredoka_700Bold', fontSize: 72, color: C.accent, letterSpacing: -3, lineHeight: 78 },
  heroDate: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: C.accent, opacity: 0.75, marginTop: 4 },
  sectionLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 13, color: C.muted, marginLeft: 8, marginBottom: 10, letterSpacing: 0.5 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.card, padding: 16, borderRadius: 20,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowCity: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16, color: C.text },
  rowOffset: { fontFamily: 'Fredoka_400Regular', fontSize: 11, color: C.muted, marginTop: 2 },
  rowTime: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: C.text, letterSpacing: -0.5 },
  rowDate: { fontFamily: 'Fredoka_400Regular', fontSize: 11, color: C.muted, marginTop: 2 },
});
