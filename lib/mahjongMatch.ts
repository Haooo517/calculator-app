import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'allcu_mahjong_match';

export type MahjongRound = {
  id: string;
  // 四人該輪淨輸贏（正=贏、負=輸），總和為 0
  scores: [number, number, number, number];
  winner: number; // 0-3
  tai: number;
  selfDraw: boolean; // true=自摸（三家付）、false=放槍（loser 一家付）
  loser: number | null; // 放槍者 index；自摸時為 null
};

export type MahjongMatch = {
  names: [string, string, string, string];
  rounds: MahjongRound[];
};

const DEFAULT_NAMES: [string, string, string, string] = ['東', '南', '西', '北'];

const emptyMatch = (): MahjongMatch => ({ names: [...DEFAULT_NAMES], rounds: [] });

let matchState: MahjongMatch = emptyMatch();
let listeners: Array<(m: MahjongMatch) => void> = [];
let hydrated = false;
let hydrating: Promise<void> | null = null;

const snapshot = (): MahjongMatch => ({
  names: [...matchState.names],
  rounds: matchState.rounds.map((r) => ({ ...r, scores: [...r.scores] as MahjongRound['scores'] })),
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

const isValid = (m: unknown): m is MahjongMatch => {
  if (!m || typeof m !== 'object') return false;
  const obj = m as Record<string, unknown>;
  if (!Array.isArray(obj.names) || obj.names.length !== 4) return false;
  if (!obj.names.every((n) => typeof n === 'string')) return false;
  if (!Array.isArray(obj.rounds)) return false;
  return obj.rounds.every(
    (r) =>
      r &&
      typeof r === 'object' &&
      typeof (r as MahjongRound).id === 'string' &&
      Array.isArray((r as MahjongRound).scores) &&
      (r as MahjongRound).scores.length === 4 &&
      (r as MahjongRound).scores.every((s) => typeof s === 'number')
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
          matchState = parsed;
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

export type AddRoundInput = {
  scores: MahjongRound['scores'];
  winner: number;
  tai: number;
  selfDraw: boolean;
  loser: number | null;
};

export function useMahjongMatch() {
  const [match, setMatch] = useState<MahjongMatch>(snapshot());

  useEffect(() => {
    listeners.push(setMatch);
    hydrate();
    return () => {
      listeners = listeners.filter((l) => l !== setMatch);
    };
  }, []);

  const setName = useCallback((idx: number, name: string) => {
    const next = [...matchState.names] as MahjongMatch['names'];
    next[idx] = name;
    matchState = { ...matchState, names: next };
    notify();
    persist();
  }, []);

  const addRound = useCallback((input: AddRoundInput) => {
    const round: MahjongRound = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...input,
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
    matchState = { names: [...matchState.names], rounds: [] };
    notify();
    persist();
  }, []);

  return { match, setName, addRound, removeRound, clearMatch };
}
