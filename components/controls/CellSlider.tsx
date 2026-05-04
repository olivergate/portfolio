"use client";

/**
 * Single "crossword cell" that doubles as a slider for one style axis.
 *
 * Visual: a square cell with an axis letter centered. Cell background fills
 * bottom-up to represent the value 0..1, accent-tinted per axis. An invisible
 * vertical native range input sits on top, so pointer/touch/keyboard work
 * with no custom event handling.
 */

type Props = {
  /** Single character (D / P / H / M) */
  letter: string;
  /** Long axis name for screen readers */
  ariaLabel: string;
  value: number;
  onChange: (next: number) => void;
  accent: string;
};

export function CellSlider({ letter, ariaLabel, value, onChange, accent }: Props) {
  const fillPct = value * 100;
  return (
    <span className="fab-cell" data-axis={ariaLabel.toLowerCase()}>
      <span
        className="fab-cell-fill"
        aria-hidden="true"
        style={{
          height: `${fillPct}%`,
          background: `linear-gradient(0deg, ${accent}, ${accent}66)`,
        }}
      />
      <span className="fab-cell-letter" aria-hidden="true">
        {letter}
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        aria-label={ariaLabel}
        className="fab-cell-input"
        // orient=vertical is honored by Firefox/Safari; on Chromium we apply
        // a CSS rotation in styles/globals.css so dragging up increases value.
      />
    </span>
  );
}
