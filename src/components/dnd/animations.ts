import type { CSSProperties } from "react";

/** Style applied to the drag overlay item on pickup */
export const pickupStyle: CSSProperties = {
  transform: "scale(1.05) rotate(2deg)",
  boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
  opacity: 0.9,
  transition: "transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease",
  cursor: "grabbing",
};

/** Style applied to a draggable source while it is being dragged */
export const draggingSourceStyle: CSSProperties = {
  opacity: 0.4,
  transition: "opacity 150ms ease",
};

/** Style applied to drop zones when a compatible item is dragged over them */
export const dropZoneActiveStyle: CSSProperties = {
  borderColor: "var(--color-primary)",
  borderWidth: "2px",
  borderStyle: "dashed",
  transition: "border-color 200ms ease",
};

/** Style applied to drop zones that are over capacity */
export const dropZoneOverCapacityStyle: CSSProperties = {
  borderColor: "var(--color-error)",
  borderWidth: "2px",
  borderStyle: "dashed",
};

/** Style applied to room card targets when a professional is over them */
export const roomTargetHighlightStyle: CSSProperties = {
  borderColor: "var(--color-primary)",
  borderWidth: "2px",
  borderStyle: "solid",
  boxShadow: "0 0 0 3px rgba(var(--color-primary-rgb, 59, 130, 246), 0.2)",
  transition: "border-color 200ms ease, box-shadow 200ms ease",
};

/** CSS class names for keyframe animations (to be used with Tailwind or global styles) */
export const animationClassNames = {
  /** Shake animation for invalid drops */
  shake: "animate-shake",
  /** Pulse animation for active drop zones */
  pulse: "animate-pulse",
  /** Slide up animation for modals */
  slideUp: "animate-slide-up",
} as const;
