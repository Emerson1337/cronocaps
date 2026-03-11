"use client";

import { useRef, useCallback, useEffect, useState } from "react";

interface RichTextEditorProps {
  readonly value: string;
  readonly onChange: (html: string) => void;
  readonly label?: string;
  readonly helperText?: string;
}

const COLOR_PRESETS = [
  { label: "Padrão", value: "" },
  { label: "Preto", value: "#000000" },
  { label: "Vermelho", value: "#dc2626" },
  { label: "Azul", value: "#2563eb" },
  { label: "Verde", value: "#16a34a" },
  { label: "Laranja", value: "#ea580c" },
  { label: "Roxo", value: "#9333ea" },
  { label: "Cinza", value: "#6b7280" },
] as const;

const FONT_SIZE_PRESETS = [
  { label: "Pequeno", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Grande", value: "5" },
  { label: "Muito grande", value: "6" },
] as const;

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  readonly onClick: () => void;
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="flex items-center justify-center w-8 h-8 rounded text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function ColorPicker({
  onSelectColor,
}: {
  readonly onSelectColor: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        className="flex items-center justify-center w-8 h-8 rounded text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
        aria-label="Cor do texto"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface-card border border-border rounded-lg p-2 shadow-lg flex gap-1.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value || "default"}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectColor(preset.value);
                setOpen(false);
              }}
              className={`w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform cursor-pointer ${
                preset.value === ""
                  ? "flex items-center justify-center bg-surface"
                  : ""
              }`}
              style={
                preset.value ? { backgroundColor: preset.value } : undefined
              }
              aria-label={preset.label}
              title={preset.label}
            >
              {preset.value === "" && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-secondary"
                >
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FontSizePicker({
  onSelectSize,
}: {
  readonly onSelectSize: (size: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        className="flex items-center justify-center w-8 h-8 rounded text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
        aria-label="Tamanho da fonte"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface-card border border-border rounded-lg py-1 shadow-lg min-w-[130px]">
          {FONT_SIZE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectSize(preset.value);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  label,
  helperText,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value into editor only when it differs
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChange.current = true;
    onChange(el.innerHTML);
  }, [onChange]);

  const execCmd = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-1">
      {label != null && (
        <label className="text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap rounded-t-lg border border-border bg-surface-card px-1.5 py-1">
        <ToolbarButton onClick={() => execCmd("bold")} label="Negrito">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton onClick={() => execCmd("italic")} label="Itálico">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="4" x2="10" y2="4" />
            <line x1="14" y1="20" x2="5" y2="20" />
            <line x1="15" y1="4" x2="9" y2="20" />
          </svg>
        </ToolbarButton>

        <ToolbarButton onClick={() => execCmd("underline")} label="Sublinhado">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
            <line x1="4" y1="21" x2="20" y2="21" />
          </svg>
        </ToolbarButton>

        <ToolbarButton onClick={() => execCmd("strikeThrough")} label="Tachado">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.3 4.9c-1.2-.8-2.8-1.4-5.3-1.4-3.2 0-5.5 1.7-5.5 4.2 0 1 .3 1.8.8 2.3" />
            <path d="M3 12h18" />
            <path d="M7.7 16.2c1 1.1 2.8 1.8 5.3 1.8 3.2 0 5.5-1.7 5.5-4.2 0-.6-.1-1.2-.4-1.8" />
          </svg>
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ColorPicker
          onSelectColor={(color) => {
            if (color === "") {
              document.execCommand("removeFormat", false);
              editorRef.current?.focus();
            } else {
              execCmd("foreColor", color);
            }
          }}
        />

        <FontSizePicker onSelectSize={(size) => execCmd("fontSize", size)} />

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => execCmd("insertUnorderedList")}
          label="Lista"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[160px] max-h-[400px] overflow-y-auto rounded-b-lg border border-t-0 border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:font-bold [&_u]:underline [&_s]:line-through [&_strike]:line-through"
      />

      {helperText != null && (
        <span className="text-xs text-text-secondary">{helperText}</span>
      )}
    </div>
  );
}
