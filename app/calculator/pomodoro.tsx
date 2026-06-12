import { Stack } from 'expo-router';
import { ArrowClockwise, Pause, Play, SkipForward } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useTheme } from '../../lib/theme';

const ACCENT = '#4a5868';
const PASTEL = '#d4d8e0';
const WORK_OPTIONS = [25, 50];
const BREAK_OPTIONS = [5, 10];

type Phase = 'idle' | 'work' | 'break';

const fmt = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function PomodoroTimer() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<Phase>('idle');
  const [running, setRunning] = useState(false);
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [rounds, setRounds] = useState(0); // 完成的 work 回合數
  const [flashExcited, setFlashExcited] = useState(false); // 剛完成 work 的小慶祝
  const [remainingMs, setRemainingMs] = useState(25 * 60000);

  const anchorRef = useRef(0); // Date.now() 錨點
  const remainingAtAnchorRef = useRef(0); // 錨點當下的剩餘 ms

  const phaseTotalMs = (phase === 'break' ? breakMin : workMin) * 60000;

  // idle 時的預覽時間跟著工作長度走
  useEffect(() => {
    if (phase === 'idle') setRemainingMs(workMin * 60000);
  }, [phase, workMin]);

  const beginPhase = useCallback((next: Exclude<Phase, 'idle'>, minutes: number) => {
    const ms = minutes * 60000;
    remainingAtAnchorRef.current = ms;
    anchorRef.current = Date.now();
    setRemainingMs(ms);
    setPhase(next);
  }, []);

  // 階段切換（自然完成或手動跳過共用）
  const advance = useCallback(
    (completed: boolean) => {
      haptics.medium();
      if (phase === 'work') {
        if (completed) {
          setRounds((r) => r + 1);
          setFlashExcited(true);
        }
        beginPhase('break', breakMin);
      } else {
        beginPhase('work', workMin);
      }
    },
    [phase, workMin, breakMin, beginPhase]
  );

  // 計時：Date.now 錨點推算剩餘，200ms 更新一次
  useEffect(() => {
    if (!running || phase === 'idle') return;
    const id = setInterval(() => {
      const left = remainingAtAnchorRef.current - (Date.now() - anchorRef.current);
      if (left <= 0) {
        advance(true);
      } else {
        setRemainingMs(left);
      }
    }, 200);
    return () => clearInterval(id);
  }, [running, phase, advance]);

  // 完成 work 的 excited 表情閃一下就回 happy
  useEffect(() => {
    if (!flashExcited) return;
    const id = setTimeout(() => setFlashExcited(false), 2200);
    return () => clearTimeout(id);
  }, [flashExcited]);

  const start = () => {
    haptics.soft();
    setRounds(0);
    setRunning(true);
    beginPhase('work', workMin);
  };

  const pause = () => {
    haptics.soft();
    const left = Math.max(0, remainingAtAnchorRef.current - (Date.now() - anchorRef.current));
    remainingAtAnchorRef.current = left;
    setRemainingMs(left);
    setRunning(false);
  };

  const resume = () => {
    haptics.soft();
    anchorRef.current = Date.now();
    setRunning(true);
  };

  const reset = () => {
    haptics.light();
    setRunning(false);
    setRounds(0);
    setFlashExcited(false);
    setPhase('idle');
    setRemainingMs(workMin * 60000);
  };

  const idle = phase === 'idle';
  const progress = idle ? 0 : 1 - remainingMs / phaseTotalMs;
  const expression: MascotExpression = idle
    ? 'default'
    : phase === 'work'
      ? 'thinking'
      : flashExcited
        ? 'excited'
        : 'happy';
  const phaseLabel = idle ? '準備好就開始吧' : phase === 'work' ? '專注中' : '休息中';
  const roundLabel = idle
    ? '🍅 番茄鐘'
    : phase === 'work'
      ? `🍅 第 ${rounds + 1} 輪`
      : `🍅 已完成 ${rounds} 輪`;

  const pickWork = (m: number) => {
    haptics.selection();
    setWorkMin(m);
  };
  const pickBreak = (m: number) => {
    haptics.selection();
    setBreakMin(m);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: '番茄鐘' }} />

      <View style={[styles.heroCard, { backgroundColor: PASTEL }]}>
        <Mascot expression={expression} color={ACCENT} size={60} />
        <Text style={[styles.roundPill, { color: ACCENT }]}>{roundLabel}</Text>
        <Text style={[styles.clock, { color: ACCENT }]}>{fmt(remainingMs)}</Text>
        <Text style={[styles.phaseLabel, { color: ACCENT }]}>{phaseLabel}</Text>
        <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
          <View
            style={[styles.progressFill, { backgroundColor: ACCENT, width: `${Math.min(100, progress * 100)}%` }]}
          />
        </View>
        {!idle && !running && <Text style={[styles.pausedHint, { color: ACCENT }]}>已暫停</Text>}
      </View>

      {rounds >= 4 && (
        <View style={[styles.bannerCard, { backgroundColor: theme.cardBg }]}>
          <Text style={styles.bannerEmoji}>🎉</Text>
          <Text style={[styles.bannerText, { color: theme.text }]}>完成 4 輪了，休息久一點吧！</Text>
        </View>
      )}

      <View style={[styles.optionCard, { backgroundColor: theme.cardBg, opacity: idle ? 1 : 0.5 }]}>
        <View style={styles.optionRow}>
          <Text style={[styles.optionLabel, { color: theme.text }]}>工作</Text>
          <View style={styles.chipGroup}>
            {WORK_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.chip, { backgroundColor: workMin === m ? ACCENT : theme.inputBg }]}
                onPress={() => pickWork(m)}
                disabled={!idle}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: workMin === m ? '#fff' : theme.text }]}>{m} 分</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
        <View style={styles.optionRow}>
          <Text style={[styles.optionLabel, { color: theme.text }]}>休息</Text>
          <View style={styles.chipGroup}>
            {BREAK_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.chip, { backgroundColor: breakMin === m ? ACCENT : theme.inputBg }]}
                onPress={() => pickBreak(m)}
                disabled={!idle}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: breakMin === m ? '#fff' : theme.text }]}>{m} 分</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {!idle && (
          <Text style={[styles.optionHint, { color: theme.hint }]}>計時中不能改長度，重設後再調整</Text>
        )}
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: ACCENT }]}
          onPress={idle ? start : running ? pause : resume}
          activeOpacity={0.85}
        >
          {!idle && running ? (
            <Pause size={18} color="#fff" weight="fill" />
          ) : (
            <Play size={18} color="#fff" weight="fill" />
          )}
          <Text style={styles.actionText}>{idle ? '開始' : running ? '暫停' : '繼續'}</Text>
        </TouchableOpacity>
        {!idle && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.outlineBtn, { backgroundColor: theme.cardBg, borderColor: PASTEL }]}
            onPress={() => advance(false)}
            activeOpacity={0.85}
          >
            <SkipForward size={18} color={ACCENT} weight="fill" />
            <Text style={[styles.actionText, { color: ACCENT }]}>跳過</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, styles.outlineBtn, { backgroundColor: theme.cardBg, borderColor: PASTEL }]}
          onPress={reset}
          activeOpacity={0.85}
        >
          <ArrowClockwise size={18} color={ACCENT} weight="bold" />
          <Text style={[styles.actionText, { color: ACCENT }]}>重設</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.note, { color: theme.hint }]}>離開頁面或鎖屏，計時不會繼續喔</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  heroCard: {
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
  roundPill: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.85,
  },
  clock: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 72,
    letterSpacing: 2,
    lineHeight: 80,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  phaseLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    marginTop: 2,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  pausedHint: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 13,
    marginTop: 10,
    opacity: 0.75,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerEmoji: {
    fontSize: 20,
  },
  bannerText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    flex: 1,
  },
  optionCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  optionLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  chipText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  optionHint: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  outlineBtn: {
    borderWidth: 2,
  },
  actionText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.5,
  },
  note: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
