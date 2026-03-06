"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/features/workspace/use-workspace";
import { useProfessionals } from "@/features/professionals/use-professionals";
import { ProfessionalFormModal } from "@/features/professionals/professional-form-modal";
import { DeleteProfessionalDialog } from "@/features/professionals/delete-professional-dialog";
import { CategoryManager } from "@/features/professionals/category-manager";
import { Button, IconButton, Input, Select } from "@/components/ui";

import type { Workspace, Professional, Shift } from "@/types";

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

const ROOMS_OPTIONS: ReadonlyArray<{ value: string; label: string }> = Array.from(
  { length: 50 },
  (_, i) => ({ value: String(i + 1), label: String(i + 1) })
);

// SVG icon paths reused across sections
const EDIT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const DELETE_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const BACK_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export default function SettingsPage() {
  const router = useRouter();
  const { workspace, updateWorkspace: rawUpdateWorkspace, isLoaded } = useWorkspace();

  const safeUpdateWorkspace = useCallback(
    (updater: (prev: Workspace) => Workspace) => {
      rawUpdateWorkspace((prev) => {
        if (prev === null) return null;
        return updater(prev);
      });
    },
    [rawUpdateWorkspace]
  );

  const { professionals, removeProfessional, getProfessionalAllocations } = useProfessionals({
    workspace,
    updateWorkspace: safeUpdateWorkspace,
  });

  // Professional modal state
  const [professionalModalOpen, setProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | undefined>(undefined);
  const [deletingProfessional, setDeletingProfessional] = useState<Professional | null>(null);

  // Shift inline editing
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftDraft, setShiftDraft] = useState<{ label: string; startTime: string; endTime: string }>({
    label: "",
    startTime: "",
    endTime: "",
  });

  // Activity presets
  const [newPreset, setNewPreset] = useState("");

  // Redirect if no workspace
  useEffect(() => {
    if (isLoaded && workspace === null) {
      router.replace("/");
    }
  }, [isLoaded, workspace, router]);

  // Handlers
  const handleEditProfessional = useCallback((p: Professional) => {
    setEditingProfessional(p);
    setProfessionalModalOpen(true);
  }, []);

  const handleAddProfessional = useCallback(() => {
    setEditingProfessional(undefined);
    setProfessionalModalOpen(true);
  }, []);

  const handleDeleteProfessional = useCallback(() => {
    if (deletingProfessional === null) return;
    removeProfessional(deletingProfessional.id);
    setDeletingProfessional(null);
  }, [deletingProfessional, removeProfessional]);

  const handleStartEditShift = useCallback((shift: Shift) => {
    setEditingShiftId(shift.id);
    setShiftDraft({ label: shift.label, startTime: shift.startTime, endTime: shift.endTime });
  }, []);

  const handleSaveShift = useCallback(() => {
    if (editingShiftId === null) return;
    const trimmedLabel = shiftDraft.label.trim();
    if (trimmedLabel.length === 0) return;
    safeUpdateWorkspace((prev) => ({
      ...prev,
      shifts: prev.shifts.map((s) =>
        s.id === editingShiftId
          ? { ...s, label: trimmedLabel, startTime: shiftDraft.startTime, endTime: shiftDraft.endTime }
          : s
      ),
      updatedAt: new Date().toISOString(),
    }));
    setEditingShiftId(null);
  }, [editingShiftId, shiftDraft, safeUpdateWorkspace]);

  const handleCancelEditShift = useCallback(() => {
    setEditingShiftId(null);
  }, []);

  const handleAddPreset = useCallback(() => {
    const trimmed = newPreset.trim();
    if (trimmed.length === 0) return;
    if (workspace !== null && workspace.activityPresets.includes(trimmed)) return;
    safeUpdateWorkspace((prev) => ({
      ...prev,
      activityPresets: [...prev.activityPresets, trimmed],
      updatedAt: new Date().toISOString(),
    }));
    setNewPreset("");
  }, [newPreset, workspace, safeUpdateWorkspace]);

  const handleRemovePreset = useCallback(
    (preset: string) => {
      safeUpdateWorkspace((prev) => ({
        ...prev,
        activityPresets: prev.activityPresets.filter((p) => p !== preset),
        updatedAt: new Date().toISOString(),
      }));
    },
    [safeUpdateWorkspace]
  );

  const handleRoomsPerShiftChange = useCallback(
    (value: number) => {
      if (value < 1 || value > 50) return;
      safeUpdateWorkspace((prev) => ({
        ...prev,
        roomsPerShift: value,
        updatedAt: new Date().toISOString(),
      }));
    },
    [safeUpdateWorkspace]
  );

  if (!isLoaded || workspace === null) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-4">
        <span className="text-text-secondary">Carregando...</span>
      </main>
    );
  }

  const getCategoryName = (categoryId: string): string => {
    const cat = workspace.categories.find((c) => c.id === categoryId);
    return cat !== undefined ? cat.name : "";
  };

  const getCategoryColor = (categoryId: string): string => {
    const cat = workspace.categories.find((c) => c.id === categoryId);
    return cat !== undefined ? cat.color : "#6B7280";
  };

  return (
    <main className="flex flex-col min-h-dvh bg-surface animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-surface-card px-4 py-2 shrink-0">
        <button
          type="button"
          onClick={() => router.push("/area-de-trabalho")}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          aria-label="Voltar"
        >
          {BACK_ICON}
        </button>
        <h1 className="text-lg font-semibold text-text-primary">Configurações</h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-minimal px-4 py-4 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: Professionals + Categories */}
          <div className="flex flex-col gap-6">
            {/* Profissionais Section */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">Profissionais</h2>
                <Button size="sm" onClick={handleAddProfessional}>
                  Adicionar
                </Button>
              </div>

              {professionals.length === 0 && (
                <p className="text-sm text-text-secondary py-3 text-center">
                  Nenhum profissional cadastrado.
                </p>
              )}

              <div className="flex flex-col gap-1">
                {professionals.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-border bg-surface-card px-2 py-1.5 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {p.name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white shrink-0"
                        style={{ backgroundColor: getCategoryColor(p.categoryId) }}
                      >
                        {getCategoryName(p.categoryId)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-text-secondary">
                        {p.availability.length} {p.availability.length === 1 ? "slot" : "slots"}
                      </span>
                      <div className="flex items-center gap-1">
                        <IconButton label="Editar profissional" onClick={() => handleEditProfessional(p)}>
                          {EDIT_ICON}
                        </IconButton>
                        <IconButton label="Remover profissional" variant="danger" onClick={() => setDeletingProfessional(p)}>
                          {DELETE_ICON}
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Categorias Section */}
            <section>
              <CategoryManager workspace={workspace} updateWorkspace={safeUpdateWorkspace} />
            </section>
          </div>

          {/* Right column: Shifts + Activity Presets + Rooms Per Shift */}
          <div className="flex flex-col gap-6">
            {/* Turnos Section */}
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-text-primary">Turnos</h2>

              {workspace.shifts.length === 0 && (
                <p className="text-sm text-text-secondary py-3 text-center">
                  Nenhum turno configurado.
                </p>
              )}

              <div className="flex flex-col gap-1">
                {workspace.shifts.map((shift) => {
                  const isEditing = editingShiftId === shift.id;

                  if (isEditing) {
                    return (
                      <div
                        key={shift.id}
                        className="rounded-lg border border-primary bg-surface-card p-2 flex flex-col gap-2"
                      >
                        <Input
                          label="Nome do turno"
                          value={shiftDraft.label}
                          onChange={(e) => setShiftDraft((d) => ({ ...d, label: e.target.value }))}
                          maxLength={30}
                        />
                        <div className="flex gap-2">
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-medium text-text-primary">Início</label>
                            <Select
                              value={shiftDraft.startTime}
                              onChange={(v) => setShiftDraft((d) => ({ ...d, startTime: v }))}
                              options={ALL_TIME_OPTIONS}
                            />
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-medium text-text-primary">Fim</label>
                            <Select
                              value={shiftDraft.endTime}
                              onChange={(v) => setShiftDraft((d) => ({ ...d, endTime: v }))}
                              options={ALL_TIME_OPTIONS}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="secondary" onClick={handleCancelEditShift}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSaveShift}>
                            Salvar
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={shift.id}
                      className="rounded-lg border border-border bg-surface-card px-2 py-1.5 flex items-center gap-2 min-h-[36px]"
                    >
                      <span className="flex-1 text-sm font-medium text-text-primary">
                        {shift.label}
                      </span>
                      <span className="text-xs text-text-secondary shrink-0">
                        {shift.startTime} - {shift.endTime}
                      </span>
                      <IconButton label="Editar turno" onClick={() => handleStartEditShift(shift)}>
                        {EDIT_ICON}
                      </IconButton>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Activity Presets Section */}
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-text-primary">Atividades Predefinidas</h2>

              <div className="flex flex-wrap gap-1.5">
                {workspace.activityPresets.map((preset) => (
                  <span
                    key={preset}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium"
                  >
                    {preset}
                    <button
                      type="button"
                      onClick={() => handleRemovePreset(preset)}
                      className="hover:text-error cursor-pointer ml-0.5"
                      aria-label={`Remover ${preset}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPreset}
                  onChange={(e) => setNewPreset(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPreset();
                    }
                  }}
                  placeholder="Nova atividade..."
                  className="flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text-primary min-h-[36px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <Button size="sm" onClick={handleAddPreset}>
                  Adicionar
                </Button>
              </div>
            </section>

            {/* Rooms Per Shift Section */}
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-text-primary">Salas por Turno</h2>
              <p className="text-xs text-text-secondary">
                Número máximo de atividades por turno em cada dia.
              </p>
              <Select
                value={String(workspace.roomsPerShift)}
                onChange={(v) => handleRoomsPerShiftChange(Number(v))}
                options={ROOMS_OPTIONS}
                className="w-24"
              />
            </section>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfessionalFormModal
        open={professionalModalOpen}
        onClose={() => setProfessionalModalOpen(false)}
        workspace={workspace}
        updateWorkspace={safeUpdateWorkspace}
        {...(editingProfessional !== undefined ? { professional: editingProfessional } : {})}
      />

      {deletingProfessional !== null && (
        <DeleteProfessionalDialog
          open={true}
          onClose={() => setDeletingProfessional(null)}
          onConfirm={handleDeleteProfessional}
          professional={deletingProfessional}
          allocations={getProfessionalAllocations(deletingProfessional.id)}
          workspace={workspace}
        />
      )}
    </main>
  );
}
