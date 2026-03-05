"use client";

import { useCallback, useMemo } from "react";
import { generateId } from "@/lib/utils";
import type {
  Allocation,
  ProfessionalAssignment,
  WeekDay,
  Workspace,
} from "@/types";

interface UseScheduleParams {
  readonly workspace: Workspace | null;
  readonly updateWorkspace: (updater: (prev: Workspace) => Workspace) => void;
}

interface UseScheduleReturn {
  readonly addAllocation: (
    day: WeekDay,
    shiftId: string,
    activityLabel: string
  ) => void;
  readonly removeAllocation: (allocationId: string) => void;
  readonly updateAllocationActivity: (
    allocationId: string,
    label: string
  ) => void;
  readonly addAssignment: (
    allocationId: string,
    professionalId: string,
    startTime: string,
    endTime: string
  ) => void;
  readonly removeAssignment: (
    allocationId: string,
    professionalId: string
  ) => void;
  readonly updateAssignment: (
    allocationId: string,
    professionalId: string,
    startTime: string,
    endTime: string
  ) => void;
  readonly getAllocationsForSlot: (
    day: WeekDay,
    shiftId: string
  ) => ReadonlyArray<Allocation>;
  readonly getRoomCountInShift: (day: WeekDay, shiftId: string) => number;
}

export function useSchedule({
  workspace,
  updateWorkspace,
}: UseScheduleParams): UseScheduleReturn {
  const allocations = useMemo(() => workspace?.allocations ?? [], [workspace?.allocations]);

  const addAllocation = useCallback(
    (
      day: WeekDay,
      shiftId: string,
      activityLabel: string
    ) => {
      const newAllocation: Allocation = {
        id: generateId(),
        day,
        shiftId,
        activityLabel,
        assignments: [],
      };

      updateWorkspace((prev) => ({
        ...prev,
        allocations: [...prev.allocations, newAllocation],
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const removeAllocation = useCallback(
    (allocationId: string) => {
      updateWorkspace((prev) => ({
        ...prev,
        allocations: prev.allocations.filter((a) => a.id !== allocationId),
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const updateAllocationActivity = useCallback(
    (allocationId: string, label: string) => {
      updateWorkspace((prev) => ({
        ...prev,
        allocations: prev.allocations.map((a) =>
          a.id === allocationId ? { ...a, activityLabel: label } : a
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const addAssignment = useCallback(
    (
      allocationId: string,
      professionalId: string,
      startTime: string,
      endTime: string
    ) => {
      const newAssignment: ProfessionalAssignment = {
        professionalId,
        startTime,
        endTime,
      };

      updateWorkspace((prev) => ({
        ...prev,
        allocations: prev.allocations.map((a) =>
          a.id === allocationId
            ? { ...a, assignments: [...a.assignments, newAssignment] }
            : a
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const removeAssignment = useCallback(
    (allocationId: string, professionalId: string) => {
      updateWorkspace((prev) => ({
        ...prev,
        allocations: prev.allocations.map((a) =>
          a.id === allocationId
            ? {
                ...a,
                assignments: a.assignments.filter(
                  (assign) => assign.professionalId !== professionalId
                ),
              }
            : a
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const updateAssignment = useCallback(
    (
      allocationId: string,
      professionalId: string,
      startTime: string,
      endTime: string
    ) => {
      updateWorkspace((prev) => ({
        ...prev,
        allocations: prev.allocations.map((a) =>
          a.id === allocationId
            ? {
                ...a,
                assignments: a.assignments.map((assign) =>
                  assign.professionalId === professionalId
                    ? { ...assign, startTime, endTime }
                    : assign
                ),
              }
            : a
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const getAllocationsForSlot = useCallback(
    (day: WeekDay, shiftId: string): ReadonlyArray<Allocation> => {
      return allocations.filter(
        (a) => a.day === day && a.shiftId === shiftId
      );
    },
    [allocations]
  );

  const getRoomCountInShift = useCallback(
    (day: WeekDay, shiftId: string): number => {
      return allocations.filter(
        (a) => a.day === day && a.shiftId === shiftId
      ).length;
    },
    [allocations]
  );

  return useMemo(
    () => ({
      addAllocation,
      removeAllocation,
      updateAllocationActivity,
      addAssignment,
      removeAssignment,
      updateAssignment,
      getAllocationsForSlot,
      getRoomCountInShift,
    }),
    [
      addAllocation,
      removeAllocation,
      updateAllocationActivity,
      addAssignment,
      removeAssignment,
      updateAssignment,
      getAllocationsForSlot,
      getRoomCountInShift,
    ]
  );
}
