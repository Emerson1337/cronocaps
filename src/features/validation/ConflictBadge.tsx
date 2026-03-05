"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConflictBadgeProps {
  readonly conflictCount: number;
  readonly hasErrors: boolean;
  readonly onClick: () => void;
}

export function ConflictBadge({ conflictCount, hasErrors, onClick }: ConflictBadgeProps) {
  if (conflictCount === 0) return null;

  const variant = hasErrors ? "error" : "warning";
  const label = conflictCount === 1 ? "conflito" : "conflitos";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] min-w-[44px] cursor-pointer rounded-lg p-1",
        "flex items-center justify-center",
        "active:scale-95 transition-transform"
      )}
      aria-label={`${String(conflictCount)} ${label} encontrado${conflictCount === 1 ? "" : "s"}`}
    >
      <Badge variant={variant} className={cn("px-3 py-1 text-sm", hasErrors ? "" : "animate-conflict-pulse")}>
        {String(conflictCount)} {label}
      </Badge>
    </button>
  );
}
