"use client";

import { useEffect, useRef, useState } from "react";
import { levelFromPosition, positionFromLevel, type StretchLevel } from "@/lib/jd-schemas";

type Props = {
  /** Continuous thumb position 0..1. */
  value: number;
  onChange: (next: number) => void;
};

export function StretchSlider({ value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const level: StretchLevel = levelFromPosition(value);

  const setFromClientX = (clientX: number) => {
    const node = trackRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(v);
  };

  useEffect(() => {
    if (!dragging) return;
    const fromX = (clientX: number) => {
      const node = trackRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const v = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onChange(v);
    };
    const move = (e: MouseEvent) => fromX(e.clientX);
    const moveT = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) fromX(t.clientX);
    };
    const stop = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", moveT);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", moveT);
      window.removeEventListener("touchend", stop);
    };
  }, [dragging, onChange]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 280, flex: 1 }}>
      {/*
        Top row mirrors the design source verbatim (cv-jd.html lines 466-474):
        "Strict — {active level} — Generous", with the active level rendered
        in --accent + bold. When level === "strict" or "generous" this reads
        "Strict — strict — Generous" / "Strict — generous — Generous" — that
        intentional duplication is the design's affordance: the centered
        accent word IS the current value, the flanking words are the axis
        labels. Don't be tempted to dedupe.
      */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        <span>Strict</span>
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>{level}</span>
        <span>Generous</span>
      </div>
      <div
        ref={trackRef}
        className="stretch-track"
        role="slider"
        tabIndex={0}
        aria-label="Stretch level"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        aria-valuetext={level}
        onMouseDown={(e) => {
          setDragging(true);
          setFromClientX(e.clientX);
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) {
            setDragging(true);
            setFromClientX(t.clientX);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            onChange(Math.max(0, value - 0.1));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            onChange(Math.min(1, value + 0.1));
          } else if (e.key === "Home") {
            e.preventDefault();
            onChange(0);
          } else if (e.key === "End") {
            e.preventDefault();
            onChange(1);
          }
        }}
      >
        <div className="stretch-tick" style={{ left: "16.66%" }} />
        <div className="stretch-tick" style={{ left: "50%" }} />
        <div className="stretch-tick" style={{ left: "83.33%" }} />
        <div className="stretch-thumb" style={{ left: `${value * 100}%` }} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted-2)",
        }}
      >
        <SnapButton
          active={level === "strict"}
          onClick={() => onChange(positionFromLevel("strict"))}
        >
          ⊢ strict
        </SnapButton>
        <SnapButton
          active={level === "balanced"}
          onClick={() => onChange(positionFromLevel("balanced"))}
        >
          ⊨ balanced
        </SnapButton>
        <SnapButton
          active={level === "generous"}
          onClick={() => onChange(positionFromLevel("generous"))}
        >
          ⊣ generous
        </SnapButton>
      </div>
    </div>
  );
}

function SnapButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: 0,
        cursor: "pointer",
        color: active ? "var(--accent)" : "inherit",
        font: "inherit",
        letterSpacing: "inherit",
        textTransform: "inherit",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}
