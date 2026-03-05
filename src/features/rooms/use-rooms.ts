import { useCallback } from "react";
import type { Workspace, WeekDay } from "@/types";

interface UseRoomsParams {
  readonly workspace: Workspace | null;
  readonly updateWorkspace: (updater: (prev: Workspace) => Workspace) => void;
}

export function useRooms({ workspace }: UseRoomsParams) {
  const getTotalRoomsInShift = useCallback(
    (day: WeekDay, shiftId: string): number => {
      if (workspace === null) return 0;
      return workspace.allocations.filter(
        (a) => a.day === day && a.shiftId === shiftId
      ).length;
    },
    [workspace]
  );

  return {
    getTotalRoomsInShift,
  };
}
