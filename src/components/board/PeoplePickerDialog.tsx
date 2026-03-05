"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Modal, Input } from "@/components/ui";
import { DraggableProfessional } from "@/components/dnd/DraggableProfessional";
import { useDndState } from "@/components/dnd/DndProvider";
import type { Allocation, Category, Professional } from "@/types";

interface PeoplePickerDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly professionals: ReadonlyArray<Professional>;
  readonly categories: ReadonlyArray<Category>;
  readonly allocations: ReadonlyArray<Allocation>;
}

export function PeoplePickerDialog({
  open,
  onClose,
  professionals,
  categories,
  allocations,
}: PeoplePickerDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const { activeDragItem } = useDndState();

  const isDragging = activeDragItem !== null && activeDragItem.type === "professional";

  const roomCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    for (const allocation of allocations) {
      for (const assignment of allocation.assignments) {
        counts.set(
          assignment.professionalId,
          (counts.get(assignment.professionalId) ?? 0) + 1
        );
      }
    }
    return counts;
  }, [allocations]);

  const filtered = useMemo(() => {
    let result = professionals;
    if (selectedCategoryId !== null) {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }
    if (search.trim().length > 0) {
      const lower = search.trim().toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(lower));
    }
    return result;
  }, [professionals, selectedCategoryId, search]);

  const getCategoryColor = useCallback(
    (categoryId: string): string => {
      const cat = categories.find((c) => c.id === categoryId);
      return cat?.color ?? "#9ca3af";
    },
    [categories]
  );

  const getCategoryName = useCallback(
    (categoryId: string): string => {
      const cat = categories.find((c) => c.id === categoryId);
      return cat?.name ?? "";
    },
    [categories]
  );

  return (
    <Modal open={open} onClose={onClose} title="Profissionais" visuallyHidden={isDragging}>
      <div className="flex flex-col gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar profissional..."
        />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-minimal">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              selectedCategoryId === null
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface-card text-text-primary hover:bg-primary-light"
            )}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setSelectedCategoryId((prev) =>
                  prev === category.id ? null : category.id
                )
              }
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                selectedCategoryId === category.id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface-card text-text-primary hover:bg-primary-light"
              )}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto scrollbar-minimal">
          {filtered.map((professional) => (
            <DraggableProfessional
              key={professional.id}
              professionalId={professional.id}
              professionalName={professional.name}
              categoryId={professional.categoryId}
              availability={professional.availability}
            >
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3 py-2 min-h-[44px] cursor-grab active:cursor-grabbing hover:bg-surface transition-colors">
                <span
                  className={cn(
                    "inline-block w-2.5 h-2.5 rounded-full shrink-0",
                    professional.availability.length > 0
                      ? "bg-green-500"
                      : "bg-gray-400"
                  )}
                />
                <span className="flex-1 min-w-0 flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {professional.name}
                  </span>
                  {(roomCountMap.get(professional.id) ?? 0) > 0 && (
                    <span className="shrink-0 text-[10px] text-text-secondary bg-surface rounded-full px-1.5 py-0.5 leading-none">
                      {roomCountMap.get(professional.id)}{" "}
                      {roomCountMap.get(professional.id) === 1
                        ? "sala"
                        : "salas"}
                    </span>
                  )}
                </span>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: getCategoryColor(professional.categoryId) }}
                >
                  {getCategoryName(professional.categoryId)}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-secondary shrink-0"
                  aria-hidden="true"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
            </DraggableProfessional>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">
              Nenhum profissional encontrado
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
