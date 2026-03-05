import type { WeekDay } from "@/types";

export const WEEKDAY_LABELS: Record<WeekDay, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

export const WEEKDAY_SHORT_LABELS: Record<WeekDay, string> = {
  segunda: "Seg",
  terca: "Ter",
  quarta: "Qua",
  quinta: "Qui",
  sexta: "Sex",
  sabado: "Sáb",
  domingo: "Dom",
};

export const DEFAULT_WEEKDAYS: ReadonlyArray<WeekDay> = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
];

export const MAX_ROOMS = 20;
export const MAX_PROFESSIONALS = 50;
export const MAX_CATEGORIES = 15;

export const DEFAULT_APPOINTMENT_DURATION = 50;
export const DEFAULT_APPOINTMENT_INTERVAL = 10;
