import { Stack } from 'expo-router';
import { Plus, Trash } from 'phosphor-react-native';
import { useState } from 'react';
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

const ACCENT = '#4a5868';
const PASTEL = '#d4d8e0';
const DAY_LABELS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
const MAX_ROWS = 7;

type Row = {
  id: number;
  inH: string;
  inM: string;
  outH: string;
  outM: string;
  breakMin: string;
};

const makeRow = (id: number): Row => ({ id, inH: '', inM: '', outH: '', outM: '', breakMin: '60' });

// 該日工作分鐘數；下班 < 上班視為跨午夜 +24h，再扣休息，最低 0
const calcRowMins = (r: Row): number | null => {
  if (r.inH === '' || r.outH === '') return null;
  const ih = parseInt(r.inH, 10);
  const im = r.inM === '' ? 0 : parseInt(r.inM, 10);
  const oh = parseInt(r.outH, 10);
  const om = r.outM === '' ? 0 : parseInt(r.outM, 10);
  if (isNaN(ih) || isNaN(im) || isNaN(oh) || isNaN(om)) return null;
  if (ih > 23 || oh > 23 || im > 59 || om > 59) return null;
  let mins = oh * 60 + om - (ih * 60 + im);
  if (mins < 0) mins += 24 * 60;
  const brk = r.breakMin === '' ? 0 : parseInt(r.breakMin, 10) || 0;
  return Math.max(0, mins - brk);
};

const fmtHm = (mins: number) => `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}m`;
const digits = (t: string) => t.replace(/[^0-9]/g, '');

export default function WorkHoursCalculator() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<Row[]>([makeRow(0)]);
  const [nextId, setNextId] = useState(1);

  const update = (id: number, field: keyof Omit<Row, 'id'>, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: digits(value) } : r)));
  };

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    haptics.soft();
    setRows((prev) => [...prev, makeRow(nextId)]);
    setNextId((n) => n + 1);
  };

  const removeRow = (id: number) => {
    if (rows.length <= 1) return;
    haptics.light();
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const computed = rows.map(calcRowMins);
  const validMins = computed.filter((m): m is number => m !== null);
  const totalMins = validMins.reduce((a, b) => a + b, 0);
  const avgMins = validMins.length > 0 ? Math.round(totalMins / validMins.length) : 0;

  // 比例性過勞判斷：總時數超過「50 小時 × 天數/7」就提醒
  const overworked = validMins.length > 0 && totalMins / 60 > (50 * validMins.length) / 7;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '工時計算' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>來算工時吧</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>填上下班時間，自動加總一週時數</Text>

        {rows.map((row, idx) => {
          const mins = computed[idx];
          return (
            <View key={row.id} style={[styles.rowCard, { backgroundColor: theme.cardBg }]}>
              <View style={styles.rowHeader}>
                <Text style={[styles.dayLabel, { color: ACCENT }]}>{DAY_LABELS[idx]}</Text>
                <Text style={[styles.dayHours, { color: mins !== null ? ACCENT : theme.hint }]}>
                  {mins !== null ? fmtHm(mins) : '—'}
                </Text>
                {rows.length > 1 && (
                  <TouchableOpacity onPress={() => removeRow(row.id)} hitSlop={8}>
                    <Trash size={18} color={theme.hint} weight="bold" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.timeLine}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>上班</Text>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                  value={row.inH}
                  onChangeText={(t) => update(row.id, 'inH', t)}
                  placeholder="9"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.colon, { color: theme.hint }]}>:</Text>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                  value={row.inM}
                  onChangeText={(t) => update(row.id, 'inM', t)}
                  placeholder="00"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.fieldLabel, { color: theme.textMuted, marginLeft: 12 }]}>下班</Text>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                  value={row.outH}
                  onChangeText={(t) => update(row.id, 'outH', t)}
                  placeholder="18"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.colon, { color: theme.hint }]}>:</Text>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                  value={row.outM}
                  onChangeText={(t) => update(row.id, 'outM', t)}
                  placeholder="00"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.timeLine}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>休息</Text>
                <TextInput
                  style={[styles.timeInput, styles.breakInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                  value={row.breakMin}
                  onChangeText={(t) => update(row.id, 'breakMin', t)}
                  placeholder="60"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>分鐘</Text>
              </View>
            </View>
          );
        })}

        {rows.length < MAX_ROWS && (
          <TouchableOpacity
            style={[styles.addBtn, { borderColor: PASTEL, backgroundColor: theme.cardBg }]}
            onPress={addRow}
            activeOpacity={0.8}
          >
            <Plus size={16} color={ACCENT} weight="bold" />
            <Text style={[styles.addText, { color: ACCENT }]}>新增一天</Text>
          </TouchableOpacity>
        )}

        {validMins.length > 0 ? (
          <View style={[styles.totalCard, { backgroundColor: PASTEL }]}>
            <Mascot expression={overworked ? 'surprised' : 'happy'} color={ACCENT} size={56} />
            <Text style={[styles.totalLabel, { color: ACCENT }]}>總時數</Text>
            <Text style={[styles.totalValue, { color: ACCENT }]}>
              {Math.floor(totalMins / 60)}
              <Text style={styles.totalUnit}> 小時 </Text>
              {totalMins % 60}
              <Text style={styles.totalUnit}> 分</Text>
            </Text>
            <Text style={[styles.totalSub, { color: ACCENT }]}>
              平均每日 {Math.floor(avgMins / 60)} 小時 {avgMins % 60} 分（{validMins.length} 天）
            </Text>
            <Text style={[styles.totalTip, { color: ACCENT }]}>
              {overworked ? '會不會太操！記得喘口氣' : '辛苦啦，記得好好休息～'}
            </Text>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.divider }]}>
            <Mascot expression="sleepy" color={theme.hint} size={52} />
            <Text style={[styles.placeholderText, { color: theme.hint }]}>填好上下班時間就會出現總計</Text>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  rowCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  dayLabel: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    flex: 1,
  },
  dayHours: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  timeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  fieldLabel: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
  },
  timeInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    textAlign: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 48,
  },
  breakInput: {
    minWidth: 64,
  },
  colon: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 18,
  },
  addText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
  },
  totalCard: {
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  totalLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.85,
  },
  totalValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 52,
    letterSpacing: -2,
    lineHeight: 60,
  },
  totalUnit: {
    fontSize: 22,
  },
  totalSub: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    marginTop: 6,
    opacity: 0.8,
  },
  totalTip: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 13,
    marginTop: 8,
    opacity: 0.85,
  },
  placeholderCard: {
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
});
