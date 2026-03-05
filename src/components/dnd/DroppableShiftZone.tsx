"use client";

import React, { type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { WeekDay } from "@/types";
import { SHIFT_DROP_PREFIX } from "./types";
import { useDndState } from "./DndProvider";

interface DroppableShiftZoneProps {
  readonly day: WeekDay;
  readonly shiftId: string;
  readonly children: ReactNode;
  readonly isOverCapacity: boolean;
}

export const DroppableShiftZone = React.memo(function DroppableShiftZone({
  day,
  shiftId,
  children,
  isOverCapacity,
}: DroppableShiftZoneProps) {
  const droppableId = `${SHIFT_DROP_PREFIX}${day}:${shiftId}`;

  const { activeDragItem } = useDndState();

  const isRoomBeingDragged =
    activeDragItem !== null && activeDragItem.type === "room";

  const isDisabled = isRoomBeingDragged && isOverCapacity;

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    disabled: isDisabled,
  });

  const isActiveTarget = isOver && isRoomBeingDragged && !isDisabled;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative rounded-xl transition-all duration-200",
        isDisabled &&
          "opacity-50 cursor-not-allowed",
        isActiveTarget &&
          "ring-2 ring-primary ring-offset-2 ring-offset-surface bg-primary/10 scale-[1.01]",
        isRoomBeingDragged && !isDisabled && !isActiveTarget &&
          "ring-1 ring-primary/40 ring-offset-1 ring-offset-surface bg-primary/5"
      )}
    >
      {children}

      {isDisabled && isOver && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 rounded-xl bg-surface/80 backdrop-blur-[2px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-error"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <span className="text-xs font-medium text-error text-center px-2">
            Todas as salas deste turno ja foram preenchidas
          </span>
        </div>
      )}

      {isDisabled && !isOver && (
        <div className="absolute inset-0 z-10 rounded-xl" style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)",
        }} />
      )}
    </div>
  );
});
