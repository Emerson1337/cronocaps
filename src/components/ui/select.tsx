"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface SelectProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: ReadonlyArray<SelectOption>;
  readonly placeholder?: string;
  readonly error?: boolean;
  readonly className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  error,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    },
    []
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center justify-between w-full rounded-lg border bg-surface px-3 py-2 text-base min-h-[44px] transition-colors duration-150 cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          error ? "border-error focus:ring-error" : "border-border",
          isOpen && "ring-2 ring-primary border-primary"
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            selectedOption ? "text-text-primary" : "text-text-secondary"
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
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
          className={cn(
            "shrink-0 ml-2 text-text-secondary transition-transform duration-150",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg max-h-[200px] overflow-y-auto scrollbar-minimal animate-fade-in">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex items-center w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer min-h-[40px]",
                "hover:bg-primary-light/30",
                option.value === value &&
                  "bg-primary-light/50 font-medium text-primary"
              )}
            >
              {option.label}
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-text-secondary text-center">
              Nenhuma opção disponível
            </div>
          )}
        </div>
      )}
    </div>
  );
}
