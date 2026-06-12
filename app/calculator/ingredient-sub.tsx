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

type SubPart = { name: string; ratio: number };
type Plan = { parts: SubPart[]; extra?: string };
type Substitution = {
  id: string;
  from: string;
  plans: Plan[];
  note: string;
};

const SUBS: Substitution[] = [
  {
    id: 'butter',
    from: '無鹽奶油',
    plans: [{ parts: [{ name: '植物油', ratio: 0.8 }] }, { parts: [{ name: '椰子油', ratio: 1 }] }],
    note: '用油的成品口感較濕潤，椰子油會帶淡淡椰香',
  },
  {
    id: 'sugar',
    from: '白砂糖',
    plans: [{ parts: [{ name: '蜂蜜', ratio: 0.75 }] }],
    note: '蜂蜜是液體，食譜裡其他液體記得略減',
  },
  {
    id: 'cream',
    from: '鮮奶油',
    plans: [
      {
        parts: [
          { name: '全脂牛奶', ratio: 0.75 },
          { name: '奶油', ratio: 0.25 },
        ],
      },
    ],
    note: '適合烹調使用，要打發的話就不行囉',
  },
  {
    id: 'baking-powder',
    from: '泡打粉',
    plans: [
      {
        parts: [
          { name: '小蘇打', ratio: 0.33 },
          { name: '塔塔粉', ratio: 0.67 },
        ],
      },
    ],
    note: '混合後盡快使用，放久膨脹力會消失',
  },
  {
    id: 'cake-flour',
    from: '低筋麵粉',
    plans: [
      {
        parts: [
          { name: '中筋麵粉', ratio: 0.86 },
          { name: '玉米澱粉', ratio: 0.14 },
        ],
      },
    ],
    note: '兩者過篩混勻，口感會更接近低筋',
  },
  {
    id: 'buttermilk',
    from: '白脫牛奶',
    plans: [{ parts: [{ name: '牛奶', ratio: 1 }], extra: '檸檬汁少許' }],
    note: '混合後靜置 5 分鐘再使用',
  },
  {
    id: 'sour-cream',
    from: '酸奶油',
    plans: [{ parts: [{ name: '無糖優格', ratio: 1 }] }],
    note: '選濃稠的希臘式優格最接近',
  },
  {
    id: 'fish-sauce',
    from: '魚露',
    plans: [{ parts: [{ name: '醬油', ratio: 1 }] }],
    note: '風味略有不同，鹹度記得先試一下',
  },
];

// 小數最多 2 位、尾零去掉
const fmt = (n: number) => {
  if (!Number.isFinite(n)) return '—';
  return String(parseFloat(n.toFixed(2)));
};

export default function IngredientSubCalculator() {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState('100');

  const selected = useMemo(() => SUBS.find((s) => s.id === selectedId) ?? null, [selectedId]);

  const amountNum = useMemo(() => {
    const v = parseFloat(amount);
    if (Number.isNaN(v) || v <= 0) return null;
    return v;
  }, [amount]);

  const pick = (id: string) => {
    haptics.light();
    setSelectedId(id);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '食材替換' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>食材臨時替換</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>家裡缺料？歐古幫你找替身</Text>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>缺什麼食材？</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          {SUBS.map((s) => {
            const active = s.id === selectedId;
            return (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.chip,
                  active
                    ? { backgroundColor: COOK.accent, borderColor: COOK.accent }
                    : { backgroundColor: theme.cardBg, borderColor: theme.divider },
                ]}
                onPress={() => pick(s.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : theme.text }]}>{s.from}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.amountCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.amountLabel, { color: theme.text }]}>食譜需要</Text>
          <View style={styles.amountWrap}>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="100"
              placeholderTextColor={theme.hint}
              keyboardType="decimal-pad"
              maxLength={6}
            />
            <Text style={[styles.amountUnit, { color: theme.hint }]}>g</Text>
          </View>
        </View>

        {selected ? (
          <View style={[styles.planCard, { backgroundColor: COOK.bg }]}>
            <View style={styles.planHead}>
              <Mascot
                expression={amountNum !== null ? 'happy' : 'thinking'}
                color={COOK.accent}
                size={56}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.planFrom, { color: COOK.accent }]}>{selected.from}</Text>
                <Text style={[styles.planSub, { color: COOK.accent }]}>可以這樣換</Text>
              </View>
            </View>

            {selected.plans.map((plan, pi) => (
              <View key={pi}>
                {pi > 0 && (
                  <View style={styles.orRow}>
                    <View style={[styles.orLine, { backgroundColor: 'rgba(168,68,58,0.25)' }]} />
                    <Text style={[styles.orText, { color: COOK.accent }]}>或</Text>
                    <View style={[styles.orLine, { backgroundColor: 'rgba(168,68,58,0.25)' }]} />
                  </View>
                )}
                <View style={styles.planBox}>
                  {plan.parts.map((part) => (
                    <View key={part.name} style={styles.partRow}>
                      <Text style={[styles.partName, { color: COOK.accent }]}>{part.name}</Text>
                      <Text style={[styles.partRatio, { color: COOK.accent }]}>×{fmt(part.ratio)}</Text>
                      <Text style={[styles.partAmount, { color: COOK.accent }]}>
                        {amountNum !== null ? `${fmt(amountNum * part.ratio)} g` : '—'}
                      </Text>
                    </View>
                  ))}
                  {plan.extra !== undefined && (
                    <View style={styles.partRow}>
                      <Text style={[styles.partName, { color: COOK.accent }]}>{plan.extra}</Text>
                      <Text style={[styles.partRatio, { color: COOK.accent }]}>＋</Text>
                      <Text style={[styles.partAmount, { color: COOK.accent, opacity: 0.7 }]}>適量</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            <Text style={[styles.planNote, { color: COOK.accent }]}>小叮嚀：{selected.note}</Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>
              點上面的食材，替代方案馬上出現
            </Text>
          </View>
        )}

        <View style={[styles.refCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.refTitle, { color: theme.text }]}>替換速查表</Text>
          {SUBS.map((s) => (
            <View key={s.id} style={styles.refRow}>
              <View style={[styles.refDot, { backgroundColor: COOK.accent }]} />
              <Text style={[styles.refFrom, { color: theme.text }]}>{s.from}</Text>
              <Text style={[styles.refTo, { color: theme.textMuted }]} numberOfLines={1}>
                {s.plans
                  .map((p) =>
                    [...p.parts.map((part) => `${part.name} ×${fmt(part.ratio)}`), ...(p.extra !== undefined ? [p.extra] : [])].join(' + ')
                  )
                  .join(' 或 ')}
              </Text>
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
    marginBottom: 22,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 4,
    paddingRight: 8,
  },
  chip: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 14,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  amountLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  amountInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    textAlign: 'right',
    minWidth: 64,
    padding: 0,
  },
  amountUnit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 15,
  },
  planCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  planHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  planFrom: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  planSub: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    opacity: 0.8,
    marginTop: 2,
  },
  planBox: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  partName: {
    flex: 1,
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
  },
  partRatio: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    opacity: 0.8,
  },
  partAmount: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    minWidth: 70,
    textAlign: 'right',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
  },
  planNote: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    marginTop: 14,
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
    textAlign: 'center',
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
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 10,
  },
  refDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  refFrom: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    width: 76,
  },
  refTo: {
    flex: 1,
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12.5,
  },
});
