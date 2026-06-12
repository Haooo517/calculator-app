import { Stack } from 'expo-router';
import { ArrowClockwise, HandTap, Megaphone, Timer, Trophy } from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Mascot } from '../../components/Mascot';
import { haptics } from '../../lib/haptics';
import { useBestScore } from '../../lib/scores';
import { useTheme } from '../../lib/theme';

const GOAL = 10;
const AD_SECONDS = 5;
const BTN = 72;
const EDGE = 10;
const INTERSTITIAL_LOCK_MS = 1500;
const AD_DARK = '#1a1612';

const AD_SLOGANS = [
  '歐古傳奇 — 點擊就送 π！',
  '全服最強計算機，裝備免費送！',
  '你絕對算不過第 3 題！',
];

const INTERSTITIALS = [
  '廣告：恭喜獲得 0 元折價券！',
  '廣告：再看一則廣告解鎖關閉廣告功能',
  '廣告：您是第 9,999,999 位幸運用戶（並不是）',
];

type Interstitial = { msg: string; closable: boolean; corner: number };

// 插頁廣告的 ✕ 隨機出現在四個角落之一
const cornerStyle = (corner: number): ViewStyle => ({
  position: 'absolute',
  ...(corner < 2 ? { top: 14 } : { bottom: 14 }),
  ...(corner % 2 === 0 ? { left: 14 } : { right: 14 }),
});

export default function AdGame() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<'idle' | 'ad' | 'playing' | 'done'>('idle');
  const [taps, setTaps] = useState(0);
  const [adCountdown, setAdCountdown] = useState(AD_SECONDS);
  const [sloganIdx, setSloganIdx] = useState(0);
  const [pos, setPos] = useState({ x: EDGE, y: EDGE });
  const [interstitial, setInterstitial] = useState<Interstitial | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [finalSec, setFinalSec] = useState(0);
  const { best, report } = useBestScore('ad-game', 'low');
  const [newBest, setNewBest] = useState(false);
  const adTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sloganRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);
  const areaRef = useRef({ w: 0, h: 0 });

  const randomPos = useCallback(() => {
    const { w, h } = areaRef.current;
    const maxX = Math.max(EDGE, w - BTN - EDGE);
    const maxY = Math.max(EDGE, h - BTN - EDGE);
    return {
      x: EDGE + Math.random() * (maxX - EDGE),
      y: EDGE + Math.random() * (maxY - EDGE),
    };
  }, []);

  // 「觀看廣告以開始遊戲」：先進假廣告
  const start = useCallback(() => {
    haptics.soft();
    setTaps(0);
    setAdCountdown(AD_SECONDS);
    setSloganIdx(0);
    setInterstitial(null);
    setElapsedSec(0);
    setFinalSec(0);
    setNewBest(false);
    setPhase('ad');
  }, []);

  // 假廣告：倒數 + 標語輪播
  useEffect(() => {
    if (phase !== 'ad') return;
    adTickRef.current = setInterval(() => {
      setAdCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    sloganRef.current = setInterval(() => {
      setSloganIdx((i) => (i + 1) % AD_SLOGANS.length);
    }, 1200);
    return () => {
      if (adTickRef.current) clearInterval(adTickRef.current);
      if (sloganRef.current) clearInterval(sloganRef.current);
    };
  }, [phase]);

  const closeAd = () => {
    haptics.light();
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    setPhase('playing');
  };

  // 通關秒數計時（插頁廣告期間照樣計時，這就是廣告的惡意）
  useEffect(() => {
    if (phase !== 'playing') return;
    tickRef.current = setInterval(() => {
      setElapsedSec((Date.now() - startedAtRef.current) / 1000);
    }, 100);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (lockRef.current) clearTimeout(lockRef.current);
    };
  }, [phase]);

  // 結束時回報秒數（越低越好），破紀錄給 success 觸感
  useEffect(() => {
    if (phase !== 'done') return;
    const isNew = report(finalSec);
    setNewBest(isNew);
    if (isNew) haptics.success();
  }, [phase, report, finalSec]);

  const onAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    areaRef.current = { w: width, h: height };
    setPos({ x: Math.max(EDGE, (width - BTN) / 2), y: Math.max(EDGE, (height - BTN) / 2) });
  };

  const tapMascot = () => {
    if (phase !== 'playing' || interstitial) return;
    haptics.light();
    const next = taps + 1;
    setTaps(next);
    setPos(randomPos()); // 歐古瞬移
    if (next >= GOAL) {
      const secs = Math.round(((Date.now() - startedAtRef.current) / 1000) * 10) / 10;
      setFinalSec(secs);
      setPhase('done');
      return;
    }
    // 第 3、6、9 次彈插頁廣告，1.5 秒內不能關
    if (next % 3 === 0) {
      haptics.error();
      setInterstitial({
        msg: INTERSTITIALS[(next / 3 - 1) % INTERSTITIALS.length],
        closable: false,
        corner: Math.floor(Math.random() * 4),
      });
      lockRef.current = setTimeout(() => {
        setInterstitial((cur) => (cur ? { ...cur, closable: true } : cur));
      }, INTERSTITIAL_LOCK_MS);
    }
  };

  const closeInterstitial = () => {
    haptics.light();
    setInterstitial(null);
  };

  const accent = '#5a8a30';
  const bgAccent = '#c4e8a8';

  const endComment =
    finalSec < 15 ? '廣告都擋不住你' : finalSec < 30 ? '不錯的抗廣告體質' : '被廣告折磨了吧';

  if (phase === 'idle') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '廣告糞遊' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression="cool" color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>廣告糞遊</Text>
          <Text style={[styles.heroSub, { color: accent }]}>體驗最純正的手遊生態</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.infoRow}>
            <Megaphone size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              本遊戲 100% 嘲諷手遊生態，廣告都是假的，請安心吐槽
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <HandTap size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>點擊歐古 10 次即可通關（會一直被廣告打斷）</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.infoRow}>
            <Timer size={20} color={accent} weight="fill" />
            <Text style={[styles.infoText, { color: theme.text }]}>通關越快越好，廣告時間照算（很壞）</Text>
          </View>
          {best !== null && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <View style={styles.infoRow}>
                <Trophy size={20} color={accent} weight="fill" />
                <Text style={[styles.infoText, { color: theme.text }]}>目前最快通關 {best.toFixed(1)} 秒</Text>
              </View>
            </>
          )}
        </View>
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: accent }]} onPress={start} activeOpacity={0.85}>
          <Text style={styles.startText}>觀看廣告以開始遊戲</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (phase === 'ad') {
    return (
      <View style={[styles.container, { backgroundColor: AD_DARK }]}>
        <Stack.Screen options={{ title: '廣告糞遊' }} />
        <View style={styles.adTopBar}>
          {adCountdown > 0 ? (
            <View style={styles.adCountPill}>
              <Text style={styles.adCountText}>廣告 {adCountdown}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.adClosePill} onPress={closeAd} activeOpacity={0.8}>
              <Text style={styles.adCloseText}>✕ 關閉</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.adBody}>
          <Mascot expression="excited" color={bgAccent} size={80} />
          <Text style={styles.adSlogan}>{AD_SLOGANS[sloganIdx]}</Text>
          <Text style={styles.adFinePrint}>（假廣告，內容純屬嘲諷）</Text>
        </View>
      </View>
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '廣告糞遊' }} />
        <View style={[styles.heroCard, { backgroundColor: bgAccent }]}>
          <Mascot expression="love" color={accent} size={64} />
          <Text style={[styles.heroTitle, { color: accent, marginTop: 10 }]}>恭喜通關！</Text>
          <Text style={[styles.heroSub, { color: accent, textAlign: 'center' }]}>
            獎勵是：什麼都沒有 🎉{'\n'}…開玩笑的，歐古給你一顆 ❤
          </Text>
        </View>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>通關秒數</Text>
          <Text style={[styles.scoreValue, { color: accent }]}>{finalSec.toFixed(1)}</Text>
          <Text style={[styles.scoreSub, { color: theme.textMuted }]}>
            {endComment}
            {best !== null && !newBest ? ` · 最快紀錄 ${best.toFixed(1)} 秒` : ''}
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
          <Text style={styles.startText}>再看一次廣告（咦）</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: '廣告糞遊' }} />
      <View style={styles.playContent}>
        <View style={styles.topStats}>
          <View style={[styles.statPill, { backgroundColor: theme.cardBg }]}>
            <Timer size={14} color={accent} weight="fill" />
            <Text style={[styles.statText, { color: theme.text }]}>{elapsedSec.toFixed(1)}s</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: theme.cardBg }]}>
            <HandTap size={14} color={accent} weight="fill" />
            <Text style={[styles.statText, { color: accent }]}>
              {taps} / {GOAL}
            </Text>
          </View>
        </View>
        <Text style={[styles.playHint, { color: theme.textMuted }]}>點擊歐古 10 次即可通關！</Text>
        <View style={styles.gameArea} onLayout={onAreaLayout}>
          <TouchableOpacity
            style={[styles.mascotBtn, { backgroundColor: accent, left: pos.x, top: pos.y }]}
            onPress={tapMascot}
            activeOpacity={0.7}
          >
            <Mascot expression="happy" color="#fff" size={44} />
          </TouchableOpacity>
        </View>
        <View style={[styles.fakeBanner, { backgroundColor: theme.cardBg }]}>
          <Megaphone size={14} color={theme.textMuted} weight="fill" />
          <Text style={[styles.fakeBannerText, { color: theme.textMuted }]}>
            廣告：此橫幅廣告位招租（不會真的有廣告）
          </Text>
        </View>
      </View>

      {interstitial && (
        <View style={styles.interstitial}>
          <Mascot expression="excited" color={bgAccent} size={56} />
          <Text style={styles.interstitialText}>{interstitial.msg}</Text>
          {!interstitial.closable && <Text style={styles.adFinePrint}>廣告載入中…（不能跳過）</Text>}
          {interstitial.closable && (
            <TouchableOpacity
              style={[styles.tinyClose, cornerStyle(interstitial.corner)]}
              onPress={closeInterstitial}
              activeOpacity={0.8}
            >
              <Text style={styles.tinyCloseText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  heroSub: { fontFamily: 'Fredoka_500Medium', fontSize: 14, opacity: 0.85, marginTop: 4, lineHeight: 20 },
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
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  infoText: { fontFamily: 'Fredoka_500Medium', fontSize: 15, flex: 1 },
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
  scoreValue: { fontFamily: 'Fredoka_700Bold', fontSize: 96, letterSpacing: -4, lineHeight: 100 },
  scoreSub: { fontFamily: 'Fredoka_400Regular', fontSize: 13, marginTop: 6 },
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
  // 假廣告（開場全螢幕）
  adTopBar: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  adCountPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  adCountText: { fontFamily: 'Fredoka_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  adClosePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  adCloseText: { fontFamily: 'Fredoka_700Bold', fontSize: 14, color: '#fff' },
  adBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  adSlogan: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 38,
  },
  adFinePrint: { fontFamily: 'Fredoka_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  // 遊戲本體
  playContent: { flex: 1, padding: 20 },
  topStats: { flexDirection: 'row', gap: 8, marginBottom: 10 },
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
  statText: { fontFamily: 'Fredoka_700Bold', fontSize: 14 },
  playHint: { fontFamily: 'Fredoka_500Medium', fontSize: 13, marginBottom: 8 },
  gameArea: { flex: 1 },
  mascotBtn: {
    position: 'absolute',
    width: BTN,
    height: BTN,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5a8a30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fakeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  fakeBannerText: { fontFamily: 'Fredoka_400Regular', fontSize: 12 },
  // 插頁廣告覆蓋卡
  interstitial: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AD_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 18,
  },
  interstitialText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 34,
  },
  tinyClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyCloseText: { fontFamily: 'Fredoka_700Bold', fontSize: 15, color: '#fff' },
});
