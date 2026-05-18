import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const KEY = 'allcu_haptics_enabled';
const SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

let enabledState = true;
let listeners: Array<(b: boolean) => void> = [];
let hydrated = false;
let hydrating: Promise<void> | null = null;

const notify = () => listeners.forEach((l) => l(enabledState));

const hydrate = () => {
  if (hydrated) return Promise.resolve();
  if (hydrating) return hydrating;
  hydrating = (async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw === 'off') {
        enabledState = false;
        notify();
      }
    } catch {
      /* keep default on */
    } finally {
      hydrated = true;
    }
  })();
  return hydrating;
};

const fire = (fn: () => Promise<void>) => {
  if (!enabledState || !SUPPORTED) return;
  fn().catch(() => {});
};

export const haptics = {
  light: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  soft: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)),
  rigid: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)),
  selection: () => fire(() => Haptics.selectionAsync()),
  success: () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

export function useHapticsToggle() {
  const [enabled, setEnabled] = useState(enabledState);

  useEffect(() => {
    listeners.push(setEnabled);
    hydrate();
    return () => {
      listeners = listeners.filter((l) => l !== setEnabled);
    };
  }, []);

  const set = useCallback((val: boolean) => {
    enabledState = val;
    notify();
    AsyncStorage.setItem(KEY, val ? 'on' : 'off').catch(() => {});
    if (val) haptics.light(); // 開啟時來一下示範
  }, []);

  return { enabled, setEnabled: set, supported: SUPPORTED };
}
