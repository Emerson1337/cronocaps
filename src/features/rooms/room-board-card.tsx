"use client";

import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui";
import { Copy, GripVertical, Trash2, UserPlus, Users } from "lucide-react";

export interface AssignmentDetail {
  readonly professionalName: string;
  readonly categoryName: string;
  readonly categoryColor: string;
}

interface RoomBoardCardProps {
  readonly slotNumber: number;
  readonly activityLabel: string;
  readonly assignmentCount: number;
  readonly onTap: () => void;
  readonly onQuickAdd: () => void;
  readonly onRemove: () => void;
  readonly onCopy?: (() => void) | undefined;
  readonly hasConflict: boolean;
  readonly className?: string;
  readonly showDetails?: boolean | undefined;
  readonly assignmentDetails?: ReadonlyArray<AssignmentDetail> | undefined;
  readonly dragHandleProps?:
    | {
        listeners: DraggableSyntheticListeners;
        attributes: Record<string, unknown>;
      }
    | undefined;
}

export function RoomBoardCard({
  slotNumber,
  activityLabel,
  assignmentCount,
  onTap,
  onQuickAdd,
  onRemove,
  onCopy,
  hasConflict,
  className,
  showDetails,
  assignmentDetails,
  dragHandleProps,
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
        "relative flex flex-col gap-1 rounded-lg border bg-surface-card p-2.5 text-left w-full",
        "min-h-[44px] min-w-[44px]",
        "transition-all duration-150 cursor-pointer",
        "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        hasConflict
          ? "border-error shadow-[0_0_8px_rgba(239,68,68,0.3)]"
          : "border-border shadow-sm",
        className
      )}
    >
      {dragHandleProps != null && (
        <button
          type="button"
          className="absolute top-2 right-2 p-2 rounded text-text-secondary/50 hover:text-text-secondary hover:bg-surface cursor-grab active:cursor-grabbing transition-colors"
          aria-label="Arrastar sala"
          onClick={(e) => e.stopPropagation()}
          {...dragHandleProps.listeners}
          {...dragHandleProps.attributes}
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
      )}
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
          {onCopy != null && (
            <IconButton
              label="Copiar sala"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="min-h-[36px] min-w-[36px] p-1"
            >
              <Copy size={15} aria-hidden="true" />
            </IconButton>
          )}
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

      {showDetails === true &&
        assignmentDetails != null &&
        assignmentDetails.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-border pt-1.5 mt-0.5">
            {assignmentDetails.map((detail, i) => (
              <div
                key={`${detail.professionalName}-${String(i)}`}
                className="flex items-center gap-1.5"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: detail.categoryColor }}
                />
                <span className="text-xs text-text-primary truncate flex-1">
                  {detail.professionalName}
                </span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full truncate max-w-[100px]"
                  style={{
                    backgroundColor: `${detail.categoryColor}20`,
                    color: detail.categoryColor,
                  }}
                >
                  {detail.categoryName}
                </span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
