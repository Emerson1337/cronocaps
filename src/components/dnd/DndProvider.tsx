"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { WeekDay } from "@/types";
import type { DragData } from "./types";
import { parseShiftDropId, parseRoomCardDropId, SHIFT_DROP_PREFIX } from "./types";
import { DndDragOverlay } from "./DragOverlay";

const WEEKDAYS: ReadonlyArray<string> = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

function isWeekDay(value: string): value is WeekDay {
  return WEEKDAYS.includes(value);
}

function extractDragData(data: Record<string, unknown>): DragData | null {
  if (data["type"] === "room") {
    return { type: "room" };
  }

  if (
    data["type"] === "professional" &&
    typeof data["professionalId"] === "string" &&
    typeof data["professionalName"] === "string" &&
    typeof data["categoryId"] === "string" &&
    Array.isArray(data["availability"])
  ) {
    return {
      type: "professional",
      professionalId: data["professionalId"],
      professionalName: data["professionalName"],
      categoryId: data["categoryId"],
      availability: data["availability"] as ReadonlyArray<{ day: string; shiftId: string }>,
    };
  }

  return null;
}

interface DndProviderProps {
  readonly children: ReactNode;
  readonly onRoomDrop: (day: WeekDay, shiftId: string) => void;
  readonly onProfessionalDrop: (
    professionalId: string,
    allocationId: string
  ) => void;
}

interface DndContextValue {
  readonly activeDragItem: DragData | null;
}

const DndStateContext = createContext<DndContextValue>({
  activeDragItem: null,
});

export function useDndState(): DndContextValue {
  return useContext(DndStateContext);
}

export function DndProvider({
  children,
  onRoomDrop,
  onProfessionalDrop,
}: DndProviderProps) {
  const [activeDragItem, setActiveDragItem] = useState<DragData | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 300, tolerance: 5 },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data === undefined) return;

    const dragData = extractDragData(data);
    if (dragData !== null) {
      setActiveDragItem(dragData);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragItem(null);

      if (over === null) return;

      const activeData = active.data.current;
      if (activeData === undefined) return;

      const overId = String(over.id);

      const dragData = extractDragData(activeData);
      if (dragData === null) return;

      if (dragData.type === "room") {
        let parsed = parseShiftDropId(overId);

        // If the drop landed on a room card (nested droppable), find the
        // parent shift zone from the collision list instead.
        if (parsed === null && event.collisions != null) {
          for (const collision of event.collisions) {
            const cid = String(collision.id);
            if (cid.startsWith(SHIFT_DROP_PREFIX)) {
              parsed = parseShiftDropId(cid);
              break;
            }
          }
        }

        if (parsed !== null && isWeekDay(parsed.day)) {
          const day = parsed.day;
          const shiftId = parsed.shiftId;
          // Defer so dnd-kit fully cleans up before the modal opens
          requestAnimationFrame(() => {
            onRoomDrop(day, shiftId);
          });
        }
      } else if (dragData.type === "professional") {
        const allocationId = parseRoomCardDropId(overId);
        if (allocationId !== null) {
          const profId = dragData.professionalId;
          // Defer so dnd-kit fully cleans up before state changes
          requestAnimationFrame(() => {
            onProfessionalDrop(profId, allocationId);
          });
        }
      }
    },
    [onRoomDrop, onProfessionalDrop]
  );

  const handleDragCancel = useCallback(() => {
    setActiveDragItem(null);
  }, []);

  const contextValue = useMemo<DndContextValue>(
    () => ({ activeDragItem }),
    [activeDragItem]
  );

  return (
    <DndStateContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DndDragOverlay activeDragItem={activeDragItem} />
      </DndContext>
    </DndStateContext.Provider>
  );
}
