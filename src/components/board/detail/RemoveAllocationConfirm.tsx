"use client";

import { useMemo } from "react";
import { Modal, Button } from "@/components/ui";
import type { Allocation, Professional } from "@/types";

interface RemoveAllocationConfirmProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly allocation: Allocation | undefined;
  readonly professionals: ReadonlyArray<Professional>;
  readonly roomName: string;
}

export function RemoveAllocationConfirm({
  open,
  onClose,
  onConfirm,
  allocation,
  professionals,
  roomName,
}: RemoveAllocationConfirmProps) {
  const affectedProfessionalNames = useMemo(() => {
    if (allocation === undefined) return [];
    const professionalMap = new Map<string, string>();
    for (const p of professionals) {
      professionalMap.set(p.id, p.name);
    }
    return allocation.assignments.map(
      (a) => professionalMap.get(a.professionalId) ?? "Profissional desconhecido"
    );
  }, [allocation, professionals]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Remover Sala"
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
          Tem certeza que deseja remover a sala{" "}
          <strong>{roomName}</strong> desta alocação?
        </p>

        {affectedProfessionalNames.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-text-secondary">
              Os seguintes profissionais serão desvinculados:
            </p>
            <ul className="list-disc list-inside text-sm text-text-secondary">
              {affectedProfessionalNames.map((name, index) => (
                <li key={`${name}-${String(index)}`}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
