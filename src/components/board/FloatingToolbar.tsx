"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Undo2, Redo2, LayoutList, Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current !== null &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setMobileOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener(
      "touchstart",
      handleClickOutside as EventListener
    );
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener(
        "touchstart",
        handleClickOutside as EventListener
      );
    };
  }, [mobileOpen, handleClickOutside]);

  const toolbarItems = (
    <>
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

      <div className="sm:w-px w-full h-px sm:h-5 bg-border mx-1" />

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </Link>
    </>
  );

  return (
    <div
      ref={containerRef}
      className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50"
    >
      {/* Desktop: always visible */}
      <div className="hidden sm:flex items-center gap-1 rounded-xl border border-border bg-surface-card/80 backdrop-blur-sm px-2 py-1.5 shadow-lg">
        {toolbarItems}
      </div>

      {/* Mobile: toggle button + expandable panel */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-surface-card/80 backdrop-blur-sm shadow-lg transition-colors cursor-pointer",
            mobileOpen
              ? "text-primary bg-primary/10"
              : "text-text-secondary hover:text-text-primary"
          )}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          {!mobileOpen && conflictCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -left-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white",
                hasErrors ? "bg-error" : "bg-warning"
              )}
            >
              {conflictCount > 9 ? "9+" : String(conflictCount)}
            </span>
          )}
        </button>

        <div
          className={cn(
            "absolute top-12 right-0 flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface-card/95 backdrop-blur-sm px-2 py-2 shadow-xl",
            "origin-top-right transition-all duration-200 ease-out",
            mobileOpen
              ? "scale-100 opacity-100"
              : "scale-90 opacity-0 pointer-events-none"
          )}
          style={{ maxWidth: "calc(100vw - 24px)" }}
        >
          {toolbarItems}
        </div>
      </div>
    </div>
  );
}
