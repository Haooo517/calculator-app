import { Stack } from 'expo-router';
import { Plus, Trash } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FocusInput } from '../../components/FocusInput';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useTheme } from '../../lib/theme';

const EDU_BG = '#e0c890';
const EDU_FG = '#786020';

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'] as const;
type Grade = (typeof GRADES)[number];
type Scale = '4.0' | '4.3';

const POINTS: Record<Scale, Record<Grade, number>> = {
  '4.3': { 'A+': 4.3, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0 },
  '4.0': { 'A+': 4.0, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0 },
};

type CourseRow = {
  id: number;
  name: string;
  credits: string;
  grade: Grade | null;
};

const classify = (gpa: number): { expression: MascotExpression; tip: string } => {
  if (gpa >= 3.7) return { expression: 'excited', tip: '學霸等級，太強啦！' };
  if (gpa >= 3.0) return { expression: 'happy', tip: '表現很不錯，繼續保持～' };
  if (gpa >= 2.0) return { expression: 'default', tip: '穩穩的，再加把勁！' };
  return { expression: 'sad', tip: '沒關係，下學期再衝一波' };
};

let nextId = 3;

export default function GPACalculator() {
  const { theme } = useTheme();
  const [scale, setScale] = useState<Scale>('4.0');
  const [rows, setRows] = useState<CourseRow[]>([
    { id: 1, name: '', credits: '', grade: null },
    { id: 2, name: '', credits: '', grade: null },
  ]);
  const [openPickerId, setOpenPickerId] = useState<number | null>(null);

  const updateRow = (id: number, patch: Partial<CourseRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    haptics.soft();
    setRows((prev) => [...prev, { id: nextId++, name: '', credits: '', grade: null }]);
  };

  const removeRow = (id: number) => {
    haptics.soft();
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (openPickerId === id) setOpenPickerId(null);
  };

  const result = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const row of rows) {
      const c = parseFloat(row.credits);
      if (isNaN(c) || c <= 0 || !row.grade) continue;
      const pts = POINTS[scale][row.grade] ?? 0;
      totalPoints += pts * c;
      totalCredits += c;
    }
    if (totalCredits <= 0) return null;
    return { gpa: totalPoints / totalCredits, totalCredits };
  }, [rows, scale]);

  const status = result ? classify(result.gpa) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'GPA 計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>來算 GPA 吧</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>填上學分和等第，馬上知道平均</Text>

        <View style={[styles.segmentWrap, { backgroundColor: theme.cardBg }]}>
          {(['4.0', '4.3'] as const).map((s) => {
            const active = scale === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.segmentBtn, active && { backgroundColor: EDU_BG }]}
                onPress={() => {
                  haptics.light();
                  setScale(s);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentText, { color: active ? EDU_FG : theme.textMuted }]}>{s} 制</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.rowList}>
          {rows.map((row, idx) => {
            const pickerOpen = openPickerId === row.id;
            return (
              <View key={row.id} style={[styles.courseCard, { backgroundColor: theme.cardBg }]}>
                <View style={styles.courseHead}>
                  <FocusInput
                    style={[styles.nameInput, { color: theme.text, backgroundColor: theme.inputBg }]}
                    value={row.name}
                    onChangeText={(t) => updateRow(row.id, { name: t })}
                    placeholder={`課程 ${idx + 1}（選填）`}
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

                <View style={styles.courseBody}>
                  <View style={[styles.creditWrap, { backgroundColor: theme.inputBg }]}>
                    <FocusInput
                      style={[styles.creditInput, { color: theme.text }]}
                      value={row.credits}
                      onChangeText={(t) => updateRow(row.id, { credits: t })}
                      placeholder="3"
                      placeholderTextColor={theme.hint}
                      keyboardType="decimal-pad"
                      maxLength={4}
                    />
                    <Text style={[styles.creditUnit, { color: theme.hint }]}>學分</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.gradeBtn,
                      { backgroundColor: row.grade ? EDU_BG : theme.inputBg },
                    ]}
                    onPress={() => {
                      haptics.light();
                      setOpenPickerId(pickerOpen ? null : row.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.gradeBtnText, { color: row.grade ? EDU_FG : theme.hint }]}>
                      {row.grade ?? '選等第'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {pickerOpen && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                    keyboardShouldPersistTaps="handled"
                  >
                    {GRADES.map((g) => {
                      const selected = row.grade === g;
                      return (
                        <TouchableOpacity
                          key={g}
                          style={[
                            styles.chip,
                            { backgroundColor: selected ? EDU_FG : theme.inputBg },
                          ]}
                          onPress={() => {
                            haptics.light();
                            updateRow(row.id, { grade: g });
                            setOpenPickerId(null);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, { color: selected ? '#fff' : theme.text }]}>{g}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { borderColor: EDU_FG }]}
          onPress={addRow}
          activeOpacity={0.7}
        >
          <Plus size={18} color={EDU_FG} weight="bold" />
          <Text style={[styles.addBtnText, { color: EDU_FG }]}>新增課程</Text>
        </TouchableOpacity>

        {result && status ? (
          <View style={styles.resultCard}>
            <Mascot expression={status.expression} color={EDU_FG} size={56} />
            <Text style={styles.resultValue}>{result.gpa.toFixed(2)}</Text>
            <Text style={styles.resultLabel}>GPA（{scale} 制）</Text>
            <Text style={styles.resultSub}>共 {result.totalCredits} 學分・{status.tip}</Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint, marginTop: 6 }]}>
              填好學分、選好等第就會出現結果
            </Text>
          </View>
        )}

        <View style={[styles.refCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.refTitle, { color: theme.text }]}>等第點數表（{scale} 制）</Text>
          <View style={styles.refGrid}>
            {GRADES.map((g) => (
              <View key={g} style={[styles.refItem, { backgroundColor: theme.inputBg }]}>
                <Text style={[styles.refGrade, { color: theme.text }]}>{g}</Text>
                <Text style={[styles.refPoint, { color: EDU_FG }]}>{(POINTS[scale][g] ?? 0).toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </View>
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
  segmentWrap: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 5,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  segmentText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
  },
  rowList: { gap: 10, marginBottom: 12 },
  courseCard: {
    borderRadius: 20,
    padding: 14,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  courseHead: {
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
  courseBody: {
    flexDirection: 'row',
    gap: 8,
  },
  creditWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  creditInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    textAlign: 'right',
    minWidth: 36,
    padding: 0,
  },
  creditUnit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
  },
  gradeBtn: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  gradeBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
  },
  chipRow: {
    gap: 8,
    paddingTop: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  chipText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  refTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    marginBottom: 12,
  },
  refGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  refItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  refGrade: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
  },
  refPoint: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
  },
});
