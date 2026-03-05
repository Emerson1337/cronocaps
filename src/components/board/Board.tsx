"use client";

import { DayColumn } from "./DayColumn";
import type { Allocation, Shift, WeekDay } from "@/types";

interface BoardProps {
  readonly days: ReadonlyArray<WeekDay>;
  readonly shifts: ReadonlyArray<Shift>;
  readonly allocations: ReadonlyArray<Allocation>;
  readonly roomsPerShift: number;
  readonly onAllocationTap: (allocationId: string) => void;
  readonly onAllocationQuickAdd: (allocationId: string) => void;
  readonly onAllocationRemove: (allocationId: string) => void;
  readonly getConflictStyle: (allocationId: string) => string;
}

export function Board({
  days,
  shifts,
  allocations,
  roomsPerShift,
  onAllocationTap,
  onAllocationQuickAdd,
  onAllocationRemove,
  getConflictStyle,
}: BoardProps) {
  return (
    <div className="flex-1 overflow-auto scrollbar-minimal">
      <div
        className="grid gap-4 p-4"
        style={{ gridTemplateColumns: `repeat(${String(days.length)}, minmax(220px, 1fr))` }}
      >
        {days.map((day) => (
          <DayColumn
            key={day}
            day={day}
            shifts={shifts}
            allocations={allocations}
            roomsPerShift={roomsPerShift}
            onAllocationTap={onAllocationTap}
            onAllocationQuickAdd={onAllocationQuickAdd}
            onAllocationRemove={onAllocationRemove}
            getConflictStyle={getConflictStyle}
          />
        ))}
      </div>
    </div>
  );
}
