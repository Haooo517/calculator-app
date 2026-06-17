import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'allcu_big2_match';

export type Big2Round = {
  id: string;
  // 四人該輪淨輸贏（正=贏、負=輸），總和為 0
  scores: [number, number, number, number];
  base: number;
};

export type Big2Match = {
  names: [string, string, string, string];
  rounds: Big2Round[];
  // 全域開關：任一玩家該輪剩牌 ≥10 張，其罰分 ×2
  tenCardDouble: boolean;
};

const DEFAULT_NAMES: [string, string, string, string] = ['玩家1', '玩家2', '玩家3', '玩家4'];

const emptyMatch = (): Big2Match => ({ names: [...DEFAULT_NAMES], rounds: [], tenCardDouble: false });

let matchState: Big2Match = emptyMatch();
let listeners: Array<(m: Big2Match) => void> = [];
let hydrated = false;
let hydrating: Promise<void> | null = null;

const snapshot = (): Big2Match => ({
  names: [...matchState.names],
  rounds: matchState.rounds.map((r) => ({ ...r, scores: [...r.scores] as Big2Round['scores'] })),
  tenCardDouble: matchState.tenCardDouble,
});

const notify = () => {
  const snap = snapshot();
  listeners.forEach((l) => l(snap));
};

const persist = async () => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(matchState));
  } catch {
    /* ignore */
  }
};

const isValid = (m: unknown): m is Big2Match => {
  if (!m || typeof m !== 'object') return false;
  const obj = m as Record<string, unknown>;
  if (!Array.isArray(obj.names) || obj.names.length !== 4) return false;
  if (!obj.names.every((n) => typeof n === 'string')) return false;
  if (!Array.isArray(obj.rounds)) return false;
  return obj.rounds.every(
    (r) =>
      r &&
      typeof r === 'object' &&
      typeof (r as Big2Round).id === 'string' &&
      Array.isArray((r as Big2Round).scores) &&
      (r as Big2Round).scores.length === 4 &&
      (r as Big2Round).scores.every((s) => typeof s === 'number')
  );
};

const hydrate = () => {
  if (hydrated) return Promise.resolve();
  if (hydrating) return hydrating;
  hydrating = (async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (isValid(parsed)) {
          // 容錯：舊資料沒有 tenCardDouble 欄位時補預設 false
          matchState = { ...parsed, tenCardDouble: parsed.tenCardDouble === true };
          notify();
        }
      }
    } catch {
      /* keep empty */
    } finally {
      hydrated = true;
    }
  })();
  return hydrating;
};

export function useBig2Match() {
  const [match, setMatch] = useState<Big2Match>(snapshot());

  useEffect(() => {
    listeners.push(setMatch);
    hydrate();
    return () => {
      listeners = listeners.filter((l) => l !== setMatch);
    };
  }, []);

  const setName = useCallback((idx: number, name: string) => {
    const next = [...matchState.names] as Big2Match['names'];
    next[idx] = name;
    matchState = { ...matchState, names: next };
    notify();
    persist();
  }, []);

  const addRound = useCallback((scores: Big2Round['scores'], base: number) => {
    const round: Big2Round = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      scores,
      base,
    };
    matchState = { ...matchState, rounds: [...matchState.rounds, round] };
    notify();
    persist();
  }, []);

  const removeRound = useCallback((id: string) => {
    matchState = { ...matchState, rounds: matchState.rounds.filter((r) => r.id !== id) };
    notify();
    persist();
  }, []);

  const clearMatch = useCallback(() => {
    matchState = { names: [...matchState.names], rounds: [], tenCardDouble: matchState.tenCardDouble };
    notify();
    persist();
  }, []);

  const setTenCardDouble = useCallback((val: boolean) => {
    matchState = { ...matchState, tenCardDouble: val };
    notify();
    persist();
  }, []);

  return { match, setName, addRound, removeRound, clearMatch, setTenCardDouble };
}
