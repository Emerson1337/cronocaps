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
  const [enf, psi, to, ass, med] = makeCategories([
    { name: "Enfermeiro(a)", color: "#3B82F6" },
    { name: "Psicólogo(a)", color: "#10B981" },
    { name: "Terapeuta Ocupacional", color: "#F59E0B" },
    { name: "Assistente Social", color: "#8B5CF6" },
    { name: "Médico(a)", color: "#EF4444" },
  ]) as [Category, Category, Category, Category, Category];
  const cats = [enf, psi, to, ass, med];
  const days = DEFAULT_WEEKDAYS;
  const adPresets = [
    "Sala de Acolhimento Inicial",
    "Sala de Acolhimento de Seguimento",
    "Sala de Psicoterapia",
    "Sala de Atendimento Social",
    "Sala de Atendimento de Enfermagem / Regulação U.D",
    "Sala de Consulta Médica",
    "Sala de Matriciamento",
    "Sala de Atendimento",
    "Sala de Grupo",
    "Sala de Enfermagem",
    "Sala de Grupos",
    "Sala de Plantão Psicológico",
  ];
  const pros = [
    // Enfermeiras
    makeProfessional("Aglay Galvão", enf.id, days, shifts),
    makeProfessional("Emília Caminha", enf.id, days, shifts),
    makeProfessional("Thaís Jormanna", enf.id, days, shifts),
    makeProfessional("Vilma Leal", enf.id, days, shifts),
    // Psicólogas
    makeProfessional("Adrielle Maia", psi.id, days, shifts),
    makeProfessional("Milena Lima", psi.id, days, shifts),
    makeProfessional("Marília Garcia", psi.id, days, shifts),
    makeProfessional("Lorena Ximenes", psi.id, days, shifts),
    // Terapeutas Ocupacionais
    makeProfessional("Bruna Gurgel", to.id, days, shifts),
    makeProfessional("Andrea Cavalcante", to.id, days, shifts),
    makeProfessional("Lis Lavor", to.id, days, shifts),
    makeProfessional("Karol Brandão", to.id, days, shifts),
    makeProfessional("Ana Paula Simões", to.id, days, shifts),
    // Assistentes Sociais
    makeProfessional("Priscilla Leite", ass.id, days, shifts),
    makeProfessional("Mércia Lucas", ass.id, days, shifts),
    makeProfessional("Káthia Kelly", ass.id, days, shifts),
    makeProfessional("Karla Vanessa", ass.id, days, shifts),
    makeProfessional("Liliana Correia", ass.id, days, shifts),
    // Médicos
    makeProfessional("Douglas Stélio", med.id, days, shifts),
    makeProfessional("Brenda Muniz", med.id, days, shifts),
  ];
  return buildWorkspace("CAPS AD", days, shifts, 5, cats, pros, adPresets);
}

export const TEMPLATES: ReadonlyArray<TemplateInfo> = [
  {
    id: "caps-ad",
    name: "CAPS AD",
    description:
      "Especializado em álcool e outras drogas. Inclui redução de danos e prevenção à recaída.",
    tags: ["Álcool e drogas", "2 turnos", "20 profissionais"],
    create: createCapsAD,
  },
];
