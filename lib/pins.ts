import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { CATEGORIES, Calculator } from '../data/categories';

const KEY = 'allcu_pinned';
const DEFAULTS = ['basic', 'percent', 'bmi', 'unit', 'currency'];

let pinsState: Set<string> = new Set(DEFAULTS);
let listeners: Array<(pins: Set<string>) => void> = [];
let hydrated = false;
let hydrating: Promise<void> | null = null;

const notify = () => {
  const snapshot = new Set(pinsState);
  listeners.forEach((l) => l(snapshot));
};

const persist = async () => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...pinsState]));
  } catch {
    /* ignore */
  }
};

const hydrate = () => {
  if (hydrated) return Promise.resolve();
  if (hydrating) return hydrating;
  hydrating = (async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          pinsState = new Set(parsed.filter((x) => typeof x === 'string'));
          notify();
        }
      }
    } catch {
      /* keep defaults */
    } finally {
      hydrated = true;
    }
  })();
  return hydrating;
};

export function usePins() {
  const [pins, setPins] = useState<Set<string>>(new Set(pinsState));

  useEffect(() => {
    listeners.push(setPins);
    hydrate();
    return () => {
      listeners = listeners.filter((l) => l !== setPins);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    if (pinsState.has(id)) pinsState.delete(id);
    else pinsState.add(id);
    notify();
    persist();
  }, []);

  const isPinned = useCallback((id: string) => pins.has(id), [pins]);

  return { pins, toggle, isPinned };
}

// 清空所有釘選（設定頁「重設釘選」用）
export function clearAllPins() {
  pinsState = new Set();
  notify();
  persist();
}

export function getPinnedCalculators(pins: Set<string>): Calculator[] {
  const out: Calculator[] = [];
  for (const cat of CATEGORIES) {
    if (cat.id === 'favorites') continue;
    for (const calc of cat.calculators) {
      if (pins.has(calc.id) && !out.find((c) => c.id === calc.id)) {
        out.push(calc);
      }
    }
  }
  return out;
}
