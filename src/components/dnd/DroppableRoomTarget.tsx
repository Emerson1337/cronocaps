"use client";

import React, { type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ROOM_CARD_DROP_PREFIX } from "./types";
import { useDndState } from "./DndProvider";

interface DroppableRoomTargetProps {
  readonly allocationId: string;
  readonly day: string;
  readonly shiftId: string;
  readonly assignedProfessionalIds: ReadonlyArray<string>;
  readonly children: ReactNode;
}

export const DroppableRoomTarget = React.memo(function DroppableRoomTarget({
  allocationId,
  day,
  shiftId,
  assignedProfessionalIds,
  children,
}: DroppableRoomTargetProps) {
  const droppableId = `${ROOM_CARD_DROP_PREFIX}${allocationId}`;

  const { activeDragItem } = useDndState();

  const isProfessionalBeingDragged =
    activeDragItem !== null && activeDragItem.type === "professional";

  const isRoomBeingDragged =
    activeDragItem !== null && activeDragItem.type === "room";

  const isAvailableForSlot =
    !isProfessionalBeingDragged ||
    activeDragItem.availability.some(
      (slot) => slot.day === day && slot.shiftId === shiftId
    );

  const isAlreadyAssigned =
    isProfessionalBeingDragged &&
    assignedProfessionalIds.includes(activeDragItem.professionalId);

  const isDisabled =
    isRoomBeingDragged || (isProfessionalBeingDragged && (!isAvailableForSlot || isAlreadyAssigned));

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    disabled: isDisabled,
  });

  const isActiveTarget = isOver && isProfessionalBeingDragged && !isDisabled;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg transition-all duration-200",
        isDisabled &&
          "opacity-40 cursor-not-allowed",
        isActiveTarget &&
          "ring-2 ring-primary ring-offset-2 ring-offset-surface scale-[1.02] shadow-md",
        isProfessionalBeingDragged && !isDisabled && !isActiveTarget &&
          "ring-1 ring-accent/50 ring-offset-1 ring-offset-surface bg-accent/5"
      )}
    >
      {children}
    </div>
  );
});
