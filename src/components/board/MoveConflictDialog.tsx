"use client";

import { Modal, Button } from "@/components/ui";

interface ConflictProfessional {
  readonly id: string;
  readonly name: string;
}

interface MoveConflictDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly unavailableProfessionals: ReadonlyArray<ConflictProfessional>;
  readonly activityLabel: string;
}

export function MoveConflictDialog({
  open,
  onClose,
  onConfirm,
  unavailableProfessionals,
  activityLabel,
}: MoveConflictDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conflito ao mover sala"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Mover mesmo assim</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text-secondary">
          A sala <strong className="text-text-primary">{activityLabel}</strong>{" "}
          possui profissionais que não estão disponiveis no turno de destino:
        </p>
        <ul className="flex flex-col gap-1.5">
          {unavailableProfessionals.map((prof) => (
            <li
              key={prof.id}
              className="flex items-center gap-2 text-sm text-text-primary"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
              {prof.name}
            </li>
          ))}
        </ul>
        <p className="text-xs text-text-secondary">
          Ao confirmar, esses profissionais serão removidos da sala movida.
        </p>
      </div>
    </Modal>
  );
}
