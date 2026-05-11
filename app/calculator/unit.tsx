import { Stack } from 'expo-router';
import { Ruler, Scales, Thermometer } from 'phosphor-react-native';
import { ComponentType, useMemo, useState } from 'react';
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

type Unit = { id: string; label: string };

type UnitGroup = {
  id: string;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string; weight?: any }>;
  units: Unit[];
  convert: (val: number, from: string, to: string) => number;
};

const LENGTH_FACTORS: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000,
  in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
};
const WEIGHT_FACTORS: Record<string, number> = {
  mg: 0.001, g: 1, kg: 1000, t: 1000000,
  oz: 28.3495, lb: 453.592,
};

const factorConvert = (factors: Record<string, number>) =>
  (val: number, from: string, to: string) => (val * factors[from]) / factors[to];

const tempConvert = (val: number, from: string, to: string) => {
  let c: number;
  if (from === 'C') c = val;
  else if (from === 'F') c = ((val - 32) * 5) / 9;
  else c = val - 273.15;
  if (to === 'C') return c;
  if (to === 'F') return (c * 9) / 5 + 32;
  return c + 273.15;
};

const GROUPS: UnitGroup[] = [
  {
    id: 'length',
    label: '長度',
    Icon: Ruler,
    units: [
      { id: 'mm', label: 'mm' }, { id: 'cm', label: 'cm' }, { id: 'm', label: 'm' }, { id: 'km', label: 'km' },
      { id: 'in', label: 'in' }, { id: 'ft', label: 'ft' }, { id: 'yd', label: 'yd' }, { id: 'mi', label: 'mi' },
    ],
    convert: factorConvert(LENGTH_FACTORS),
  },
  {
    id: 'weight',
    label: '重量',
    Icon: Scales,
    units: [
      { id: 'mg', label: 'mg' }, { id: 'g', label: 'g' }, { id: 'kg', label: 'kg' }, { id: 't', label: 't' },
      { id: 'oz', label: 'oz' }, { id: 'lb', label: 'lb' },
    ],
    convert: factorConvert(WEIGHT_FACTORS),
  },
  {
    id: 'temp',
    label: '溫度',
    Icon: Thermometer,
    units: [
      { id: 'C', label: '°C' }, { id: 'F', label: '°F' }, { id: 'K', label: 'K' },
    ],
    convert: tempConvert,
  },
];

const formatNum = (n: number) => {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 0.0001 || abs >= 1e9)) return n.toExponential(3);
  const rounded = Number(n.toPrecision(6));
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 6 });
};

export default function UnitCalculator() {
  const [groupId, setGroupId] = useState(GROUPS[0].id);
  const [fromUnit, setFromUnit] = useState(GROUPS[0].units[1].id);
  const [value, setValue] = useState('');

  const group = GROUPS.find((g) => g.id === groupId)!;

  const conversions = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v)) return null;
    return group.units
      .filter((u) => u.id !== fromUnit)
      .map((u) => ({ unit: u, result: group.convert(v, fromUnit, u.id) }));
  }, [value, fromUnit, group]);

  const switchGroup = (g: UnitGroup) => {
    setGroupId(g.id);
    setFromUnit(g.units[1]?.id ?? g.units[0].id);
    setValue('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff8ed' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '單位換算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>單位換算</Text>
        <Text style={styles.subtitle}>選類型、選單位、輸入數值</Text>

        <View style={styles.groupRow}>
          {GROUPS.map((g) => {
            const active = g.id === groupId;
            const Icon = g.Icon;
            return (
              <TouchableOpacity
                key={g.id}
                style={[styles.groupBtn, active && styles.groupBtnActive]}
                onPress={() => switchGroup(g)}
                activeOpacity={0.75}
              >
                <Icon size={22} color={active ? '#fff' : '#2d8765'} weight={active ? 'fill' : 'regular'} />
                <Text style={[styles.groupText, active && styles.groupTextActive]}>{g.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder="0"
            placeholderTextColor="#c8b8a8"
            keyboardType="decimal-pad"
            maxLength={12}
          />
          <Text style={styles.inputUnit}>{group.units.find((u) => u.id === fromUnit)?.label}</Text>
        </View>

        <Text style={styles.unitSelectorLabel}>從</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.unitPills}
        >
          {group.units.map((u) => {
            const active = u.id === fromUnit;
            return (
              <TouchableOpacity
                key={u.id}
                style={[styles.unitPill, active && styles.unitPillActive]}
                onPress={() => setFromUnit(u.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.unitPillText, active && styles.unitPillTextActive]}>{u.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {conversions ? (
          <View style={styles.resultList}>
            {conversions.map(({ unit, result }) => (
              <View key={unit.id} style={styles.resultRow}>
                <Text style={styles.resultUnit}>{unit.label}</Text>
                <Text style={styles.resultValue}>{formatNum(result)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <group.Icon size={32} color="#c8b8a8" weight="duotone" />
            <Text style={styles.placeholderText}>輸入數字看換算結果</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  card: '#fff',
  text: '#2d2520',
  muted: '#8a7a6c',
  hint: '#a3897a',
  divider: '#f1e3d0',
  accentBg: '#b8e6d2',
  accent: '#2d8765',
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    color: C.muted,
    marginBottom: 22,
    textAlign: 'center',
  },
  groupRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  groupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.card,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  groupBtnActive: {
    backgroundColor: C.accent,
  },
  groupText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: C.text,
  },
  groupTextActive: {
    color: '#fff',
  },
  inputCard: {
    backgroundColor: C.accentBg,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 18,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 40,
    color: C.accent,
    letterSpacing: -1,
    flex: 1,
    padding: 0,
  },
  inputUnit: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 22,
    color: C.accent,
    opacity: 0.7,
    marginLeft: 12,
  },
  unitSelectorLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 12,
    color: C.muted,
    marginLeft: 8,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  unitPills: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
    paddingRight: 8,
  },
  unitPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.card,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  unitPillActive: {
    backgroundColor: C.accent,
  },
  unitPillText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: C.text,
  },
  unitPillTextActive: {
    color: '#fff',
  },
  resultList: {
    backgroundColor: C.card,
    borderRadius: 24,
    marginTop: 18,
    padding: 4,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  resultUnit: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: C.muted,
  },
  resultValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: C.text,
    letterSpacing: -0.5,
  },
  placeholderCard: {
    backgroundColor: C.card,
    borderRadius: 28,
    padding: 36,
    marginTop: 18,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: C.divider,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: C.hint,
  },
});
