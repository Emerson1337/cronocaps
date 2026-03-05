"use client";

import { useMemo, useState, useCallback } from "react";
import { Modal, Button, Input } from "@/components/ui";
import type { Professional, Category, Allocation, WeekDay } from "@/types";

interface AddProfessionalPickerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly professionals: ReadonlyArray<Professional>;
  readonly categories: ReadonlyArray<Category>;
  readonly allocations: ReadonlyArray<Allocation>;
  readonly day: WeekDay;
  readonly shiftId: string;
  readonly onSelect: (professionalId: string) => void;
}

export function AddProfessionalPicker({
  open,
  onClose,
  professionals,
  categories,
  allocations,
  day,
  shiftId,
  onSelect,
}: AddProfessionalPickerProps) {
  const [search, setSearch] = useState("");

  const assignedProfessionalIds = useMemo(() => {
    const ids = new Set<string>();
    for (const allocation of allocations) {
      if (allocation.day === day && allocation.shiftId === shiftId) {
        for (const assignment of allocation.assignments) {
          ids.add(assignment.professionalId);
        }
      }
    }
    return ids;
  }, [allocations, day, shiftId]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const category of categories) {
      map.set(category.id, category);
    }
    return map;
  }, [categories]);

  const availableProfessionals = useMemo(() => {
    return professionals.filter(
      (p) =>
        !assignedProfessionalIds.has(p.id) &&
        p.availability.some(
          (slot) => slot.day === day && slot.shiftId === shiftId
        )
    );
  }, [professionals, assignedProfessionalIds, day, shiftId]);

  const filteredProfessionals = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (term.length === 0) return availableProfessionals;
    return availableProfessionals.filter((p) => {
      const category = categoryMap.get(p.categoryId);
      const categoryName = category?.name ?? "";
      return (
        p.name.toLowerCase().includes(term) ||
        categoryName.toLowerCase().includes(term)
      );
    });
  }, [availableProfessionals, search, categoryMap]);

  const handleSelect = useCallback(
    (professionalId: string) => {
      onSelect(professionalId);
      setSearch("");
    },
    [onSelect]
  );

  const handleClose = useCallback(() => {
    setSearch("");
    onClose();
  }, [onClose]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Adicionar Profissional"
    >
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Buscar profissional..."
          value={search}
          onChange={handleSearchChange}
          autoFocus
        />

        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto scrollbar-minimal">
          {filteredProfessionals.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">
              {availableProfessionals.length === 0
                ? "Nenhum profissional disponível para este turno."
                : "Nenhum profissional encontrado."}
            </p>
          ) : (
            filteredProfessionals.map((professional) => {
              const category = categoryMap.get(professional.categoryId);

              return (
                <Button
                  key={professional.id}
                  variant="ghost"
                  onClick={() => handleSelect(professional.id)}
                  className="flex items-center gap-2 justify-start text-left w-full min-h-[44px] px-3 py-2"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: category?.color ?? "#999" }}
                    aria-hidden="true"
                  />
                  <span className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {professional.name}
                    </span>
                    <span className="text-xs text-text-secondary truncate">
                      {category?.name ?? "Sem categoria"}
                    </span>
                  </span>
                </Button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
