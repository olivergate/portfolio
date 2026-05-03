"use client";

import { Chip, type HoverData } from "@/components/jd/Chip";
import type { ChipModel } from "@/components/jd/chip-models";

type Props = {
  chips: ChipModel[];
  onActivate: (chip: ChipModel) => void;
  onHoverChange: (data: HoverData | null) => void;
};

export function ChipGrid({ chips, onActivate, onHoverChange }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {chips.map((chip, i) => (
        <Chip
          key={chip.id}
          chip={chip}
          index={i}
          onActivate={onActivate}
          onHoverChange={onHoverChange}
        />
      ))}
    </div>
  );
}
