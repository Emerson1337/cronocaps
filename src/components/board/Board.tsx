"use client";

import { DayColumn } from "./DayColumn";
import type { Allocation, Shift, WeekDay, Professional, Category } from "@/types";

interface BoardProps {
  readonly days: ReadonlyArray<WeekDay>;
  readonly shifts: ReadonlyArray<Shift>;
  readonly allocations: ReadonlyArray<Allocation>;
  readonly roomsPerShift: number;
  readonly onAllocationTap: (allocationId: string) => void;
  readonly onAllocationQuickAdd: (allocationId: string) => void;
  readonly onAllocationRemove: (allocationId: string) => void;
  readonly onAllocationCopy?: ((allocationId: string) => void) | undefined;
  readonly onPaste?: ((day: WeekDay, shiftId: string) => void) | undefined;
  readonly hasClipboard?: boolean | undefined;
  readonly getConflictStyle: (allocationId: string) => string;
  readonly showDetails?: boolean | undefined;
  readonly professionals?: ReadonlyArray<Professional> | undefined;
  readonly categories?: ReadonlyArray<Category> | undefined;
  readonly onAddRoom?: ((day: WeekDay, shiftId: string) => void) | undefined;
}

export function Board({
  days,
  shifts,
  allocations,
  roomsPerShift,
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
}: BoardProps) {
  return (
    <div className="flex-1 overflow-auto scrollbar-minimal">
      <div
        className="grid gap-4 p-4"
        style={{
          gridTemplateColumns: `repeat(${String(days.length)}, minmax(314px, 1fr))`,
          gridTemplateRows: `auto repeat(${String(shifts.length)}, 1fr)`,
        }}
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
            onAllocationCopy={onAllocationCopy}
            onPaste={onPaste}
            hasClipboard={hasClipboard}
            getConflictStyle={getConflictStyle}
            showDetails={showDetails}
            professionals={professionals}
            categories={categories}
            onAddRoom={onAddRoom}
          />
        ))}
      </div>
    </div>
  );
}
