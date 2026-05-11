import { Stack } from 'expo-router';
import { Minus, Plus, Receipt } from 'phosphor-react-native';
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

const TIP_PERCENTS = [10, 15, 18, 20];
const MIN_PEOPLE = 1;
const MAX_PEOPLE = 20;

const formatMoney = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function TipCalculator() {
  const [amount, setAmount] = useState('');
  const [tipPercent, setTipPercent] = useState(15);
  const [customPercent, setCustomPercent] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [people, setPeople] = useState(1);

  const activePercent = useCustom ? parseFloat(customPercent) || 0 : tipPercent;

  const result = useMemo(() => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return null;
    const tip = a * (activePercent / 100);
    const total = a + tip;
    const perPerson = total / people;
    return { tip, total, perPerson };
  }, [amount, activePercent, people]);

  const adjustPeople = (delta: number) => {
    setPeople((p) => Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, p + delta)));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff8ed' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '小費計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>來算小費吧</Text>
        <Text style={styles.subtitle}>輸入金額，挑個比例，AA 也算給你</Text>

        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Text style={styles.label}>消費金額</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="#c8b8a8"
                keyboardType="decimal-pad"
                maxLength={9}
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>小費比例</Text>
        <View style={styles.percentGrid}>
          {TIP_PERCENTS.map((p) => {
            const active = !useCustom && tipPercent === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.percentBtn, active && styles.percentBtnActive]}
                onPress={() => {
                  setUseCustom(false);
                  setTipPercent(p);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.percentText, active && styles.percentTextActive]}>{p}%</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[styles.percentBtn, styles.percentBtnCustom, useCustom && styles.percentBtnActive]}
            onPress={() => setUseCustom(true)}
            activeOpacity={0.75}
          >
            {useCustom ? (
              <View style={styles.customInputWrap}>
                <TextInput
                  style={[styles.percentText, styles.percentTextActive, styles.customInput]}
                  value={customPercent}
                  onChangeText={setCustomPercent}
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="decimal-pad"
                  maxLength={4}
                  autoFocus
                />
                <Text style={[styles.percentText, styles.percentTextActive]}>%</Text>
              </View>
            ) : (
              <Text style={styles.percentText}>自訂</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>分帳人數</Text>
        <View style={styles.peopleCard}>
          <TouchableOpacity
            style={[styles.stepBtn, people <= MIN_PEOPLE && styles.stepBtnDisabled]}
            onPress={() => adjustPeople(-1)}
            activeOpacity={0.7}
            disabled={people <= MIN_PEOPLE}
          >
            <Minus size={20} color="#8d6e00" weight="bold" />
          </TouchableOpacity>
          <View style={styles.peopleCenter}>
            <Text style={styles.peopleCount}>{people}</Text>
            <Text style={styles.peopleLabel}>人</Text>
          </View>
          <TouchableOpacity
            style={[styles.stepBtn, people >= MAX_PEOPLE && styles.stepBtnDisabled]}
            onPress={() => adjustPeople(1)}
            activeOpacity={0.7}
            disabled={people >= MAX_PEOPLE}
          >
            <Plus size={20} color="#8d6e00" weight="bold" />
          </TouchableOpacity>
        </View>

        {result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultIconWrap}>
              <Receipt size={32} color="#8d6e00" weight="fill" />
            </View>

            <View style={styles.resultMain}>
              <Text style={styles.resultMainLabel}>每人</Text>
              <Text style={styles.resultMainValue}>
                <Text style={styles.resultDollar}>$</Text>
                {formatMoney(result.perPerson)}
              </Text>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>小費</Text>
              <Text style={styles.resultRowValue}>${formatMoney(result.tip)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>總計</Text>
              <Text style={styles.resultRowValue}>${formatMoney(result.total)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Receipt size={32} color="#c8b8a8" weight="duotone" />
            <Text style={styles.placeholderText}>輸入金額就會出現結果</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const C = {
  bg: '#fff8ed',
  card: '#fff',
  text: '#2d2520',
  muted: '#8a7a6c',
  hint: '#a3897a',
  divider: '#f1e3d0',
  accentBg: '#ffe082',
  accent: '#8d6e00',
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    color: C.muted,
    marginBottom: 24,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  label: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    color: C.text,
    width: 80,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 4,
  },
  currencyPrefix: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 22,
    color: C.hint,
  },
  input: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    color: C.text,
    textAlign: 'right',
    minWidth: 100,
    padding: 0,
  },
  sectionLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    color: C.muted,
    marginLeft: 8,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  percentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  percentBtn: {
    flex: 1,
    minWidth: '18%',
    paddingVertical: 14,
    backgroundColor: C.card,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  percentBtnCustom: {
    flexBasis: '100%',
    flex: undefined,
  },
  percentBtnActive: {
    backgroundColor: C.accent,
  },
  percentText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    color: C.text,
  },
  percentTextActive: {
    color: '#fff',
  },
  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  customInput: {
    minWidth: 40,
    textAlign: 'center',
    padding: 0,
  },
  peopleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 24,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  peopleCenter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  peopleCount: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    color: C.text,
  },
  peopleLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 15,
    color: C.muted,
  },
  resultCard: {
    backgroundColor: C.accentBg,
    borderRadius: 28,
    padding: 24,
    shadowColor: C.hint,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  resultIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  resultMain: {
    marginBottom: 18,
  },
  resultMainLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: C.accent,
    opacity: 0.8,
    marginBottom: 2,
  },
  resultMainValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 56,
    color: C.accent,
    letterSpacing: -2,
    lineHeight: 60,
  },
  resultDollar: {
    fontSize: 32,
  },
  resultDivider: {
    height: 1,
    backgroundColor: 'rgba(141, 110, 0, 0.15)',
    marginBottom: 14,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  resultRowLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 15,
    color: C.accent,
    opacity: 0.85,
  },
  resultRowValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: C.accent,
  },
  placeholderCard: {
    backgroundColor: C.card,
    borderRadius: 28,
    padding: 36,
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
