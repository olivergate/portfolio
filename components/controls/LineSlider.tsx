"use client";

/**
 * One row of the open FAB panel: three visual lines.
 *   Line 1: axis name + value readout
 *   Line 2: thin track with accent-tinted fill from 0 → value
 *   Line 3: extreme labels (← left / right →)
 *
 * Native <input type="range"> sits invisibly over the track for full
 * pointer/touch/keyboard support — no custom event handling.
 */

type Props = {
  name: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (next: number) => void;
  accent: string;
};

export function LineSlider({ name, leftLabel, rightLabel, value, onChange, accent }: Props) {
  const pct = value * 100;
  return (
    <div className="fab-slider">
      <div className="fab-slider-head">
        <span className="fab-slider-name">{name}</span>
        <span className="fab-slider-value">{value.toFixed(2)}</span>
      </div>
      <div className="fab-slider-track">
        <span
          className="fab-slider-fill"
          aria-hidden="true"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accent}66, ${accent})`,
          }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={value}
          onChange={(e) => onChange(Number.parseFloat(e.target.value))}
          aria-label={name}
          className="fab-slider-input"
        />
      </div>
      <div className="fab-slider-extremes">
        <span>← {leftLabel}</span>
        <span>{rightLabel} →</span>
      </div>
    </div>
  );
}
