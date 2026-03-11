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

export const DEFAULT_EXPORT_RULES = `<ul>
<li>Designar o profissional para atendimento conforme a escala e o horário de trabalho de cada um. <strong>*Sem comunicação, o nome do profissional deve permanecer na distribuição dos atendimentos seguindo exatamente o seu horário de trabalho.*</strong></li>
<li>Alterações apenas mediante <strong>comunicação formal de atraso ou ausência à ADM e/ou à Técnica de Enfermagem</strong>, profissional responsável pelo preenchimento diário da ocorrência do serviço.</li>
<li>Nos dias em que constarem <strong>dois profissionais no acolhimento inicial</strong>, haverá <strong>alternância semanal entre eles</strong>. Na semana em que não estiver no inicial, o profissional será lotado no acolhimento de seguimento.</li>
<li>Se o profissional do <strong>acolhimento inicial</strong> estiver <strong>ausente</strong>, os atendimentos serão <strong>redistribuídos entre os demais</strong>, respeitando a proporção de <strong>1 inicial + 4 acolhimentos/cada</strong>.</li>
<li>Proporções por acolhimento: <strong>Acolhimento Inicial- até 4 por turno</strong>; <strong>Acolhimento de Seguimento- até 6 por turno.</strong></li>
<li>Os atendimentos devem ser colocados até <strong>40 minutos (iniciais)</strong> ou até <strong>20 minutos (seguimento)</strong> antes do <strong>término do turno do profissional</strong>, visando tempo hábil para finalização das demandas.</li>
<li>Os <strong>grupos</strong> e <strong>Plantões Psicológicos</strong> durante a semana estão <strong>suspensos</strong> até a chegada do profissional gestor, devido às demandas alimentícias e organizacionais.</li>
</ul>`;
