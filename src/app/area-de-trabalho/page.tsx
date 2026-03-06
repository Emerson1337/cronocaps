"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/features/workspace/use-workspace";
import { useSchedule } from "@/features/schedule/use-schedule";
import { useUndoRedo } from "@/hooks/use-undo-redo";
import { Board } from "@/components/board/Board";
import { ResourceIcons } from "@/components/board/ResourceIcons";
import { FloatingToolbar } from "@/components/board/FloatingToolbar";
import { AutoSaveIndicator } from "@/components/board/AutoSaveIndicator";
import { RoomDetailPanel } from "@/components/board/RoomDetailPanel";
import { Input } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";
import { ExportPreviewModal } from "@/components/export";
import { DndProvider } from "@/components/dnd";
import { ActivityLabelModal } from "@/features/rooms/activity-label-modal";
import { AddProfessionalPicker } from "@/components/board/detail/AddProfessionalPicker";
import { TimePicker } from "@/components/dnd/TimePicker";
import { MoveConflictDialog } from "@/components/board/MoveConflictDialog";
import { ClipboardProvider, useClipboard } from "@/contexts/clipboard-context";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { generateId } from "@/lib/utils";
import {
  validateWorkspace,
  ConflictSummaryPanel,
  getAllocationConflictStyle,
} from "@/features/validation";
import type { Workspace, WeekDay } from "@/types";

interface PendingRoomDrop {
  readonly day: WeekDay;
  readonly shiftId: string;
}

interface PendingAllocationMove {
  readonly allocationId: string;
  readonly targetDay: WeekDay;
  readonly targetShiftId: string;
  readonly unavailableProfessionals: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;
  readonly availableProfessionalIds: ReadonlyArray<string>;
  readonly activityLabel: string;
}

export default function WorkspacePage() {
  return (
    <ClipboardProvider>
      <ToastProvider>
        <WorkspacePageInner />
      </ToastProvider>
    </ClipboardProvider>
  );
}

function WorkspacePageInner() {
  const { copiedRoom, copyRoom, clearClipboard } = useClipboard();
  const { showToast } = useToast();
  const router = useRouter();
  const {
    workspace,
    updateWorkspace: rawUpdateWorkspace,
    isLoaded,
  } = useWorkspace();

  const safeUpdateWorkspace = useCallback(
    (updater: (prev: Workspace) => Workspace) => {
      rawUpdateWorkspace((prev) => {
        if (prev === null) return null;
        return updater(prev);
      });
    },
    [rawUpdateWorkspace]
  );

  const { undoableUpdate, undo, redo, canUndo, canRedo } = useUndoRedo({
    workspace,
    updateWorkspace: safeUpdateWorkspace,
  });

  const schedule = useSchedule({
    workspace,
    updateWorkspace: undoableUpdate,
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isConflictPanelOpen, setIsConflictPanelOpen] = useState(false);
  const [selectedAllocationId, setSelectedAllocationId] = useState<
    string | null
  >(null);
  const [isRoomsSummaryOpen, setIsRoomsSummaryOpen] = useState(false);
  const [pendingRoomDrop, setPendingRoomDrop] =
    useState<PendingRoomDrop | null>(null);
  const [pendingAllocationMove, setPendingAllocationMove] =
    useState<PendingAllocationMove | null>(null);
  const [quickAddAllocationId, setQuickAddAllocationId] = useState<
    string | null
  >(null);
  const [quickAddTimePicker, setQuickAddTimePicker] = useState<{
    allocationId: string;
    professionalId: string;
    professionalName: string;
  } | null>(null);

  useEffect(() => {
    if (isLoaded && workspace === null) {
      router.replace("/");
    }
  }, [isLoaded, workspace, router]);

  const handleNameEdit = useCallback(() => {
    if (workspace === null) return;
    setEditedName(workspace.name);
    setIsEditingName(true);
  }, [workspace]);

  const handleNameSave = useCallback(() => {
    const trimmed = editedName.trim();
    if (trimmed.length > 0) {
      safeUpdateWorkspace((prev) => ({
        ...prev,
        name: trimmed,
        updatedAt: new Date().toISOString(),
      }));
    }
    setIsEditingName(false);
  }, [editedName, safeUpdateWorkspace]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleNameSave();
      } else if (e.key === "Escape") {
        setIsEditingName(false);
      }
    },
    [handleNameSave]
  );

  const conflicts = useMemo(() => {
    if (workspace === null) return [];
    return [...validateWorkspace(workspace)];
  }, [workspace]);

  const conflictCount = conflicts.length;
  const hasErrors = conflicts.some((c) => c.severity === "error");

  const handleRoomDrop = useCallback(
    (day: WeekDay, shiftId: string) => {
      if (workspace === null) return;
      setPendingRoomDrop({ day, shiftId });
    },
    [workspace]
  );

  const handleProfessionalDrop = useCallback(
    (professionalId: string, allocationId: string) => {
      if (workspace === null) return;
      const allocation = workspace.allocations.find(
        (a) => a.id === allocationId
      );
      if (allocation === undefined) return;
      const shift = workspace.shifts.find((s) => s.id === allocation.shiftId);
      if (shift === undefined) return;

      schedule.addAssignment(
        allocationId,
        professionalId,
        shift.startTime,
        shift.endTime
      );
    },
    [workspace, schedule]
  );

  const handleAllocationMove = useCallback(
    (allocationId: string, targetDay: WeekDay, targetShiftId: string) => {
      if (workspace === null) return;
      const allocation = workspace.allocations.find(
        (a) => a.id === allocationId
      );
      if (allocation === undefined) return;

      const assignedProfIds = allocation.assignments.map(
        (a) => a.professionalId
      );
      if (assignedProfIds.length === 0) {
        schedule.moveAllocation(allocationId, targetDay, targetShiftId);
        return;
      }

      const unavailable: Array<{ id: string; name: string }> = [];
      const availableIds: string[] = [];

      for (const profId of assignedProfIds) {
        const prof = workspace.professionals.find((p) => p.id === profId);
        if (prof === undefined) continue;

        const isAvailable = prof.availability.some(
          (slot) => slot.day === targetDay && slot.shiftId === targetShiftId
        );
        if (isAvailable) {
          availableIds.push(profId);
        } else {
          unavailable.push({ id: profId, name: prof.name });
        }
      }

      if (unavailable.length === 0) {
        schedule.moveAllocation(allocationId, targetDay, targetShiftId);
      } else {
        setPendingAllocationMove({
          allocationId,
          targetDay,
          targetShiftId,
          unavailableProfessionals: unavailable,
          availableProfessionalIds: availableIds,
          activityLabel: allocation.activityLabel,
        });
      }
    },
    [workspace, schedule]
  );

  const handleMoveConflictConfirm = useCallback(() => {
    if (pendingAllocationMove === null) return;
    schedule.moveAllocation(
      pendingAllocationMove.allocationId,
      pendingAllocationMove.targetDay,
      pendingAllocationMove.targetShiftId,
      pendingAllocationMove.availableProfessionalIds
    );
    setPendingAllocationMove(null);
  }, [pendingAllocationMove, schedule]);

  const handleActivityConfirm = useCallback(
    (activityLabel: string) => {
      if (pendingRoomDrop === null) return;
      schedule.addAllocation(
        pendingRoomDrop.day,
        pendingRoomDrop.shiftId,
        activityLabel
      );
      setPendingRoomDrop(null);
    },
    [pendingRoomDrop, schedule]
  );

  const handleAllocationTap = useCallback((allocationId: string) => {
    setSelectedAllocationId(allocationId);
  }, []);

  const handleAllocationQuickAdd = useCallback((allocationId: string) => {
    setQuickAddAllocationId(allocationId);
  }, []);

  const handleQuickAddSelect = useCallback(
    (professionalId: string) => {
      if (workspace === null || quickAddAllocationId === null) return;
      const prof = workspace.professionals.find((p) => p.id === professionalId);
      setQuickAddTimePicker({
        allocationId: quickAddAllocationId,
        professionalId,
        professionalName: prof?.name ?? "Profissional",
      });
      setQuickAddAllocationId(null);
    },
    [workspace, quickAddAllocationId]
  );

  const handleQuickAddTimeConfirm = useCallback(
    (startTime: string, endTime: string) => {
      if (quickAddTimePicker === null) return;
      schedule.addAssignment(
        quickAddTimePicker.allocationId,
        quickAddTimePicker.professionalId,
        startTime,
        endTime
      );
      setQuickAddTimePicker(null);
    },
    [quickAddTimePicker, schedule]
  );

  const handleAllocationRemove = useCallback(
    (allocationId: string) => {
      schedule.removeAllocation(allocationId);
    },
    [schedule]
  );

  const handleAllocationCopy = useCallback(
    (allocationId: string) => {
      if (workspace === null) return;
      const allocation = workspace.allocations.find(
        (a) => a.id === allocationId
      );
      if (allocation === undefined) return;
      copyRoom({
        activityLabel: allocation.activityLabel,
        assignments: allocation.assignments,
      });
      showToast(`Sala "${allocation.activityLabel}" copiada`, "success");
    },
    [workspace, copyRoom, showToast]
  );

  const handlePaste = useCallback(
    (day: WeekDay, shiftId: string) => {
      if (workspace === null || copiedRoom === null) return;

      const availableAssignments = copiedRoom.assignments.filter((assign) => {
        const prof = workspace.professionals.find(
          (p) => p.id === assign.professionalId
        );
        if (prof === undefined) return false;
        return prof.availability.some(
          (slot) => slot.day === day && slot.shiftId === shiftId
        );
      });

      const newAllocationId = generateId();
      undoableUpdate((prev) => ({
        ...prev,
        allocations: [
          ...prev.allocations,
          {
            id: newAllocationId,
            day,
            shiftId,
            activityLabel: copiedRoom.activityLabel,
            assignments: availableAssignments,
          },
        ],
        updatedAt: new Date().toISOString(),
      }));

      const removedCount =
        copiedRoom.assignments.length - availableAssignments.length;
      if (removedCount > 0) {
        showToast(
          `Sala colada. ${String(removedCount)} profissional(is) removido(s) por indisponibilidade.`,
          "info"
        );
      } else {
        showToast(`Sala "${copiedRoom.activityLabel}" colada`, "success");
      }

      clearClipboard();
    },
    [workspace, copiedRoom, undoableUpdate, showToast, clearClipboard]
  );

  const getConflictStyleForAllocation = useCallback(
    (allocationId: string): string => {
      return getAllocationConflictStyle(conflicts, allocationId);
    },
    [conflicts]
  );

  if (!isLoaded || workspace === null) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-4">
        <span className="text-text-secondary">Carregando...</span>
      </main>
    );
  }

  return (
    <DndProvider
      onRoomDrop={handleRoomDrop}
      onProfessionalDrop={handleProfessionalDrop}
      onAllocationMove={handleAllocationMove}
    >
      <main className="flex flex-col h-dvh overflow-hidden animate-fade-in">
        {/* Floating toolbar (top-right) */}
        <FloatingToolbar
          onExport={() => setIsExportModalOpen(true)}
          conflictCount={conflictCount}
          hasErrors={hasErrors}
          onConflictClick={() => setIsConflictPanelOpen(true)}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          showRoomsSummary={isRoomsSummaryOpen}
          onToggleRoomsSummary={() => setIsRoomsSummaryOpen((prev) => !prev)}
        />

        {/* Centered workspace name */}
        <div className="flex relative items-center justify-center gap-2 pt-2 pb-1 sm:pt-3 shrink-0">
          <Logo size={24} className="shrink-0" />
          {isEditingName ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              className="text-xl sm:text-2xl font-bold max-w-[200px] sm:max-w-[300px] text-center font-hand"
              maxLength={60}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={handleNameEdit}
              className="text-xl sm:text-2xl font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer bg-transparent border-none px-1 text-center font-hand truncate max-w-[200px] sm:max-w-none"
              title="Clique para editar o nome"
            >
              {workspace.name}
            </button>
          )}
          <div className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 hidden sm:block">
            <AutoSaveIndicator workspace={workspace} />
          </div>
        </div>

        {/* Resource Icons */}
        <ResourceIcons workspace={workspace} />
        {/* Board */}
        <Board
          days={workspace.days}
          shifts={workspace.shifts}
          allocations={workspace.allocations}
          roomsPerShift={workspace.roomsPerShift}
          onAllocationTap={handleAllocationTap}
          onAllocationQuickAdd={handleAllocationQuickAdd}
          onAllocationRemove={handleAllocationRemove}
          onAllocationCopy={handleAllocationCopy}
          onPaste={handlePaste}
          hasClipboard={copiedRoom !== null}
          getConflictStyle={getConflictStyleForAllocation}
          showDetails={isRoomsSummaryOpen}
          professionals={workspace.professionals}
          categories={workspace.categories}
          onAddRoom={handleRoomDrop}
        />

        {/* Activity label modal (after room drop) */}
        <ActivityLabelModal
          open={pendingRoomDrop !== null}
          onClose={() => setPendingRoomDrop(null)}
          onConfirm={handleActivityConfirm}
          activityPresets={workspace.activityPresets ?? []}
        />

        {/* Room Detail Panel */}
        <RoomDetailPanel
          allocationId={selectedAllocationId}
          onClose={() => setSelectedAllocationId(null)}
          workspace={workspace}
          onUpdateActivity={schedule.updateAllocationActivity}
          onRemoveAllocation={(allocationId) => {
            schedule.removeAllocation(allocationId);
            setSelectedAllocationId(null);
          }}
          onAddAssignment={schedule.addAssignment}
          onRemoveAssignment={schedule.removeAssignment}
          onUpdateAssignment={schedule.updateAssignment}
        />

        {/* Quick-add professional picker */}
        {workspace !== null &&
          quickAddAllocationId !== null &&
          (() => {
            const alloc = workspace.allocations.find(
              (a) => a.id === quickAddAllocationId
            );
            if (alloc === undefined) return null;
            return (
              <AddProfessionalPicker
                open
                onClose={() => setQuickAddAllocationId(null)}
                professionals={workspace.professionals}
                categories={workspace.categories}
                allocations={workspace.allocations}
                day={alloc.day}
                shiftId={alloc.shiftId}
                onSelect={handleQuickAddSelect}
              />
            );
          })()}

        {/* Quick-add time picker */}
        {workspace !== null &&
          quickAddTimePicker !== null &&
          (() => {
            const alloc = workspace.allocations.find(
              (a) => a.id === quickAddTimePicker.allocationId
            );
            const shift =
              alloc !== undefined
                ? workspace.shifts.find((s) => s.id === alloc.shiftId)
                : undefined;
            if (shift === undefined) return null;
            return (
              <TimePicker
                open
                onClose={() => setQuickAddTimePicker(null)}
                professionalName={quickAddTimePicker.professionalName}
                shiftStartTime={shift.startTime}
                shiftEndTime={shift.endTime}
                onConfirm={handleQuickAddTimeConfirm}
              />
            );
          })()}

        {/* Move Conflict Dialog */}
        <MoveConflictDialog
          open={pendingAllocationMove !== null}
          onClose={() => setPendingAllocationMove(null)}
          onConfirm={handleMoveConflictConfirm}
          unavailableProfessionals={
            pendingAllocationMove?.unavailableProfessionals ?? []
          }
          activityLabel={pendingAllocationMove?.activityLabel ?? ""}
        />

        {/* Conflict Summary Panel */}
        <ConflictSummaryPanel
          open={isConflictPanelOpen}
          onClose={() => setIsConflictPanelOpen(false)}
          conflicts={conflicts}
        />

        {/* Export PDF Modal */}
        <ExportPreviewModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          workspace={workspace}
          conflicts={conflicts}
        />
      </main>
    </DndProvider>
  );
}
