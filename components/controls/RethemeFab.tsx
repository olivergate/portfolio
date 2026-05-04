"use client";

import { useEffect, useRef, useState } from "react";
import { CellSlider } from "@/components/controls/CellSlider";
import { useStyleContext } from "@/components/controls/style-context";
import { getPresetName } from "@/lib/preset-name";

const ACCENTS = {
  density: "#d4ff3a",
  polish: "#ff7a59",
  hierarchy: "#7ad7ff",
  motion: "#ffd166",
} as const;

/**
 * Rethemer FAB. Replaces the design-locked slider deck (ADR-0006) with a
 * minimal floating button that opens four crossword-cell sliders.
 *
 * Closed: shows the current preset name + chevron, bottom-right corner.
 * Open: a tight strip with [D][P][H][M] cells (each a vertical slider),
 *   the preset readout, and a reset cell. ESC closes; outside clicks close.
 *
 * The four-cell metaphor is the user's brief — "think doing a crossword and
 * the letters are the sliders." The preset name is the "state identifier"
 * — kept visible in both states. ADR-0026 supersedes ADR-0006.
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
        <span className="fab-preset" aria-hidden="true">
          {preset}
        </span>
        <span className="fab-chevron" aria-hidden="true">
          {open ? "×" : "▾"}
        </span>
      </button>

      {open && (
        <div id="reset-fab-panel" className="fab-panel" role="group" aria-label="Style axes">
          <div className="fab-cells">
            <CellSlider
              letter="D"
              ariaLabel="Density"
              value={state.density}
              onChange={(v) => setAxis("density", v)}
              accent={ACCENTS.density}
            />
            <CellSlider
              letter="P"
              ariaLabel="Polish"
              value={state.polish}
              onChange={(v) => setAxis("polish", v)}
              accent={ACCENTS.polish}
            />
            <CellSlider
              letter="H"
              ariaLabel="Hierarchy"
              value={state.hierarchy}
              onChange={(v) => setAxis("hierarchy", v)}
              accent={ACCENTS.hierarchy}
            />
            <CellSlider
              letter="M"
              ariaLabel="Motion"
              value={state.motion}
              onChange={(v) => setAxis("motion", v)}
              accent={ACCENTS.motion}
            />
            <button
              type="button"
              className="fab-cell fab-cell-reset"
              onClick={reset}
              aria-label="Reset axes to default"
              title="Reset"
            >
              ↺
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
