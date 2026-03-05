"use client";

import { useCallback, useMemo } from "react";
import { generateId } from "@/lib/utils";
import { MAX_CATEGORIES } from "@/lib/constants";
import type { Category, Workspace } from "@/types";

interface UseCategoriesParams {
  readonly workspace: Workspace | null;
  readonly updateWorkspace: (updater: (prev: Workspace) => Workspace) => void;
}

interface AddCategoryData {
  readonly name: string;
  readonly color: string;
}

interface UpdateCategoryData {
  readonly name?: string;
  readonly color?: string;
}

interface UseCategoriesReturn {
  readonly categories: ReadonlyArray<Category>;
  readonly categoryColors: ReadonlyArray<string>;
  readonly addCategory: (data: AddCategoryData) => boolean;
  readonly updateCategory: (id: string, data: UpdateCategoryData) => void;
  readonly removeCategory: (id: string) => boolean;
  readonly getCategoryProfessionalCount: (id: string) => number;
}

export const CATEGORY_COLORS: ReadonlyArray<string> = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

export function useCategories({
  workspace,
  updateWorkspace,
}: UseCategoriesParams): UseCategoriesReturn {
  const categories = useMemo(() => workspace?.categories ?? [], [workspace?.categories]);
  const professionals = useMemo(() => workspace?.professionals ?? [], [workspace?.professionals]);

  const addCategory = useCallback(
    (data: AddCategoryData): boolean => {
      if (workspace === null) return false;
      if (workspace.categories.length >= MAX_CATEGORIES) return false;

      const newCategory: Category = {
        id: generateId(),
        name: data.name,
        color: data.color,
      };

      updateWorkspace((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
        updatedAt: new Date().toISOString(),
      }));

      return true;
    },
    [workspace, updateWorkspace]
  );

  const updateCategory = useCallback(
    (id: string, data: UpdateCategoryData) => {
      updateWorkspace((prev) => ({
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === id
            ? {
                ...c,
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.color !== undefined ? { color: data.color } : {}),
              }
            : c
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateWorkspace]
  );

  const removeCategory = useCallback(
    (id: string): boolean => {
      if (workspace === null) return false;
      const hasProfessionals = workspace.professionals.some(
        (p) => p.categoryId === id
      );
      if (hasProfessionals) return false;

      updateWorkspace((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
        updatedAt: new Date().toISOString(),
      }));

      return true;
    },
    [workspace, updateWorkspace]
  );

  const getCategoryProfessionalCount = useCallback(
    (id: string): number => {
      return professionals.filter((p) => p.categoryId === id).length;
    },
    [professionals]
  );

  return useMemo(
    () => ({
      categories,
      categoryColors: CATEGORY_COLORS,
      addCategory,
      updateCategory,
      removeCategory,
      getCategoryProfessionalCount,
    }),
    [
      categories,
      addCategory,
      updateCategory,
      removeCategory,
      getCategoryProfessionalCount,
    ]
  );
}
