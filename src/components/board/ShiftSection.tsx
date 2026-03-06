"use client";

import React from "react";
import { ClipboardPaste, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { RoomBoardCard } from "@/features/rooms/room-board-card";
import type { AssignmentDetail } from "@/features/rooms/room-board-card";
import { DroppableRoomTarget } from "@/components/dnd/DroppableRoomTarget";
import { DraggableAllocation } from "@/components/dnd/DraggableAllocation";
import type { Allocation, Shift, Professional, Category } from "@/types";

interface ShiftSectionProps {
  readonly shift: Shift;
  readonly allocations: ReadonlyArray<Allocation>;
  readonly droppableId: string;
  readonly isDropTarget?: boolean | undefined;
  readonly isDragOver?: boolean | undefined;
  readonly onAllocationTap: (allocationId: string) => void;
  readonly onAllocationQuickAdd: (allocationId: string) => void;
  readonly onAllocationRemove: (allocationId: string) => void;
  readonly onAllocationCopy?: ((allocationId: string) => void) | undefined;
  readonly onPaste?: (() => void) | undefined;
  readonly hasClipboard?: boolean | undefined;
  readonly getConflictStyle: (allocationId: string) => string;
  readonly showDetails?: boolean | undefined;
  readonly professionals?: ReadonlyArray<Professional> | undefined;
  readonly categories?: ReadonlyArray<Category> | undefined;
  readonly onAddRoom?: (() => void) | undefined;
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
  onAllocationCopy,
  onPaste,
  hasClipboard,
  getConflictStyle,
  showDetails,
  professionals,
  categories,
  onAddRoom,
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
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase text-text-secondary tracking-wide">
            {shift.label === "Manhã"
              ? "☀️"
              : shift.label === "Tarde"
                ? "🌥️"
                : shift.label === "Noite"
                  ? "🌙"
                  : "🕐"}{" "}
            {shift.label}
          </span>
          <span className="text-xs text-text-secondary">
            ({shift.startTime}&ndash;{shift.endTime})
          </span>
        </div>
        {onPaste != null && (
          <Button
            variant="ghost"
            onClick={hasClipboard === true ? onPaste : undefined}
            className={cn(
              "ml-auto text-xs px-2 py-1 h-auto gap-1 transition-opacity",
              hasClipboard === true
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
            tabIndex={hasClipboard === true ? 0 : -1}
          >
            <ClipboardPaste size={14} aria-hidden="true" />
            <span className="hidden xl:block">Colar sala</span>
          </Button>
        )}
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
          <span className="text-sm text-center animate-fade-in">
            {"Arraste uma sala para cá"}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {allocations.map((allocation, index) => {
            const conflictClassName = getConflictStyle(allocation.id);
            const hasConflict = conflictClassName.length > 0;

            let assignmentDetails: ReadonlyArray<AssignmentDetail> | undefined;
            if (
              showDetails === true &&
              professionals != null &&
              categories != null
            ) {
              assignmentDetails = allocation.assignments.map((a) => {
                const prof = professionals.find(
                  (p) => p.id === a.professionalId
                );
                const cat =
                  prof != null
                    ? categories.find((c) => c.id === prof.categoryId)
                    : undefined;
                return {
                  professionalName: prof?.name ?? "Desconhecido",
                  categoryName: cat?.name ?? "",
                  categoryColor: cat?.color ?? "#999",
                };
              });
            }

            return (
              <DraggableAllocation
                key={allocation.id}
                allocationId={allocation.id}
                sourceDay={allocation.day}
                sourceShiftId={allocation.shiftId}
                activityLabel={allocation.activityLabel}
              >
                <DroppableRoomTarget
                  allocationId={allocation.id}
                  day={allocation.day}
                  shiftId={allocation.shiftId}
                  assignedProfessionalIds={allocation.assignments.map(
                    (a) => a.professionalId
                  )}
                >
                  <RoomBoardCard
                    slotNumber={index + 1}
                    activityLabel={allocation.activityLabel}
                    assignmentCount={allocation.assignments.length}
                    onTap={() => onAllocationTap(allocation.id)}
                    onQuickAdd={() => onAllocationQuickAdd(allocation.id)}
                    onRemove={() => onAllocationRemove(allocation.id)}
                    onCopy={
                      onAllocationCopy != null
                        ? () => onAllocationCopy(allocation.id)
                        : undefined
                    }
                    hasConflict={hasConflict}
                    className={conflictClassName}
                    showDetails={showDetails}
                    assignmentDetails={assignmentDetails}
                  />
                </DroppableRoomTarget>
              </DraggableAllocation>
            );
          })}
        </div>
      )}

      {onAddRoom != null && (
        <Button
          variant="ghost"
          onClick={onAddRoom}
          className="w-full text-xs py-1.5 h-auto gap-1 border border-dashed border-border text-text-secondary hover:border-primary hover:text-primary"
        >
          <Plus size={14} aria-hidden="true" />
          Adicionar Sala
        </Button>
      )}
    </div>
  );
}

export const ShiftSection = React.memo(ShiftSectionComponent);
