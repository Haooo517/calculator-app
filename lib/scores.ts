import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// 遊戲最高分持久化。mode: 'high' 越高越好（預設）、'low' 越低越好（誤差類遊戲）
const keyFor = (gameId: string) => `allcu_best_${gameId}`;

const bestState: Record<string, number | null> = {};
let listeners: Array<{ gameId: string; fn: (b: number | null) => void }> = [];
const hydratingMap: Record<string, Promise<void> | undefined> = {};

const notify = (gameId: string) => {
  const value = bestState[gameId] ?? null;
  listeners.forEach((l) => {
    if (l.gameId === gameId) l.fn(value);
  });
};

const hydrate = (gameId: string) => {
  if (gameId in bestState) return Promise.resolve();
  const pending = hydratingMap[gameId];
  if (pending) return pending;
  hydratingMap[gameId] = (async () => {
    try {
      const raw = await AsyncStorage.getItem(keyFor(gameId));
      const n = raw === null ? NaN : Number(raw);
      bestState[gameId] = Number.isFinite(n) ? n : null;
      notify(gameId);
    } catch {
      bestState[gameId] = null;
    }
  })();
  return hydratingMap[gameId];
};

export function useBestScore(gameId: string, mode: 'high' | 'low' = 'high') {
  const [best, setBest] = useState<number | null>(bestState[gameId] ?? null);

  useEffect(() => {
    const entry = { gameId, fn: setBest };
    listeners.push(entry);
    hydrate(gameId);
    return () => {
      listeners = listeners.filter((l) => l !== entry);
    };
  }, [gameId]);

  // 回報一局結果；若破紀錄回傳 true 並持久化
  const report = useCallback(
    (score: number): boolean => {
      const cur = bestState[gameId] ?? null;
      const isNew = cur === null || (mode === 'high' ? score > cur : score < cur);
      if (isNew) {
        bestState[gameId] = score;
        notify(gameId);
        AsyncStorage.setItem(keyFor(gameId), String(score)).catch(() => {});
      }
      return isNew;
    },
    [gameId, mode]
  );

  return { best, report };
}
