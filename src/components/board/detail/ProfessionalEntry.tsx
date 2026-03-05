"use client";

import { useCallback } from "react";
import { Card, IconButton, Badge } from "@/components/ui";
import {
  DEFAULT_APPOINTMENT_DURATION,
  DEFAULT_APPOINTMENT_INTERVAL,
} from "@/lib/constants";

interface ProfessionalEntryProps {
  readonly professionalName: string;
  readonly categoryName: string;
  readonly categoryColor: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly onEdit: () => void;
  readonly onRemove: () => void;
}

function timeToMinutes(time: string): number {
  const parts = time.split(":");
  const hours = parts[0];
  const minutes = parts[1];
  if (hours === undefined || minutes === undefined) return 0;
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
}

function calculateSessionCount(startTime: string, endTime: string): number {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const totalMinutes = endMinutes - startMinutes;
  if (totalMinutes <= 0) return 0;
  return Math.floor(
    totalMinutes / (DEFAULT_APPOINTMENT_DURATION + DEFAULT_APPOINTMENT_INTERVAL)
  );
}

export function ProfessionalEntry({
  professionalName,
  categoryName,
  categoryColor,
  startTime,
  endTime,
  onEdit,
  onRemove,
}: ProfessionalEntryProps) {
  const sessionCount = calculateSessionCount(startTime, endTime);
  const sessionLabel =
    sessionCount === 1
      ? `${String(sessionCount)} atendimento`
      : `${String(sessionCount)} atendimentos`;

  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove();
    },
    [onRemove]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit();
    },
    [onEdit]
  );

  return (
    <Card className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: categoryColor }}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-text-primary truncate flex-1">
          {professionalName}
        </span>
      </div>

      <Badge className="w-fit" variant="custom" color={categoryColor}>
        {categoryName}
      </Badge>

      <div className="flex items-center gap-1 text-sm text-text-secondary">
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
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          {startTime} – {endTime}
        </span>
      </div>

      <p className="text-xs text-text-secondary">
        {sessionLabel} · {String(DEFAULT_APPOINTMENT_DURATION)}min
      </p>

      <div className="flex items-center gap-1 justify-end">
        <IconButton
          label="Editar horário"
          variant="ghost"
          onClick={handleEditClick}
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
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </IconButton>
        <IconButton
          label="Remover profissional"
          variant="danger"
          onClick={handleRemoveClick}
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
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </IconButton>
      </div>
    </Card>
  );
}
