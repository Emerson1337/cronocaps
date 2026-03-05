import { generateId } from "@/lib/utils";
import { DEFAULT_WEEKDAYS } from "@/lib/constants";
import type { Workspace, Category, Professional, Shift } from "@/types";

const DEFAULT_ACTIVITY_PRESETS: ReadonlyArray<string> = [
  "Psicoterapia Individual",
  "Acolhimento Inicial",
  "Acolhimento de Seguimento",
  "Grupo Terapeutico",
  "Consulta Medica",
  "Atendimento de Enfermagem",
];

export function createCapsTemplate(): Workspace {
  const shiftManha: Shift = {
    id: generateId(),
    label: "Manhã",
    startTime: "07:00",
    endTime: "12:00",
  };

  const shiftTarde: Shift = {
    id: generateId(),
    label: "Tarde",
    startTime: "13:00",
    endTime: "17:00",
  };

  const shifts: ReadonlyArray<Shift> = [shiftManha, shiftTarde];

  const catPsicologo: Category = { id: generateId(), name: "Psicólogo(a)", color: "#10B981" };
  const catEnfermeiro: Category = { id: generateId(), name: "Enfermeiro(a)", color: "#3B82F6" };
  const catAssistente: Category = { id: generateId(), name: "Assistente Social", color: "#8B5CF6" };
  const catMedico: Category = { id: generateId(), name: "Médico(a) Psiquiatra", color: "#EF4444" };
  const catTerapeuta: Category = { id: generateId(), name: "Terapeuta Ocupacional", color: "#F59E0B" };

  const categories: ReadonlyArray<Category> = [
    catPsicologo,
    catEnfermeiro,
    catAssistente,
    catMedico,
    catTerapeuta,
  ];

  const days = DEFAULT_WEEKDAYS;

  const professionals: ReadonlyArray<Professional> = [
    {
      id: generateId(),
      name: "Ana Silva",
      categoryId: catPsicologo.id,
      availability: days.flatMap((day) =>
        shifts.map((s) => ({ day, shiftId: s.id }))
      ),
    },
    {
      id: generateId(),
      name: "Carlos Oliveira",
      categoryId: catPsicologo.id,
      availability: days.flatMap((day) =>
        [shiftManha].map((s) => ({ day, shiftId: s.id }))
      ),
    },
    {
      id: generateId(),
      name: "Mariana Costa",
      categoryId: catPsicologo.id,
      availability: days.flatMap((day) =>
        [shiftTarde].map((s) => ({ day, shiftId: s.id }))
      ),
    },
    {
      id: generateId(),
      name: "Ricardo Santos",
      categoryId: catPsicologo.id,
      availability: days.slice(0, 3).flatMap((day) =>
        shifts.map((s) => ({ day, shiftId: s.id }))
      ),
    },
    {
      id: generateId(),
      name: "Fernanda Lima",
      categoryId: catEnfermeiro.id,
      availability: days.flatMap((day) =>
        shifts.map((s) => ({ day, shiftId: s.id }))
      ),
    },
    {
      id: generateId(),
      name: "Paulo Mendes",
      categoryId: catEnfermeiro.id,
      availability: days.flatMap((day) =>
        [shiftManha].map((s) => ({ day, shiftId: s.id }))
      ),
    },
    {
      id: generateId(),
      name: "Juliana Ferreira",
      categoryId: catAssistente.id,
      availability: days.flatMap((day) =>
        shifts.map((s) => ({ day, shiftId: s.id }))
      ),
    },
    {
      id: generateId(),
      name: "Roberto Almeida",
      categoryId: catAssistente.id,
      availability: days.slice(0, 3).flatMap((day) =>
        [shiftTarde].map((s) => ({ day, shiftId: s.id }))
      ),
    },
    {
      id: generateId(),
      name: "Dr. Marcos Pereira",
      categoryId: catMedico.id,
      availability: days.slice(0, 3).flatMap((day) =>
        [shiftManha].map((s) => ({ day, shiftId: s.id }))
      ),
    },
    {
      id: generateId(),
      name: "Camila Rocha",
      categoryId: catTerapeuta.id,
      availability: days.flatMap((day) =>
        [shiftTarde].map((s) => ({ day, shiftId: s.id }))
      ),
    },
  ];

  const now = new Date().toISOString();

  return {
    id: generateId(),
    name: "CronoCaps",
    days: [...days],
    shifts,
    roomsPerShift: 5,
    activityPresets: [...DEFAULT_ACTIVITY_PRESETS],
    professionals,
    categories,
    allocations: [],
    createdAt: now,
    updatedAt: now,
  };
}
