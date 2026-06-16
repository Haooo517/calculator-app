import { Stack } from 'expo-router';
import { ArrowClockwise, Pause, Play } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const ACCENT = '#4a5868';
const PASTEL = '#d4d8e0';
const PRESETS = [1, 3, 5, 10];

type Phase = 'setup' | 'running' | 'paused' | 'done';

const fmt = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function CountdownTimer() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<Phase>('setup');
  const [min, setMin] = useState('5');
  const [sec, setSec] = useState('');
  const [remainingMs, setRemainingMs] = useState(0);

  const totalMsRef = useRef(0); // 本次倒數總長（算進度條用）
  const anchorRef = useRef(0); // Date.now() 錨點
  const remainingAtAnchorRef = useRef(0); // 錨點當下的剩餘 ms

  const totalSec = (parseInt(min, 10) || 0) * 60 + (parseInt(sec, 10) || 0);

  const start = useCallback(() => {
    if (totalSec <= 0) return;
    haptics.soft();
    const ms = totalSec * 1000;
    totalMsRef.current = ms;
    remainingAtAnchorRef.current = ms;
    anchorRef.current = Date.now();
    setRemainingMs(ms);
    setPhase('running');
  }, [totalSec]);

  const pause = useCallback(() => {
    haptics.soft();
    // 暫停：把剩餘 ms 結算回 ref，繼續時重設錨點
    const left = Math.max(0, remainingAtAnchorRef.current - (Date.now() - anchorRef.current));
    remainingAtAnchorRef.current = left;
    setRemainingMs(left);
    setPhase('paused');
  }, []);

  const resume = useCallback(() => {
    haptics.soft();
    anchorRef.current = Date.now();
    setPhase('running');
  }, []);

  const reset = useCallback(() => {
    haptics.light();
    setPhase('setup');
    setRemainingMs(0);
  }, []);

  // 計時用 Date.now 錨點推算剩餘，不靠 tick 累減（避免漂移）
  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => {
      const left = remainingAtAnchorRef.current - (Date.now() - anchorRef.current);
      if (left <= 0) {
        setRemainingMs(0);
        setPhase('done');
        haptics.success();
      } else {
        setRemainingMs(left);
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase]);

  const pickPreset = (p: number) => {
    haptics.selection();
    setMin(String(p));
    setSec('');
  };

  if (phase === 'setup') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Stack.Screen options={{ title: '倒數計時' }} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.text }]}>倒數計時</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>選個時間，開始倒數吧</Text>

          <View style={styles.chipRow}>
            {PRESETS.map((p) => {
              const active = min === String(p) && (sec === '' || (parseInt(sec, 10) || 0) === 0);
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? ACCENT : theme.cardBg },
                  ]}
                  onPress={() => pickPreset(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : theme.text }]}>{p} 分</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>自訂時間</Text>
            <View style={styles.timeRow}>
              <View style={[styles.timeField, { backgroundColor: theme.inputBg }]}>
                <FocusInput
                  style={[styles.timeInput, { color: theme.text }]}
                  value={min}
                  onChangeText={(t) => setMin(t.replace(/[^0-9]/g, ''))}
                  placeholder="5"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={[styles.timeUnit, { color: theme.hint }]}>分</Text>
              </View>
              <View style={[styles.timeField, { backgroundColor: theme.inputBg }]}>
                <FocusInput
                  style={[styles.timeInput, { color: theme.text }]}
                  value={sec}
                  onChangeText={(t) => setSec(t.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  placeholderTextColor={theme.hint}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.timeUnit, { color: theme.hint }]}>秒</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: ACCENT, opacity: totalSec > 0 ? 1 : 0.4 }]}
            onPress={start}
            activeOpacity={0.85}
            disabled={totalSec <= 0}
          >
            <Play size={18} color="#fff" weight="fill" />
            <Text style={styles.startText}>開始</Text>
          </TouchableOpacity>

          <Text style={[styles.note, { color: theme.hint }]}>離開頁面或鎖屏，計時不會繼續喔</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const done = phase === 'done';
  const progress = totalMsRef.current > 0 ? 1 - remainingMs / totalMsRef.current : 0;
  const expression: MascotExpression = done
    ? 'excited'
    : remainingMs <= 10000
      ? 'surprised'
      : 'thinking';

  return (
    <View style={[styles.runContainer, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: '倒數計時' }} />
      <View style={[styles.runCard, { backgroundColor: PASTEL }]}>
        <Mascot expression={expression} color={ACCENT} size={64} />
        {done ? (
          <Text style={[styles.doneText, { color: ACCENT }]}>時間到！</Text>
        ) : (
          <Text style={[styles.clock, { color: ACCENT }]}>{fmt(remainingMs)}</Text>
        )}
        <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
          <View
            style={[styles.progressFill, { backgroundColor: ACCENT, width: `${Math.min(100, progress * 100)}%` }]}
          />
        </View>
        {phase === 'paused' && <Text style={[styles.pausedHint, { color: ACCENT }]}>已暫停</Text>}
      </View>

      <View style={styles.btnRow}>
        {!done && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: ACCENT }]}
            onPress={phase === 'running' ? pause : resume}
            activeOpacity={0.85}
          >
            {phase === 'running' ? (
              <Pause size={18} color="#fff" weight="fill" />
            ) : (
              <Play size={18} color="#fff" weight="fill" />
            )}
            <Text style={styles.actionText}>{phase === 'running' ? '暫停' : '繼續'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, styles.resetBtn, { backgroundColor: theme.cardBg, borderColor: PASTEL }]}
          onPress={reset}
          activeOpacity={0.85}
        >
          <ArrowClockwise size={18} color={ACCENT} weight="bold" />
          <Text style={[styles.actionText, { color: ACCENT }]}>重設</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.note, { color: theme.hint }]}>離開頁面或鎖屏，計時不會繼續喔</Text>
    </View>
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
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  chipText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 13,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timeField: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  timeInput: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    textAlign: 'center',
    minWidth: 56,
    padding: 0,
  },
  timeUnit: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
  },
  startBtn: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
    color: '#fff',
    letterSpacing: 0.5,
  },
  note: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  runContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  runCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  clock: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 84,
    letterSpacing: 2,
    lineHeight: 92,
    marginTop: 12,
    fontVariant: ['tabular-nums'],
  },
  doneText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 52,
    letterSpacing: -1,
    lineHeight: 60,
    marginTop: 12,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  pausedHint: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    marginTop: 12,
    opacity: 0.75,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetBtn: {
    borderWidth: 2,
  },
  actionText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
