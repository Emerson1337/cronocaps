"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button, IconButton, Input } from "@/components/ui";
import { WEEKDAY_LABELS } from "@/lib/constants";
import { TimePicker } from "@/components/dnd/TimePicker";
import { ProfessionalEntry } from "./detail/ProfessionalEntry";
import { AddProfessionalPicker } from "./detail/AddProfessionalPicker";
import { RemoveAllocationConfirm } from "./detail/RemoveAllocationConfirm";
import type { Workspace } from "@/types";

interface RoomDetailPanelProps {
  readonly allocationId: string | null;
  readonly onClose: () => void;
  readonly workspace: Workspace;
  readonly onUpdateActivity: (allocationId: string, label: string) => void;
  readonly onRemoveAllocation: (allocationId: string) => void;
  readonly onAddAssignment: (
    allocationId: string,
    professionalId: string,
    startTime: string,
    endTime: string
  ) => void;
  readonly onRemoveAssignment: (
    allocationId: string,
    professionalId: string
  ) => void;
  readonly onUpdateAssignment: (
    allocationId: string,
    professionalId: string,
    startTime: string,
    endTime: string
  ) => void;
}

interface TimePickerState {
  readonly open: boolean;
  readonly professionalId: string;
  readonly professionalName: string;
  readonly mode: "add" | "edit";
}

const INITIAL_TIME_PICKER_STATE: TimePickerState = {
  open: false,
  professionalId: "",
  professionalName: "",
  mode: "add",
};

export function RoomDetailPanel({
  allocationId,
  onClose,
  workspace,
  onUpdateActivity,
  onRemoveAllocation,
  onAddAssignment,
  onRemoveAssignment,
  onUpdateAssignment,
}: RoomDetailPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [activityDraft, setActivityDraft] = useState("");
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [timePickerState, setTimePickerState] = useState<TimePickerState>(
    INITIAL_TIME_PICKER_STATE
  );
  const [pendingAddProfessionalId, setPendingAddProfessionalId] = useState<
    string | null
  >(null);

  const panelRef = useRef<HTMLDivElement>(null);

  const isOpen = allocationId !== null;

  // Animate in when panel opens
  useEffect(() => {
    if (!isOpen) return;
    // Delay to trigger CSS transition
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Reset local state when panel closes (via unmount)
  useEffect(() => {
    return () => {
      setIsVisible(false);
      setIsEditingActivity(false);
      setShowAddPicker(false);
      setShowRemoveConfirm(false);
      setTimePickerState(INITIAL_TIME_PICKER_STATE);
      setPendingAddProfessionalId(null);
    };
  }, [isOpen]);

  const allocation = useMemo(() => {
    if (allocationId === null) return undefined;
    return workspace.allocations.find((a) => a.id === allocationId);
  }, [workspace.allocations, allocationId]);

  const roomName = useMemo(() => {
    if (allocation === undefined) return "Sala";
    const sameSlotAllocations = workspace.allocations.filter(
      (a) => a.day === allocation.day && a.shiftId === allocation.shiftId
    );
    const index = sameSlotAllocations.findIndex((a) => a.id === allocation.id);
    return `Sala ${String(index + 1)}`;
  }, [workspace.allocations, allocation]);

  const shift = useMemo(() => {
    if (allocation === undefined) return undefined;
    return workspace.shifts.find((s) => s.id === allocation.shiftId);
  }, [workspace.shifts, allocation]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const cat of workspace.categories) {
      map.set(cat.id, { name: cat.name, color: cat.color });
    }
    return map;
  }, [workspace.categories]);

  const professionalMap = useMemo(() => {
    const map = new Map<string, { name: string; categoryId: string }>();
    for (const p of workspace.professionals) {
      map.set(p.id, { name: p.name, categoryId: p.categoryId });
    }
    return map;
  }, [workspace.professionals]);

  // Header context string
  const contextLabel = useMemo(() => {
    if (allocation === undefined || shift === undefined) return "";
    const dayLabel = WEEKDAY_LABELS[allocation.day];
    return `${dayLabel} · ${shift.label} (${shift.startTime}–${shift.endTime})`;
  }, [allocation, shift]);

  // Activity editing
  const handleStartEditActivity = useCallback(() => {
    if (allocation === undefined) return;
    setActivityDraft(allocation.activityLabel);
    setIsEditingActivity(true);
  }, [allocation]);

  const handleSaveActivity = useCallback(() => {
    if (allocationId === null) return;
    const trimmed = activityDraft.trim();
    if (trimmed.length > 0) {
      onUpdateActivity(allocationId, trimmed);
    }
    setIsEditingActivity(false);
  }, [allocationId, activityDraft, onUpdateActivity]);

  const handleActivityKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSaveActivity();
      } else if (e.key === "Escape") {
        setIsEditingActivity(false);
      }
    },
    [handleSaveActivity]
  );

  const handleActivityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setActivityDraft(e.target.value);
    },
    []
  );

  // Remove allocation
  const handleRemoveConfirm = useCallback(() => {
    if (allocationId === null) return;
    onRemoveAllocation(allocationId);
    setShowRemoveConfirm(false);
    onClose();
  }, [allocationId, onRemoveAllocation, onClose]);

  // Add professional flow
  const handleProfessionalSelected = useCallback(
    (professionalId: string) => {
      const professional = professionalMap.get(professionalId);
      setPendingAddProfessionalId(professionalId);
      setShowAddPicker(false);
      setTimePickerState({
        open: true,
        professionalId,
        professionalName: professional?.name ?? "Profissional",
        mode: "add",
      });
    },
    [professionalMap]
  );

  // Edit professional time
  const handleEditProfessionalTime = useCallback(
    (professionalId: string) => {
      const professional = professionalMap.get(professionalId);
      setTimePickerState({
        open: true,
        professionalId,
        professionalName: professional?.name ?? "Profissional",
        mode: "edit",
      });
    },
    [professionalMap]
  );

  // Time picker confirm
  const handleTimeConfirm = useCallback(
    (startTime: string, endTime: string) => {
      if (allocationId === null) return;

      if (timePickerState.mode === "add" && pendingAddProfessionalId !== null) {
        onAddAssignment(
          allocationId,
          pendingAddProfessionalId,
          startTime,
          endTime
        );
        setPendingAddProfessionalId(null);
      } else if (timePickerState.mode === "edit") {
        onUpdateAssignment(
          allocationId,
          timePickerState.professionalId,
          startTime,
          endTime
        );
      }

      setTimePickerState(INITIAL_TIME_PICKER_STATE);
    },
    [
      allocationId,
      timePickerState,
      pendingAddProfessionalId,
      onAddAssignment,
      onUpdateAssignment,
    ]
  );

  const handleTimePickerClose = useCallback(() => {
    setTimePickerState(INITIAL_TIME_PICKER_STATE);
    setPendingAddProfessionalId(null);
  }, []);

  // Remove professional
  const handleRemoveProfessional = useCallback(
    (professionalId: string) => {
      if (allocationId === null) return;
      onRemoveAssignment(allocationId, professionalId);
    },
    [allocationId, onRemoveAssignment]
  );

  // Backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Keyboard escape
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const assignmentCount = allocation?.assignments.length ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-60 bg-black/50 transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={`Detalhes da sala ${roomName}`}
        className={cn(
          // Mobile/tablet: slide up from bottom
          "fixed z-50 bg-surface-card border-border shadow-xl",
          "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t",
          "transition-transform duration-250 ease-[cubic-bezier(0.33,1,0.68,1)]",
          "overflow-y-auto scrollbar-minimal",
          // Desktop: slide in from right
          "lg:inset-x-auto lg:right-0 lg:top-0 lg:bottom-0 lg:max-h-full lg:w-[420px] lg:rounded-t-none lg:rounded-l-2xl lg:border-t-0 lg:border-l",
          // Slide animation
          isVisible
            ? "translate-y-0 lg:translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-y-0 lg:translate-x-full"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex flex-col gap-1 border-b border-border bg-surface-card px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary truncate flex-1">
              {roomName}
            </h2>
            <IconButton label="Fechar" onClick={onClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </IconButton>
          </div>

          {/* Activity label */}
          {isEditingActivity ? (
            <Input
              value={activityDraft}
              onChange={handleActivityChange}
              onBlur={handleSaveActivity}
              onKeyDown={handleActivityKeyDown}
              maxLength={80}
              autoFocus
              className="text-sm"
            />
          ) : (
            <button
              type="button"
              onClick={handleStartEditActivity}
              className="text-sm font-medium text-primary hover:underline cursor-pointer bg-transparent border-none p-0 text-left min-h-[44px] flex items-center"
              title="Clique para editar a atividade"
            >
              {allocation?.activityLabel ?? "Sem atividade"}
            </button>
          )}

          <p className="text-xs text-text-secondary">{contextLabel}</p>
        </div>

        {/* Professional list */}
        <div className="flex flex-col gap-3 p-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Profissionais ({String(assignmentCount)})
          </h3>

          {assignmentCount === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center">
              Nenhum profissional alocado nesta sala.
            </p>
          ) : (
            allocation?.assignments.map((assignment, index) => {
              const professional = professionalMap.get(
                assignment.professionalId
              );
              const category = professional
                ? categoryMap.get(professional.categoryId)
                : undefined;

              const staggerStyle: React.CSSProperties &
                Record<string, unknown> = {
                "--stagger-index": index,
              };

              return (
                <div
                  key={assignment.professionalId}
                  className="animate-stagger-fade-in"
                  style={staggerStyle}
                >
                  <ProfessionalEntry
                    professionalName={
                      professional?.name ?? "Profissional desconhecido"
                    }
                    categoryName={category?.name ?? "Sem categoria"}
                    categoryColor={category?.color ?? "#999"}
                    startTime={assignment.startTime}
                    endTime={assignment.endTime}
                    onEdit={() =>
                      handleEditProfessionalTime(assignment.professionalId)
                    }
                    onRemove={() =>
                      handleRemoveProfessional(assignment.professionalId)
                    }
                  />
                </div>
              );
            })
          )}

          {/* Add professional button */}
          <Button
            variant="secondary"
            onClick={() => setShowAddPicker(true)}
            className="w-full"
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
              aria-hidden="true"
              className="mr-2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar Profissional
          </Button>
        </div>

        {/* Actions footer */}
        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-surface-card p-4">
          <Button
            variant="ghost"
            onClick={handleStartEditActivity}
            className="w-full"
          >
            Editar Atividade
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowRemoveConfirm(true)}
            className="w-full"
          >
            Remover Sala
          </Button>
        </div>
      </div>

      {/* Add professional picker modal */}
      {allocation !== undefined && (
        <AddProfessionalPicker
          open={showAddPicker}
          onClose={() => setShowAddPicker(false)}
          professionals={workspace.professionals}
          categories={workspace.categories}
          allocations={workspace.allocations}
          day={allocation.day}
          shiftId={allocation.shiftId}
          onSelect={handleProfessionalSelected}
        />
      )}

      {/* Time picker modal */}
      {shift !== undefined && (
        <TimePicker
          open={timePickerState.open}
          onClose={handleTimePickerClose}
          professionalName={timePickerState.professionalName}
          shiftStartTime={shift.startTime}
          shiftEndTime={shift.endTime}
          onConfirm={handleTimeConfirm}
        />
      )}

      {/* Remove allocation confirmation */}
      <RemoveAllocationConfirm
        open={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleRemoveConfirm}
        allocation={allocation}
        professionals={workspace.professionals}
        roomName={roomName}
      />
    </>
  );
}
