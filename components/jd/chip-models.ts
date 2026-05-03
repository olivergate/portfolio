"use client";

import type {
  ChipStatus,
  Match,
  ParsedRequirement,
  SampleChip,
  StretchLevel,
} from "@/lib/jd-schemas";
import { statusAtLevel } from "@/lib/jd-schemas";

/**
 * Uniform chip projection used by ChipGrid + downstream consumers.
 * Sample chips and matched chips both project to this shape.
 */
export type ChipModel = {
  id: string;
  text: string;
  status: ChipStatus;
  cite: string[];
  reasoning: string;
  gapFraming?: string;
};

export function projectSampleChips(chips: SampleChip[], level: StretchLevel): ChipModel[] {
  return chips.map((c) => ({
    id: c.id,
    text: c.text,
    status: statusAtLevel(c, level),
    cite: c.cite,
    reasoning: c.reasoning,
    gapFraming: c.gapFraming,
  }));
}

export function projectMatchedChips(
  matches: Match[],
  requirements: ParsedRequirement[],
): ChipModel[] {
  const reqById = new Map(requirements.map((r) => [r.id, r]));
  return matches.map((m) => {
    const req = reqById.get(m.requirementId);
    return {
      id: m.requirementId,
      text: req?.text ?? m.requirementId,
      status: m.status,
      cite: m.cite,
      reasoning: m.reasoning,
      gapFraming: m.gapFraming,
    };
  });
}

/**
 * Counts (hits, stretches, misses) at the current chip-set state.
 */
export function chipCounts(chips: ChipModel[]): { hit: number; stretch: number; miss: number } {
  const counts = { hit: 0, stretch: 0, miss: 0 };
  for (const c of chips) counts[c.status]++;
  return counts;
}

/**
 * Citation ID parsing — splits "role:opensc-1" → { kind: "role", id: "opensc-1" }.
 * Returns null for malformed cites (defensive; should not happen since the schema
 * + server-side validator both gate cites).
 */
export function parseCite(ref: string): { kind: "role" | "project"; id: string } | null {
  const idx = ref.indexOf(":");
  if (idx <= 0) return null;
  const kind = ref.slice(0, idx);
  const id = ref.slice(idx + 1);
  if (kind !== "role" && kind !== "project") return null;
  if (!id) return null;
  return { kind, id };
}

/**
 * Resolve cited bullet IDs into a Set, used by the experience renderer to mark
 * cited bullets and by the reorder logic to rank them. Misses contribute nothing.
 */
export function citedBulletIds(chips: ChipModel[]): {
  hit: Set<string>;
  stretch: Set<string>;
  hitProject: Set<string>;
  stretchProject: Set<string>;
} {
  const hit = new Set<string>();
  const stretch = new Set<string>();
  const hitProject = new Set<string>();
  const stretchProject = new Set<string>();
  for (const chip of chips) {
    if (chip.status === "miss") continue;
    for (const ref of chip.cite) {
      const parsed = parseCite(ref);
      if (!parsed) continue;
      if (parsed.kind === "role") {
        if (chip.status === "hit") hit.add(parsed.id);
        else if (chip.status === "stretch" && !hit.has(parsed.id)) stretch.add(parsed.id);
      } else if (parsed.kind === "project") {
        if (chip.status === "hit") hitProject.add(parsed.id);
        else if (chip.status === "stretch" && !hitProject.has(parsed.id))
          stretchProject.add(parsed.id);
      }
    }
  }
  return { hit, stretch, hitProject, stretchProject };
}
