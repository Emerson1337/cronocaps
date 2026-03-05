/** Discriminator for drag item types */
export type DragItemType = "room" | "professional";

export interface RoomDragData {
  readonly type: "room";
}

export interface ProfessionalDragData {
  readonly type: "professional";
  readonly professionalId: string;
  readonly professionalName: string;
  readonly categoryId: string;
  readonly availability: ReadonlyArray<{ readonly day: string; readonly shiftId: string }>;
}

export type DragData = RoomDragData | ProfessionalDragData;

/**
 * Drop target ID format conventions:
 *
 * Shift sections: "shift:{day}:{shiftId}"
 *   e.g. "shift:segunda:morning"
 *
 * Room cards on board: "room-card:{allocationId}"
 *   e.g. "room-card:abc123"
 */

/** Prefix for shift drop zone IDs */
export const SHIFT_DROP_PREFIX = "shift:" as const;

/** Prefix for room-card drop target IDs */
export const ROOM_CARD_DROP_PREFIX = "room-card:" as const;

/** Parse a shift drop zone ID into day and shiftId */
export function parseShiftDropId(
  id: string
): { day: string; shiftId: string } | null {
  if (!id.startsWith(SHIFT_DROP_PREFIX)) return null;
  const parts = id.slice(SHIFT_DROP_PREFIX.length).split(":");
  const day = parts[0];
  const shiftId = parts[1];
  if (day === undefined || shiftId === undefined) return null;
  return { day, shiftId };
}

/** Parse a room-card drop target ID into allocationId */
export function parseRoomCardDropId(id: string): string | null {
  if (!id.startsWith(ROOM_CARD_DROP_PREFIX)) return null;
  const allocationId = id.slice(ROOM_CARD_DROP_PREFIX.length);
  if (allocationId.length === 0) return null;
  return allocationId;
}
