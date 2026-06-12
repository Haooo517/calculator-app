import { Stack } from 'expo-router';
import { Check, Confetti, Minus, Plus } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { useTheme } from '../../lib/theme';
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

type TaiItem = { id: string; label: string; tai: number };
type Section = { title: string; items: TaiItem[] };

const SECTIONS: Section[] = [
  {
    title: '基本台',
    items: [
      { id: 'banker', label: '莊家', tai: 1 },
      { id: 'self-draw', label: '自摸', tai: 1 },
      { id: 'pure', label: '門清', tai: 1 },
      { id: 'kong-flower', label: '槓上開花', tai: 1 },
      { id: 'last-draw', label: '海底撈月', tai: 1 },
      { id: 'last-discard', label: '河底撈魚', tai: 1 },
      { id: 'rob-kong', label: '搶槓胡', tai: 1 },
    ],
  },
  {
    title: '牌型',
    items: [
      { id: 'pingu', label: '平胡', tai: 2 },
      { id: 'three-hidden', label: '三暗刻', tai: 2 },
      { id: 'pure-self', label: '門清自摸', tai: 3 },
      { id: 'all-pung', label: '碰碰胡', tai: 4 },
      { id: 'all-need', label: '全求人', tai: 4 },
      { id: 'half-color', label: '混一色', tai: 4 },
      { id: 'four-hidden', label: '四暗刻', tai: 5 },
      { id: 'pure-color', label: '清一色', tai: 8 },
      { id: 'all-honors', label: '字一色', tai: 8 },
      { id: 'five-hidden', label: '五暗刻', tai: 8 },
    ],
  },
  {
    title: '特殊',
    items: [
      { id: 'small-three', label: '小三元', tai: 4 },
      { id: 'big-three', label: '大三元', tai: 8 },
      { id: 'small-four', label: '小四喜', tai: 8 },
      { id: 'seven-rob', label: '七搶一', tai: 8 },
      { id: 'eight-immortals', label: '八仙過海', tai: 8 },
      { id: 'earth-han', label: '地胡', tai: 16 },
      { id: 'big-four', label: '大四喜', tai: 16 },
      { id: 'heaven-han', label: '天胡', tai: 24 },
    ],
  },
];

export default function MahjongCalculator() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [chain, setChain] = useState(0);
  const [flowers, setFlowers] = useState(0);
  const [basePerTai, setBasePerTai] = useState('10');

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalTai = useMemo(() => {
    let total = 0;
    SECTIONS.forEach((s) =>
      s.items.forEach((i) => {
        if (selected.has(i.id)) total += i.tai;
      })
    );
    return total + chain + flowers;
  }, [selected, chain, flowers]);

  const base = Math.max(0, parseFloat(basePerTai) || 0);
  const points = totalTai * base;

  const reset = () => {
    setSelected(new Set());
    setChain(0);
    setFlowers(0);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title: '麻將台數',
          headerRight: () => (
            <TouchableOpacity onPress={reset} style={{ paddingHorizontal: 8 }}>
              <Text style={{ fontFamily: 'Fredoka_600SemiBold', color: '#6a3da8', fontSize: 14 }}>清空</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>麻將台數</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>勾選達成的台，自動加總</Text>

        <View style={styles.totalCard}>
          <View style={styles.totalIconWrap}>
            <Confetti size={28} color="#6a3da8" weight="fill" />
          </View>
          <Text style={styles.totalLabel}>共計</Text>
          <Text style={styles.totalValue}>
            {totalTai}
            <Text style={styles.totalUnit}> 台</Text>
          </Text>
          {base > 0 && totalTai > 0 && (
            <Text style={styles.totalPoints}>${points.toLocaleString()} 元</Text>
          )}
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
            <View style={[styles.itemList, { backgroundColor: theme.cardBg }]}>
              {section.items.map((item) => {
                const active = selected.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemRow, active && styles.itemRowActive]}
                    onPress={() => toggle(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkBox, active && styles.checkBoxActive]}>
                      {active && <Check size={14} color="#fff" weight="bold" />}
                    </View>
                    <Text style={[styles.itemLabel, { color: theme.text }, active && styles.itemLabelActive]}>
                      {item.label}
                    </Text>
                    <View style={[styles.taiBadge, { backgroundColor: theme.divider }, active && styles.taiBadgeActive]}>
                      <Text style={[styles.taiText, { color: theme.textMuted }, active && styles.taiTextActive]}>
                        {item.tai} 台
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>連莊 / 花牌</Text>
          {[
            { label: '連莊次數', value: chain, set: setChain, max: 20, hint: '每連 1 莊加 1 台' },
            { label: '花牌數量', value: flowers, set: setFlowers, max: 8, hint: '每朵相應花 1 台' },
          ].map((s) => (
            <View key={s.label} style={[styles.stepperCard, { backgroundColor: theme.cardBg }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepperLabel, { color: theme.text }]}>{s.label}</Text>
                <Text style={[styles.stepperHint, { color: theme.textMuted }]}>{s.hint}</Text>
              </View>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={[styles.stepBtn, s.value <= 0 && styles.stepBtnDisabled]}
                  onPress={() => s.set(Math.max(0, s.value - 1))}
                  activeOpacity={0.7}
                  disabled={s.value <= 0}
                >
                  <Minus size={18} color="#6a3da8" weight="bold" />
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: theme.text }]}>{s.value}</Text>
                <TouchableOpacity
                  style={[styles.stepBtn, s.value >= s.max && styles.stepBtnDisabled]}
                  onPress={() => s.set(Math.min(s.max, s.value + 1))}
                  activeOpacity={0.7}
                  disabled={s.value >= s.max}
                >
                  <Plus size={18} color="#6a3da8" weight="bold" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>每台底注（選填）</Text>
          <View style={[styles.baseCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.basePrefix, { color: theme.hint }]}>$</Text>
            <TextInput
              style={[styles.baseInput, { color: theme.text }]}
              value={basePerTai}
              onChangeText={setBasePerTai}
              placeholder="10"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={6}
            />
            <Text style={[styles.baseSuffix, { color: theme.hint }]}>/ 台</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  hint: '#a3897a',
  accentBg: '#d4baf0', accent: '#6a3da8',
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 32, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontFamily: 'Fredoka_400Regular', fontSize: 14, marginBottom: 22, textAlign: 'center' },
  totalCard: {
    backgroundColor: C.accentBg, borderRadius: 28, padding: 24, alignItems: 'center', marginBottom: 18,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  totalIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  totalLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 13, color: C.accent, opacity: 0.8 },
  totalValue: { fontFamily: 'Fredoka_700Bold', fontSize: 56, color: C.accent, letterSpacing: -2, lineHeight: 60 },
  totalUnit: { fontSize: 22 },
  totalPoints: { fontFamily: 'Fredoka_600SemiBold', fontSize: 18, color: C.accent, opacity: 0.85, marginTop: 6 },
  section: { marginBottom: 18 },
  sectionTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 15, marginBottom: 10, marginLeft: 4 },
  itemList: {
    borderRadius: 20, padding: 4,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, gap: 12,
  },
  itemRowActive: { backgroundColor: '#f7eeff' },
  checkBox: {
    width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: '#d8c5e8',
    alignItems: 'center', justifyContent: 'center',
  },
  checkBoxActive: { backgroundColor: C.accent, borderColor: C.accent },
  itemLabel: { flex: 1, fontFamily: 'Fredoka_500Medium', fontSize: 15 },
  itemLabelActive: { fontFamily: 'Fredoka_700Bold', color: C.accent },
  taiBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  taiBadgeActive: { backgroundColor: C.accent },
  taiText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 12 },
  taiTextActive: { color: '#fff' },
  stepperCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 20,
    padding: 14, marginBottom: 8, gap: 10,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  stepperLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15 },
  stepperHint: { fontFamily: 'Fredoka_400Regular', fontSize: 11, marginTop: 2 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: C.accentBg,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.35 },
  stepperValue: {
    fontFamily: 'Fredoka_700Bold', fontSize: 20, width: 30, textAlign: 'center',
  },
  baseCard: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center',
    borderRadius: 20, padding: 16, gap: 6,
    shadowColor: C.hint, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  basePrefix: { fontFamily: 'Fredoka_500Medium', fontSize: 18 },
  baseInput: { fontFamily: 'Fredoka_700Bold', fontSize: 28, textAlign: 'center', minWidth: 70, padding: 0 },
  baseSuffix: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
});
