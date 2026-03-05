"use client";

import { useCallback, useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

type Theme = "light" | "dark";

function getThemeSnapshot(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEYS.THEME);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.THEME) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}

export function useTheme(): { readonly theme: Theme; readonly toggleTheme: () => void } {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    const next: Theme = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.THEME, next);
    } catch {
      // localStorage unavailable
    }
    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEYS.THEME, newValue: next })
    );
  }, []);

  return { theme, toggleTheme };
}
