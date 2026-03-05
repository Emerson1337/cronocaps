"use client";

import { useState, useCallback } from "react";
import { Button, IconButton, Input, Modal } from "@/components/ui";
import { MAX_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category, Workspace } from "@/types";
import { useCategories, CATEGORY_COLORS } from "./use-categories";

interface CategoryManagerProps {
  readonly workspace: Workspace | null;
  readonly updateWorkspace: (updater: (prev: Workspace) => Workspace) => void;
}

interface EditingState {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export function CategoryManager({
  workspace,
  updateWorkspace,
}: CategoryManagerProps) {
  const {
    categories,
    addCategory,
    updateCategory,
    removeCategory,
    getCategoryProfessionalCount,
  } = useCategories({ workspace, updateWorkspace });

  const [editing, setEditing] = useState<EditingState | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0] ?? "#10B981");
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleStartEdit = useCallback((category: Category) => {
    setEditing({ id: category.id, name: category.name, color: category.color });
    setError("");
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editing === null) return;
    if (editing.name.trim().length === 0) {
      setError("Nome é obrigatório");
      return;
    }
    updateCategory(editing.id, {
      name: editing.name.trim(),
      color: editing.color,
    });
    setEditing(null);
    setError("");
  }, [editing, updateCategory]);

  const handleCancelEdit = useCallback(() => {
    setEditing(null);
    setError("");
  }, []);

  const handleAdd = useCallback(() => {
    if (newName.trim().length === 0) {
      setError("Nome é obrigatório");
      return;
    }
    const success = addCategory({ name: newName.trim(), color: newColor });
    if (!success) {
      setError(`Máximo de ${MAX_CATEGORIES} categorias atingido`);
      return;
    }
    setNewName("");
    setNewColor(CATEGORY_COLORS[0] ?? "#10B981");
    setShowAdd(false);
    setError("");
  }, [newName, newColor, addCategory]);

  const handleDelete = useCallback(
    (id: string) => {
      const success = removeCategory(id);
      if (!success) {
        setDeleteError(id);
        setTimeout(() => setDeleteError(""), 3000);
      }
    },
    [removeCategory]
  );

  if (workspace === null) return null;

  const canAddMore = categories.length < MAX_CATEGORIES;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Categorias</h3>
        {canAddMore && (
          <Button size="sm" onClick={() => setShowAdd(true)} disabled={showAdd}>
            Adicionar Categoria
          </Button>
        )}
      </div>

      {!canAddMore && (
        <p className="text-xs text-text-secondary">
          Limite de {MAX_CATEGORIES} categorias atingido.
        </p>
      )}

      <div className="flex flex-col gap-1">
        {categories.map((category) => {
          const count = getCategoryProfessionalCount(category.id);
          const isEditing = editing !== null && editing.id === category.id;
          const hasDeleteError = deleteError === category.id;

          if (isEditing) {
            return (
              <div
                key={category.id}
                className="rounded-lg border border-primary bg-surface-card p-3 flex flex-col gap-2"
              >
                <Input
                  label="Nome"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  error={error}
                />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-text-primary">Cor</span>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setEditing({ ...editing, color })
                        }
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center",
                          editing.color === color
                            ? "border-text-primary scale-110"
                            : "border-transparent"
                        )}
                      >
                        <span
                          className="w-6 h-6 rounded-full inline-block"
                          style={{ backgroundColor: color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="secondary" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    Salvar
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={category.id}
              className="rounded-lg border border-border bg-surface-card px-3 py-2 flex items-center gap-2 min-h-[44px]"
            >
              <span
                className="inline-block w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="flex-1 text-sm font-medium text-text-primary">
                {category.name}
              </span>
              <span className="text-xs text-text-secondary shrink-0">
                {count} {count === 1 ? "profissional" : "profissionais"}
              </span>
              <IconButton
                label="Editar categoria"
                onClick={() => handleStartEdit(category)}
              >
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
                >
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </IconButton>
              <IconButton
                label="Remover categoria"
                variant="danger"
                onClick={() => handleDelete(category.id)}
              >
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
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </IconButton>
              {hasDeleteError && (
                <span className="text-xs text-error">
                  Categoria possui profissionais vinculados
                </span>
              )}
            </div>
          );
        })}
      </div>

      {showAdd && (
        <Modal
          open={showAdd}
          onClose={() => {
            setShowAdd(false);
            setError("");
            setNewName("");
          }}
          title="Nova Categoria"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAdd(false);
                  setError("");
                  setNewName("");
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleAdd}>Adicionar</Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Nome da categoria"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Psicólogo(a)"
              error={error}
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary">Cor</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center",
                      newColor === color
                        ? "border-text-primary scale-110"
                        : "border-transparent"
                    )}
                  >
                    <span
                      className="w-6 h-6 rounded-full inline-block"
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {categories.length === 0 && !showAdd && (
        <p className="text-sm text-text-secondary py-4 text-center">
          Nenhuma categoria cadastrada.
        </p>
      )}
    </div>
  );
}
