import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Status = {
  label: string;
  emoji: string;
  bg: string;
  fg: string;
  tip: string;
};

const classify = (bmi: number): Status => {
  if (bmi < 18.5) return { label: '體重過輕', emoji: '🍞', bg: '#b8d8ff', fg: '#2c5fa8', tip: '多吃點，加油！' };
  if (bmi < 24) return { label: '健康體重', emoji: '✨', bg: '#b8e6d2', fg: '#2d8765', tip: '保持下去，超棒的！' };
  if (bmi < 27) return { label: '體重過重', emoji: '🌿', bg: '#ffe082', fg: '#8d6e00', tip: '稍微運動一下吧～' };
  if (bmi < 30) return { label: '輕度肥胖', emoji: '🍂', bg: '#ffd4ba', fg: '#c4623a', tip: '可以開始注意飲食' };
  if (bmi < 35) return { label: '中度肥胖', emoji: '🌸', bg: '#ffc4d4', fg: '#c2456a', tip: '建議調整生活習慣' };
  return { label: '重度肥胖', emoji: '🌺', bg: '#d4baf0', fg: '#6a3da8', tip: '建議諮詢專業醫師' };
};

export default function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const bmi = useMemo(() => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    return w / (h * h);
  }, [height, weight]);

  const status = bmi ? classify(bmi) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff8ed' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'BMI 計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>來算 BMI 吧</Text>
        <Text style={styles.subtitle}>輸入身高體重，馬上知道結果 ✨</Text>

        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Text style={styles.label}>身高</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="170"
                placeholderTextColor="#c8b8a8"
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.unit}>cm</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Text style={styles.label}>體重</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="60"
                placeholderTextColor="#c8b8a8"
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.unit}>kg</Text>
            </View>
          </View>
        </View>

        {status && bmi !== null ? (
          <View style={[styles.resultCard, { backgroundColor: status.bg }]}>
            <Text style={[styles.resultEmoji]}>{status.emoji}</Text>
            <Text style={[styles.resultBmi, { color: status.fg }]}>{bmi.toFixed(1)}</Text>
            <Text style={[styles.resultLabel, { color: status.fg }]}>{status.label}</Text>
            <Text style={[styles.resultTip, { color: status.fg }]}>{status.tip}</Text>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderEmoji}>📊</Text>
            <Text style={styles.placeholderText}>填好上面兩格就會出現結果</Text>
          </View>
        )}

        <View style={styles.refCard}>
          <Text style={styles.refTitle}>BMI 對照表</Text>
          {[
            { range: '< 18.5', label: '體重過輕', color: '#2c5fa8' },
            { range: '18.5 – 24', label: '健康體重', color: '#2d8765' },
            { range: '24 – 27', label: '體重過重', color: '#8d6e00' },
            { range: '27 – 30', label: '輕度肥胖', color: '#c4623a' },
            { range: '30 – 35', label: '中度肥胖', color: '#c2456a' },
            { range: '≥ 35', label: '重度肥胖', color: '#6a3da8' },
          ].map((r) => (
            <View key={r.range} style={styles.refRow}>
              <View style={[styles.refDot, { backgroundColor: r.color }]} />
              <Text style={styles.refRange}>{r.range}</Text>
              <Text style={styles.refLabel}>{r.label}</Text>
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
    color: '#2d2520',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    color: '#8a7a6c',
    marginBottom: 24,
  },
  inputCard: {
    backgroundColor: '#fff',
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
    color: '#2d2520',
    width: 56,
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
    color: '#2d2520',
    textAlign: 'right',
    minWidth: 80,
    padding: 0,
  },
  unit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 16,
    color: '#a3897a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1e3d0',
    marginHorizontal: 18,
  },
  resultCard: {
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  resultEmoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  resultBmi: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 72,
    letterSpacing: -3,
    lineHeight: 76,
  },
  resultLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 22,
    marginTop: 4,
  },
  resultTip: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.85,
  },
  placeholderCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f1e3d0',
    borderStyle: 'dashed',
  },
  placeholderEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  placeholderText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: '#a3897a',
  },
  refCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  refTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
    color: '#2d2520',
    marginBottom: 12,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  refDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  refRange: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: '#2d2520',
    width: 90,
  },
  refLabel: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 14,
    color: '#8a7a6c',
  },
});
