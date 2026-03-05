"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly visuallyHidden?: boolean;
}

export function Modal({ open, onClose, title, children, footer, visuallyHidden }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isShowingRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      // Dialog was unmounted (component returned null) — reset the flag
      // so the next mount will call showModal() again.
      isShowingRef.current = false;
      return;
    }

    if (open || visuallyHidden === true) {
      if (!isShowingRef.current) {
        dialog.showModal();
        isShowingRef.current = true;
      }
    } else {
      if (isShowingRef.current) {
        dialog.close();
        isShowingRef.current = false;
      }
    }

    if (visuallyHidden === true) {
      dialog.classList.add("dialog-hidden-for-drag");
    } else {
      dialog.classList.remove("dialog-hidden-for-drag");
    }
  }, [open, visuallyHidden]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    const handleClose = () => {
      isShowingRef.current = false;
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  if (!open && !visuallyHidden) return null;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-border bg-surface-card p-0 shadow-xl backdrop:bg-black/50 backdrop:animate-modal-backdrop-fade animate-modal-slide-up",
        "max-sm:mt-auto max-sm:mb-0 max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none max-sm:rounded-t-2xl"
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="flex flex-col max-h-[85vh] max-sm:max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <IconButton label="Fechar" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </IconButton>
        </div>
        <div className="p-4 overflow-y-auto scrollbar-minimal">{children}</div>
        {footer !== undefined && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
