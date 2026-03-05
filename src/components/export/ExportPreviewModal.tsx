"use client";

import { useState, useCallback } from "react";
import { Modal, Button, Input, Badge } from "@/components/ui";
import type { Workspace } from "@/types";
import type { Conflict } from "@/features/validation/types";

interface ExportPreviewModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly workspace: Workspace;
  readonly conflicts: ReadonlyArray<Conflict>;
}

export function ExportPreviewModal({
  open,
  onClose,
  workspace,
  conflicts,
}: ExportPreviewModalProps) {
  const [weekReference, setWeekReference] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = useCallback(() => {
    setIsGenerating(true);

    // Use a microtask to let the UI update before generating
    Promise.resolve()
      .then(() => import("./pdf-generator"))
      .then(({ generateSchedulePdf }) => {
        generateSchedulePdf({
          workspace,
          conflicts: [...conflicts],
          weekReference:
            weekReference.trim().length > 0
              ? weekReference.trim()
              : "Cronograma Semanal",
        });
        setIsGenerating(false);
        onClose();
      })
      .catch(() => {
        setIsGenerating(false);
      });
  }, [workspace, conflicts, weekReference, onClose]);

  const conflictCount = conflicts.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Exportar Cronograma"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating ? "Gerando..." : "Baixar PDF"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Referência da semana"
          placeholder="Ex: Semana de 10/03 a 14/03"
          value={weekReference}
          onChange={(e) => setWeekReference(e.target.value)}
          maxLength={80}
          helperText="Texto exibido no cabeçalho do PDF"
        />

        <div className="flex flex-col gap-2 rounded-lg bg-surface p-3">
          <p className="text-sm text-text-secondary">
            O PDF será gerado no formato paisagem (A4) com uma página por dia e
            um resumo ao final.
          </p>

          {conflictCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="error">
                {String(conflictCount)}{" "}
                {conflictCount === 1 ? "conflito" : "conflitos"}
              </Badge>
              <span className="text-sm text-text-secondary">
                não resolvido{conflictCount === 1 ? "" : "s"} —{" "}
                ser{conflictCount === 1 ? "á" : "ão"} incluído{conflictCount === 1 ? "" : "s"} no relatório
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
