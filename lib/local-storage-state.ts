"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, DEFAULT_STYLE, type StyleState } from "@/lib/style-tokens";

/**
 * localStorage-backed slider state.
 *
 * Replaces the older URL-hash mechanism (removed because the hash polluted
 * shared URLs and there was no need to expose look-state across origins).
 * The trade-off: no shareable look URLs, but the visitor's last configuration
 * is remembered across visits — which is the consistency the slider deck
 * actually needs.
 *
 * SSR returns DEFAULT_STYLE; the inline bootstrap script in `app/layout.tsx`
 * reads localStorage synchronously before hydration to suppress the visual
 * flash on a return visit. Bootstrap and runtime must agree on the storage
 * key and value shape — see `LOCAL_STORAGE_KEY` below + the bootstrap script.
 */

export const LOCAL_STORAGE_KEY = "olg-cv-style-v1";

function parseStoredValue(raw: string | null): StyleState | null {
  if (raw == null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;
  const out: Partial<StyleState> = {};
  for (const key of ["density", "polish", "hierarchy", "motion"] as (keyof StyleState)[]) {
    const v = obj[key];
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    out[key] = clamp(v, 0, 1);
  }
  return out as StyleState;
}

function readLocalStorage(): StyleState | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredValue(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeLocalStorage(state: StyleState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded / Safari private mode / disabled — silently no-op.
    // The visitor still gets a working session; just no persistence.
  }
}

export function useLocalStorageState(): [
  StyleState,
  React.Dispatch<React.SetStateAction<StyleState>>,
] {
  const [state, setState] = useState<StyleState>(DEFAULT_STYLE);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = readLocalStorage();
    if (stored) setState(stored);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    writeLocalStorage(state);
  }, [state]);

  return [state, setState];
}
