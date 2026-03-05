"use client";

import { Button, Modal } from "@/components/ui";
import { WEEKDAY_SHORT_LABELS } from "@/lib/constants";
import type { Allocation, Professional, Shift, Workspace } from "@/types";

interface DeleteProfessionalDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly professional: Professional;
  readonly allocations: ReadonlyArray<Allocation>;
  readonly workspace: Workspace;
}

export function DeleteProfessionalDialog({
  open,
  onClose,
  onConfirm,
  professional,
  allocations,
  workspace,
}: DeleteProfessionalDialogProps) {
  const hasAllocations = allocations.length > 0;

  const getShiftLabel = (shiftId: string): string => {
    const shift = workspace.shifts.find((s: Shift) => s.id === shiftId);
    return shift !== undefined ? shift.label : "Turno desconhecido";
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Remover Profissional"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Remover
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text-primary">
          Tem certeza que deseja remover{" "}
          <strong>{professional.name}</strong>?
        </p>

        {hasAllocations && (
          <div className="rounded-lg border border-warning/50 bg-warning/10 p-3">
            <p className="text-sm font-medium text-warning mb-2">
              Este profissional possui alocações na agenda:
            </p>
            <ul className="flex flex-col gap-1">
              {allocations.map((alloc) => (
                <li
                  key={alloc.id}
                  className="text-xs text-text-secondary flex items-center gap-1"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                  {WEEKDAY_SHORT_LABELS[alloc.day]} — {getShiftLabel(alloc.shiftId)} — {alloc.activityLabel || "Sem atividade"}
                </li>
              ))}
            </ul>
            <p className="text-xs text-text-secondary mt-2">
              Ao remover, o profissional será desvinculado automaticamente de todas as alocações acima.
            </p>
          </div>
        )}

        {!hasAllocations && (
          <p className="text-sm text-text-secondary">
            Este profissional não possui alocações na agenda.
          </p>
        )}
      </div>
    </Modal>
  );
}
