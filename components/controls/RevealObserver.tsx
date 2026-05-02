"use client";

import { useEffect } from "react";
import { useStyleContext } from "@/components/controls/style-context";

/**
 * IntersectionObserver wrapper for `[data-reveal]` and `[data-reveal-display]`.
 * Active only when motion > 0.4 AND prefers-reduced-motion does NOT match.
 * Otherwise: every revealable element is marked revealed immediately.
 *
 * Stagger total is capped at 600ms regardless of element count, per the spec's
 * edge case ("don't compound staggers").
 */
const REVEAL_SELECTOR = "[data-reveal], [data-reveal-display]";
const MAX_STAGGER_TOTAL_MS = 600;

export function RevealObserver() {
  const { state } = useStyleContext();
  const motion = state.motion;

  useEffect(() => {
    const surface = document.querySelector<HTMLElement>(".cv-surface");
    if (!surface) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const kinetic = motion > 0.4 && !reduced;
    surface.dataset.kinetic = kinetic ? "true" : "false";

    const items = surface.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);

    if (!kinetic) {
      items.forEach((it) => {
        it.classList.add("is-revealed");
        it.style.removeProperty("--reveal-delay");
      });
      return;
    }

    // Only strip `is-revealed` from elements currently OFF-screen. Removing it
    // from in-viewport items would cause a visible flash when the user scrubs
    // motion across the 0.4 threshold (already-revealed content fading out
    // and back in). The off-screen items will get re-revealed naturally as
    // the user scrolls.
    const viewportH = window.innerHeight;
    items.forEach((it) => {
      const rect = it.getBoundingClientRect();
      const inViewport = rect.bottom > 0 && rect.top < viewportH;
      if (!inViewport) it.classList.remove("is-revealed");
    });

    const stagger = Number.parseInt(
      // StyleApplier writes --stagger before this effect runs (it's declared
      // first in DeckProvider's JSX, so its useEffect fires first within the
      // same commit). If that order is ever reversed, this falls back to 60ms.
      getComputedStyle(document.documentElement).getPropertyValue("--stagger"),
      10,
    );
    const staggerSafe = Number.isFinite(stagger) ? stagger : 60;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        const cap = Math.max(1, Math.floor(MAX_STAGGER_TOTAL_MS / Math.max(staggerSafe, 1)));
        visible.forEach((entry, i) => {
          const delay = Math.min(i, cap) * staggerSafe;
          (entry.target as HTMLElement).style.setProperty("--reveal-delay", `${delay}ms`);
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "-5% 0px -10% 0px", threshold: 0.05 },
    );

    items.forEach((it) => {
      // Skip already-revealed (in-viewport from a previous run); they're
      // visible and we don't want to re-apply stagger / re-fire transition.
      if (it.classList.contains("is-revealed")) return;
      observer.observe(it);
    });
    return () => observer.disconnect();
  }, [motion]);

  return null;
}
