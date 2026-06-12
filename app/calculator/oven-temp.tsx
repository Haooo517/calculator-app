import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Mascot } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useTheme } from '../../lib/theme';

const COOK = { bg: '#f5b8a8', accent: '#a8443a' };

type Unit = 'c' | 'f';

const GAS_MARKS: { mark: number; c: number }[] = [
  { mark: 1, c: 140 },
  { mark: 2, c: 150 },
  { mark: 3, c: 160 },
  { mark: 4, c: 180 },
  { mark: 5, c: 190 },
  { mark: 6, c: 200 },
  { mark: 7, c: 220 },
  { mark: 8, c: 230 },
  { mark: 9, c: 240 },
];

const REF_ROWS: { c: number; f: number; gas: number; use: string }[] = [
  { c: 140, f: 284, gas: 1, use: '低溫烘烤、蛋白霜' },
  { c: 150, f: 302, gas: 2, use: '慢烤、燉烤' },
  { c: 160, f: 320, gas: 3, use: '餅乾、司康' },
  { c: 180, f: 356, gas: 4, use: '蛋糕、瑪芬' },
  { c: 190, f: 374, gas: 5, use: '吐司、麵包' },
  { c: 200, f: 392, gas: 6, use: '塔派、烤蔬菜' },
  { c: 220, f: 428, gas: 7, use: '披薩、法棍' },
  { c: 240, f: 464, gas: 9, use: '高溫快烤' },
];

export default function OvenTempCalculator() {
  const { theme } = useTheme();
  const [unit, setUnit] = useState<Unit>('c');
  const [value, setValue] = useState('');

  const pickUnit = (u: Unit) => {
    if (u === unit) return;
    haptics.light();
    setUnit(u);
  };

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (Number.isNaN(v) || v <= 0) return null;
    const c = unit === 'c' ? v : ((v - 32) * 5) / 9;
    const f = unit === 'c' ? (v * 9) / 5 + 32 : v;
    const gas = GAS_MARKS.reduce((best, g) => (Math.abs(g.c - c) < Math.abs(best.c - c) ? g : best));
    return { c, f, gas };
  }, [value, unit]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '烤箱溫度' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>烤箱溫度換算</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>°C、°F、Gas Mark 一次搞定</Text>

        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={[styles.segment, { backgroundColor: theme.inputBg }]}>
            {(['c', 'f'] as Unit[]).map((u) => {
              const active = unit === u;
              return (
                <TouchableOpacity
                  key={u}
                  style={[styles.segmentBtn, active && { backgroundColor: COOK.accent }]}
                  onPress={() => pickUnit(u)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.segmentText, { color: active ? '#fff' : theme.textMuted }]}
                  >
                    {u === 'c' ? '°C 攝氏' : '°F 華氏'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>溫度</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={value}
                onChangeText={setValue}
                placeholder={unit === 'c' ? '180' : '356'}
                placeholderTextColor={theme.hint}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={[styles.unit, { color: theme.hint }]}>{unit === 'c' ? '°C' : '°F'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.tipRow, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.tipText, { color: theme.textMuted }]}>
            小提醒：風扇烤箱（旋風）溫度約再減 20°C 喔
          </Text>
        </View>

        {result ? (
          <View style={[styles.resultCard, { backgroundColor: COOK.bg }]}>
            <Mascot expression="excited" color={COOK.accent} size={56} />
            <Text style={[styles.resultValue, { color: COOK.accent, marginTop: 10 }]}>
              {unit === 'c' ? `${Math.round(result.f)}°F` : `${Math.round(result.c)}°C`}
            </Text>
            <Text style={[styles.resultGas, { color: COOK.accent }]}>
              Gas Mark {result.gas.mark} 最接近
            </Text>
            <Text style={[styles.resultTip, { color: COOK.accent }]}>
              旋風烤箱建議約 {Math.round(result.c - 20)}°C
            </Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>
              輸入溫度，馬上幫你換算
            </Text>
          </View>
        )}

        <View style={[styles.refCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.refTitle, { color: theme.text }]}>常用溫度對照表</Text>
          <View style={[styles.refHead, { borderBottomColor: theme.divider }]}>
            <Text style={[styles.refColC, styles.refHeadText, { color: theme.textMuted }]}>°C</Text>
            <Text style={[styles.refColF, styles.refHeadText, { color: theme.textMuted }]}>°F</Text>
            <Text style={[styles.refColGas, styles.refHeadText, { color: theme.textMuted }]}>Gas</Text>
            <Text style={[styles.refColUse, styles.refHeadText, { color: theme.textMuted }]}>用途</Text>
          </View>
          {REF_ROWS.map((r) => (
            <View key={r.c} style={styles.refRow}>
              <Text style={[styles.refColC, styles.refCell, { color: COOK.accent }]}>{r.c}</Text>
              <Text style={[styles.refColF, styles.refCell, { color: theme.text }]}>{r.f}</Text>
              <Text style={[styles.refColGas, styles.refCell, { color: theme.text }]}>{r.gas}</Text>
              <Text style={[styles.refColUse, styles.refUse, { color: theme.textMuted }]}>{r.use}</Text>
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
  inputCard: {
    borderRadius: 24,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    marginBottom: 6,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 9,
    alignItems: 'center',
  },
  segmentText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 10,
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
  tipRow: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  tipText: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    textAlign: 'center',
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
  resultValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 60,
    letterSpacing: -2,
    lineHeight: 66,
  },
  resultGas: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 20,
    marginTop: 4,
  },
  resultTip: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.85,
  },
  placeholderCard: {
    borderRadius: 28,
    padding: 32,
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
    padding: 18,
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
  refHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  refHeadText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 12,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  refCell: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
  refUse: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
  },
  refColC: {
    width: 42,
  },
  refColF: {
    width: 42,
  },
  refColGas: {
    width: 36,
  },
  refColUse: {
    flex: 1,
  },
});
