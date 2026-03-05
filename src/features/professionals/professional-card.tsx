"use client";

import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Category, Professional } from "@/types";

interface ProfessionalCardProps {
  readonly professional: Professional;
  readonly category: Category;
  readonly isAvailable: boolean;
}

export function ProfessionalCard({
  professional,
  category,
  isAvailable,
}: ProfessionalCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-surface-card px-3 py-2 min-h-[44px] select-none transition-shadow duration-150 hover:shadow-md hover-lift cursor-grab active:cursor-grabbing"
      )}
    >
      <span
        className={cn(
          "inline-block w-2.5 h-2.5 rounded-full shrink-0",
          isAvailable ? "bg-green-500" : "bg-gray-400"
        )}
        title={isAvailable ? "Disponível" : "Indisponível"}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {professional.name}
        </p>
      </div>
      <Badge variant="custom" color={category.color} className="shrink-0">
        {category.name}
      </Badge>
    </div>
  );
}
