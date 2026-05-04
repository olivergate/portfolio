"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LineSlider } from "@/components/controls/LineSlider";
import { useStyleContext } from "@/components/controls/style-context";
import { FOUR_SLIDERS_POST_HREF } from "@/lib/blog-links";
import { getPresetName } from "@/lib/preset-name";

const ACCENTS = {
  density: "#d4ff3a",
  polish: "#ff7a59",
  hierarchy: "#7ad7ff",
  motion: "#ffd166",
} as const;

/**
 * Rethemer FAB. Closed pill: STYLE · <preset> ▾.
 * Open panel: four horizontal LineSliders with extreme labels, plus a footer
 * row holding reset and a link to the blog post explaining the four axes.
 *
 * State plumbing is the same StyleContext the original deck used —
 * `setAxis(...)` writes through `useLocalStorageState`, `StyleApplier` paints
 * tokens onto :root. ADR-0026 supersedes ADR-0006.
 */
export function RethemeFab() {
  const { state, setAxis, reset } = useStyleContext();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const preset = getPresetName(state);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fab-root" data-open={open ? "true" : undefined}>
      <button
        type="button"
        className="fab-toggle"
        aria-expanded={open}
        aria-controls="reset-fab-panel"
        aria-label={open ? "Close style controls" : "Open style controls"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="fab-toggle-label" aria-hidden="true">
          STYLE
        </span>
        <span className="fab-toggle-sep" aria-hidden="true">
          ·
        </span>
        <span className="fab-preset" aria-hidden="true">
          {preset}
        </span>
        <span className="fab-chevron" aria-hidden="true">
          {open ? "×" : "▾"}
        </span>
      </button>

      {open && (
        <div id="reset-fab-panel" className="fab-panel" role="group" aria-label="Style axes">
          <LineSlider
            name="DENSITY"
            leftLabel="sparse"
            rightLabel="dense"
            value={state.density}
            onChange={(v) => setAxis("density", v)}
            accent={ACCENTS.density}
          />
          <LineSlider
            name="POLISH"
            leftLabel="brutalist"
            rightLabel="refined"
            value={state.polish}
            onChange={(v) => setAxis("polish", v)}
            accent={ACCENTS.polish}
          />
          <LineSlider
            name="HIERARCHY"
            leftLabel="flat"
            rightLabel="dramatic"
            value={state.hierarchy}
            onChange={(v) => setAxis("hierarchy", v)}
            accent={ACCENTS.hierarchy}
          />
          <LineSlider
            name="MOTION"
            leftLabel="static"
            rightLabel="kinetic"
            value={state.motion}
            onChange={(v) => setAxis("motion", v)}
            accent={ACCENTS.motion}
          />

          <div className="fab-footer">
            <button
              type="button"
              className="fab-reset"
              onClick={reset}
              aria-label="Reset axes to default"
            >
              ↺ RESET
            </button>
            <Link href={FOUR_SLIDERS_POST_HREF} className="fab-about">
              About these sliders →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
