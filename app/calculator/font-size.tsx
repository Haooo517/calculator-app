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

const ACCENT = '#8a3a8d';
const PASTEL = '#f0c4e8';

type FontUnit = 'px' | 'rem' | 'pt';

const UNITS: FontUnit[] = ['px', 'rem', 'pt'];

const COMMON_PX = [12, 14, 16, 18, 20, 24, 32, 48];

const fmt = (n: number): string => {
  if (!isFinite(n)) return '—';
  return String(Number(n.toFixed(3)));
};

export default function FontSizeCalculator() {
  const { theme } = useTheme();
  const [base, setBase] = useState('16');
  const [unit, setUnit] = useState<FontUnit>('px');
  const [value, setValue] = useState('');

  const baseNum = useMemo(() => {
    const b = parseFloat(base);
    if (isNaN(b) || b <= 0) return null;
    return b;
  }, [base]);

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v) || v <= 0 || baseNum === null) return null;
    let px: number;
    if (unit === 'px') px = v;
    else if (unit === 'rem') px = v * baseNum;
    else px = v / 0.75;
    return { px, rem: px / baseNum, pt: px * 0.75 };
  }, [value, unit, baseNum]);

  const pickUnit = (u: FontUnit) => {
    haptics.light();
    setUnit(u);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '字級換算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>來換字級吧</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>px、rem、pt 互轉不卡關</Text>

        <View style={[styles.baseCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.baseLabel, { color: theme.text }]}>基準字級</Text>
          <View style={styles.baseInputWrap}>
            <FocusInput
              style={[styles.baseInput, { color: theme.text, backgroundColor: theme.inputBg }]}
              value={base}
              onChangeText={setBase}
              placeholder="16"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={6}
            />
            <Text style={[styles.baseUnit, { color: theme.hint }]}>px</Text>
          </View>
        </View>

        <View style={styles.segmentRow}>
          {UNITS.map((u) => {
            const active = u === unit;
            return (
              <TouchableOpacity
                key={u}
                style={[styles.segmentBtn, { backgroundColor: active ? ACCENT : theme.cardBg }]}
                onPress={() => pickUnit(u)}
                activeOpacity={0.75}
              >
                <Text style={[styles.segmentText, { color: active ? '#fff' : theme.text }]}>{u}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>數值</Text>
            <View style={styles.inputWrap}>
              <FocusInput
                style={[styles.input, { color: theme.text }]}
                value={value}
                onChangeText={setValue}
                placeholder="16"
                placeholderTextColor={theme.hint}
                keyboardType="decimal-pad"
                maxLength={8}
              />
              <Text style={[styles.unit, { color: theme.hint }]}>{unit}</Text>
            </View>
          </View>
        </View>

        {result ? (
          <>
            <View style={[styles.resultCard, { backgroundColor: PASTEL }]}>
              <Mascot expression="happy" color={ACCENT} size={56} />
              <View style={styles.resultRows}>
                {([
                  ['px', result.px],
                  ['rem', result.rem],
                  ['pt', result.pt],
                ] as const).map(([u, n]) => (
                  <View key={u} style={styles.resultRow}>
                    <Text style={[styles.resultUnit, { color: ACCENT }]}>
                      {u}
                      {u === unit ? '（輸入）' : ''}
                    </Text>
                    <Text style={[styles.resultValue, { color: ACCENT }]}>{fmt(n)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.previewCard, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.previewLabel, { color: theme.textMuted }]}>
                實際大小預覽（{fmt(result.px)} px{result.px > 60 ? '，最大顯示 60' : ''}）
              </Text>
              <Text
                style={{
                  fontFamily: 'Fredoka_600SemiBold',
                  fontSize: Math.min(result.px, 60),
                  color: theme.text,
                  textAlign: 'center',
                }}
              >
                歐古 Allcu 123
              </Text>
            </View>
          </>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>
              {baseNum === null ? '基準字級要大於 0 喔' : '選單位、填數值，三種寫法一起出現'}
            </Text>
          </View>
        )}

        <View style={[styles.refCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.refTitle, { color: theme.text }]}>常用字級對照</Text>
          <View style={[styles.refRow, styles.refHeaderRow]}>
            <Text style={[styles.refCell, styles.refHeader, { color: theme.textMuted }]}>px</Text>
            <Text style={[styles.refCell, styles.refHeader, { color: theme.textMuted }]}>rem</Text>
            <Text style={[styles.refCell, styles.refHeader, { color: theme.textMuted }]}>pt</Text>
          </View>
          {COMMON_PX.map((px) => (
            <View key={px} style={[styles.refRow, { borderTopColor: theme.divider }]}>
              <Text style={[styles.refCell, { color: theme.text }]}>{px}</Text>
              <Text style={[styles.refCell, { color: theme.textMuted }]}>
                {baseNum !== null ? fmt(px / baseNum) : '—'}
              </Text>
              <Text style={[styles.refCell, { color: theme.textMuted }]}>{fmt(px * 0.75)}</Text>
            </View>
          ))}
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
  baseCard: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  baseLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
  },
  baseInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  baseInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    textAlign: 'center',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 64,
  },
  baseUnit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
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
  unit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 16,
  },
  resultCard: {
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  resultRows: {
    flex: 1,
    gap: 6,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  resultUnit: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    opacity: 0.75,
  },
  resultValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
  },
  previewCard: {
    borderRadius: 24,
    padding: 20,
    gap: 12,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  previewLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 12,
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
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  refHeaderRow: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  refHeader: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  refCell: {
    flex: 1,
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
});
