import type { WeekDay } from "@/types";
import type { Conflict } from "./types";

function getHighestSeverity(conflicts: ReadonlyArray<Conflict>): "error" | "warning" | "none" {
  let hasError = false;
  let hasWarning = false;

  for (const conflict of conflicts) {
    if (conflict.severity === "error") {
      hasError = true;
    } else if (conflict.severity === "warning") {
      hasWarning = true;
    }
  }

  if (hasError) return "error";
  if (hasWarning) return "warning";
  return "none";
}

export function getAllocationConflictStyle(
  conflicts: ReadonlyArray<Conflict>,
  allocationId: string
): string {
  const matching = conflicts.filter((c) =>
    c.relatedAllocationIds.includes(allocationId)
  );

  const severity = getHighestSeverity(matching);

  if (severity === "error") {
    return "border-error shadow-[0_0_8px_rgba(239,68,68,0.3)]";
  }

  if (severity === "warning") {
    return "border-warning shadow-[0_0_6px_rgba(251,191,36,0.3)]";
  }

  return "";
}

export function getProfessionalConflictStyle(
  conflicts: ReadonlyArray<Conflict>,
  professionalId: string,
  day: WeekDay,
  shiftId: string
): string {
  const matching = conflicts.filter(
    (c) =>
      c.relatedProfessionalIds.includes(professionalId) &&
      c.day === day &&
      c.shiftId === shiftId
  );

  const severity = getHighestSeverity(matching);

  if (severity === "error") {
    return "border-error shadow-[0_0_8px_rgba(239,68,68,0.3)]";
  }

  if (severity === "warning") {
    return "border-warning shadow-[0_0_6px_rgba(251,191,36,0.3)]";
  }

  return "";
}
