type Props = {
  /** -1 = idle (component returns null); 0..3 = active step. */
  phase: number;
};

const STEPS = ["read transcript", "extract beats", "synthesise retro", "format output"] as const;

/**
 * Designed loading state — 4 terminal-styled steps with green-check / amber-arrow
 * / muted-dot glyphs and a sweep bar on the active row. Visual cadence is driven
 * by the parent (RetroDemo) on a fixed timer (~520ms/step), decoupled from the
 * actual fetch. Cache hits and cold paths both pay this 2s; predictable beats
 * surprise.
 *
 * Accessibility: the visual rows are aria-hidden — a single sr-only live region
 * announces "Step N of 4: <label>" so screen readers don't re-read all 4 lines
 * on every 520ms phase tick.
 */
export function LoadingPipeline({ phase }: Props) {
  if (phase < 0) return null;
  const activeLabel = STEPS[phase] ?? STEPS[STEPS.length - 1];

  return (
    <div className="lab-pipeline">
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {`Step ${Math.min(phase + 1, STEPS.length)} of ${STEPS.length}: ${activeLabel}`}
      </span>
      <div aria-hidden="true">
        {STEPS.map((label, i) => {
          const state = i < phase ? "done" : i === phase ? "active" : "pending";
          const glyph = state === "done" ? "✓" : state === "active" ? "▸" : "·";
          return (
            <div key={label} className="lab-pipeline-row" data-state={state}>
              <span className="lab-pipeline-glyph">{glyph}</span>
              <span className="lab-pipeline-label">
                {label}
                {state === "active" && <span className="lab-caret" />}
              </span>
              <span className="lab-pipeline-bar">
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
