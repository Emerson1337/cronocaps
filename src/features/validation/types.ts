import type { WeekDay } from "@/types";

export type ConflictType =
  | "PROFESSIONAL_DOUBLE_BOOKED"
  | "ROOM_OVER_CAPACITY"
  | "PROFESSIONAL_UNAVAILABLE"
  | "INITIAL_AND_FOLLOWUP_CONFLICT";

export type ConflictSeverity = "error" | "warning";

export interface Conflict {
  readonly id: string;
  readonly type: ConflictType;
  readonly severity: ConflictSeverity;
  readonly message: string;
  readonly relatedAllocationIds: ReadonlyArray<string>;
  readonly relatedProfessionalIds: ReadonlyArray<string>;
  readonly day: WeekDay;
  readonly shiftId: string;
}
