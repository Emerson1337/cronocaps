"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { RoomBoardCard } from "@/features/rooms/room-board-card";
import { DroppableRoomTarget } from "@/components/dnd/DroppableRoomTarget";
import type { Allocation, Shift } from "@/types";

interface ShiftSectionProps {
  readonly shift: Shift;
  readonly allocations: ReadonlyArray<Allocation>;
  readonly droppableId: string;
  readonly isDropTarget?: boolean | undefined;
  readonly isDragOver?: boolean | undefined;
  readonly onAllocationTap: (allocationId: string) => void;
  readonly onAllocationQuickAdd: (allocationId: string) => void;
  readonly onAllocationRemove: (allocationId: string) => void;
  readonly getConflictStyle: (allocationId: string) => string;
}

function ShiftSectionComponent({
  shift,
  allocations,
  droppableId,
  isDropTarget,
  isDragOver,
  onAllocationTap,
  onAllocationQuickAdd,
  onAllocationRemove,
  getConflictStyle,
}: ShiftSectionProps) {
  const isEmpty = allocations.length === 0;

  return (
    <div
      data-droppable-id={droppableId}
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 min-h-[100px] transition-colors duration-150",
        isDragOver === true
          ? "border-primary bg-primary-light/30"
          : isDropTarget === true
            ? "border-primary/50 bg-primary-light/10"
            : "border-border bg-surface"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase text-text-secondary tracking-wide">
          🕐 {shift.label}
        </span>
        <span className="text-xs text-text-secondary">
          ({shift.startTime}&ndash;{shift.endTime})
        </span>
      </div>

      {isEmpty ? (
        <div
          className={cn(
            "flex flex-1 items-center justify-center rounded-md border-2 border-dashed p-4 min-h-[80px]",
            isDragOver === true
              ? "border-primary text-primary animate-drop-zone-pulse"
              : "border-border text-text-secondary animate-empty-zone-breathe"
          )}
        >
          <span className="text-sm text-center animate-fade-in">{"Arraste uma sala para cá"}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {allocations.map((allocation, index) => {
            const conflictClassName = getConflictStyle(allocation.id);
            const hasConflict = conflictClassName.length > 0;

            return (
              <DroppableRoomTarget
                key={allocation.id}
                allocationId={allocation.id}
                day={allocation.day}
                shiftId={allocation.shiftId}
                assignedProfessionalIds={allocation.assignments.map((a) => a.professionalId)}
              >
                <RoomBoardCard
                  slotNumber={index + 1}
                  activityLabel={allocation.activityLabel}
                  assignmentCount={allocation.assignments.length}
                  onTap={() => onAllocationTap(allocation.id)}
                  onQuickAdd={() => onAllocationQuickAdd(allocation.id)}
                  onRemove={() => onAllocationRemove(allocation.id)}
                  hasConflict={hasConflict}
                  className={conflictClassName}
                />
              </DroppableRoomTarget>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const ShiftSection = React.memo(ShiftSectionComponent);
