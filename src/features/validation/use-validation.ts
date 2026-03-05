"use client";

import { useCallback, useMemo } from "react";
import type { WeekDay, Workspace } from "@/types";
import type { Conflict } from "./types";
import { validateWorkspace } from "./validate";

interface UseValidationParams {
  readonly workspace: Workspace | null;
}

interface UseValidationReturn {
  readonly conflicts: ReadonlyArray<Conflict>;
  readonly conflictCount: number;
  readonly hasConflicts: boolean;
  readonly getConflictsForAllocation: (allocationId: string) => ReadonlyArray<Conflict>;
  readonly getConflictsForProfessional: (professionalId: string, day: WeekDay, shiftId: string) => ReadonlyArray<Conflict>;
}

export function useValidation({ workspace }: UseValidationParams): UseValidationReturn {
  const conflicts = useMemo((): ReadonlyArray<Conflict> => {
    if (workspace === null) return [];
    return validateWorkspace(workspace);
  }, [workspace]);

  const conflictCount = conflicts.length;
  const hasConflicts = conflictCount > 0;

  const getConflictsForAllocation = useCallback(
    (allocationId: string): ReadonlyArray<Conflict> => {
      return conflicts.filter((c) =>
        c.relatedAllocationIds.includes(allocationId)
      );
    },
    [conflicts]
  );

  const getConflictsForProfessional = useCallback(
    (professionalId: string, day: WeekDay, shiftId: string): ReadonlyArray<Conflict> => {
      return conflicts.filter(
        (c) =>
          c.relatedProfessionalIds.includes(professionalId) &&
          c.day === day &&
          c.shiftId === shiftId
      );
    },
    [conflicts]
  );

  return useMemo(
    () => ({
      conflicts,
      conflictCount,
      hasConflicts,
      getConflictsForAllocation,
      getConflictsForProfessional,
    }),
    [conflicts, conflictCount, hasConflicts, getConflictsForAllocation, getConflictsForProfessional]
  );
}
