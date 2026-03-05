"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Modal, Button } from "@/components/ui";
import {
  DEFAULT_APPOINTMENT_DURATION,
  DEFAULT_APPOINTMENT_INTERVAL,
} from "@/lib/constants";

interface TimePickerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly professionalName: string;
  readonly shiftStartTime: string;
  readonly shiftEndTime: string;
  readonly onConfirm: (startTime: string, endTime: string) => void;
}

function timeToMinutes(time: string): number {
  const parts = time.split(":");
  const hours = parts[0];
  const minutes = parts[1];
  if (hours === undefined || minutes === undefined) return 0;
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function generateTimeOptions(
  startMinutes: number,
  endMinutes: number
): ReadonlyArray<string> {
  const options: Array<string> = [];
  for (let m = startMinutes; m <= endMinutes; m += 30) {
    options.push(minutesToTime(m));
  }
  return options;
}

function calculateSessionCount(
  startMinutes: number,
  endMinutes: number
): number {
  const totalMinutes = endMinutes - startMinutes;
  if (totalMinutes <= 0) return 0;
  return Math.floor(
    totalMinutes / (DEFAULT_APPOINTMENT_DURATION + DEFAULT_APPOINTMENT_INTERVAL)
  );
}

export const TimePicker = React.memo(function TimePicker({
  open,
  onClose,
  professionalName,
  shiftStartTime,
  shiftEndTime,
  onConfirm,
}: TimePickerProps) {
  const shiftStartMinutes = timeToMinutes(shiftStartTime);
  const shiftEndMinutes = timeToMinutes(shiftEndTime);

  const [startTime, setStartTime] = useState(shiftStartTime);
  const [endTime, setEndTime] = useState(shiftEndTime);

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const startOptions = useMemo(
    () => generateTimeOptions(shiftStartMinutes, shiftEndMinutes),
    [shiftStartMinutes, shiftEndMinutes]
  );

  const endOptions = useMemo(
    () => generateTimeOptions(shiftStartMinutes, shiftEndMinutes),
    [shiftStartMinutes, shiftEndMinutes]
  );

  const sessionCount = calculateSessionCount(startMinutes, endMinutes);
  const isValid = endMinutes > startMinutes;

  const handleConfirm = useCallback(() => {
    if (isValid) {
      onConfirm(startTime, endTime);
    }
  }, [isValid, onConfirm, startTime, endTime]);

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStartTime(e.target.value);
    },
    []
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setEndTime(e.target.value);
    },
    []
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Horário de atendimento de ${professionalName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!isValid}>
            Confirmar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="time-picker-start"
            className="text-sm font-medium text-text-primary"
          >
            Início
          </label>
          <select
            id="time-picker-start"
            value={startTime}
            onChange={handleStartChange}
            className="rounded-lg border border-border bg-surface-card px-3 py-2 text-text-primary min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {startOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="time-picker-end"
            className="text-sm font-medium text-text-primary"
          >
            Término
          </label>
          <select
            id="time-picker-end"
            value={endTime}
            onChange={handleEndChange}
            className="rounded-lg border border-border bg-surface-card px-3 py-2 text-text-primary min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {endOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {isValid ? (
          <p className="text-sm text-text-secondary">
            {sessionCount === 1
              ? `${String(sessionCount)} atendimento de ${String(DEFAULT_APPOINTMENT_DURATION)} minutos`
              : `${String(sessionCount)} atendimentos de ${String(DEFAULT_APPOINTMENT_DURATION)} minutos`}
            {sessionCount === 0 ? " (tempo insuficiente)" : ""}
          </p>
        ) : (
          <p className="text-sm text-error">
            O horário de término deve ser posterior ao de início.
          </p>
        )}
      </div>
    </Modal>
  );
});
