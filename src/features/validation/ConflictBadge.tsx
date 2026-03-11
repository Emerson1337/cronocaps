"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConflictBadgeProps {
  readonly conflictCount: number;
  readonly hasErrors: boolean;
  readonly onClick: () => void;
}

export function ConflictBadge({ conflictCount, hasErrors, onClick }: ConflictBadgeProps) {
  if (conflictCount === 0) return null;

  const label = conflictCount === 1 ? "conflito" : "conflitos";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] min-w-[44px] cursor-pointer rounded-lg p-1",
        "flex items-center justify-center gap-1",
        "active:scale-95 transition-transform",
        hasErrors ? "text-error" : "text-warning"
      )}
      aria-label={`${String(conflictCount)} ${label} encontrado${conflictCount === 1 ? "" : "s"}`}
    >
      <AlertTriangle size={18} className={cn(!hasErrors && "animate-conflict-pulse")} aria-hidden="true" />
      <span className="text-sm font-semibold">{String(conflictCount)}</span>
    </button>
  );
}
