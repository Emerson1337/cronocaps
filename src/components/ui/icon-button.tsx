import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant = "primary" | "ghost" | "danger";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: IconButtonVariant;
  readonly label: string;
  readonly children: ReactNode;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary: "bg-primary text-white hover:opacity-90",
  ghost: "bg-transparent text-text-primary hover:bg-surface-card",
  danger: "bg-transparent text-error hover:bg-error/10",
};

export function IconButton({
  variant = "ghost",
  label,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px] p-2 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
