"use client";

import { useState } from "react";

/**
 * Per-slider visual: custom-drawn track + thumb layered above an invisible
 * native range input. Hover affordance for the thumb glow is CSS-only
 * (`.slider-track-wrap:hover .slider-thumb-glow`) — no React state needed
 * since the wrapper is decorative.
 */

type Props = {
  name: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (next: number) => void;
  accent: string;
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
};

const MINOR_TICKS = Array.from({ length: 21 }, (_, i) => i / 20);
const MAJOR_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;

export function Slider({
  name,
  leftLabel,
  rightLabel,
  value,
  onChange,
  accent,
  isActive,
  onActiveChange,
}: Props) {
  const [active, setActive] = useState(false);

  const pct = value * 100;
  const display = value.toFixed(2);
  const isAnchor =
    Math.abs(value - 0) < 0.005 || Math.abs(value - 0.5) < 0.005 || Math.abs(value - 1) < 0.005;

  const handleStart = () => {
    setActive(true);
    onActiveChange(true);
  };
  const handleEnd = () => {
    setActive(false);
    onActiveChange(false);
  };

  return (
    <div className={`slider-row ${isActive ? "is-active" : ""}`}>
      <div className="slider-row-head">
        <h3 className="deck-grotesk slider-name">{name}</h3>
        <div className="deck-mono slider-readout">
          <span className="slider-readout-label">VAL</span>
          <span
            className="slider-readout-value"
            style={{
              color: isAnchor ? accent : "#f4f1ea",
              textShadow: isAnchor ? `0 0 12px ${accent}66` : "none",
            }}
          >
            {display}
          </span>
        </div>
      </div>

      <div className="slider-track-wrap">
        <div className="slider-baseline" />

        <div
          className="slider-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accent}55, ${accent})`,
            boxShadow: active ? `0 0 18px ${accent}99` : `0 0 8px ${accent}55`,
            transition: active ? "none" : "width 100ms linear, box-shadow 220ms",
          }}
        />

        <div className="slider-ticks">
          {MINOR_TICKS.map((t, i) => {
            const major = i % 5 === 0;
            const passed = t <= value + 0.001;
            const left = `${t * 100}%`;
            const passedColor = major ? "rgba(244,241,234,0.7)" : "rgba(244,241,234,0.35)";
            const unpassedColor = major ? "rgba(244,241,234,0.3)" : "rgba(244,241,234,0.15)";
            return (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: ticks are positional
                key={i}
                className={`slider-tick ${major ? "is-major" : ""}`}
                style={{ left, background: passed ? passedColor : unpassedColor }}
              />
            );
          })}
        </div>

        <div className="slider-tick-labels">
          {MAJOR_TICKS.map((t) => (
            <span key={t} className="deck-mono slider-tick-label" style={{ left: `${t * 100}%` }}>
              {t.toFixed(2)}
            </span>
          ))}
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={value}
          onChange={(e) => onChange(Number.parseFloat(e.target.value))}
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onBlur={handleEnd}
          className="raw-range"
          aria-label={name}
        />

        <div
          className="slider-thumb"
          style={{
            left: `${pct}%`,
            transition: active ? "none" : "left 100ms linear",
          }}
        >
          <div
            className="slider-thumb-glow"
            data-active={active ? "true" : undefined}
            style={
              {
                "--thumb-glow-active": `radial-gradient(closest-side, ${accent}33, transparent 70%)`,
              } as React.CSSProperties
            }
          />
          <div
            className="slider-thumb-bar"
            style={{
              boxShadow: active
                ? `0 0 0 2px ${accent}, 0 0 18px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.8)`
                : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.5)",
            }}
          />
          <div className="slider-thumb-notch" />
          <div
            className="slider-thumb-accent"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}88` }}
          />
          <div className="slider-thumb-bar-tick" />
        </div>
      </div>

      <div className="deck-mono slider-extremes">
        <span>← {leftLabel}</span>
        <span>{rightLabel} →</span>
      </div>
    </div>
  );
}
