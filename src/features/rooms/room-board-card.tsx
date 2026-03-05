"use client";

import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui";
import { Trash2, UserPlus, Users } from "lucide-react";

interface RoomBoardCardProps {
  readonly slotNumber: number;
  readonly activityLabel: string;
  readonly assignmentCount: number;
  readonly onTap: () => void;
  readonly onQuickAdd: () => void;
  readonly onRemove: () => void;
  readonly hasConflict: boolean;
  readonly className?: string;
}

export function RoomBoardCard({
  slotNumber,
  activityLabel,
  assignmentCount,
  onTap,
  onQuickAdd,
  onRemove,
  hasConflict,
  className,
}: RoomBoardCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      className={cn(
        "flex flex-col gap-1 rounded-lg border bg-surface-card p-2.5 text-left w-full",
        "min-h-[44px] min-w-[44px]",
        "transition-all duration-150 cursor-pointer",
        "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        hasConflict
          ? "border-error shadow-[0_0_8px_rgba(239,68,68,0.3)]"
          : "border-border",
        className
      )}
    >
      <span className="text-xs text-text-secondary truncate w-full">
        {`Sala ${String(slotNumber)}`}
      </span>
      <span className="text-sm font-semibold text-text-primary truncate w-full">
        {activityLabel}
      </span>
      <div className="flex items-center justify-between w-full mt-1">
        <span className="text-xs text-text-secondary flex items-center gap-1">
          <Users size={14} aria-hidden="true" />
          {assignmentCount}x
        </span>
        <div className="flex items-center gap-0.5">
          <IconButton
            label="Adicionar profissional"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            className="min-h-[36px] min-w-[36px] p-1"
          >
            <UserPlus size={16} aria-hidden="true" />
          </IconButton>
          <IconButton
            label="Remover sala"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="min-h-[36px] min-w-[36px] p-1"
          >
            <Trash2 size={15} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
