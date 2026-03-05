"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Workspace } from "@/types";

const subscribeNoop = () => () => {};
const returnTrue = () => true;
const returnFalse = () => false;

const DEFAULT_ACTIVITY_PRESETS: ReadonlyArray<string> = [
  "Psicoterapia Individual",
  "Acolhimento Inicial",
  "Acolhimento de Seguimento",
  "Grupo Terapêutico",
  "Consulta Médica",
  "Atendimento de Enfermagem",
];

function migrateWorkspace(raw: unknown): Workspace | null {
  if (raw === null || raw === undefined || typeof raw !== "object") return null;
  const ws = raw as Record<string, unknown>;

  // Already migrated — ensure activityPresets exists
  if (typeof ws["roomsPerShift"] === "number") {
    if (!Array.isArray(ws["activityPresets"])) {
      return { ...ws, activityPresets: [...DEFAULT_ACTIVITY_PRESETS] } as unknown as Workspace;
    }
    return raw as Workspace;
  }

  // Legacy workspace with rooms array
  const rooms = ws["rooms"];
  const roomCount = Array.isArray(rooms) ? rooms.length : 5;

  // Remove roomId from allocations
  const allocations = ws["allocations"];
  let migratedAllocations = allocations;
  if (Array.isArray(allocations)) {
    migratedAllocations = allocations.map((a: Record<string, unknown>) => {
      const { roomId: _, ...rest } = a;
      return rest;
    });
  }

  const { rooms: _r, ...rest } = ws;
  return {
    ...rest,
    roomsPerShift: roomCount,
    activityPresets: [...DEFAULT_ACTIVITY_PRESETS],
    allocations: migratedAllocations,
    updatedAt: new Date().toISOString(),
  } as unknown as Workspace;
}

interface UseWorkspaceReturn {
  readonly workspace: Workspace | null;
  readonly updateWorkspace: (updater: Workspace | ((prev: Workspace | null) => Workspace | null)) => void;
  readonly resetWorkspace: () => void;
  readonly isLoaded: boolean;
}

export function useWorkspace(): UseWorkspaceReturn {
  const [stored, setStored] = useLocalStorage<Workspace | null>(
    STORAGE_KEYS.WORKSPACE,
    null
  );
  const isLoaded = useSyncExternalStore(subscribeNoop, returnTrue, returnFalse);
  const [pendingValue, setPendingValue] = useState<Workspace | null>(null);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef<Workspace | null>(null);
  const hasMigratedRef = useRef(false);

  // Run migration once on load
  useEffect(() => {
    if (!isLoaded || hasMigratedRef.current || stored === null) return;
    hasMigratedRef.current = true;
    const migrated = migrateWorkspace(stored);
    if (migrated !== stored && migrated !== null) {
      setStored(migrated);
    }
  }, [isLoaded, stored, setStored]);

  const flushPending = useCallback(() => {
    if (pendingRef.current !== null) {
      clearTimeout(pendingRef.current);
      pendingRef.current = null;
    }
  }, []);

  const updateWorkspace = useCallback(
    (updater: Workspace | ((prev: Workspace | null) => Workspace | null)) => {
      flushPending();

      const nextValue =
        typeof updater === "function" ? updater(pendingValueRef.current ?? stored) : updater;

      // Direct value (not a function updater) — flush to localStorage immediately
      // so navigation to another page can read it right away.
      if (typeof updater !== "function") {
        pendingValueRef.current = null;
        setPendingValue(null);
        setStored(nextValue);
        return;
      }

      pendingValueRef.current = nextValue;
      setPendingValue(nextValue);

      pendingRef.current = setTimeout(() => {
        setStored(nextValue);
        pendingRef.current = null;
        pendingValueRef.current = null;
        setPendingValue(null);
      }, 500);
    },
    [stored, setStored, flushPending]
  );

  const resetWorkspace = useCallback(() => {
    flushPending();
    pendingValueRef.current = null;
    setPendingValue(null);
    setStored(null);
  }, [setStored, flushPending]);

  useEffect(() => {
    return () => {
      if (pendingRef.current !== null) {
        clearTimeout(pendingRef.current);
        pendingRef.current = null;
      }
      if (pendingValueRef.current !== null) {
        try {
          window.localStorage.setItem(
            STORAGE_KEYS.WORKSPACE,
            JSON.stringify(pendingValueRef.current)
          );
        } catch {
          // localStorage full or unavailable
        }
        pendingValueRef.current = null;
      }
    };
  }, []);

  return {
    workspace: pendingValue ?? stored,
    updateWorkspace,
    resetWorkspace,
    isLoaded,
  };
}
