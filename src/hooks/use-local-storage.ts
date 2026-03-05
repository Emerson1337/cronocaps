"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { parseJSON } from "@/lib/json";

function getServerSnapshot(): null {
  return null;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): readonly [T, (value: T | ((prev: T) => T)) => void] {
  const [internalValue, setInternalValue] = useState<T>(initialValue);

  const getSnapshot = useCallback((): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const subscribe = useCallback(
    (callback: () => void): (() => void) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key) {
          callback();
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => {
        window.removeEventListener("storage", handleStorage);
      };
    },
    [key]
  );

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // parseJSON returns unknown; we trust that localStorage contains
  // the correct shape since we control writes
  const value: T = raw !== null ? (parseJSON(raw) as T) : internalValue;

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setInternalValue((prev) => {
        let current: T = prev;
        try {
          const stored = window.localStorage.getItem(key);
          if (stored !== null) {
            current = parseJSON(stored) as T;
          }
        } catch {
          // fall through
        }

        const nextValue =
          typeof updater === "function"
            ? (updater as (prev: T) => T)(current)
            : updater;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // localStorage full or unavailable
        }
        return nextValue;
      });
    },
    [key]
  );

  return [value, setValue];
}
