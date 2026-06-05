"use client";

import type { ChipModel } from "@/components/jd/chip-models";
import { chipCounts } from "@/components/jd/chip-models";

type Props = { chips: ChipModel[] };

const word = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`;

/**
 * Locked editorial summary phrasing per ADR-0018. Never a percentage.
 */
export function SummaryLine({ chips }: Props) {
  const counts = chipCounts(chips);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          lineHeight: 1.1,
          margin: 0,
          letterSpacing: "-0.015em",
          textWrap: "balance",
        }}
      >
        Reading the JD as written, this CV lands{" "}
        <span style={{ color: "var(--hit)" }}>{word(counts.hit, "hit", "hits")}</span>,{" "}
        <span style={{ color: "var(--stretch)" }}>
          {word(counts.stretch, "stretch", "stretches")}
        </span>
        , and{" "}
        <span style={{ color: "var(--muted)" }}>
          {word(counts.miss, "honest gap", "honest gaps")}
        </span>
        .
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        Conservative matching: when uncertain, defaults to stretch over hit.
      </p>
    </div>
  );
}
