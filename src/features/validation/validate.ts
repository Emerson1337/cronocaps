import type { Allocation, Workspace } from "@/types";
import { WEEKDAY_LABELS } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import type { Conflict } from "./types";

function getShiftLabel(workspace: Workspace, shiftId: string): string {
  const shift = workspace.shifts.find((s) => s.id === shiftId);
  return shift !== undefined ? shift.label : shiftId;
}

function getProfessionalName(workspace: Workspace, professionalId: string): string {
  const professional = workspace.professionals.find((p) => p.id === professionalId);
  return professional !== undefined ? professional.name : professionalId;
}

function detectDoubleBooking(workspace: Workspace): ReadonlyArray<Conflict> {
  const conflicts: Array<Conflict> = [];
  const slotMap = new Map<string, ReadonlyArray<Allocation>>();

  for (const allocation of workspace.allocations) {
    const key = `${allocation.day}::${allocation.shiftId}`;
    const existing = slotMap.get(key);
    if (existing !== undefined) {
      slotMap.set(key, [...existing, allocation]);
    } else {
      slotMap.set(key, [allocation]);
    }
  }

  for (const [, allocations] of slotMap) {
    if (allocations.length < 2) continue;

    const professionalAllocations = new Map<string, Array<string>>();

    for (const allocation of allocations) {
      for (const assignment of allocation.assignments) {
        const existing = professionalAllocations.get(assignment.professionalId);
        if (existing !== undefined) {
          existing.push(allocation.id);
        } else {
          professionalAllocations.set(assignment.professionalId, [allocation.id]);
        }
      }
    }

    for (const [professionalId, allocationIds] of professionalAllocations) {
      if (allocationIds.length < 2) continue;

      const firstAllocation = allocations[0];
      if (firstAllocation === undefined) continue;

      const dayLabel = WEEKDAY_LABELS[firstAllocation.day];
      const shiftLabel = getShiftLabel(workspace, firstAllocation.shiftId);
      const name = getProfessionalName(workspace, professionalId);

      conflicts.push({
        id: generateId(),
        type: "PROFESSIONAL_DOUBLE_BOOKED",
        severity: "warning",
        message: `${name} está alocado(a) em mais de uma sala em ${dayLabel} ${shiftLabel}`,
        relatedAllocationIds: allocationIds,
        relatedProfessionalIds: [professionalId],
        day: firstAllocation.day,
        shiftId: firstAllocation.shiftId,
      });
    }
  }

  return conflicts;
}

function detectRoomOverCapacity(workspace: Workspace): ReadonlyArray<Conflict> {
  const conflicts: Array<Conflict> = [];
  const maxRooms = workspace.roomsPerShift;
  const slotMap = new Map<string, ReadonlyArray<Allocation>>();

  for (const allocation of workspace.allocations) {
    const key = `${allocation.day}::${allocation.shiftId}`;
    const existing = slotMap.get(key);
    if (existing !== undefined) {
      slotMap.set(key, [...existing, allocation]);
    } else {
      slotMap.set(key, [allocation]);
    }
  }

  for (const [, allocations] of slotMap) {
    if (allocations.length <= maxRooms) continue;

    const firstAllocation = allocations[0];
    if (firstAllocation === undefined) continue;

    const dayLabel = WEEKDAY_LABELS[firstAllocation.day];
    const shiftLabel = getShiftLabel(workspace, firstAllocation.shiftId);

    conflicts.push({
      id: generateId(),
      type: "ROOM_OVER_CAPACITY",
      severity: "error",
      message: `Número de salas em ${dayLabel} ${shiftLabel} excede o limite de ${String(maxRooms)} salas`,
      relatedAllocationIds: allocations.map((a) => a.id),
      relatedProfessionalIds: [],
      day: firstAllocation.day,
      shiftId: firstAllocation.shiftId,
    });
  }

  return conflicts;
}

function detectProfessionalUnavailable(workspace: Workspace): ReadonlyArray<Conflict> {
  const conflicts: Array<Conflict> = [];

  const availabilitySet = new Set<string>();
  for (const professional of workspace.professionals) {
    for (const slot of professional.availability) {
      availabilitySet.add(`${professional.id}::${slot.day}::${slot.shiftId}`);
    }
  }

  for (const allocation of workspace.allocations) {
    for (const assignment of allocation.assignments) {
      const key = `${assignment.professionalId}::${allocation.day}::${allocation.shiftId}`;
      if (!availabilitySet.has(key)) {
        const dayLabel = WEEKDAY_LABELS[allocation.day];
        const shiftLabel = getShiftLabel(workspace, allocation.shiftId);
        const name = getProfessionalName(workspace, assignment.professionalId);

        conflicts.push({
          id: generateId(),
          type: "PROFESSIONAL_UNAVAILABLE",
          severity: "warning",
          message: `${name} não está disponível em ${dayLabel} ${shiftLabel}`,
          relatedAllocationIds: [allocation.id],
          relatedProfessionalIds: [assignment.professionalId],
          day: allocation.day,
          shiftId: allocation.shiftId,
        });
      }
    }
  }

  return conflicts;
}

function detectInitialAndFollowupConflict(workspace: Workspace): ReadonlyArray<Conflict> {
  const conflicts: Array<Conflict> = [];
  const slotMap = new Map<string, ReadonlyArray<Allocation>>();

  for (const allocation of workspace.allocations) {
    const key = `${allocation.day}::${allocation.shiftId}`;
    const existing = slotMap.get(key);
    if (existing !== undefined) {
      slotMap.set(key, [...existing, allocation]);
    } else {
      slotMap.set(key, [allocation]);
    }
  }

  for (const [, allocations] of slotMap) {
    const initialAllocations: Array<Allocation> = [];
    const followupAllocations: Array<Allocation> = [];

    for (const allocation of allocations) {
      const labelLower = allocation.activityLabel.toLowerCase();
      if (labelLower.includes("acolhimento inicial")) {
        initialAllocations.push(allocation);
      }
      if (labelLower.includes("acolhimento de seguimento")) {
        followupAllocations.push(allocation);
      }
    }

    if (initialAllocations.length === 0 || followupAllocations.length === 0) continue;

    const professionalInitialMap = new Map<string, string>();
    for (const alloc of initialAllocations) {
      for (const assignment of alloc.assignments) {
        professionalInitialMap.set(assignment.professionalId, alloc.id);
      }
    }

    for (const alloc of followupAllocations) {
      for (const assignment of alloc.assignments) {
        const initialAllocId = professionalInitialMap.get(assignment.professionalId);
        if (initialAllocId !== undefined) {
          const firstAllocation = allocations[0];
          if (firstAllocation === undefined) continue;

          const name = getProfessionalName(workspace, assignment.professionalId);

          conflicts.push({
            id: generateId(),
            type: "INITIAL_AND_FOLLOWUP_CONFLICT",
            severity: "warning",
            message: `${name} não pode realizar Acolhimento Inicial e de Seguimento no mesmo turno`,
            relatedAllocationIds: [initialAllocId, alloc.id],
            relatedProfessionalIds: [assignment.professionalId],
            day: firstAllocation.day,
            shiftId: firstAllocation.shiftId,
          });
        }
      }
    }
  }

  return conflicts;
}

export function validateWorkspace(workspace: Workspace): ReadonlyArray<Conflict> {
  return [
    ...detectDoubleBooking(workspace),
    ...detectRoomOverCapacity(workspace),
    ...detectProfessionalUnavailable(workspace),
    ...detectInitialAndFollowupConflict(workspace),
  ];
}
