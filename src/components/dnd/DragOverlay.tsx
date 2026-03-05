"use client";

import React from "react";
import { DragOverlay } from "@dnd-kit/core";
import { Card } from "@/components/ui";
import { RoomIcon } from "@/components/ui/RoomIcon";
import type { DragData } from "./types";
import { pickupStyle } from "./animations";
import { snapCenterToCursor } from "./modifiers";

function RoomOverlayContent() {
  return (
    <Card
      className="w-16 h-16 flex items-center justify-center cursor-grabbing"
      style={pickupStyle}
    >
      <RoomIcon size={40} />
    </Card>
  );
}

function AllocationOverlayContent({
  activityLabel,
}: {
  readonly activityLabel: string;
}) {
  return (
    <Card
      className="w-40 cursor-grabbing"
      style={pickupStyle}
    >
      <div className="flex items-center gap-2">
        <RoomIcon size={18} />
        <span className="text-sm font-medium text-text-primary truncate">
          {activityLabel}
        </span>
      </div>
    </Card>
  );
}

function ProfessionalOverlayContent({
  professionalName,
}: {
  readonly professionalName: string;
}) {
  return (
    <Card
      className="w-36 cursor-grabbing"
      style={pickupStyle}
    >
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="text-xs font-medium text-text-primary truncate">
          {professionalName}
        </span>
      </div>
    </Card>
  );
}

interface DndDragOverlayProps {
  readonly activeDragItem: DragData | null;
}

export const DndDragOverlay = React.memo(function DndDragOverlay({
  activeDragItem,
}: DndDragOverlayProps) {
  return (
    <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
      {activeDragItem !== null && activeDragItem.type === "room" ? (
        <RoomOverlayContent />
      ) : null}
      {activeDragItem !== null && activeDragItem.type === "professional" ? (
        <ProfessionalOverlayContent
          professionalName={activeDragItem.professionalName}
        />
      ) : null}
      {activeDragItem !== null && activeDragItem.type === "allocation" ? (
        <AllocationOverlayContent
          activityLabel={activeDragItem.activityLabel}
        />
      ) : null}
    </DragOverlay>
  );
});
