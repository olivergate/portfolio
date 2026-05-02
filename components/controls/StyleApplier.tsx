"use client";

import { useEffect } from "react";
import { useStyleContext } from "@/components/controls/style-context";
import { bulletCapFor, stateToTokens } from "@/lib/style-tokens";

/**
 * Writes the derived CSS custom properties to <html> on every state change.
 * Also toggles `is-hidden` on bullets past the density-derived cap and
 * stamps `data-brutalist` on the .cv-surface so brutalist-only CSS can fire.
 *
 * Intentionally renders nothing — this is the single component that re-renders
 * on slider movement; the rest of the CV reads from CSS variables.
 */
export function StyleApplier() {
  const { state } = useStyleContext();

  useEffect(() => {
    const tokens = stateToTokens(state);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(key, value);
    }

    const cap = bulletCapFor(state.density);
    for (const list of document.querySelectorAll<HTMLElement>("[data-bullets]")) {
      const items = list.querySelectorAll<HTMLElement>("li.bullet-row");
      items.forEach((li, idx) => {
        if (idx >= cap) li.classList.add("is-hidden");
        else li.classList.remove("is-hidden");
      });
    }

    const surface = document.querySelector<HTMLElement>(".cv-surface");
    if (surface) surface.dataset.brutalist = state.polish < 0.28 ? "true" : "false";
  }, [state]);

  return null;
}
