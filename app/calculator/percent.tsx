import { Stack } from 'expo-router';
import { Percent } from 'phosphor-react-native';
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

type Mode = 'value' | 'ratio' | 'change';

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'value', label: '取百分比', hint: 'X% 是多少' },
  { id: 'ratio', label: '算比例', hint: 'X 占 Y 的多少 %' },
  { id: 'change', label: '增減', hint: '增加 / 減少 X%' },
];

const format = (n: number, digits = 2) => {
  const rounded = Number(n.toFixed(digits));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

export default function PercentCalculator() {
  const { theme } = useTheme();
  const [mode, setMode] = useState<Mode>('value');
  const [pct, setPct] = useState('');
  const [num, setNum] = useState('');

  const result = useMemo(() => {
    const p = parseFloat(pct);
    const n = parseFloat(num);
    if (isNaN(p) || isNaN(n)) return null;

    if (mode === 'value') {
      return { main: (n * p) / 100, formula: `${pct}% × ${num}` };
    }
    if (mode === 'ratio') {
      if (n === 0) return null;
      return { main: (p / n) * 100, suffix: '%', formula: `${pct} ÷ ${num} × 100` };
    }
    const delta = (n * p) / 100;
    return { plus: n + delta, minus: n - delta, delta, formula: `${num} ± ${format(delta)}` };
  }, [pct, num, mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setPct('');
    setNum('');
  };

  const fields = (() => {
    if (mode === 'value') {
      return [
        { label: '百分比', value: pct, onChange: setPct, suffix: '%', placeholder: '15' },
        { label: '原值', value: num, onChange: setNum, placeholder: '200' },
      ];
    }
    if (mode === 'ratio') {
      return [
        { label: '部分', value: pct, onChange: setPct, placeholder: '30' },
        { label: '全部', value: num, onChange: setNum, placeholder: '200' },
      ];
    }
    return [
      { label: '原值', value: num, onChange: setNum, placeholder: '200' },
      { label: '增減比例', value: pct, onChange: setPct, suffix: '%', placeholder: '15' },
    ];
  })();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '百分比計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>百分比計算</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{MODES.find((m) => m.id === mode)?.hint}</Text>

        <View style={[styles.modes, { backgroundColor: theme.inputBg }]}>
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeBtn, active && styles.modeBtnActive, active && { backgroundColor: theme.cardBg }]}
                onPress={() => switchMode(m.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.modeText, { color: theme.textMuted }, active && styles.modeTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          {fields.map((f, i) => (
            <View key={f.label}>
              <View style={styles.inputRow}>
                <Text style={[styles.label, { color: theme.text }]}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <FocusInput
                    style={[styles.input, { color: theme.text }]}
                    value={f.value}
                    onChangeText={f.onChange}
                    placeholder={f.placeholder}
                    placeholderTextColor={theme.hint}
                    keyboardType="decimal-pad"
                    maxLength={10}
                  />
                  {f.suffix && <Text style={[styles.suffix, { color: theme.hint }]}>{f.suffix}</Text>}
                </View>
              </View>
              {i < fields.length - 1 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
            </View>
          ))}
        </View>

        {result ? (
          mode === 'change' ? (
            <View style={styles.dualResult}>
              <View style={[styles.resultCard, styles.dualCard]}>
                <Text style={styles.dualLabel}>＋ 增加後</Text>
                <Text style={styles.dualValue}>{format(result.plus!)}</Text>
              </View>
              <View style={[styles.resultCard, styles.dualCard]}>
                <Text style={styles.dualLabel}>－ 減少後</Text>
                <Text style={styles.dualValue}>{format(result.minus!)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.resultCard}>
              <Mascot expression="happy" color="#c4623a" size={52} />
              <Text style={[styles.resultFormula, { marginTop: 8 }]}>{result.formula}</Text>
              <Text style={styles.resultMain}>
                {format(result.main!)}
                {result.suffix && <Text style={styles.resultSuffix}>{result.suffix}</Text>}
              </Text>
            </View>
          )
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={48} />
            <Text style={[styles.placeholderText, { marginTop: 4, color: theme.hint }]}>輸入數字就會出現結果</Text>
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
    marginBottom: 18,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeBtnActive: {
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
  },
  modeTextActive: {
    color: C.accent,
  },
  card: {
    borderRadius: 24,
    padding: 6,
    marginBottom: 18,
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
    width: 96,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 4,
  },
  input: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    textAlign: 'right',
    minWidth: 60,
    padding: 0,
  },
  suffix: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 18,
  },
  resultCard: {
    backgroundColor: C.accentBg,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  resultIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  resultFormula: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: C.accent,
    opacity: 0.7,
    marginBottom: 2,
  },
  resultMain: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 56,
    color: C.accent,
    letterSpacing: -2,
    lineHeight: 60,
  },
  resultSuffix: {
    fontSize: 28,
  },
  dualResult: {
    flexDirection: 'row',
    gap: 12,
  },
  dualCard: {
    flex: 1,
    padding: 20,
  },
  dualLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    color: C.accent,
    opacity: 0.75,
    marginBottom: 8,
  },
  dualValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    color: C.accent,
    letterSpacing: -1,
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
