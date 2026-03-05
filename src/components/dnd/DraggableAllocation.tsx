"use client";

import React, { useMemo, type CSSProperties, type ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { AllocationDragData } from "./types";
import { draggingSourceStyle } from "./animations";

interface DraggableAllocationProps {
  readonly allocationId: string;
  readonly sourceDay: string;
  readonly sourceShiftId: string;
  readonly activityLabel: string;
  readonly children: ReactNode;
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

    const style: CSSProperties | undefined = isDragging
      ? draggingSourceStyle
      : undefined;

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        {children}
      </div>
    );
  }
);
