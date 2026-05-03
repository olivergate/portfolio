"use client";

import { useState } from "react";
import type { ChipModel } from "@/components/jd/chip-models";

const STATUS_STYLES = {
  hit: {
    fg: "var(--hit)",
    bg: "color-mix(in srgb, var(--hit) 14%, var(--bg))",
    border: "var(--hit)",
    symbol: "●",
    label: "Hit",
  },
  stretch: {
    fg: "var(--stretch)",
    bg: "color-mix(in srgb, var(--stretch) 16%, var(--bg))",
    border: "var(--stretch)",
    symbol: "◐",
    label: "Stretch",
  },
  miss: {
    fg: "var(--muted)",
    bg: "color-mix(in srgb, var(--miss) 12%, var(--bg))",
    border: "var(--rule)",
    symbol: "○",
    label: "Honest gap",
  },
} as const;

type Props = {
  chip: ChipModel;
  index: number;
  onActivate: (chip: ChipModel) => void;
  onHoverChange: (data: HoverData | null) => void;
};

export type HoverData = {
  chip: ChipModel;
  rect: { left: number; right: number; top: number; bottom: number; width: number };
};

export function Chip({ chip, index, onActivate, onHoverChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_STYLES[chip.status];
  const isMiss = chip.status === "miss";
  const isHit = chip.status === "hit";

  const onClick = () => {
    if (isHit) onActivate(chip);
    else if (isMiss) setExpanded((x) => !x);
  };

  return (
    <button
      type="button"
      className="chip chip-in"
      onClick={onClick}
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onHoverChange({
          chip,
          rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width },
        });
      }}
      onMouseLeave={() => onHoverChange(null)}
      onFocus={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onHoverChange({
          chip,
          rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width },
        });
      }}
      onBlur={() => onHoverChange(null)}
      aria-label={`${s.label}: ${chip.text}`}
      style={{
        position: "relative",
        animationDelay: `${index * 65}ms`,
        background: s.bg,
        borderStyle: "solid",
        borderColor: s.border,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 3,
        borderRadius: 8,
        padding: "12px 14px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        textAlign: "left",
        font: "inherit",
        color: "inherit",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: s.fg,
            fontWeight: 600,
          }}
        >
          {s.symbol} {s.label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            color: "var(--muted-2)",
            letterSpacing: "0.1em",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.02rem",
          fontWeight: 500,
          lineHeight: 1.25,
          color: isMiss ? "var(--muted)" : "var(--fg)",
          textWrap: "balance",
        }}
      >
        {chip.text}
      </div>
      {expanded && isMiss && (
        <div
          style={{
            marginTop: 6,
            paddingTop: 10,
            borderTop: "1px dashed var(--rule)",
            fontStyle: "italic",
            color: "var(--fg-soft)",
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "0.96rem",
            lineHeight: 1.45,
            textWrap: "pretty",
          }}
        >
          “{chip.gapFraming || chip.reasoning}”
        </div>
      )}
    </button>
  );
}
