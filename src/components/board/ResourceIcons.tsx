"use client";

import { useState } from "react";
import { PeoplePickerDialog } from "./PeoplePickerDialog";
import { DraggableRoom } from "@/components/dnd/DraggableRoom";
import { RoomIcon } from "@/components/ui/RoomIcon";
import type { Workspace } from "@/types";

interface ResourceIconsProps {
  readonly workspace: Workspace;
}

export function ResourceIcons({ workspace }: ResourceIconsProps) {
  const [peoplePickerOpen, setPeoplePickerOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-center gap-4 sm:gap-6 px-4 py-2 sm:py-3 shrink-0 relative">
        <DraggableRoom>
          {({ listeners, attributes }) => (
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-150 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Salas"
                title="Arraste para adicionar sala"
                {...listeners}
                {...attributes}
              >
                <RoomIcon size={22} />
              </div>
              <span className="text-[10px] text-text-secondary select-none leading-tight text-center">Salas<br /><span className="text-text-secondary/60">(Arraste)</span></span>
            </div>
          )}
        </DraggableRoom>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setPeoplePickerOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Profissionais"
            title="Profissionais"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          <span className="text-[10px] text-text-secondary select-none">Equipe</span>

        </div>
      </div>

      <PeoplePickerDialog
        open={peoplePickerOpen}
        onClose={() => setPeoplePickerOpen(false)}
        professionals={workspace.professionals}
        categories={workspace.categories}
        allocations={workspace.allocations}
      />
    </>
  );
}
