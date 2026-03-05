"use client";

import { useCallback, useMemo } from "react";
import { generateId } from "@/lib/utils";
import type {
  Allocation,
  AvailabilitySlot,
  Professional,
  WeekDay,
  Workspace,
} from "@/types";

interface UseProfessionalsParams {
  readonly workspace: Workspace | null;
  readonly updateWorkspace: (updater: (prev: Workspace) => Workspace) => void;
}

interface AddProfessionalData {
  readonly name: string;
  readonly categoryId: string;
  readonly availability: ReadonlyArray<AvailabilitySlot>;
}

interface UpdateProfessionalData {
  readonly name?: string;
  readonly categoryId?: string;
  readonly availability?: ReadonlyArray<AvailabilitySlot>;
}

interface UseProfessionalsReturn {
  readonly professionals: ReadonlyArray<Professional>;
  readonly addProfessional: (data: AddProfessionalData) => void;
  readonly updateProfessional: (id: string, data: UpdateProfessionalData) => void;
  readonly removeProfessional: (id: string) => void;
  readonly getProfessionalsByCategory: () => Map<string, ReadonlyArray<Professional>>;
  readonly getAvailableProfessionals: (day: WeekDay, shiftId: string) => ReadonlyArray<Professional>;
  readonly isProfessionalAllocated: (id: string) => boolean;
  readonly getProfessionalAllocations: (id: string) => ReadonlyArray<Allocation>;
}

export function useProfessionals({
  workspace,
  updateWorkspace,
}: UseProfessionalsParams): UseProfessionalsReturn {
  const professionals = useMemo(() => workspace?.professionals ?? [], [workspace?.professionals]);

  const addProfessional = useCallback(
    (data: AddProfessionalData) => {
      const newProfessional: Professional = {
        id: generateId(),
        name: data.name,
        categoryId: data.categoryId,
        availability: data.availability,
      };
      updateWorkspace((prev) => ({
        ...prev,
        professionals: [...prev.professionals, newProfessional],
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const updateProfessional = useCallback(
    (id: string, data: UpdateProfessionalData) => {
      updateWorkspace((prev) => ({
        ...prev,
        professionals: prev.professionals.map((p) =>
          p.id === id
            ? {
                ...p,
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
                ...(data.availability !== undefined ? { availability: data.availability } : {}),
              }
            : p
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const removeProfessional = useCallback(
    (id: string) => {
      updateWorkspace((prev) => ({
        ...prev,
        professionals: prev.professionals.filter((p) => p.id !== id),
        allocations: prev.allocations.map((alloc) => ({
          ...alloc,
          assignments: alloc.assignments.filter((a) => a.professionalId !== id),
        })),
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const getProfessionalsByCategory = useCallback((): Map<
    string,
    ReadonlyArray<Professional>
  > => {
    const map = new Map<string, ReadonlyArray<Professional>>();
    for (const p of professionals) {
      const existing = map.get(p.categoryId);
      if (existing !== undefined) {
        map.set(p.categoryId, [...existing, p]);
      } else {
        map.set(p.categoryId, [p]);
      }
    }
    return map;
  }, [professionals]);

  const getAvailableProfessionals = useCallback(
    (day: WeekDay, shiftId: string): ReadonlyArray<Professional> => {
      return professionals.filter((p) =>
        p.availability.some((slot) => slot.day === day && slot.shiftId === shiftId)
      );
    },
    [professionals]
  );

  const allocations = useMemo(() => workspace?.allocations ?? [], [workspace?.allocations]);

  const isProfessionalAllocated = useCallback(
    (id: string): boolean => {
      return allocations.some((alloc) =>
        alloc.assignments.some((a) => a.professionalId === id)
      );
    },
    [allocations]
  );

  const getProfessionalAllocations = useCallback(
    (id: string): ReadonlyArray<Allocation> => {
      return allocations.filter((alloc) =>
        alloc.assignments.some((a) => a.professionalId === id)
      );
    },
    [allocations]
  );

  return useMemo(
    () => ({
      professionals,
      addProfessional,
      updateProfessional,
      removeProfessional,
      getProfessionalsByCategory,
      getAvailableProfessionals,
      isProfessionalAllocated,
      getProfessionalAllocations,
    }),
    [
      professionals,
      addProfessional,
      updateProfessional,
      removeProfessional,
      getProfessionalsByCategory,
      getAvailableProfessionals,
      isProfessionalAllocated,
      getProfessionalAllocations,
    ]
  );
}
