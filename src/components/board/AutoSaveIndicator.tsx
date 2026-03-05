"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";

interface AutoSaveIndicatorProps {
  readonly workspace: Workspace | null;
}

export function AutoSaveIndicator({ workspace }: AutoSaveIndicatorProps) {
  const prevUpdatedAtRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleRef = useRef(false);
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = (listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  };

  const getSnapshot = () => visibleRef.current;

  const visible = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setVisible = (value: boolean) => {
    visibleRef.current = value;
    for (const listener of listenersRef.current) {
      listener();
    }
  };

  useEffect(() => {
    const currentUpdatedAt = workspace?.updatedAt ?? null;

    if (
      prevUpdatedAtRef.current !== null &&
      currentUpdatedAt !== null &&
      currentUpdatedAt !== prevUpdatedAtRef.current
    ) {
      setVisible(true);

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, 2000);
    }

    prevUpdatedAtRef.current = currentUpdatedAt;
  }, [workspace?.updatedAt]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <span
      className={cn(
        "text-xs text-text-secondary transition-opacity",
        visible ? "opacity-100 duration-150" : "opacity-0 duration-300"
      )}
      aria-live="polite"
    >
      Salvo
    </span>
  );
}
