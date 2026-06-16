import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FocusInput } from '../../components/FocusInput';
import { Mascot } from '../../components/Mascot';
import { useTheme } from '../../lib/theme';

const PHI = 1.6180339887;
const ACCENT = '#8a3a8d';
const ACCENT_SOFT = '#c977bd';
const PASTEL = '#f0c4e8';

const fmt = (n: number): string => {
  if (!isFinite(n)) return '—';
  return String(Number(n.toFixed(3)));
};

export default function GoldenRatioCalculator() {
  const { theme } = useTheme();
  const [length, setLength] = useState('');
  const [rectW, setRectW] = useState('');

  const segment = useMemo(() => {
    const l = parseFloat(length);
    if (isNaN(l) || l <= 0) return null;
    const a = l / PHI;
    const b = l - a;
    return { l, a, b };
  }, [length]);

  const rect = useMemo(() => {
    const w = parseFloat(rectW);
    if (isNaN(w) || w <= 0) return null;
    return { w, h: w / PHI, wide: w * PHI };
  }, [rectW]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '黃金比例' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>黃金比例 φ</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>1.618…，大自然最愛的數字</Text>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>線段黃金分割</Text>
        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>總長</Text>
            <FocusInput
              style={[styles.input, { color: theme.text }]}
              value={length}
              onChangeText={setLength}
              placeholder="100"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        {segment ? (
          <View style={[styles.resultCard, { backgroundColor: PASTEL }]}>
            <Mascot expression="excited" color={ACCENT} size={56} />
            <Text style={[styles.resultRatio, { color: ACCENT }]}>a : b ≈ 1.618 : 1</Text>

            <View style={styles.barLabels}>
              <Text style={[styles.barLabel, { color: ACCENT }]}>長段 a = {fmt(segment.a)}</Text>
              <Text style={[styles.barLabel, { color: ACCENT }]}>短段 b = {fmt(segment.b)}</Text>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barSegment, { flex: 0.618, backgroundColor: ACCENT }]}>
                <Text style={styles.barTextLight}>a</Text>
              </View>
              <View style={[styles.barSegment, { flex: 0.382, backgroundColor: ACCENT_SOFT }]}>
                <Text style={styles.barTextLight}>b</Text>
              </View>
            </View>
            <Text style={[styles.resultTip, { color: ACCENT }]}>切在 0.618 的位置，看起來最舒服</Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>輸入總長，幫你切出黃金分割</Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>黃金矩形</Text>
        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>寬</Text>
            <FocusInput
              style={[styles.input, { color: theme.text }]}
              value={rectW}
              onChangeText={setRectW}
              placeholder="320"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
          {rect && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.rectResultWrap}>
                <View style={styles.rectResultRow}>
                  <Text style={[styles.rectResultKey, { color: theme.textMuted }]}>高 = 寬 ÷ φ</Text>
                  <Text style={[styles.rectResultValue, { color: ACCENT }]}>{fmt(rect.h)}</Text>
                </View>
                <View style={styles.rectResultRow}>
                  <Text style={[styles.rectResultKey, { color: theme.textMuted }]}>若這是高，寬 = 高 × φ</Text>
                  <Text style={[styles.rectResultValue, { color: ACCENT }]}>{fmt(rect.wide)}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={[styles.refCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.refTitle, { color: theme.text }]}>φ 的小知識</Text>
          <Text style={[styles.refText, { color: theme.textMuted }]}>• 鸚鵡螺殼的螺旋，一圈圈都貼著黃金螺線長大</Text>
          <Text style={[styles.refText, { color: theme.textMuted }]}>• 帕德嫩神殿的立面，據說藏著好幾個黃金矩形</Text>
          <Text style={[styles.refText, { color: theme.textMuted }]}>• 向日葵的種子以 137.5°（黃金角）排列，擠好擠滿</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
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
  sectionLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.5,
    marginLeft: 8,
    marginBottom: 8,
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
  label: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    width: 56,
  },
  input: {
    flex: 1,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    textAlign: 'right',
    padding: 0,
  },
  divider: {
    height: 1,
    marginHorizontal: 18,
  },
  resultCard: {
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  resultRatio: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 30,
    letterSpacing: -0.5,
    marginTop: 8,
    marginBottom: 16,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: 6,
  },
  barLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
  },
  bar: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: 36,
    borderRadius: 12,
    overflow: 'hidden',
  },
  barSegment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTextLight: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  resultTip: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    marginTop: 12,
    opacity: 0.85,
  },
  placeholderCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  rectResultWrap: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  rectResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  rectResultKey: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  rectResultValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
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
    marginBottom: 10,
  },
  refText: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
});
