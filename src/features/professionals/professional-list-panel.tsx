"use client";

import { useState, useCallback, useMemo } from "react";
import { Button, IconButton, Badge } from "@/components/ui";
import { WEEKDAY_SHORT_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Professional, Workspace } from "@/types";
import { useProfessionals } from "./use-professionals";
import { useCategories } from "./use-categories";

interface ProfessionalListPanelProps {
  readonly workspace: Workspace | null;
  readonly updateWorkspace: (updater: (prev: Workspace) => Workspace) => void;
  readonly onEditProfessional: (professional: Professional) => void;
  readonly onAddProfessional: () => void;
}

export function ProfessionalListPanel({
  workspace,
  updateWorkspace,
  onEditProfessional,
  onAddProfessional,
}: ProfessionalListPanelProps) {
  const { getProfessionalsByCategory, isProfessionalAllocated } = useProfessionals({
    workspace,
    updateWorkspace,
  });
  const { categories } = useCategories({ workspace, updateWorkspace });

  const [expandedCategories, setExpandedCategories] = useState<ReadonlyArray<string>>(() =>
    categories.map((c) => c.id)
  );

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const grouped = useMemo(() => getProfessionalsByCategory(), [getProfessionalsByCategory]);

  const shifts = useMemo(() => workspace?.shifts ?? [], [workspace?.shifts]);

  const getAvailabilitySummary = useCallback(
    (professional: Professional): string => {
      if (professional.availability.length === 0) return "Sem disponibilidade";

      const slotsByDay = new Map<string, ReadonlyArray<string>>();
      for (const slot of professional.availability) {
        const existing = slotsByDay.get(slot.day);
        if (existing !== undefined) {
          slotsByDay.set(slot.day, [...existing, slot.shiftId]);
        } else {
          slotsByDay.set(slot.day, [slot.shiftId]);
        }
      }

      const parts: Array<string> = [];
      for (const [day, shiftIds] of slotsByDay) {
        const dayLabel = WEEKDAY_SHORT_LABELS[day as keyof typeof WEEKDAY_SHORT_LABELS];
        if (dayLabel === undefined) continue;
        const shiftInitials = shiftIds
          .map((sid) => {
            const shift = shifts.find((s) => s.id === sid);
            return shift !== undefined ? shift.label.charAt(0) : "";
          })
          .filter((s) => s.length > 0)
          .join(", ");
        parts.push(`${dayLabel} ${shiftInitials}`);
      }

      return parts.join(", ");
    },
    [shifts]
  );

  if (workspace === null) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Profissionais</h3>
        <Button size="sm" onClick={onAddProfessional}>
          Adicionar Profissional
        </Button>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-text-secondary py-4 text-center">
          Nenhuma categoria cadastrada. Adicione um profissional para começar.
        </p>
      )}

      <div className="flex flex-col gap-1">
        {categories.map((category) => {
          const profs = grouped.get(category.id) ?? [];
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <div
              key={category.id}
              className="rounded-lg border border-border overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 min-h-[44px] text-left bg-surface-card hover:bg-primary-light/30 transition-colors cursor-pointer"
                )}
              >
                <span
                  className="inline-block w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-text-primary flex-1">
                  {category.name}
                </span>
                <Badge variant="custom" color={category.color}>
                  {profs.length}
                </Badge>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "text-text-secondary transition-transform duration-150",
                    isExpanded && "rotate-180"
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && profs.length > 0 && (
                <div className="border-t border-border divide-y divide-border">
                  {profs.map((prof) => {
                    const allocated = isProfessionalAllocated(prof.id);
                    return (
                      <div
                        key={prof.id}
                        className="flex items-center gap-2 px-3 py-2 min-h-[44px]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary truncate">
                              {prof.name}
                            </span>
                            {allocated && (
                              <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" title="Alocado na agenda" />
                            )}
                          </div>
                          <p className="text-xs text-text-secondary truncate">
                            {getAvailabilitySummary(prof)}
                          </p>
                        </div>
                        <div className="flex items-center shrink-0">
                          <IconButton
                            label="Editar profissional"
                            onClick={() => onEditProfessional(prof)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </IconButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {isExpanded && profs.length === 0 && (
                <div className="border-t border-border px-3 py-3">
                  <p className="text-xs text-text-secondary text-center">
                    Nenhum profissional nesta categoria
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
