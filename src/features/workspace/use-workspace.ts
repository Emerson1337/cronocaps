"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { DEFAULT_EXPORT_RULES } from "@/lib/constants";
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

function stripSalaPrefix(label: string): string {
  return label.replace(/^Sala\s+de\s+/i, "").replace(/^Sala\s+/i, "");
}

function migrateWorkspace(raw: unknown): Workspace | null {
  if (raw === null || raw === undefined || typeof raw !== "object") return null;
  const ws = raw as Record<string, unknown>;

  // Already migrated — ensure activityPresets and exportRules exist
  if (typeof ws["roomsPerShift"] === "number") {
    let patched = false;
    let result = ws;
    if (!Array.isArray(ws["activityPresets"])) {
      result = { ...result, activityPresets: [...DEFAULT_ACTIVITY_PRESETS] };
      patched = true;
    } else {
      const presets = ws["activityPresets"] as ReadonlyArray<unknown>;
      const cleaned = presets.map((p) =>
        typeof p === "string" ? stripSalaPrefix(p) : p
      );
      if (cleaned.some((p, i) => p !== presets[i])) {
        result = { ...result, activityPresets: cleaned };
        patched = true;
      }
    }
    if (typeof ws["exportRules"] !== "string") {
      result = { ...result, exportRules: DEFAULT_EXPORT_RULES };
      patched = true;
    }
    const allocations = ws["allocations"];
    if (Array.isArray(allocations)) {
      let allocationsChanged = false;
      const cleanedAllocations = allocations.map((a: unknown) => {
        if (a === null || typeof a !== "object") return a;
        const alloc = a as Record<string, unknown>;
        const label = alloc["activityLabel"];
        if (typeof label !== "string") return a;
        const cleaned = stripSalaPrefix(label);
        if (cleaned === label) return a;
        allocationsChanged = true;
        return { ...alloc, activityLabel: cleaned };
      });
      if (allocationsChanged) {
        result = { ...result, allocations: cleanedAllocations };
        patched = true;
      }
    }
    return (patched ? result : raw) as Workspace;
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
    exportRules: DEFAULT_EXPORT_RULES,
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
