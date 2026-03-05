import { generateId } from "@/lib/utils";
import { DEFAULT_WEEKDAYS } from "@/lib/constants";
import type { Workspace, Category, Professional, Shift } from "@/types";

const DEFAULT_ACTIVITY_PRESETS: ReadonlyArray<string> = [
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

  const catEnfermeiro: Category = { id: generateId(), name: "Enfermeiro(a)", color: "#3B82F6" };
  const catPsicologo: Category = { id: generateId(), name: "Psicólogo(a)", color: "#10B981" };
  const catTerapeuta: Category = { id: generateId(), name: "Terapeuta Ocupacional", color: "#F59E0B" };
  const catAssistente: Category = { id: generateId(), name: "Assistente Social", color: "#8B5CF6" };
  const catMedico: Category = { id: generateId(), name: "Médico(a)", color: "#EF4444" };

  const categories: ReadonlyArray<Category> = [
    catEnfermeiro,
    catPsicologo,
    catTerapeuta,
    catAssistente,
    catMedico,
  ];

  const days = DEFAULT_WEEKDAYS;
  const allSlots = days.flatMap((day) => shifts.map((s) => ({ day, shiftId: s.id })));

  const professionals: ReadonlyArray<Professional> = [
    // Enfermeiras
    { id: generateId(), name: "Aglay Galvão", categoryId: catEnfermeiro.id, availability: allSlots },
    { id: generateId(), name: "Emília Caminha", categoryId: catEnfermeiro.id, availability: allSlots },
    { id: generateId(), name: "Thaís Jormanna", categoryId: catEnfermeiro.id, availability: allSlots },
    { id: generateId(), name: "Vilma Leal", categoryId: catEnfermeiro.id, availability: allSlots },
    // Psicólogas
    { id: generateId(), name: "Adrielle Maia", categoryId: catPsicologo.id, availability: allSlots },
    { id: generateId(), name: "Milena Lima", categoryId: catPsicologo.id, availability: allSlots },
    { id: generateId(), name: "Marília Garcia", categoryId: catPsicologo.id, availability: allSlots },
    { id: generateId(), name: "Lorena Ximenes", categoryId: catPsicologo.id, availability: allSlots },
    // Terapeutas Ocupacionais
    { id: generateId(), name: "Bruna Gurgel", categoryId: catTerapeuta.id, availability: allSlots },
    { id: generateId(), name: "Andrea Cavalcante", categoryId: catTerapeuta.id, availability: allSlots },
    { id: generateId(), name: "Lis Lavor", categoryId: catTerapeuta.id, availability: allSlots },
    { id: generateId(), name: "Karol Brandão", categoryId: catTerapeuta.id, availability: allSlots },
    { id: generateId(), name: "Ana Paula Simões", categoryId: catTerapeuta.id, availability: allSlots },
    // Assistentes Sociais
    { id: generateId(), name: "Priscilla Leite", categoryId: catAssistente.id, availability: allSlots },
    { id: generateId(), name: "Mércia Lucas", categoryId: catAssistente.id, availability: allSlots },
    { id: generateId(), name: "Káthia Kelly", categoryId: catAssistente.id, availability: allSlots },
    { id: generateId(), name: "Karla Vanessa", categoryId: catAssistente.id, availability: allSlots },
    { id: generateId(), name: "Liliana Correia", categoryId: catAssistente.id, availability: allSlots },
    // Médicos
    { id: generateId(), name: "Douglas Stélio", categoryId: catMedico.id, availability: allSlots },
    { id: generateId(), name: "Brenda Muniz", categoryId: catMedico.id, availability: allSlots },
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
