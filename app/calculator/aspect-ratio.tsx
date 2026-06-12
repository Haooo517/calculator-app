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

const ACCENT = '#8a3a8d';
const PASTEL = '#f0c4e8';

const PRESETS: Array<{ w: string; h: string }> = [
  { w: '16', h: '9' },
  { w: '4', h: '3' },
  { w: '1', h: '1' },
  { w: '21', h: '9' },
  { w: '3', h: '2' },
  { w: '9', h: '16' },
];

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const decimals = (n: number): number => {
  const s = String(n);
  const idx = s.indexOf('.');
  return idx === -1 ? 0 : Math.min(s.length - idx - 1, 4);
};

const reduceRatio = (w: number, h: number): [number, number] => {
  const scale = Math.pow(10, Math.max(decimals(w), decimals(h)));
  const a = Math.round(w * scale);
  const b = Math.round(h * scale);
  const g = gcd(a, b) || 1;
  return [a / g, b / g];
};

const fmt = (n: number): string => {
  if (!isFinite(n)) return '—';
  return String(Number(n.toFixed(3)));
};

export default function AspectRatioCalculator() {
  const { theme } = useTheme();

  // 區塊①：化簡比例
  const [simpW, setSimpW] = useState('');
  const [simpH, setSimpH] = useState('');

  // 區塊②：等比換算
  const [ratioW, setRatioW] = useState('16');
  const [ratioH, setRatioH] = useState('9');
  const [convW, setConvW] = useState('');
  const [convH, setConvH] = useState('');
  const [lastEdit, setLastEdit] = useState<'w' | 'h'>('w');

  const simplified = useMemo(() => {
    const w = parseFloat(simpW);
    const h = parseFloat(simpH);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
    const [a, b] = reduceRatio(w, h);
    return { a, b, decimal: w / h };
  }, [simpW, simpH]);

  const ratio = useMemo(() => {
    const rw = parseFloat(ratioW);
    const rh = parseFloat(ratioH);
    if (isNaN(rw) || isNaN(rh) || rw <= 0 || rh <= 0) return null;
    return { rw, rh, value: rw / rh };
  }, [ratioW, ratioH]);

  const shownW = useMemo(() => {
    if (lastEdit === 'w') return convW;
    const h = parseFloat(convH);
    if (!ratio || isNaN(h) || h <= 0) return '';
    return fmt(h * ratio.value);
  }, [lastEdit, convW, convH, ratio]);

  const shownH = useMemo(() => {
    if (lastEdit === 'h') return convH;
    const w = parseFloat(convW);
    if (!ratio || isNaN(w) || w <= 0) return '';
    return fmt(w / ratio.value);
  }, [lastEdit, convW, convH, ratio]);

  const rectSize = useMemo(() => {
    if (!ratio) return null;
    const maxW = 200;
    const maxH = 110;
    const scale = Math.min(maxW / ratio.rw, maxH / ratio.rh);
    return { w: ratio.rw * scale, h: ratio.rh * scale };
  }, [ratio]);

  const pickPreset = (p: { w: string; h: string }) => {
    haptics.light();
    setRatioW(p.w);
    setRatioH(p.h);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '寬高比' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>來算比例吧</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>化簡比例、等比換算一次搞定</Text>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>化簡比例</Text>
        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>寬</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={simpW}
              onChangeText={setSimpW}
              placeholder="1920"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={8}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>高</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={simpH}
              onChangeText={setSimpH}
              placeholder="1080"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={8}
            />
          </View>
        </View>

        {simplified ? (
          <View style={[styles.resultCard, { backgroundColor: PASTEL }]}>
            <Mascot expression="cool" color={ACCENT} size={56} />
            <Text style={[styles.resultRatio, { color: ACCENT }]}>
              {simplified.a} : {simplified.b}
            </Text>
            <Text style={[styles.resultDecimal, { color: ACCENT }]}>≈ {fmt(simplified.decimal)}</Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>填寬和高，比例自己約分好</Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>等比換算</Text>
        <View style={styles.chipRow}>
          {PRESETS.map((p) => {
            const active = p.w === ratioW && p.h === ratioH;
            return (
              <TouchableOpacity
                key={`${p.w}:${p.h}`}
                style={[
                  styles.chip,
                  { backgroundColor: active ? ACCENT : theme.cardBg },
                ]}
                onPress={() => pickPreset(p)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : theme.text }]}>
                  {p.w}:{p.h}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>比例</Text>
            <View style={styles.ratioWrap}>
              <TextInput
                style={[styles.ratioInput, { color: theme.text, backgroundColor: theme.inputBg }]}
                value={ratioW}
                onChangeText={setRatioW}
                placeholder="16"
                placeholderTextColor={theme.hint}
                keyboardType="decimal-pad"
                maxLength={6}
              />
              <Text style={[styles.ratioColon, { color: theme.textMuted }]}>:</Text>
              <TextInput
                style={[styles.ratioInput, { color: theme.text, backgroundColor: theme.inputBg }]}
                value={ratioH}
                onChangeText={setRatioH}
                placeholder="9"
                placeholderTextColor={theme.hint}
                keyboardType="decimal-pad"
                maxLength={6}
              />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>寬</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={shownW}
              onChangeText={(t) => {
                setConvW(t);
                setLastEdit('w');
              }}
              placeholder="1280"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>高</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={shownH}
              onChangeText={(t) => {
                setConvH(t);
                setLastEdit('h');
              }}
              placeholder="720"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        {ratio && rectSize && (
          <View style={[styles.previewCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.previewTitle, { color: theme.text }]}>長這個形狀</Text>
            <View
              style={[
                styles.previewRect,
                {
                  width: rectSize.w,
                  height: rectSize.h,
                  borderColor: ACCENT,
                  backgroundColor: PASTEL,
                },
              ]}
            >
              <Text style={[styles.previewRectText, { color: ACCENT }]}>
                {ratioW}:{ratioH}
              </Text>
            </View>
          </View>
        )}
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
    padding: 26,
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
    fontSize: 48,
    letterSpacing: -1,
    marginTop: 8,
  },
  resultDecimal: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 16,
    marginTop: 4,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  chipText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
  ratioWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  ratioInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    textAlign: 'center',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 62,
  },
  ratioColon: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
  },
  previewCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  previewTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
    alignSelf: 'flex-start',
  },
  previewRect: {
    borderWidth: 3,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewRectText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
});
