type Props = {
  /** -1 = idle (component returns null); 0..n = active step index. */
  phase: number;
  /** Ordered step labels. The active row shows a sweep bar; done rows a check. */
  steps: readonly string[];
  /**
   * Whether this component owns the screen-reader announcement. Default true
   * (the /lab demo has no other live region). Set false when the host page
   * already announces progress (e.g. /jd's JDAdapter), so the two polite
   * regions don't double-announce.
   */
  announce?: boolean;
};

/**
 * Designed loading state — terminal-styled steps with green-check / amber-arrow
 * / muted-dot glyphs and a sweep bar on the active row. Visual cadence is driven
 * by the parent on a fixed timer, decoupled from the actual fetch, so cache hits
 * and cold paths both show the same predictable progression (predictable beats
 * surprise). Shared by the /lab retro demo and the /jd matcher (ADR-0042).
 *
 * Accessibility: the visual rows are aria-hidden — a single sr-only live region
 * announces "Step N of M: <label>" so screen readers don't re-read every line
 * on each phase tick.
 */
export function LoadingPipeline({ phase, steps, announce = true }: Props) {
  if (phase < 0) return null;
  const activeLabel = steps[phase] ?? steps[steps.length - 1];

  return (
    <div className="pipeline">
      {announce && (
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {`Step ${Math.min(phase + 1, steps.length)} of ${steps.length}: ${activeLabel}`}
        </span>
      )}
      <div aria-hidden="true">
        {steps.map((label, i) => {
          const state = i < phase ? "done" : i === phase ? "active" : "pending";
          const glyph = state === "done" ? "✓" : state === "active" ? "▸" : "·";
          return (
            <div key={label} className="pipeline-row" data-state={state}>
              <span className="pipeline-glyph">{glyph}</span>
              <span className="pipeline-label">
                {label}
                {state === "active" && <span className="pipeline-caret" />}
              </span>
              <span className="pipeline-bar">
                <span className="track" />
                <span className="fill" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
