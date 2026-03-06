"use client";

import React, { useMemo, type CSSProperties, type ReactNode } from "react";
import { useDraggable, type DraggableSyntheticListeners } from "@dnd-kit/core";
import type { ProfessionalDragData } from "./types";
import { draggingSourceStyle } from "./animations";

interface DraggableProfessionalProps {
  readonly professionalId: string;
  readonly professionalName: string;
  readonly categoryId: string;
  readonly availability: ReadonlyArray<{ readonly day: string; readonly shiftId: string }>;
  readonly children: (handleProps: {
    listeners: DraggableSyntheticListeners;
    attributes: Record<string, unknown>;
  }) => ReactNode;
}

export const DraggableProfessional = React.memo(
  function DraggableProfessional({
    professionalId,
    professionalName,
    categoryId,
    availability,
    children,
  }: DraggableProfessionalProps) {
    const data = useMemo<ProfessionalDragData>(
      () => ({
        type: "professional" as const,
        professionalId,
        professionalName,
        categoryId,
        availability,
      }),
      [professionalId, professionalName, categoryId, availability]
    );

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `draggable-professional:${professionalId}`,
      data,
    });

    const style: CSSProperties = isDragging
      ? { ...draggingSourceStyle, touchAction: "none" }
      : { touchAction: "none" };

    return (
      <div ref={setNodeRef} style={style}>
        {children({ listeners, attributes: { ...attributes, style: { touchAction: "none" } } })}
      </div>
    );
  }
);
