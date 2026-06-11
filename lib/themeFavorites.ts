import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'allcu_theme_favorites';

let favState: Set<string> = new Set();
let listeners: Array<(favs: Set<string>) => void> = [];
let hydrated = false;
let hydrating: Promise<void> | null = null;

const notify = () => {
  const snapshot = new Set(favState);
  listeners.forEach((l) => l(snapshot));
};

const persist = async () => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...favState]));
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
          favState = new Set(parsed.filter((x) => typeof x === 'string'));
          notify();
        }
      }
    } catch {
      /* empty */
    } finally {
      hydrated = true;
    }
  })();
  return hydrating;
};

export function useThemeFavorites() {
  const [favs, setFavs] = useState<Set<string>>(new Set(favState));

  useEffect(() => {
    listeners.push(setFavs);
    hydrate();
    return () => {
      listeners = listeners.filter((l) => l !== setFavs);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    if (favState.has(id)) favState.delete(id);
    else favState.add(id);
    notify();
    persist();
  }, []);

  const isFav = useCallback((id: string) => favs.has(id), [favs]);

  return { favs, toggle, isFav };
}
