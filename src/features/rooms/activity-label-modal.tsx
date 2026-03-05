"use client";

import { useState } from "react";
import { Modal, Input, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ActivityLabelModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (activityLabel: string) => void;
  readonly activityPresets: ReadonlyArray<string>;
}

export function ActivityLabelModal({
  open,
  onClose,
  onConfirm,
  activityPresets,
}: ActivityLabelModalProps) {
  const [prevOpen, setPrevOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  if (open && !prevOpen) {
    setLabel("");
    setError("");
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
  }

  function handleConfirm() {
    const trimmed = label.trim();
    if (trimmed.length === 0) {
      setError("Informe a atividade.");
      return;
    }
    onConfirm(trimmed);
  }

  function handlePresetClick(preset: string) {
    onConfirm(preset);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Qual atividade?"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirmar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {activityPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                "min-h-[36px] cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                label === preset
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface-card text-text-primary hover:bg-primary-light"
              )}
            >
              {preset}
            </button>
          ))}
        </div>

        <Input
          label="Ou digite um nome personalizado"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            setError("");
          }}
          error={error}
          placeholder="Nome da atividade"
          maxLength={100}
        />
      </div>
    </Modal>
  );
}
