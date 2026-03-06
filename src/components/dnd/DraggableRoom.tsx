"use client";

import React, { type CSSProperties, type ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { RoomDragData } from "./types";
import { draggingSourceStyle } from "./animations";

const ROOM_DRAG_DATA: RoomDragData = { type: "room" as const };

interface DraggableRoomProps {
  readonly children: ReactNode;
}

export const DraggableRoom = React.memo(function DraggableRoom({
  children,
}: DraggableRoomProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "draggable-room-icon",
    data: ROOM_DRAG_DATA,
  });

  const style: CSSProperties = isDragging
    ? { ...draggingSourceStyle, touchAction: "none" }
    : { touchAction: "none" };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
});
