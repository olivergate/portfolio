"use client";

import { useEffect, useState } from "react";
import type { HoverData } from "@/components/jd/Chip";

type Props = { data: HoverData | null };

const PANEL_W_MIN = 260;
const PANEL_W_MAX = 360;

export function FloatingTooltip({ data }: Props) {
  const [viewport, setViewport] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!data) return null;
  const { chip, rect } = data;
  const isHit = chip.status === "hit";
  const isMiss = chip.status === "miss";

  const panelW = Math.max(PANEL_W_MIN, Math.min(PANEL_W_MAX, rect.width * 1.1));
  const spaceBelow = viewport.h - rect.bottom;
  const placeAbove = spaceBelow < 180 && rect.top > 200;
  const top = placeAbove ? rect.top - 10 - 160 : rect.bottom + 8;
  const left = Math.max(
    12,
    Math.min(viewport.w - panelW - 12, rect.left + rect.width / 2 - panelW / 2),
  );

  const heading = isHit
    ? "Why this is a hit"
    : chip.status === "stretch"
      ? "Why this is a stretch"
      : "Honest gap";

  return (
    <div
      role="tooltip"
      style={{
        position: "fixed",
        left,
        top,
        width: panelW,
        background: "#1c1915",
        color: "#f4f1ea",
        padding: "12px 14px",
        fontSize: "0.84rem",
        lineHeight: 1.5,
        zIndex: 1000,
        boxShadow: "0 18px 40px -10px rgba(28, 25, 21, 0.55)",
        textWrap: "pretty",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(244, 241, 234, 0.55)",
          marginBottom: 6,
        }}
      >
        {heading}
      </div>
      {chip.reasoning}
      {isHit && chip.cite.length > 0 && (
        <div
          style={{
            marginTop: 8,
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem",
            color: "#d4ff3a",
            letterSpacing: "0.1em",
          }}
        >
          {/*
            Design source (cv-jd.html line 656) reads "supporting bullet".
            We say "evidence" because, per ADR-0016 H2, cites can now resolve
            to either a role bullet (role:<id>) or a project (project:<id>).
            "Bullet" would mislead for project-cited Hits like the Claude Code
            setup example. "Evidence" covers both. Intentional deviation.
          */}
          ↳ click to view supporting evidence
        </div>
      )}
      {isMiss && (
        <div
          style={{
            marginTop: 8,
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem",
            color: "#ffb37a",
            letterSpacing: "0.1em",
          }}
        >
          ↳ click to expand a candid framing
        </div>
      )}
    </div>
  );
}
