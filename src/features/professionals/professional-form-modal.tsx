"use client";

import { useState, useCallback, useMemo } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import { WEEKDAY_SHORT_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AvailabilitySlot, Professional, WeekDay, Workspace } from "@/types";
import { useProfessionals } from "./use-professionals";
import { useCategories, CATEGORY_COLORS } from "./use-categories";

function generateTimeOptionsForShift(
  shiftStart: string,
  shiftEnd: string
): ReadonlyArray<{ value: string; label: string }> {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const startMin = toMin(shiftStart);
  const endMin = toMin(shiftEnd);
  const options: Array<{ value: string; label: string }> = [];
  for (let m = startMin; m <= endMin; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    options.push({ value: time, label: time });
  }
  return options;
}

interface ProfessionalFormModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly workspace: Workspace;
  readonly updateWorkspace: (updater: (prev: Workspace) => Workspace) => void;
  readonly professional?: Professional;
}

export function ProfessionalFormModal({
  open,
  onClose,
  workspace,
  updateWorkspace,
  professional,
}: ProfessionalFormModalProps) {
  const { addProfessional, updateProfessional } = useProfessionals({
    workspace,
    updateWorkspace,
  });
  const { categories } = useCategories({ workspace, updateWorkspace });

  const isEditMode = professional !== undefined;

  const [prevOpen, setPrevOpen] = useState(false);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availability, setAvailability] = useState<ReadonlyArray<AvailabilitySlot>>([]);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0] ?? "#10B981");

  const [errors, setErrors] = useState<{
    readonly name?: string;
    readonly categoryId?: string;
    readonly availability?: string;
  }>({});

  if (open && !prevOpen) {
    if (professional !== undefined) {
      setName(professional.name);
      setCategoryId(professional.categoryId);
      setAvailability(professional.availability);
    } else {
      setName("");
      setCategoryId("");
      setAvailability([]);
    }
    setShowNewCategory(false);
    setNewCategoryName("");
    setNewCategoryColor(CATEGORY_COLORS[0] ?? "#10B981");
    setErrors({});
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
  }

  const days = workspace.days;
  const shifts = workspace.shifts;

  const getShiftTimes = useCallback(
    (shiftId: string) => {
      const shift = shifts.find((s) => s.id === shiftId);
      return { startTime: shift?.startTime ?? "07:00", endTime: shift?.endTime ?? "12:00" };
    },
    [shifts]
  );

  const toggleAvailability = useCallback(
    (day: WeekDay, shiftId: string) => {
      setAvailability((prev) => {
        const exists = prev.some(
          (slot) => slot.day === day && slot.shiftId === shiftId
        );
        if (exists) {
          return prev.filter(
            (slot) => !(slot.day === day && slot.shiftId === shiftId)
          );
        }
        const times = getShiftTimes(shiftId);
        return [...prev, { day, shiftId, startTime: times.startTime, endTime: times.endTime }];
      });
    },
    [getShiftTimes]
  );

  const updateSlotTime = useCallback(
    (day: WeekDay, shiftId: string, field: "startTime" | "endTime", value: string) => {
      setAvailability((prev) =>
        prev.map((slot) =>
          slot.day === day && slot.shiftId === shiftId
            ? { ...slot, [field]: value }
            : slot
        )
      );
    },
    []
  );

  const validate = useCallback((): boolean => {
    const newErrors: {
      name?: string;
      categoryId?: string;
      availability?: string;
    } = {};

    if (name.trim().length === 0) {
      newErrors.name = "Nome é obrigatório";
    }

    const effectiveCategoryId = showNewCategory ? "new" : categoryId;
    if (effectiveCategoryId.length === 0) {
      newErrors.categoryId = "Categoria é obrigatória";
    }

    if (showNewCategory && newCategoryName.trim().length === 0) {
      newErrors.categoryId = "Nome da nova categoria é obrigatório";
    }

    if (availability.length === 0) {
      newErrors.availability = "Selecione ao menos um horário de disponibilidade";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, categoryId, showNewCategory, newCategoryName, availability]);

  const handleSubmitCombined = useCallback(() => {
    if (!validate()) return;

    if (showNewCategory) {
      // Combined update: add category + add/update professional
      const newCatId = crypto.randomUUID();
      updateWorkspace((prev) => {
        const updatedCategories = [
          ...prev.categories,
          { id: newCatId, name: newCategoryName.trim(), color: newCategoryColor },
        ];

        let updatedProfessionals;
        if (isEditMode) {
          updatedProfessionals = prev.professionals.map((p) =>
            p.id === professional.id
              ? {
                  ...p,
                  name: name.trim(),
                  categoryId: newCatId,
                  availability,
                }
              : p
          );
        } else {
          updatedProfessionals = [
            ...prev.professionals,
            {
              id: crypto.randomUUID(),
              name: name.trim(),
              categoryId: newCatId,
              availability,
            },
          ];
        }

        return {
          ...prev,
          categories: updatedCategories,
          professionals: updatedProfessionals,
          updatedAt: new Date().toISOString(),
        };
      });
    } else {
      if (isEditMode) {
        updateProfessional(professional.id, {
          name: name.trim(),
          categoryId,
          availability,
        });
      } else {
        addProfessional({
          name: name.trim(),
          categoryId,
          availability,
        });
      }
    }

    onClose();
  }, [
    validate,
    showNewCategory,
    isEditMode,
    professional,
    updateWorkspace,
    updateProfessional,
    addProfessional,
    name,
    categoryId,
    newCategoryName,
    newCategoryColor,
    availability,
    onClose,
  ]);

  const toggleAllDay = useCallback(
    (day: WeekDay) => {
      setAvailability((prev) => {
        const allSelected = shifts.every((s) =>
          prev.some((slot) => slot.day === day && slot.shiftId === s.id)
        );
        if (allSelected) {
          return prev.filter((slot) => slot.day !== day);
        }
        const existing = prev.filter((slot) => slot.day !== day);
        return [...existing, ...shifts.map((s) => {
          const times = getShiftTimes(s.id);
          return { day, shiftId: s.id, startTime: times.startTime, endTime: times.endTime };
        })];
      });
    },
    [shifts, getShiftTimes]
  );

  const toggleAllShift = useCallback(
    (shiftId: string) => {
      setAvailability((prev) => {
        const allSelected = days.every((d) =>
          prev.some((slot) => slot.day === d && slot.shiftId === shiftId)
        );
        if (allSelected) {
          return prev.filter((slot) => slot.shiftId !== shiftId);
        }
        const existing = prev.filter((slot) => slot.shiftId !== shiftId);
        const times = getShiftTimes(shiftId);
        return [...existing, ...days.map((d) => ({ day: d, shiftId, startTime: times.startTime, endTime: times.endTime }))];
      });
    },
    [days, getShiftTimes]
  );

  const toggleAll = useCallback(() => {
    setAvailability((prev) => {
      const total = days.length * shifts.length;
      if (prev.length === total) {
        return [];
      }
      return days.flatMap((day) => shifts.map((s) => {
        const times = getShiftTimes(s.id);
        return { day, shiftId: s.id, startTime: times.startTime, endTime: times.endTime };
      }));
    });
  }, [days, shifts, getShiftTimes]);

  const allCount = days.length * shifts.length;

  const isDayFullySelected = useMemo(
    () =>
      (day: WeekDay) =>
        shifts.every((s) =>
          availability.some((slot) => slot.day === day && slot.shiftId === s.id)
        ),
    [shifts, availability]
  );

  const isShiftFullySelected = useMemo(
    () =>
      (shiftId: string) =>
        days.every((d) =>
          availability.some((slot) => slot.day === d && slot.shiftId === shiftId)
        ),
    [days, availability]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? "Editar Profissional" : "Novo Profissional"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitCombined}>
            {isEditMode ? "Salvar" : "Adicionar"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do profissional"
          {...(errors.name !== undefined ? { error: errors.name } : {})}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-primary">
            Categoria
          </label>

          {!showNewCategory ? (
            <div className="flex flex-col gap-2">
              <Select
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Selecione uma categoria"
                error={errors.categoryId !== undefined}
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
              />
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="text-sm text-primary hover:underline text-left min-h-[44px] flex items-center cursor-pointer"
              >
                + Criar nova categoria
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <Input
                label="Nome da categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Psicólogo(a)"
                {...(errors.categoryId !== undefined ? { error: errors.categoryId } : {})}
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-text-primary">Cor</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategoryColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center",
                        newCategoryColor === color
                          ? "border-text-primary scale-110"
                          : "border-transparent"
                      )}
                      title={color}
                    >
                      <span
                        className="w-6 h-6 rounded-full inline-block"
                        style={{ backgroundColor: color }}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategoryName("");
                }}
                className="text-sm text-text-secondary hover:underline text-left min-h-[44px] flex items-center cursor-pointer"
              >
                Cancelar nova categoria
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">
              Disponibilidade
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              {availability.length === allCount ? "Desmarcar tudo" : "Selecionar tudo"}
            </button>
          </div>
          <p className="text-xs text-text-secondary -mt-1">
            Toque nos turnos para marcar quando o profissional está disponível
          </p>
          {errors.availability !== undefined && (
            <p className="text-sm text-error" role="alert">
              {errors.availability}
            </p>
          )}
          <div className="overflow-x-auto scrollbar-minimal">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-1" />
                  {shifts.map((shift) => {
                    const fullySelected = isShiftFullySelected(shift.id);
                    return (
                      <th key={shift.id} className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => toggleAllShift(shift.id)}
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-md transition-colors cursor-pointer",
                            fullySelected
                              ? "bg-primary/15 text-primary"
                              : "text-text-secondary hover:text-primary hover:bg-primary/5"
                          )}
                          title={`${fullySelected ? "Desmarcar" : "Selecionar"} ${shift.label} todos os dias`}
                        >
                          🕐 {shift.label}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const dayFull = isDayFullySelected(day);
                  return (
                    <tr key={day}>
                      <td className="p-1">
                        <button
                          type="button"
                          onClick={() => toggleAllDay(day)}
                          className={cn(
                            "text-sm font-medium px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap",
                            dayFull
                              ? "bg-primary/15 text-primary"
                              : "text-text-primary hover:text-primary hover:bg-primary/5"
                          )}
                          title={`${dayFull ? "Desmarcar" : "Selecionar"} todos os turnos de ${WEEKDAY_SHORT_LABELS[day]}`}
                        >
                          📅 {WEEKDAY_SHORT_LABELS[day]}
                        </button>
                      </td>
                      {shifts.map((shift) => {
                        const isChecked = availability.some(
                          (slot) => slot.day === day && slot.shiftId === shift.id
                        );
                        return (
                          <td key={shift.id} className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => toggleAvailability(day, shift.id)}
                              className={cn(
                                "w-8 h-8 rounded-md border-2 transition-all duration-150 cursor-pointer flex items-center justify-center mx-auto",
                                isChecked
                                  ? "bg-primary border-primary text-white"
                                  : "bg-surface border-border text-text-secondary hover:border-primary/50"
                              )}
                              aria-label={`${WEEKDAY_SHORT_LABELS[day]} - ${shift.label}`}
                              aria-pressed={isChecked}
                            >
                              {isChecked && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {availability.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-xs font-medium text-text-secondary">
                Horários por turno
              </span>
              <div className="flex flex-col gap-1.5">
                {shifts.map((shift) => {
                  const slotsForShift = availability.filter(
                    (slot) => slot.shiftId === shift.id
                  );
                  if (slotsForShift.length === 0) return null;

                  const activeDays = slotsForShift
                    .map((slot) => WEEKDAY_SHORT_LABELS[slot.day])
                    .join(", ");

                  const firstSlot = slotsForShift[0];
                  if (firstSlot === undefined) return null;
                  const slotStart = firstSlot.startTime ?? shift.startTime;
                  const slotEnd = firstSlot.endTime ?? shift.endTime;

                  return (
                    <div
                      key={shift.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-text-primary">
                          {shift.label}
                        </span>
                        <span className="text-xs text-text-secondary ml-1.5">
                          {activeDays}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Select
                          value={slotStart}
                          onChange={(v) => {
                            for (const slot of slotsForShift) {
                              updateSlotTime(slot.day, shift.id, "startTime", v);
                            }
                          }}
                          options={generateTimeOptionsForShift(shift.startTime, shift.endTime)}
                          className="w-[6.5rem]"
                        />
                        <span className="text-xs text-text-secondary">às</span>
                        <Select
                          value={slotEnd}
                          onChange={(v) => {
                            for (const slot of slotsForShift) {
                              updateSlotTime(slot.day, shift.id, "endTime", v);
                            }
                          }}
                          options={generateTimeOptionsForShift(shift.startTime, shift.endTime)}
                          className="w-[6.5rem]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
