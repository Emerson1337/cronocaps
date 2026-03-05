import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:opacity-90 focus-visible:ring-primary",
  secondary:
    "bg-surface-card text-text-primary border border-border hover:bg-primary-light focus-visible:ring-accent",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface-card focus-visible:ring-primary",
  danger:
    "bg-error text-white hover:opacity-90 focus-visible:ring-error",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm min-h-[36px] min-w-[36px]",
  md: "px-4 py-2 text-base min-h-[44px] min-w-[44px]",
  lg: "px-6 py-3 text-lg min-h-[48px] min-w-[48px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer press-scale focus-ring",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
