import { generateId } from "@/lib/utils";
import { DEFAULT_WEEKDAYS } from "@/lib/constants";
import type { Workspace, Category, Professional, Shift, WeekDay } from "@/types";

export interface TemplateInfo {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly tags: ReadonlyArray<string>;
  readonly create: () => Workspace;
}

function makeShifts(
  defs: ReadonlyArray<{ label: string; start: string; end: string }>
): Shift[] {
  return defs.map((d) => ({
    id: generateId(),
    label: d.label,
    startTime: d.start,
    endTime: d.end,
  }));
}

function makeCategories(
  defs: ReadonlyArray<{ name: string; color: string }>
): Category[] {
  return defs.map((d) => ({ id: generateId(), name: d.name, color: d.color }));
}

function makeProfessional(
  name: string,
  categoryId: string,
  days: ReadonlyArray<WeekDay>,
  shifts: ReadonlyArray<Shift>
): Professional {
  return {
    id: generateId(),
    name,
    categoryId,
    availability: days.flatMap((day) =>
      shifts.map((s) => ({ day, shiftId: s.id }))
    ),
  };
}

function buildWorkspace(
  name: string,
  days: ReadonlyArray<WeekDay>,
  shifts: ReadonlyArray<Shift>,
  roomsPerShift: number,
  categories: ReadonlyArray<Category>,
  professionals: ReadonlyArray<Professional>,
  activityPresets: ReadonlyArray<string>
): Workspace {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    days: [...days],
    shifts,
    roomsPerShift,
    activityPresets: [...activityPresets],
    professionals,
    categories,
    allocations: [],
    createdAt: now,
    updatedAt: now,
  };
}

// --- CAPS AD ---
function createCapsAD(): Workspace {
  const [manha, tarde] = makeShifts([
    { label: "Manhã", start: "07:00", end: "12:00" },
    { label: "Tarde", start: "13:00", end: "17:00" },
  ]) as [Shift, Shift];
  const shifts = [manha, tarde];
  const [psi, enf, ass, med, to, rd] = makeCategories([
    { name: "Psicólogo(a)", color: "#10B981" },
    { name: "Enfermeiro(a)", color: "#3B82F6" },
    { name: "Assistente Social", color: "#8B5CF6" },
    { name: "Médico(a)", color: "#EF4444" },
    { name: "Terapeuta Ocupacional", color: "#F59E0B" },
    { name: "Redutor(a) de Danos", color: "#F97316" },
  ]) as [Category, Category, Category, Category, Category, Category];
  const cats = [psi, enf, ass, med, to, rd];
  const days = DEFAULT_WEEKDAYS;
  const adPresets = [
    "Acolhimento Inicial",
    "Grupo Terapêutico",
    "Grupo de Prevenção à Recaída",
    "Atendimento Individual",
    "Oficina Terapêutica",
    "Consulta Médica",
    "Redução de Danos",
    "Atendimento Familiar",
  ];
  const pros = [
    makeProfessional("Ana Silva", psi.id, days, shifts),
    makeProfessional("Carlos Oliveira", psi.id, days, [manha]),
    makeProfessional("Fernanda Lima", enf.id, days, shifts),
    makeProfessional("Juliana Ferreira", ass.id, days, shifts),
    makeProfessional("Dr. Marcos Pereira", med.id, days.slice(0, 3), [manha]),
    makeProfessional("Camila Rocha", to.id, days, [tarde]),
    makeProfessional("Diego Santos", rd.id, days, shifts),
  ];
  return buildWorkspace("CAPS AD", days, shifts, 5, cats, pros, adPresets);
}

export const TEMPLATES: ReadonlyArray<TemplateInfo> = [
  {
    id: "caps-ad",
    name: "CAPS AD",
    description:
      "Especializado em álcool e outras drogas. Inclui redução de danos e prevenção à recaída.",
    tags: ["Álcool e drogas", "2 turnos", "7 profissionais"],
    create: createCapsAD,
  },
];
