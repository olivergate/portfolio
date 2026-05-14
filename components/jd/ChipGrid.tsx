"use client";

import { Chip, type HoverData } from "@/components/jd/Chip";
import type { ChipModel } from "@/components/jd/chip-models";

type Props = {
  chips: ChipModel[];
  onActivate: (chip: ChipModel) => void;
  onHoverChange: (data: HoverData | null) => void;
};

/**
 * Rendered as <ul role="list"> so SR users hear "List, N items" and can
 * navigate chip-by-chip. The explicit role="list" defeats Safari's
 * list-styling-removal heuristic, which strips the list role when
 * `list-style: none` is in effect (Phase 4.5).
 */
export function ChipGrid({ chips, onActivate, onHoverChange }: Props) {
  return (
    <ul
      // biome-ignore lint/a11y/noRedundantRoles: explicit role="list" defends against Safari's list-style:none heuristic which strips the implicit list role in some configurations.
      role="list"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "0.75rem",
        margin: 0,
        padding: 0,
        listStyle: "none",
      }}
    >
      {chips.map((chip, i) => (
        // display: contents flattens the <li> in box layout so each <Chip>
        // remains the grid item directly — preserves the original equal-row-
        // height behavior. Modern Safari (16.4+), Firefox (113+), and Chrome
        // (105+) preserve the listitem role under display:contents, so SR
        // semantics stay intact.
        <li key={chip.id} style={{ display: "contents" }}>
          <Chip chip={chip} index={i} onActivate={onActivate} onHoverChange={onHoverChange} />
        </li>
      ))}
    </ul>
  );
}
