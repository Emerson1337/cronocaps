"use client";

import Link from "next/link";
import { Undo2, Redo2, LayoutList } from "lucide-react";
import { ThemeToggle } from "@/components/ui/toggle";
import { ConflictBadge } from "@/features/validation";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  readonly onExport: () => void;
  readonly conflictCount: number;
  readonly hasErrors: boolean;
  readonly onConflictClick: () => void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly showRoomsSummary: boolean;
  readonly onToggleRoomsSummary: () => void;
}

export function FloatingToolbar({
  onExport,
  conflictCount,
  hasErrors,
  onConflictClick,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showRoomsSummary,
  onToggleRoomsSummary,
}: FloatingToolbarProps) {
  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 flex items-center gap-1 rounded-xl border border-border bg-surface-card/80 backdrop-blur-sm px-1.5 py-1 sm:px-2 sm:py-1.5 shadow-lg">
      {/* Undo / Redo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer",
          canUndo
            ? "text-text-secondary hover:text-text-primary hover:bg-surface"
            : "text-text-secondary/30 cursor-not-allowed"
        )}
        aria-label="Desfazer"
        title="Desfazer (Ctrl+Z)"
      >
        <Undo2 size={18} />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer",
          canRedo
            ? "text-text-secondary hover:text-text-primary hover:bg-surface"
            : "text-text-secondary/30 cursor-not-allowed"
        )}
        aria-label="Refazer"
        title="Refazer (Ctrl+Shift+Z)"
      >
        <Redo2 size={18} />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      <ConflictBadge
        conflictCount={conflictCount}
        hasErrors={hasErrors}
        onClick={onConflictClick}
      />

      <button
        type="button"
        onClick={onToggleRoomsSummary}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer",
          showRoomsSummary
            ? "text-primary bg-primary/10"
            : "text-text-secondary hover:text-text-primary hover:bg-surface"
        )}
        aria-label="Detalhes das salas"
        title="Detalhes das salas"
      >
        <LayoutList size={18} />
      </button>

      <button
        type="button"
        onClick={onExport}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
        aria-label="Exportar PDF"
        title="Exportar PDF"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      <ThemeToggle />

      <Link
        href="/area-de-trabalho/configuracoes"
        className="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
        aria-label="Configurações"
        title="Configurações"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </Link>
    </div>
  );
}
