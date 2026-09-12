"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = (): boolean => window.matchMedia(QUERY).matches;
const getServerSnapshot = (): boolean => true;

// The installed Motion version reads this preference only at mount.
// Subscribe explicitly so changing the OS preference also stops active effects.
export default function useReducedEffects(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
