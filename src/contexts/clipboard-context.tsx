"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { ProfessionalAssignment } from "@/types";

export interface CopiedRoom {
  readonly activityLabel: string;
  readonly assignments: ReadonlyArray<ProfessionalAssignment>;
}

interface ClipboardContextValue {
  readonly copiedRoom: CopiedRoom | null;
  readonly copyRoom: (room: CopiedRoom) => void;
  readonly clearClipboard: () => void;
}

const ClipboardContext = createContext<ClipboardContextValue>({
  copiedRoom: null,
  copyRoom: () => {},
  clearClipboard: () => {},
});

export function ClipboardProvider({ children }: { readonly children: ReactNode }) {
  const [copiedRoom, setCopiedRoom] = useState<CopiedRoom | null>(null);

  const copyRoom = useCallback((room: CopiedRoom) => {
    setCopiedRoom(room);
  }, []);

  const clearClipboard = useCallback(() => {
    setCopiedRoom(null);
  }, []);

  return (
    <ClipboardContext.Provider value={{ copiedRoom, copyRoom, clearClipboard }}>
      {children}
    </ClipboardContext.Provider>
  );
}

export function useClipboard(): ClipboardContextValue {
  return useContext(ClipboardContext);
}
