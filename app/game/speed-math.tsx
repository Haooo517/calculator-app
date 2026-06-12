import { Stack } from 'expo-router';
import { ArrowClockwise, Lightning, Timer, Trophy } from 'phosphor-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mascot, MascotExpression } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useBestScore } from '../../lib/scores';
import { useTheme } from '../../lib/theme';

type Question = { a: number; b: number; op: '+' | '−' | '×'; answer: number; choices: number[] };

const TOTAL_TIME = 30;

const randInt = (max: number) => Math.floor(Math.random() * max) + 1;

const generateQuestion = (): Question => {
  const ops = ['+', '−', '×'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  if (op === '×') {
    a = randInt(9); b = randInt(9);
    answer = a * b;
  } else if (op === '−') {
    a = randInt(99) + 1;
    b = randInt(a);
    answer = a - b;
  } else {
    a = randInt(99); b = randInt(99);
    answer = a + b;
  }
  // Generate 3 wrong choices near the answer
  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    const delta = randInt(10) - 5;
    const candidate = answer + delta;
    if (candidate >= 0 && candidate !== answer) choices.add(candidate);
  }
  const arr = [...choices].sort(() => Math.random() - 0.5);
  return { a, b, op, answer, choices: arr };
};

export default function SpeedMath() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [question, setQuestion] = useState<Question>(() => generateQuestion());
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { best, report } = useBestScore('speed-math');
  const [newBest, setNewBest] = useState(false);

  const start = useCallback(() => {
    haptics.soft();
    setPhase('playing');
    setTimeLeft(TOTAL_TIME);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setQuestion(generateQuestion());
    setFeedback('none');
    setNewBest(false);
  }, []);

  // 結束時回報成績，破紀錄給 success 觸感
  useEffect(() => {
    if (phase !== 'done') return;
    const isNew = report(score);
    setNewBest(isNew);
    if (isNew) haptics.success();
  }, [phase, report, score]);

  useEffect(() => {
    if (phase !== 'playing') return;
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase]);

  const answer = (n: number) => {
    if (phase !== 'playing') return;
    if (n === question.answer) {
      haptics.light();
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setFeedback('correct');
    } else {
      haptics.rigid();
      setStreak(0);
      setFeedback('wrong');
    }
    setTimeout(() => {
      setFeedback('none');
      setQuestion(generateQuestion());
    }, 180);
  };

  const mascotExpression: MascotExpression = useMemo(() => {
    if (phase === 'idle') return 'sleepy';
    if (phase === 'done') return score >= 15 ? 'excited' : score >= 8 ? 'happy' : 'sad';
    if (feedback === 'correct') return 'happy';
    if (feedback === 'wrong') return 'surprised';
    return 'default';
  }, [phase, feedback, score]);

  const accent = '#5a8a30';
  const bgAccent = '#c4e8a8';

  if (phase === 'idle') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '速算' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression="excited" color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>速算挑戰</Text>
          <Text style={[styles.heroSub, { color: accent }]}>
            30 秒內算對越多題越好
          </Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.infoRow}>
            <Timer size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>限時 30 秒</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <Lightning size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>連續答對會累積連擊</Text>
          </View>
          {best !== null && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.infoRow}>
                <Trophy size={20} color={accent} weight="fill" />
                <Text style={[styles.infoText, { color: theme.text }]}>目前最佳紀錄 {best} 題</Text>
              </View>
            </>
          )}
        </View>
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: accent }]} onPress={start} activeOpacity={0.85}>
          <Text style={styles.startText}>開始遊戲</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '速算' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression={mascotExpression} color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>結束！</Text>
        </View>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>分數</Text>
          <Text style={[styles.scoreValue, { color: accent }]}>{score}</Text>
          <Text style={[styles.scoreSub, { color: theme.textMuted }]}>
            最高連擊 {bestStreak} 題{best !== null && !newBest ? ` · 最佳紀錄 ${best} 題` : ''}
          </Text>
          {newBest && (
            <View style={[styles.newBestPill, { backgroundColor: accent }]}>
              <Trophy size={14} color="#fff" weight="fill" />
              <Text style={styles.newBestText}>新紀錄！</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: accent }]} onPress={start} activeOpacity={0.85}>
          <ArrowClockwise size={18} color="#fff" weight="bold" />
          <Text style={styles.startText}>再玩一次</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: '速算' }} />
      <View style={styles.playContent}>
        <View style={styles.topStats}>
          <View style={[styles.statPill, { backgroundColor: theme.cardBg }]}>
            <Timer size={14} color={accent} weight="fill" />
            <Text style={[styles.statText, { color: theme.text }]}>{timeLeft}s</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>分數</Text>
            <Text style={[styles.statText, { color: theme.text }]}>{score}</Text>
          </View>
          {streak >= 3 && (
            <View style={[styles.statPill, { backgroundColor: accent }]}>
              <Lightning size={14} color="#fff" weight="fill" />
              <Text style={[styles.statText, { color: '#fff' }]}>{streak}</Text>
            </View>
          )}
        </View>

        <View style={styles.questionWrap}>
          <Mascot expression={mascotExpression} color={theme.text} size={56} />
          <Text style={[styles.question, { color: theme.text }]}>
            {question.a} {question.op} {question.b} = ?
          </Text>
        </View>

        <View style={styles.choices}>
          {question.choices.map((c) => {
            const isCorrect = feedback === 'correct' && c === question.answer;
            const isWrong = feedback === 'wrong' && c !== question.answer;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.choice,
                  { backgroundColor: theme.cardBg },
                  isCorrect && { backgroundColor: accent },
                ]}
                onPress={() => answer(c)}
                activeOpacity={0.7}
                disabled={feedback !== 'none'}
              >
                <Text
                  style={[
                    styles.choiceText,
                    { color: theme.text },
                    isCorrect && { color: '#fff' },
                    isWrong && c === question.answer && { color: accent },
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  heroCard: {
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 28, letterSpacing: -0.5 },
  heroSub: { fontFamily: 'Fredoka_500Medium', fontSize: 14, opacity: 0.85, marginTop: 4 },
  infoCard: {
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoText: { fontFamily: 'Fredoka_500Medium', fontSize: 15 },
  divider: { height: 1, marginHorizontal: 16 },
  startBtn: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: { fontFamily: 'Fredoka_700Bold', fontSize: 17, color: '#fff', letterSpacing: 0.5 },
  scoreCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  scoreLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 14 },
  scoreValue: { fontFamily: 'Fredoka_700Bold', fontSize: 80, letterSpacing: -3, lineHeight: 88 },
  scoreSub: { fontFamily: 'Fredoka_400Regular', fontSize: 13, marginTop: 4 },
  newBestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  newBestText: { fontFamily: 'Fredoka_700Bold', fontSize: 13, color: '#fff' },
  playContent: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  topStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 5,
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  statLabel: { fontFamily: 'Fredoka_500Medium', fontSize: 12 },
  statText: { fontFamily: 'Fredoka_700Bold', fontSize: 14 },
  questionWrap: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  question: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 44,
    letterSpacing: -1,
    marginTop: 20,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  choice: {
    width: '48%',
    aspectRatio: 1.8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a3897a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  choiceText: { fontFamily: 'Fredoka_700Bold', fontSize: 32, letterSpacing: -0.5 },
});
