"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui";
import { X, AlertTriangle, AlertCircle } from "lucide-react";
import type { Conflict } from "./types";

interface ConflictSummaryPanelProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly conflicts: ReadonlyArray<Conflict>;
}

const CONFLICT_TYPE_LABELS: Record<string, string> = {
  PROFESSIONAL_DOUBLE_BOOKED: "Dupla alocação",
  ROOM_OVER_CAPACITY: "Excesso de salas",
  PROFESSIONAL_UNAVAILABLE: "Indisponível",
  INITIAL_AND_FOLLOWUP_CONFLICT: "Conflito de atividade",
};

export function ConflictSummaryPanel({ open, onClose, conflicts }: ConflictSummaryPanelProps) {
  if (!open) return null;

  const errorCount = conflicts.filter((c) => c.severity === "error").length;
  const warningCount = conflicts.filter((c) => c.severity === "warning").length;

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-l border-border bg-surface-card shadow-lg",
        "animate-slide-in-right"
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">
          Conflitos ({String(conflicts.length)})
        </h2>
        <IconButton label="Fechar painel" variant="ghost" onClick={onClose}>
          <X size={18} aria-hidden="true" />
        </IconButton>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        {errorCount > 0 && (
          <Badge variant="error">{String(errorCount)} erro{errorCount === 1 ? "" : "s"}</Badge>
        )}
        {warningCount > 0 && (
          <Badge variant="warning">{String(warningCount)} aviso{warningCount === 1 ? "" : "s"}</Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-minimal">
        {conflicts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-text-secondary">
            <p className="text-sm">Nenhum conflito encontrado.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1 p-2">
            {conflicts.map((conflict) => (
              <li
                key={conflict.id}
                className={cn(
                  "flex items-start gap-2 rounded-lg p-3 text-sm",
                  conflict.severity === "error"
                    ? "bg-error/5"
                    : "bg-warning/5"
                )}
              >
                {conflict.severity === "error" ? (
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
                ) : (
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium text-text-secondary">
                    {CONFLICT_TYPE_LABELS[conflict.type] ?? conflict.type}
                  </span>
                  <span className="text-sm text-text-primary">{conflict.message}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
