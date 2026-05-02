"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, DEFAULT_STYLE, type StyleState } from "@/lib/style-tokens";

/**
 * URL hash format: #d=0.5&p=0.55&h=0.55&m=0.5
 * Single source of truth for sharing a slider configuration.
 */

const KEYS = { density: "d", polish: "p", hierarchy: "h", motion: "m" } as const;

export function parseHash(hash: string): StyleState | null {
  const trimmed = hash.replace(/^#/, "");
  if (!trimmed) return null;
  const params = new URLSearchParams(trimmed);
  const out: Partial<StyleState> = {};
  for (const [stateKey, paramKey] of Object.entries(KEYS) as [keyof StyleState, string][]) {
    const raw = params.get(paramKey);
    if (raw == null) return null;
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n)) return null;
    out[stateKey] = clamp(n, 0, 1);
  }
  return out as StyleState;
}

export function formatHash(state: StyleState): string {
  const round = (n: number) => Number(n.toFixed(3)).toString();
  return [
    `${KEYS.density}=${round(state.density)}`,
    `${KEYS.polish}=${round(state.polish)}`,
    `${KEYS.hierarchy}=${round(state.hierarchy)}`,
    `${KEYS.motion}=${round(state.motion)}`,
  ].join("&");
}

export function shareUrl(state: StyleState): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}#${formatHash(state)}`;
}

/**
 * Read on mount AND on hashchange/popstate. Writing to the hash is suppressed via
 * an `incoming` ref so an external hash change (address bar edit, back/forward,
 * in-app navigation) updates state without immediately writing back the same value
 * and triggering a feedback loop.
 *
 * SSR renders DEFAULT_STYLE; the inline bootstrap script in app/layout.tsx applies
 * the hash's CSS vars synchronously before hydration to suppress the visual flash.
 */
export function useHashState(): [StyleState, React.Dispatch<React.SetStateAction<StyleState>>] {
  const [state, setState] = useState<StyleState>(DEFAULT_STYLE);
  const hydrated = useRef(false);
  const incoming = useRef(false);

  useEffect(() => {
    const apply = () => {
      const parsed = parseHash(window.location.hash);
      if (!parsed) return;
      incoming.current = true;
      setState(parsed);
    };
    apply();
    hydrated.current = true;
    window.addEventListener("hashchange", apply);
    window.addEventListener("popstate", apply);
    return () => {
      window.removeEventListener("hashchange", apply);
      window.removeEventListener("popstate", apply);
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    if (incoming.current) {
      incoming.current = false;
      return;
    }
    const next = formatHash(state);
    const current = window.location.hash.replace(/^#/, "");
    if (next === current) return;
    // history.replaceState avoids polluting the back stack on every micro-move
    window.history.replaceState(null, "", `#${next}`);
  }, [state]);

  return [state, setState];
}
