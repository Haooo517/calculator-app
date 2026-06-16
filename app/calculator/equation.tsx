import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Mascot } from '../../components/Mascot';
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
import { useTheme } from '../../lib/theme';

type Mode = 'linear1' | 'quadratic' | 'linear2';

const MODES: { id: Mode; label: string }[] = [
  { id: 'linear1', label: '一元一次' },
  { id: 'quadratic', label: '一元二次' },
  { id: 'linear2', label: '二元一次' },
];

const fmt = (n: number, d = 4) => {
  if (!isFinite(n)) return '—';
  const rounded = Number(n.toFixed(d));
  return String(rounded);
};

export default function EquationCalculator() {
  const { theme } = useTheme();
  const [mode, setMode] = useState<Mode>('linear1');
  const [coef, setCoef] = useState<Record<string, string>>({});

  const set = (k: string) => (v: string) => setCoef((c) => ({ ...c, [k]: v }));
  const get = (k: string) => parseFloat(coef[k] ?? '');

  const result = useMemo(() => {
    if (mode === 'linear1') {
      const a = get('a'), b = get('b');
      if (isNaN(a) || isNaN(b)) return null;
      if (a === 0) return { error: b === 0 ? '任意 x 都成立' : '無解' };
      return { roots: [-b / a] };
    }
    if (mode === 'quadratic') {
      const a = get('a'), b = get('b'), c = get('c');
      if (isNaN(a) || isNaN(b) || isNaN(c)) return null;
      if (a === 0) {
        if (b === 0) return { error: c === 0 ? '任意 x 都成立' : '無解' };
        return { roots: [-c / b] };
      }
      const d = b * b - 4 * a * c;
      if (d > 0) {
        const sq = Math.sqrt(d);
        return { roots: [(-b + sq) / (2 * a), (-b - sq) / (2 * a)], disc: d };
      }
      if (d === 0) return { roots: [-b / (2 * a)], disc: 0 };
      const sq = Math.sqrt(-d);
      return {
        complex: { real: -b / (2 * a), imag: sq / (2 * a) },
        disc: d,
      };
    }
    // linear2: ax+by=c, dx+ey=f
    const a = get('a'), b = get('b'), c = get('c');
    const d = get('d'), e = get('e'), f = get('f');
    if ([a, b, c, d, e, f].some(isNaN)) return null;
    const det = a * e - b * d;
    if (det === 0) return { error: '無解或無限多解' };
    return {
      pair: { x: (c * e - b * f) / det, y: (a * f - c * d) / det },
    };
  }, [mode, coef]);

  const renderInputs = () => {
    if (mode === 'linear1') {
      return (
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.eqLabel, { color: theme.textMuted }]}>a · x + b = 0</Text>
          <View style={styles.coefRow}>
            <CoefInput label="a" value={coef.a} onChange={set('a')} />
            <CoefInput label="b" value={coef.b} onChange={set('b')} />
          </View>
        </View>
      );
    }
    if (mode === 'quadratic') {
      return (
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.eqLabel, { color: theme.textMuted }]}>a · x² + b · x + c = 0</Text>
          <View style={styles.coefRow}>
            <CoefInput label="a" value={coef.a} onChange={set('a')} />
            <CoefInput label="b" value={coef.b} onChange={set('b')} />
            <CoefInput label="c" value={coef.c} onChange={set('c')} />
          </View>
        </View>
      );
    }
    return (
      <>
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.eqLabel, { color: theme.textMuted }]}>a · x + b · y = c</Text>
          <View style={styles.coefRow}>
            <CoefInput label="a" value={coef.a} onChange={set('a')} />
            <CoefInput label="b" value={coef.b} onChange={set('b')} />
            <CoefInput label="c" value={coef.c} onChange={set('c')} />
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.eqLabel, { color: theme.textMuted }]}>d · x + e · y = f</Text>
          <View style={styles.coefRow}>
            <CoefInput label="d" value={coef.d} onChange={set('d')} />
            <CoefInput label="e" value={coef.e} onChange={set('e')} />
            <CoefInput label="f" value={coef.f} onChange={set('f')} />
          </View>
        </View>
      </>
    );
  };

  const renderResult = () => {
    if (!result) {
      return (
        <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
          <Mascot expression="sleepy" color={theme.hint} size={48} />
          <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 4 }]}>輸入係數就會出現解</Text>
        </View>
      );
    }
    if ('error' in result && result.error) {
      return (
        <View style={[styles.resultCard, { backgroundColor: '#ffd4ba' }]}>
          <Mascot expression="thinking" color="#c4623a" size={48} />
          <Text style={[styles.resultLabel, { color: '#c4623a', marginTop: 8 }]}>{result.error}</Text>
        </View>
      );
    }
    if ('pair' in result && result.pair) {
      return (
        <View style={styles.resultCard}>
          <Mascot expression="happy" color="#2d8765" size={52} />
          <View style={[styles.rootsRow, { marginTop: 10 }]}>
            <View style={styles.rootBox}>
              <Text style={styles.rootVar}>x =</Text>
              <Text style={styles.rootVal}>{fmt(result.pair.x)}</Text>
            </View>
            <View style={styles.rootBox}>
              <Text style={styles.rootVar}>y =</Text>
              <Text style={styles.rootVal}>{fmt(result.pair.y)}</Text>
            </View>
          </View>
        </View>
      );
    }
    if ('complex' in result && result.complex) {
      const { real, imag } = result.complex;
      return (
        <View style={styles.resultCard}>
          <Mascot expression="surprised" color="#2d8765" size={48} />
          <Text style={[styles.resultLabel, { marginTop: 6 }]}>兩個複數解</Text>
          <Text style={styles.rootVal}>{fmt(real)} ± {fmt(imag)}i</Text>
          <Text style={styles.discText}>判別式 = {fmt(result.disc!)}</Text>
        </View>
      );
    }
    if ('roots' in result && result.roots) {
      return (
        <View style={styles.resultCard}>
          <Mascot expression="happy" color="#2d8765" size={48} />
          <Text style={[styles.resultLabel, { marginTop: 6 }]}>
            {result.roots.length === 1 ? '解' : `兩個實數解`}
          </Text>
          <View style={result.roots.length === 1 ? null : styles.rootsRow}>
            {result.roots.map((r, i) => (
              <View key={i} style={styles.rootBox}>
                <Text style={styles.rootVar}>x{result.roots.length > 1 ? <Text style={styles.rootSub}>{i + 1}</Text> : ''} =</Text>
                <Text style={styles.rootVal}>{fmt(r)}</Text>
              </View>
            ))}
          </View>
          {result.disc !== undefined && (
            <Text style={styles.discText}>判別式 = {fmt(result.disc)}</Text>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: '方程式求解' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>方程式求解</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>輸入係數，自動算出 x、y</Text>

        <View style={[styles.modes, { backgroundColor: theme.inputBg }]}>
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <TouchableOpacity key={m.id} style={[styles.modeBtn, active && styles.modeBtnActive, active && { backgroundColor: theme.cardBg }]} onPress={() => { setMode(m.id); setCoef({}); }} activeOpacity={0.75}>
                <Text style={[styles.modeText, { color: theme.textMuted }, active && styles.modeTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {renderInputs()}
        {renderResult()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CoefInput = ({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.coefBox, { backgroundColor: theme.inputBg }]}>
      <Text style={styles.coefLabel}>{label}</Text>
      <FocusInput
        style={[styles.coefInput, { color: theme.text }]}
        value={value ?? ''}
        onChangeText={onChange}
        placeholder="0"
        placeholderTextColor={theme.hint}
        keyboardType="numbers-and-punctuation"
        maxLength={8}
      />
    </View>
  );
};

const C = {
  accentBg: '#b8e6d2', accent: '#2d8765',
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 32, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontFamily: 'Fredoka_400Regular', fontSize: 14, marginBottom: 22, textAlign: 'center' },
  modes: {
    flexDirection: 'row', borderRadius: 16, padding: 4, gap: 4, marginBottom: 16,
  },
  modeBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  modeBtnActive: { shadowColor: '#a3897a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  modeText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 13 },
  modeTextActive: { color: C.accent },
  card: {
    borderRadius: 24, padding: 18, marginBottom: 12,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  eqLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  coefRow: { flexDirection: 'row', gap: 10 },
  coefBox: {
    flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6,
  },
  coefLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: C.accent, fontStyle: 'italic' },
  coefInput: { fontFamily: 'Fredoka_700Bold', fontSize: 22, textAlign: 'center', minWidth: 50, padding: 0 },
  resultCard: {
    backgroundColor: C.accentBg, borderRadius: 28, padding: 26, alignItems: 'center', marginTop: 4,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  resultIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  resultLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 14, color: C.accent, opacity: 0.85, marginBottom: 10 },
  rootsRow: { flexDirection: 'row', gap: 20, alignItems: 'baseline' },
  rootBox: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  rootVar: { fontFamily: 'Fredoka_500Medium', fontSize: 18, color: C.accent, fontStyle: 'italic' },
  rootSub: { fontSize: 13 },
  rootVal: { fontFamily: 'Fredoka_700Bold', fontSize: 30, color: C.accent, letterSpacing: -0.5 },
  discText: { fontFamily: 'Fredoka_400Regular', fontSize: 12, color: C.accent, opacity: 0.7, marginTop: 10 },
  placeholderCard: {
    borderRadius: 28, padding: 36, alignItems: 'center', gap: 10, marginTop: 4,
    borderWidth: 2, borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
});
