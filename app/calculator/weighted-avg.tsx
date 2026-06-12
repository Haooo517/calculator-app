import { Stack } from 'expo-router';
import { Plus, Trash } from 'phosphor-react-native';
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
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useTheme } from '../../lib/theme';

const EDU_BG = '#e0c890';
const EDU_FG = '#786020';

type ItemRow = {
  id: number;
  name: string;
  score: string;
  weight: string;
};

const classify = (avg: number): { expression: MascotExpression; tip: string } => {
  if (avg >= 90) return { expression: 'excited', tip: '太猛了，幾乎滿分！' };
  if (avg >= 80) return { expression: 'happy', tip: '很棒的成績，繼續保持～' };
  if (avg >= 60) return { expression: 'default', tip: '安全過關，穩住！' };
  return { expression: 'cry', tip: '嗚嗚…下次一起加油' };
};

const formatWeight = (n: number) => {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

let nextId = 4;

export default function WeightedAvgCalculator() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<ItemRow[]>([
    { id: 1, name: '期中考', score: '', weight: '30' },
    { id: 2, name: '期末考', score: '', weight: '40' },
    { id: 3, name: '平時', score: '', weight: '30' },
  ]);

  const updateRow = (id: number, patch: Partial<ItemRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    haptics.soft();
    setRows((prev) => [...prev, { id: nextId++, name: '', score: '', weight: '' }]);
  };

  const removeRow = (id: number) => {
    haptics.soft();
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const result = useMemo(() => {
    let weightedSum = 0;
    let weightSum = 0;
    for (const row of rows) {
      const s = parseFloat(row.score);
      const w = parseFloat(row.weight);
      if (isNaN(s) || s < 0 || s > 100 || isNaN(w) || w <= 0) continue;
      weightedSum += s * w;
      weightSum += w;
    }
    if (weightSum <= 0) return null;
    return { avg: weightedSum / weightSum, weightSum };
  }, [rows]);

  const status = result ? classify(result.avg) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '加權平均' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>加權平均</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>填上分數和權重，即時算出平均</Text>

        <View style={styles.rowList}>
          {rows.map((row, idx) => (
            <View key={row.id} style={[styles.itemCard, { backgroundColor: theme.cardBg }]}>
              <View style={styles.itemHead}>
                <TextInput
                  style={[styles.nameInput, { color: theme.text, backgroundColor: theme.inputBg }]}
                  value={row.name}
                  onChangeText={(t) => updateRow(row.id, { name: t })}
                  placeholder={`項目 ${idx + 1}（選填）`}
                  placeholderTextColor={theme.hint}
                  maxLength={20}
                />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeRow(row.id)}
                  activeOpacity={0.7}
                >
                  <Trash size={18} color="#c2456a" weight="bold" />
                </TouchableOpacity>
              </View>

              <View style={styles.itemBody}>
                <View style={[styles.fieldWrap, { backgroundColor: theme.inputBg }]}>
                  <TextInput
                    style={[styles.fieldInput, { color: theme.text }]}
                    value={row.score}
                    onChangeText={(t) => updateRow(row.id, { score: t })}
                    placeholder="85"
                    placeholderTextColor={theme.hint}
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />
                  <Text style={[styles.fieldUnit, { color: theme.hint }]}>分</Text>
                </View>

                <View style={[styles.fieldWrap, { backgroundColor: theme.inputBg }]}>
                  <TextInput
                    style={[styles.fieldInput, { color: theme.text }]}
                    value={row.weight}
                    onChangeText={(t) => updateRow(row.id, { weight: t })}
                    placeholder="30"
                    placeholderTextColor={theme.hint}
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />
                  <Text style={[styles.fieldUnit, { color: theme.hint }]}>%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { borderColor: EDU_FG }]}
          onPress={addRow}
          activeOpacity={0.7}
        >
          <Plus size={18} color={EDU_FG} weight="bold" />
          <Text style={[styles.addBtnText, { color: EDU_FG }]}>新增項目</Text>
        </TouchableOpacity>

        {result && status ? (
          <View style={styles.resultCard}>
            <Mascot expression={status.expression} color={EDU_FG} size={56} />
            <Text style={styles.resultValue}>{result.avg.toFixed(1)}</Text>
            <Text style={styles.resultLabel}>加權平均分</Text>
            <Text style={styles.resultSub}>{status.tip}</Text>
            {Math.abs(result.weightSum - 100) > 0.001 && (
              <View style={styles.weightHint}>
                <Text style={styles.weightHintText}>
                  目前權重加總 {formatWeight(result.weightSum)}%（仍按比例計算）
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>
              填上分數和權重就會即時計算
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  rowList: { gap: 10, marginBottom: 12 },
  itemCard: {
    borderRadius: 20,
    padding: 14,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  nameInput: {
    flex: 1,
    fontFamily: 'Fredoka_500Medium',
    fontSize: 15,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ffc4d422',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fieldInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    textAlign: 'right',
    minWidth: 44,
    padding: 0,
  },
  fieldUnit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingVertical: 12,
    marginBottom: 16,
  },
  addBtnText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
  },
  resultCard: {
    backgroundColor: EDU_BG,
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
    fontSize: 64,
    color: EDU_FG,
    letterSpacing: -2,
    lineHeight: 70,
    marginTop: 10,
  },
  resultLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    color: EDU_FG,
    marginTop: 2,
  },
  resultSub: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    color: EDU_FG,
    marginTop: 8,
    opacity: 0.85,
  },
  weightHint: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  weightHintText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    color: EDU_FG,
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
    textAlign: 'center',
  },
});
