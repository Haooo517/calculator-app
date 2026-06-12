import { Stack } from 'expo-router';
import { Plus, X } from 'phosphor-react-native';
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

type Row = { id: number; name: string; amount: string; unit: string };

// 小數最多 2 位、尾零去掉
const fmt = (n: number) => {
  if (!Number.isFinite(n)) return '—';
  return String(parseFloat(n.toFixed(2)));
};

export default function RecipeScaleCalculator() {
  const { theme } = useTheme();
  const [original, setOriginal] = useState('');
  const [target, setTarget] = useState('');
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: '中筋麵粉', amount: '200', unit: 'g' },
    { id: 2, name: '砂糖', amount: '80', unit: 'g' },
  ]);
  const [nextId, setNextId] = useState(3);

  const ratio = useMemo(() => {
    const o = parseFloat(original);
    const t = parseFloat(target);
    if (Number.isNaN(o) || Number.isNaN(t) || o <= 0 || t <= 0) return null;
    return t / o;
  }, [original, target]);

  const updateRow = (id: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    haptics.soft();
    setRows((prev) => [...prev, { id: nextId, name: '', amount: '', unit: 'g' }]);
    setNextId((n) => n + 1);
  };

  const removeRow = (id: number) => {
    haptics.soft();
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '食譜倍率' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>食譜放大縮小</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>份數一改，食材份量自動換算好</Text>

        <View style={[styles.inputCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>原食譜份數</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={original}
                onChangeText={setOriginal}
                placeholder="4"
                placeholderTextColor={theme.hint}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={[styles.unit, { color: theme.hint }]}>份</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.inputRow}>
            <Text style={[styles.label, { color: theme.text }]}>想做份數</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={target}
                onChangeText={setTarget}
                placeholder="6"
                placeholderTextColor={theme.hint}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={[styles.unit, { color: theme.hint }]}>份</Text>
            </View>
          </View>
        </View>

        {ratio !== null ? (
          <View style={[styles.ratioCard, { backgroundColor: COOK.bg }]}>
            <Mascot expression="happy" color={COOK.accent} size={56} />
            <Text style={[styles.ratioValue, { color: COOK.accent, marginTop: 10 }]}>{fmt(ratio)}×</Text>
            <Text style={[styles.ratioLabel, { color: COOK.accent }]}>所有食材都乘這個倍率</Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>
              填好兩個份數，倍率就出來囉
            </Text>
          </View>
        )}

        <View style={[styles.listCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.listTitle, { color: theme.text }]}>食材清單</Text>

          {rows.map((row) => {
            const amount = parseFloat(row.amount);
            const scaled =
              ratio !== null && !Number.isNaN(amount) && amount > 0 ? fmt(amount * ratio) : null;

            return (
              <View key={row.id} style={[styles.ingRow, { borderBottomColor: theme.divider }]}>
                <TextInput
                  style={[styles.ingName, { color: theme.text, backgroundColor: theme.inputBg }]}
                  value={row.name}
                  onChangeText={(v) => updateRow(row.id, { name: v })}
                  placeholder="食材名"
                  placeholderTextColor={theme.hint}
                  maxLength={12}
                />
                <TextInput
                  style={[styles.ingAmount, { color: theme.text, backgroundColor: theme.inputBg }]}
                  value={row.amount}
                  onChangeText={(v) => updateRow(row.id, { amount: v })}
                  placeholder="0"
                  placeholderTextColor={theme.hint}
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
                <TextInput
                  style={[styles.ingUnit, { color: theme.textMuted, backgroundColor: theme.inputBg }]}
                  value={row.unit}
                  onChangeText={(v) => updateRow(row.id, { unit: v })}
                  placeholder="g"
                  placeholderTextColor={theme.hint}
                  maxLength={4}
                />
                <Text
                  style={[styles.ingScaled, { color: scaled !== null ? COOK.accent : theme.hint }]}
                  numberOfLines={1}
                >
                  {scaled !== null ? `${scaled} ${row.unit}` : '—'}
                </Text>
                <TouchableOpacity
                  style={[styles.removeBtn, { backgroundColor: theme.inputBg }]}
                  onPress={() => removeRow(row.id)}
                  activeOpacity={0.7}
                >
                  <X size={14} color={theme.textMuted} weight="bold" />
                </TouchableOpacity>
              </View>
            );
          })}

          {rows.length === 0 && (
            <Text style={[styles.emptyText, { color: theme.hint }]}>清單空空的，加點食材吧</Text>
          )}

          <TouchableOpacity
            style={[styles.addBtn, { borderColor: COOK.accent }]}
            onPress={addRow}
            activeOpacity={0.7}
          >
            <Plus size={16} color={COOK.accent} weight="bold" />
            <Text style={[styles.addBtnText, { color: COOK.accent }]}>新增食材</Text>
          </TouchableOpacity>
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
    fontSize: 16,
    width: 110,
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
    minWidth: 70,
    padding: 0,
  },
  unit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 18,
  },
  ratioCard: {
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  ratioValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 60,
    letterSpacing: -2,
    lineHeight: 66,
  },
  ratioLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    marginTop: 4,
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
  listCard: {
    borderRadius: 24,
    padding: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  listTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
    marginBottom: 12,
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  ingName: {
    flex: 1,
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ingAmount: {
    width: 56,
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    textAlign: 'right',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  ingUnit: {
    width: 44,
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    textAlign: 'center',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  ingScaled: {
    minWidth: 58,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    textAlign: 'right',
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 14,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingVertical: 12,
    marginTop: 14,
  },
  addBtnText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
});
