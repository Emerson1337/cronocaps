"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { generateId } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WEEKDAY_LABELS, MAX_ROOMS, MAX_PROFESSIONALS, MAX_CATEGORIES } from "@/lib/constants";
import type {
  WeekDay,
  Workspace,
  Shift,
  Category,
  Professional,
  AvailabilitySlot,
} from "@/types";

function generateAllTimeOptions(): ReadonlyArray<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  for (let m = 0; m <= 23 * 60 + 30; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    options.push({ value: time, label: time });
  }
  return options;
}

const ALL_TIME_OPTIONS = generateAllTimeOptions();

const DEFAULT_ACTIVITY_PRESETS: ReadonlyArray<string> = [
  "Psicoterapia Individual",
  "Acolhimento Inicial",
  "Acolhimento de Seguimento",
  "Grupo Terapeutico",
  "Consulta Medica",
  "Atendimento de Enfermagem",
];

const ALL_DAYS: ReadonlyArray<WeekDay> = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

const DEFAULT_DAYS: ReadonlyArray<WeekDay> = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
];

const TOTAL_STEPS = 5;

interface SetupWizardProps {
  readonly onComplete: (workspace: Workspace) => void;
  readonly onCancel: () => void;
}

// --- Step components ---

function StepName({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-secondary">
        Escolha um nome para seu espaço de trabalho.
      </p>
      <Input
        label="Nome do Espaço de Trabalho"
        placeholder="Ex: CronoCaps"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    </div>
  );
}

function StepDays({
  selected,
  onChange,
}: {
  readonly selected: ReadonlyArray<WeekDay>;
  readonly onChange: (days: ReadonlyArray<WeekDay>) => void;
}) {
  const toggle = (day: WeekDay) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-secondary">
        Selecione os dias da semana em que o serviço funciona.
      </p>
      <div className="flex flex-wrap gap-2">
        {ALL_DAYS.map((day) => {
          const isSelected = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium min-h-[44px] transition-colors duration-150 border cursor-pointer",
                isSelected
                  ? "bg-primary text-white border-primary"
                  : "bg-surface-card text-text-primary border-border hover:bg-primary-light"
              )}
            >
              {WEEKDAY_LABELS[day]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ShiftDraft {
  readonly id: string;
  readonly label: string;
  readonly startTime: string;
  readonly endTime: string;
}

function StepShifts({
  shifts,
  onChange,
}: {
  readonly shifts: ReadonlyArray<ShiftDraft>;
  readonly onChange: (shifts: ReadonlyArray<ShiftDraft>) => void;
}) {
  const addShift = () => {
    onChange([
      ...shifts,
      { id: generateId(), label: "", startTime: "08:00", endTime: "12:00" },
    ]);
  };

  const removeShift = (id: string) => {
    onChange(shifts.filter((s) => s.id !== id));
  };

  const updateShift = (id: string, field: keyof ShiftDraft, value: string) => {
    onChange(
      shifts.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-secondary">
        Configure os turnos de funcionamento.
      </p>
      <div className="flex flex-col gap-3">
        {shifts.map((shift) => (
          <Card key={shift.id} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Nome do turno"
                placeholder="Ex: Manhã"
                value={shift.label}
                onChange={(e) => updateShift(shift.id, "label", e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-primary">Início</label>
                <Select
                  value={shift.startTime}
                  onChange={(v) => updateShift(shift.id, "startTime", v)}
                  options={ALL_TIME_OPTIONS}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-primary">Fim</label>
                <Select
                  value={shift.endTime}
                  onChange={(v) => updateShift(shift.id, "endTime", v)}
                  options={ALL_TIME_OPTIONS}
                />
              </div>
              {shifts.length > 1 && (
                <IconButton
                  label="Remover turno"
                  variant="danger"
                  onClick={() => removeShift(shift.id)}
                >
                  <TrashIcon />
                </IconButton>
              )}
            </div>
          </Card>
        ))}
      </div>
      <Button variant="secondary" size="sm" onClick={addShift}>
        + Adicionar Turno
      </Button>
    </div>
  );
}

function StepRooms({
  count,
  onChange,
}: {
  readonly count: number;
  readonly onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-secondary">
        Quantas atividades podem ocorrer simultaneamente em cada turno? (máx. {MAX_ROOMS})
      </p>
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(Math.max(1, count - 1))}
          disabled={count <= 1}
        >
          -
        </Button>
        <span className="text-2xl font-bold text-text-primary min-w-[3ch] text-center">
          {count}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(Math.min(MAX_ROOMS, count + 1))}
          disabled={count >= MAX_ROOMS}
        >
          +
        </Button>
      </div>
      <p className="text-sm text-text-secondary">
        Este é o número máximo de alocações por turno.
      </p>
    </div>
  );
}

interface ProfessionalDraft {
  readonly id: string;
  readonly name: string;
  readonly categoryId: string;
  readonly availability: ReadonlyArray<AvailabilitySlot>;
}

function StepProfessionals({
  professionals,
  categories,
  days,
  shifts,
  onChangeProfessionals: onProfsChange,
  onChangeCategories: onCatsChange,
}: {
  readonly professionals: ReadonlyArray<ProfessionalDraft>;
  readonly categories: ReadonlyArray<Category>;
  readonly days: ReadonlyArray<WeekDay>;
  readonly shifts: ReadonlyArray<ShiftDraft>;
  readonly onChangeProfessionals: (profs: ReadonlyArray<ProfessionalDraft>) => void;
  readonly onChangeCategories: (cats: ReadonlyArray<Category>) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftCategoryId, setDraftCategoryId] = useState("");
  const [draftAvailability, setDraftAvailability] = useState<
    ReadonlyArray<AvailabilitySlot>
  >([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1");
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const startNew = () => {
    setEditingId("new");
    setDraftName("");
    setDraftCategoryId(categories[0]?.id ?? "");
    setDraftAvailability([]);
  };

  const startEdit = (prof: ProfessionalDraft) => {
    setEditingId(prof.id);
    setDraftName(prof.name);
    setDraftCategoryId(prof.categoryId);
    setDraftAvailability(prof.availability);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const toggleAvailability = (day: WeekDay, shiftId: string) => {
    const exists = draftAvailability.some(
      (a) => a.day === day && a.shiftId === shiftId
    );
    if (exists) {
      setDraftAvailability(
        draftAvailability.filter(
          (a) => !(a.day === day && a.shiftId === shiftId)
        )
      );
    } else {
      const shift = shifts.find((s) => s.id === shiftId);
      setDraftAvailability([...draftAvailability, {
        day,
        shiftId,
        startTime: shift?.startTime ?? "07:00",
        endTime: shift?.endTime ?? "12:00",
      }]);
    }
  };

  const saveProfessional = () => {
    if (draftName.trim() === "" || draftCategoryId === "") return;

    if (editingId === "new") {
      const newProf: ProfessionalDraft = {
        id: generateId(),
        name: draftName.trim(),
        categoryId: draftCategoryId,
        availability: draftAvailability,
      };
      onProfsChange([...professionals, newProf]);
    } else if (editingId !== null) {
      onProfsChange(
        professionals.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: draftName.trim(),
                categoryId: draftCategoryId,
                availability: draftAvailability,
              }
            : p
        )
      );
    }
    setEditingId(null);
  };

  const removeProfessional = (id: string) => {
    onProfsChange(professionals.filter((p) => p.id !== id));
  };

  const addCategory = () => {
    if (newCategoryName.trim() === "") return;
    if (categories.length >= MAX_CATEGORIES) return;
    const cat: Category = {
      id: generateId(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };
    onCatsChange([...categories, cat]);
    setNewCategoryName("");
    setShowCategoryForm(false);
    if (draftCategoryId === "") {
      setDraftCategoryId(cat.id);
    }
  };

  const removeCategory = (id: string) => {
    onCatsChange(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-secondary">
        Cadastre os profissionais e suas categorias. (máx. {MAX_PROFESSIONALS}{" "}
        profissionais, {MAX_CATEGORIES} categorias)
      </p>

      {/* Categories */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-text-primary">Categorias</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1">
              <Badge variant="custom" color={cat.color}>
                {cat.name}
              </Badge>
              <button
                type="button"
                onClick={() => removeCategory(cat.id)}
                className="text-text-secondary hover:text-error text-xs cursor-pointer"
                aria-label={`Remover categoria ${cat.name}`}
              >
                x
              </button>
            </div>
          ))}
        </div>
        {showCategoryForm ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Input
              label="Nome da categoria"
              placeholder="Ex: Psicólogo(a)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">
                Cor
              </label>
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="h-[44px] w-[44px] cursor-pointer rounded border border-border"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addCategory}>
                Salvar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategoryForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCategoryForm(true)}
            disabled={categories.length >= MAX_CATEGORIES}
          >
            + Nova Categoria
          </Button>
        )}
      </div>

      {/* Professional form */}
      {editingId !== null ? (
        <Card className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text-primary">
            {editingId === "new" ? "Novo Profissional" : "Editar Profissional"}
          </h3>
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Categoria
            </label>
            <Select
              value={draftCategoryId}
              onChange={setDraftCategoryId}
              placeholder="Selecione..."
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
            />
          </div>

          {/* Availability grid */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">
              Disponibilidade
            </span>
            <div className="overflow-x-auto scrollbar-minimal">
              <table className="text-sm">
                <thead>
                  <tr>
                    <th className="p-1 text-left text-text-secondary">Turno</th>
                    {days.map((d) => (
                      <th key={d} className="p-1 text-center text-text-secondary">
                        📅 {WEEKDAY_LABELS[d].slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => (
                    <tr key={shift.id}>
                      <td className="p-1 text-text-primary">🕐 {shift.label}</td>
                      {days.map((day) => {
                        const checked = draftAvailability.some(
                          (a) => a.day === day && a.shiftId === shift.id
                        );
                        return (
                          <td key={`${day}-${shift.id}`} className="p-1 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleAvailability(day, shift.id)
                              }
                              className="h-4 w-4 cursor-pointer accent-primary"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={saveProfessional}
              disabled={draftName.trim() === "" || draftCategoryId === ""}
            >
              Salvar
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelEdit}>
              Cancelar
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={startNew}
          disabled={professionals.length >= MAX_PROFESSIONALS}
        >
          + Adicionar Profissional
        </Button>
      )}

      {/* Professional list */}
      {professionals.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-text-primary">
            Profissionais ({professionals.length})
          </h3>
          {professionals.map((prof) => {
            const cat = categories.find((c) => c.id === prof.categoryId);
            return (
              <div
                key={prof.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-text-primary">{prof.name}</span>
                  {cat !== undefined && (
                    <Badge variant="custom" color={cat.color}>
                      {cat.name}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <IconButton
                    label="Editar profissional"
                    onClick={() => startEdit(prof)}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    label="Remover profissional"
                    variant="danger"
                    onClick={() => removeProfessional(prof.id)}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Icons ---

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// --- Main Wizard ---

export function SetupWizard({ onComplete, onCancel }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState<"right" | "left">("right");
  const [animKey, setAnimKey] = useState(0);
  const [name, setName] = useState("");
  const [days, setDays] = useState<ReadonlyArray<WeekDay>>(DEFAULT_DAYS);
  const [shifts, setShifts] = useState<ReadonlyArray<ShiftDraft>>([
    { id: generateId(), label: "Manhã", startTime: "07:00", endTime: "12:00" },
    { id: generateId(), label: "Tarde", startTime: "13:00", endTime: "17:00" },
  ]);
  const [roomCount, setRoomCount] = useState(5);
  const [professionals, setProfessionals] = useState<
    ReadonlyArray<ProfessionalDraft>
  >([]);
  const [categories, setCategories] = useState<ReadonlyArray<Category>>([]);

  const canAdvance = useCallback((): boolean => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return days.length > 0;
      case 3:
        return (
          shifts.length > 0 &&
          shifts.every(
            (s) =>
              s.label.trim().length > 0 &&
              s.startTime.length > 0 &&
              s.endTime.length > 0
          )
        );
      case 4:
        return roomCount >= 1 && roomCount <= MAX_ROOMS;
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, name, days, shifts, roomCount]);

  const handleFinish = () => {
    const finalShifts: ReadonlyArray<Shift> = shifts.map((s) => ({
      id: s.id,
      label: s.label.trim(),
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    const finalProfessionals: ReadonlyArray<Professional> = professionals.map(
      (p) => ({
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        availability: p.availability,
      })
    );

    const now = new Date().toISOString();
    const workspace: Workspace = {
      id: generateId(),
      name: name.trim(),
      days: [...days],
      shifts: finalShifts,
      roomsPerShift: roomCount,
      activityPresets: DEFAULT_ACTIVITY_PRESETS,
      professionals: finalProfessionals,
      categories: [...categories],
      allocations: [],
      createdAt: now,
      updatedAt: now,
    };
    onComplete(workspace);
  };

  const stepTitles: ReadonlyArray<string> = [
    "Nome do Espaço de Trabalho",
    "Dias da Semana",
    "Turnos",
    "Salas por Turno",
    "Cadastro de Profissionais",
  ];

  const currentTitle = stepTitles[step - 1] ?? "";

  const goNext = () => {
    setSlideDirection("right");
    setAnimKey((k) => k + 1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setSlideDirection("left");
    setAnimKey((k) => k + 1);
    setStep((s) => s - 1);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">
            Passo {step} de {TOTAL_STEPS}
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-text-secondary hover:text-text-primary cursor-pointer"
          >
            Cancelar
          </button>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i < step ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step content with animation */}
      <div
        key={animKey}
        className={cn(
          "flex flex-col gap-4",
          slideDirection === "right"
            ? "animate-step-slide-in-right"
            : "animate-step-slide-in-left"
        )}
      >
        {/* Title */}
        <h2 className="text-xl font-bold text-text-primary">{currentTitle}</h2>

        {step === 1 && <StepName value={name} onChange={setName} />}
        {step === 2 && <StepDays selected={days} onChange={setDays} />}
        {step === 3 && <StepShifts shifts={shifts} onChange={setShifts} />}
        {step === 4 && <StepRooms count={roomCount} onChange={setRoomCount} />}
        {step === 5 && (
          <StepProfessionals
            professionals={professionals}
            categories={categories}
            days={days}
            shifts={shifts}
            onChangeProfessionals={setProfessionals}
            onChangeCategories={setCategories}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={step === 1}
        >
          Voltar
        </Button>
        {step < TOTAL_STEPS ? (
          <Button
            onClick={goNext}
            disabled={!canAdvance()}
          >
            Próximo
          </Button>
        ) : (
          <Button onClick={handleFinish}>Criar Espaço de Trabalho</Button>
        )}
      </div>
    </div>
  );
}
