export type WeekDay =
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado"
  | "domingo";

export interface Shift {
  readonly id: string;
  readonly label: string;
  readonly startTime: string;
  readonly endTime: string;
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export interface Professional {
  readonly id: string;
  readonly name: string;
  readonly categoryId: string;
  readonly availability: ReadonlyArray<AvailabilitySlot>;
}

export interface AvailabilitySlot {
  readonly day: WeekDay;
  readonly shiftId: string;
  readonly startTime?: string;
  readonly endTime?: string;
}

export interface ProfessionalAssignment {
  readonly professionalId: string;
  readonly startTime: string;
  readonly endTime: string;
}

export interface Allocation {
  readonly id: string;
  readonly day: WeekDay;
  readonly shiftId: string;
  readonly activityLabel: string;
  readonly assignments: ReadonlyArray<ProfessionalAssignment>;
}

export interface Workspace {
  readonly id: string;
  readonly name: string;
  readonly days: ReadonlyArray<WeekDay>;
  readonly shifts: ReadonlyArray<Shift>;
  readonly roomsPerShift: number;
  readonly activityPresets: ReadonlyArray<string>;
  readonly professionals: ReadonlyArray<Professional>;
  readonly categories: ReadonlyArray<Category>;
  readonly allocations: ReadonlyArray<Allocation>;
  readonly createdAt: string;
  readonly updatedAt: string;
}
