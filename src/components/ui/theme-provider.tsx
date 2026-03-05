"use client";

import { useEffect, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

interface ThemeProviderProps {
  readonly children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const theme = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return <>{children}</>;
}
