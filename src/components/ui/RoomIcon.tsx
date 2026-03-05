import { DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomIconProps {
  readonly size?: number;
  readonly className?: string;
}

export function RoomIcon({ size = 22, className }: RoomIconProps) {
  return (
    <DoorOpen
      size={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    />
  );
}
