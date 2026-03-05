"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Workspace } from "@/types";

const MAX_HISTORY = 50;

interface UseUndoRedoParams {
  readonly workspace: Workspace | null;
  readonly updateWorkspace: (
    updater: (prev: Workspace) => Workspace
  ) => void;
}

interface UseUndoRedoReturn {
  readonly undoableUpdate: (updater: (prev: Workspace) => Workspace) => void;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

export function useUndoRedo({
  workspace,
  updateWorkspace,
}: UseUndoRedoParams): UseUndoRedoReturn {
  const [past, setPast] = useState<Workspace[]>([]);
  const [future, setFuture] = useState<Workspace[]>([]);
  const isUndoRedoRef = useRef(false);

  const undoableUpdate = useCallback(
    (updater: (prev: Workspace) => Workspace) => {
      if (workspace === null) return;

      // Save current state to past
      setPast((prev) => {
        const next = [...prev, workspace];
        if (next.length > MAX_HISTORY) next.shift();
        return next;
      });
      // Clear future on new action
      setFuture([]);

      updateWorkspace(updater);
    },
    [workspace, updateWorkspace]
  );

  const undo = useCallback(() => {
    if (past.length === 0 || workspace === null) return;

    isUndoRedoRef.current = true;

    const previous = past[past.length - 1] as Workspace;
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [workspace, ...prev]);

    updateWorkspace(() => previous);

    // Reset flag after update settles
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, [past, workspace, updateWorkspace]);

  const redo = useCallback(() => {
    if (future.length === 0 || workspace === null) return;

    isUndoRedoRef.current = true;

    const next = future[0] as Workspace;
    setFuture((prev) => prev.slice(1));
    setPast((prev) => {
      const updated = [...prev, workspace];
      if (updated.length > MAX_HISTORY) updated.shift();
      return updated;
    });

    updateWorkspace(() => next);

    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, [future, workspace, updateWorkspace]);

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta || e.key.toLowerCase() !== "z") return;

      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    undoableUpdate,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
