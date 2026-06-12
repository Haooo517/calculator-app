import { Stack } from 'expo-router';
import { Binary } from 'phosphor-react-native';
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
import { useTheme } from '../../lib/theme';

type Base = 2 | 8 | 10 | 16;

const BASES: { id: Base; label: string }[] = [
  { id: 10, label: 'DEC' },
  { id: 16, label: 'HEX' },
  { id: 2, label: 'BIN' },
  { id: 8, label: 'OCT' },
];

const VALID: Record<Base, RegExp> = {
  2: /^[01]*$/i,
  8: /^[0-7]*$/i,
  10: /^[0-9]*$/i,
  16: /^[0-9a-f]*$/i,
};

const parseInBase = (s: string, base: Base): number | null => {
  if (!s) return null;
  if (!VALID[base].test(s)) return null;
  const n = parseInt(s, base);
  if (isNaN(n) || !isFinite(n)) return null;
  return n;
};

const formatBin = (n: number) => {
  const s = n.toString(2);
  // group by 4 bits
  return s.replace(/\B(?=(.{4})+$)/g, ' ');
};

export default function EngineeringCalculator() {
  const { theme } = useTheme();
  const [base, setBase] = useState<Base>(10);
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');

  const a = useMemo(() => parseInBase(val1, base), [val1, base]);
  const b = useMemo(() => parseInBase(val2, base), [val2, base]);

  const conversions = a !== null
    ? {
        DEC: a.toString(10),
        HEX: a.toString(16).toUpperCase(),
        BIN: formatBin(a),
        OCT: a.toString(8),
      }
    : null;

  const bitwise =
    a !== null && b !== null
      ? {
          and: a & b,
          or: a | b,
          xor: a ^ b,
        }
      : null;

  const switchBase = (newBase: Base) => {
    // convert existing inputs to new base
    if (a !== null) setVal1(a.toString(newBase).toUpperCase());
    if (b !== null) setVal2(b.toString(newBase).toUpperCase());
    setBase(newBase);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: '工程計算機' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>工程計算機</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>進位轉換、位元運算</Text>

        <View style={[styles.modes, { backgroundColor: theme.inputBg }]}>
          {BASES.map((b) => {
            const active = base === b.id;
            return (
              <TouchableOpacity key={b.id} style={[styles.modeBtn, active && styles.modeBtnActive, active && { backgroundColor: theme.cardBg }]} onPress={() => switchBase(b.id)} activeOpacity={0.75}>
                <Text style={[styles.modeText, { color: theme.textMuted }, active && styles.modeTextActive]}>{b.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>輸入</Text>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={val1}
            onChangeText={(t) => VALID[base].test(t) && setVal1(t.toUpperCase())}
            placeholder="0"
            placeholderTextColor={theme.hint}
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType={base === 10 ? 'number-pad' : 'default'}
            maxLength={32}
          />
        </View>

        {conversions ? (
          <View style={styles.convCard}>
            {(['DEC', 'HEX', 'BIN', 'OCT'] as const).map((k) => (
              <View key={k} style={[styles.convRow, k === BASES.find((x) => x.id === base)?.label && styles.convRowActive]}>
                <Text style={styles.convLabel}>{k}</Text>
                <Text style={styles.convValue} numberOfLines={2}>
                  {k === 'HEX' ? '0x' : k === 'BIN' ? '0b' : k === 'OCT' ? '0o' : ''}
                  {conversions[k]}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Binary size={32} color={theme.hint} weight="duotone" />
            <Text style={[styles.placeholderText, { color: theme.hint }]}>輸入數字看各進位</Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>位元運算（選填）</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>第二個數字</Text>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={val2}
            onChangeText={(t) => VALID[base].test(t) && setVal2(t.toUpperCase())}
            placeholder="0"
            placeholderTextColor={theme.hint}
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType={base === 10 ? 'number-pad' : 'default'}
            maxLength={32}
          />
        </View>

        {bitwise ? (
          <View style={[styles.bitCard, { backgroundColor: theme.cardBg }]}>
            {([
              { op: 'AND', val: bitwise.and },
              { op: 'OR', val: bitwise.or },
              { op: 'XOR', val: bitwise.xor },
            ] as const).map((b) => (
              <View key={b.op} style={styles.bitRow}>
                <View style={styles.bitOp}>
                  <Text style={styles.bitOpText}>{b.op}</Text>
                </View>
                <Text style={[styles.bitValue, { color: theme.text }]}>
                  {b.val.toString(base).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  modeText: { fontFamily: 'Fredoka_700Bold', fontSize: 13, letterSpacing: 0.5 },
  modeTextActive: { color: C.accent },
  card: {
    borderRadius: 24, padding: 18, marginBottom: 12,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  cardLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 12, marginBottom: 8, letterSpacing: 0.5 },
  input: {
    fontFamily: 'Fredoka_700Bold', fontSize: 32, letterSpacing: 1, padding: 0,
  },
  convCard: {
    backgroundColor: C.accentBg, borderRadius: 24, padding: 8, marginBottom: 18,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 3,
  },
  convRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(45, 135, 101, 0.15)',
  },
  convRowActive: {
    backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 14,
  },
  convLabel: {
    fontFamily: 'Fredoka_700Bold', fontSize: 13, color: C.accent, letterSpacing: 1, width: 50,
  },
  convValue: {
    flex: 1, fontFamily: 'Fredoka_600SemiBold', fontSize: 18, color: C.accent, textAlign: 'right',
  },
  sectionLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 13, marginLeft: 8, marginBottom: 10, letterSpacing: 0.5 },
  bitCard: {
    borderRadius: 24, padding: 8,
    shadowColor: '#a3897a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  bitRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 10,
  },
  bitOp: {
    backgroundColor: C.accentBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  bitOpText: { fontFamily: 'Fredoka_700Bold', fontSize: 12, color: C.accent, letterSpacing: 1 },
  bitValue: { flex: 1, fontFamily: 'Fredoka_700Bold', fontSize: 18, textAlign: 'right' },
  placeholderCard: {
    borderRadius: 24, padding: 30, alignItems: 'center', gap: 10, marginBottom: 18,
    borderWidth: 2, borderStyle: 'dashed',
  },
  placeholderText: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
});
