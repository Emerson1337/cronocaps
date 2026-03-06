"use client";

import React, { useMemo, type CSSProperties, type ReactNode } from "react";
import { useDraggable, type DraggableSyntheticListeners } from "@dnd-kit/core";
import type { AllocationDragData } from "./types";
import { draggingSourceStyle } from "./animations";
import { useDndState } from "./DndProvider";

interface DraggableAllocationProps {
  readonly allocationId: string;
  readonly sourceDay: string;
  readonly sourceShiftId: string;
  readonly activityLabel: string;
  readonly children: (handleProps: {
    listeners: DraggableSyntheticListeners;
    attributes: Record<string, unknown>;
  }) => ReactNode;
}

export const DraggableAllocation = React.memo(
  function DraggableAllocation({
    allocationId,
    sourceDay,
    sourceShiftId,
    activityLabel,
    children,
  }: DraggableAllocationProps) {
    const data = useMemo<AllocationDragData>(
      () => ({
        type: "allocation" as const,
        allocationId,
        sourceDay,
        sourceShiftId,
        activityLabel,
      }),
      [allocationId, sourceDay, sourceShiftId, activityLabel]
    );

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `draggable-allocation:${allocationId}`,
      data,
    });

    const { activeDragItem } = useDndState();
    const isRoomBeingDragged =
      activeDragItem !== null && activeDragItem.type === "room";

    const style: CSSProperties = isDragging
      ? { ...draggingSourceStyle, touchAction: "none" }
      : isRoomBeingDragged
        ? { touchAction: "none", pointerEvents: "none" }
        : { touchAction: "none" };

    return (
      <div ref={setNodeRef} style={style}>
        {children({ listeners, attributes: { ...attributes, style: { touchAction: "none" } } })}
      </div>
    );
  }
);
