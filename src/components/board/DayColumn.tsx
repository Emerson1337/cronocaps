"use client";

import React from "react";
import { WEEKDAY_LABELS } from "@/lib/constants";
import { ShiftSection } from "./ShiftSection";
import { DroppableShiftZone } from "@/components/dnd/DroppableShiftZone";
import type { Allocation, Shift, WeekDay } from "@/types";

interface DayColumnProps {
  readonly day: WeekDay;
  readonly shifts: ReadonlyArray<Shift>;
  readonly allocations: ReadonlyArray<Allocation>;
  readonly roomsPerShift: number;
  readonly onAllocationTap: (allocationId: string) => void;
  readonly onAllocationQuickAdd: (allocationId: string) => void;
  readonly onAllocationRemove: (allocationId: string) => void;
  readonly getConflictStyle: (allocationId: string) => string;
}

function DayColumnComponent({
  day,
  shifts,
  allocations,
  roomsPerShift,
  onAllocationTap,
  onAllocationQuickAdd,
  onAllocationRemove,
  getConflictStyle,
}: DayColumnProps) {
  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      <h2 className="text-sm font-semibold uppercase text-text-secondary text-center py-1.5">
        📅 {WEEKDAY_LABELS[day]}
      </h2>

      <div className="flex flex-col gap-3 px-1">
        {shifts.map((shift) => {
          const shiftAllocations = allocations.filter(
            (a) => a.day === day && a.shiftId === shift.id
          );

          const isOverCapacity = shiftAllocations.length >= roomsPerShift;

          return (
            <DroppableShiftZone
              key={shift.id}
              day={day}
              shiftId={shift.id}
              isOverCapacity={isOverCapacity}
            >
              <ShiftSection
                shift={shift}
                allocations={shiftAllocations}
                droppableId={`${day}:${shift.id}`}
                onAllocationTap={onAllocationTap}
                onAllocationQuickAdd={onAllocationQuickAdd}
                onAllocationRemove={onAllocationRemove}
                getConflictStyle={getConflictStyle}
              />
            </DroppableShiftZone>
          );
        })}
      </div>
    </div>
  );
}

export const DayColumn = React.memo(DayColumnComponent);
