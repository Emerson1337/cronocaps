import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "outline" | "warning" | "error" | "custom";

interface BadgeProps {
  readonly variant?: BadgeVariant;
  readonly color?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary-light text-primary-dark",
  outline: "border border-border text-text-secondary",
  warning: "bg-warning/20 text-warning",
  error: "bg-error/20 text-error",
  custom: "",
};

export function Badge({
  variant = "default",
  color,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      style={
        variant === "custom" && typeof color === "string"
          ? { backgroundColor: `${color}20`, color }
          : undefined
      }
    >
      {children}
    </span>
  );
}
