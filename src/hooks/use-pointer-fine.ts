import { useSyncExternalStore } from "react";

const query = "(pointer: fine)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return true;
}

export function useIsPointerFine() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
