import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FocusInput } from '../../components/FocusInput';
import { Mascot } from '../../components/Mascot';
import { useTheme } from '../../lib/theme';

const ACCENT = '#8a3a8d';
const PASTEL = '#f0c4e8';

type RGB = { r: number; g: number; b: number };

const hexToRgb = (input: string): RGB | null => {
  const h = input.replace(/^#/, '').trim();
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    const r = parseInt(h.charAt(0) + h.charAt(0), 16);
    const g = parseInt(h.charAt(1) + h.charAt(1), 16);
    const b = parseInt(h.charAt(2) + h.charAt(2), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  if (/^[0-9a-fA-F]{6}$/.test(h)) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
};

const rgbToHex = ({ r, g, b }: RGB): string =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();

const rgbToHsl = ({ r, g, b }: RGB): { h: number; s: number; l: number } => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const parseChannel = (text: string): number | null => {
  if (text.trim() === '') return null;
  const n = parseInt(text, 10);
  if (isNaN(n) || n < 0 || n > 255) return null;
  return n;
};

export default function ColorCalculator() {
  const { theme } = useTheme();
  const [hex, setHex] = useState('');
  const [rStr, setRStr] = useState('');
  const [gStr, setGStr] = useState('');
  const [bStr, setBStr] = useState('');

  const onHexChange = (text: string) => {
    let t = text.replace(/[^#0-9a-fA-F]/g, '');
    if (t.length > 0 && !t.startsWith('#')) t = '#' + t;
    setHex(t);
    const rgb = hexToRgb(t);
    if (rgb) {
      setRStr(String(rgb.r));
      setGStr(String(rgb.g));
      setBStr(String(rgb.b));
    }
  };

  const onRgbChange = (channel: 'r' | 'g' | 'b', text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    const next = {
      r: channel === 'r' ? clean : rStr,
      g: channel === 'g' ? clean : gStr,
      b: channel === 'b' ? clean : bStr,
    };
    setRStr(next.r);
    setGStr(next.g);
    setBStr(next.b);
    const r = parseChannel(next.r);
    const g = parseChannel(next.g);
    const b = parseChannel(next.b);
    if (r !== null && g !== null && b !== null) {
      setHex(rgbToHex({ r, g, b }));
    }
  };

  const color = useMemo(() => {
    const r = parseChannel(rStr);
    const g = parseChannel(gStr);
    const b = parseChannel(bStr);
    if (r === null || g === null || b === null) return null;
    const rgb = { r, g, b };
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return {
      rgb,
      hex: rgbToHex(rgb),
      hsl: rgbToHsl(rgb),
      contrast: luminance > 150 ? '#4a2d46' : '#ffffff',
    };
  }, [rStr, gStr, bStr]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '色彩換算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>來玩顏色吧</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>HEX、RGB、HSL 一次看光光</Text>

        {color ? (
          <View style={[styles.previewCard, { backgroundColor: color.hex }]}>
            <Mascot expression="love" color={color.contrast} size={56} />
            <Text style={[styles.previewHex, { color: color.contrast }]}>{color.hex}</Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>輸入 HEX 或 RGB，顏色馬上現身</Text>
          </View>
        )}

        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>HEX</Text>
            <FocusInput
              style={[styles.hexInput, { color: theme.text }]}
              value={hex}
              onChangeText={onHexChange}
              placeholder="#FFB6C1"
              placeholderTextColor={theme.hint}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.inputRow}>
            {([
              ['R', rStr, 'r'],
              ['G', gStr, 'g'],
              ['B', bStr, 'b'],
            ] as const).map(([label, value, channel]) => (
              <View key={channel} style={styles.channelWrap}>
                <Text style={[styles.channelLabel, { color: theme.textMuted }]}>{label}</Text>
                <FocusInput
                  style={[styles.channelInput, { color: theme.text, backgroundColor: theme.inputBg }]}
                  value={value}
                  onChangeText={(t) => onRgbChange(channel, t)}
                  placeholder="0"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            ))}
          </View>
        </View>

        {color && (
          <View style={[styles.resultCard, { backgroundColor: PASTEL }]}>
            <Text style={[styles.resultTitle, { color: ACCENT }]}>三種寫法</Text>
            {[
              { key: 'HEX', value: color.hex },
              { key: 'RGB', value: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` },
              { key: 'HSL', value: `hsl(${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%)` },
            ].map((row) => (
              <View key={row.key} style={styles.resultRow}>
                <Text style={[styles.resultKey, { color: ACCENT }]}>{row.key}</Text>
                <Text style={[styles.resultValue, { color: ACCENT }]}>{row.value}</Text>
              </View>
            ))}
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
  previewCard: {
    borderRadius: 28,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  previewHex: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    letterSpacing: 1,
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
    gap: 10,
  },
  label: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    width: 56,
  },
  hexInput: {
    flex: 1,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    textAlign: 'right',
    padding: 0,
  },
  divider: {
    height: 1,
    marginHorizontal: 18,
  },
  channelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
  },
  channelInput: {
    flex: 1,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    textAlign: 'center',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  resultCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  resultTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 7,
  },
  resultKey: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    opacity: 0.75,
  },
  resultValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
  },
});
