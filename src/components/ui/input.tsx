import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = typeof error === "string" && error.length > 0;

  return (
    <div className="flex flex-col gap-1">
      {typeof label === "string" && label.length > 0 && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "rounded-lg border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-secondary min-h-[44px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50",
          hasError && "border-error focus:ring-error",
          className
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId ?? ""}-error` : undefined}
        {...props}
      />
      {hasError && (
        <p
          id={`${inputId ?? ""}-error`}
          className="text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
      {typeof helperText === "string" && helperText.length > 0 && !hasError && (
        <p className="text-sm text-text-secondary">{helperText}</p>
      )}
    </div>
  );
}
