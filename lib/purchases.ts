import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// 解鎖框架（目前為模擬購買）：
// 已購清單存 AsyncStorage，之後接真 IAP 時只要把「付款那一步」換掉，
// 驗證成功後一樣呼叫 purchase(productId) 即可。
const KEY = 'allcu_purchases';

export const ALLCU_PLUS = 'allcu-plus'; // 全功能：解鎖所有主題（之後含免廣告）
export const AD_FREE = 'ad-free'; // 永久免廣告（廣告功能還沒做，先佔位）
export const themeProduct = (themeId: string) => `theme:${themeId}`;

let owned: Set<string> = new Set();
let listeners: Array<(o: Set<string>) => void> = [];
let hydrated = false;
let hydrating: Promise<void> | null = null;

const notify = () => {
  const snapshot = new Set(owned);
  listeners.forEach((l) => l(snapshot));
};

const persist = async () => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...owned]));
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
          owned = new Set(parsed.filter((x) => typeof x === 'string'));
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

export function useOwnership() {
  const [ownedSet, setOwnedSet] = useState<Set<string>>(new Set(owned));

  useEffect(() => {
    listeners.push(setOwnedSet);
    hydrate();
    return () => {
      listeners = listeners.filter((l) => l !== setOwnedSet);
    };
  }, []);

  const has = useCallback((productId: string) => ownedSet.has(productId), [ownedSet]);

  // Allcu+ 擁有者視同擁有所有主題
  const ownsTheme = useCallback(
    (themeId: string) => ownedSet.has(ALLCU_PLUS) || ownedSet.has(themeProduct(themeId)),
    [ownedSet]
  );

  const purchase = useCallback((productId: string) => {
    owned.add(productId);
    notify();
    persist();
  }, []);

  // dev 用：清空購買紀錄重測流程
  const resetAll = useCallback(() => {
    owned = new Set();
    notify();
    persist();
  }, []);

  return { owned: ownedSet, has, ownsTheme, purchase, resetAll };
}
