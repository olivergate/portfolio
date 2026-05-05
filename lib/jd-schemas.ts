import { z } from "zod";

/**
 * Citation prefix tags. The matcher cites the supporting evidence for a Hit
 * (or the closest evidence for a Stretch) by reference, not by inlining text.
 *
 * - "role:opensc-1" → CV role bullet ID
 * - "project:habit-forming-app" → CV project ID
 *
 * Project citations exist because some CV-to-JD matches are anchored in the
 * Projects section (e.g. mobile/consumer side projects) and not in role bullets.
 * Without the project: prefix that match would have to be a Stretch with no
 * citation, which understates the evidence.
 */
const CitePrefix = z
  .string()
  .regex(/^(role|project):[a-z0-9][a-z0-9-]*$/, 'must be "role:<id>" or "project:<id>"');

export const ChipStatus = z.enum(["hit", "stretch", "miss"]);
export type ChipStatus = z.infer<typeof ChipStatus>;

export const StretchLevel = z.enum(["strict", "balanced", "generous"]);
export type StretchLevel = z.infer<typeof StretchLevel>;

export const RequirementCategory = z.enum(["hard", "soft", "nice"]);
export type RequirementCategory = z.infer<typeof RequirementCategory>;

export const ParsedRequirement = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  category: RequirementCategory,
  weight: z.number().min(0).max(1),
});
export type ParsedRequirement = z.infer<typeof ParsedRequirement>;

export const ParseResponse = z.object({
  requirements: z.array(ParsedRequirement).min(1).max(20),
  jdHash: z.string().min(1),
});
export type ParseResponse = z.infer<typeof ParseResponse>;

export const Match = z.object({
  requirementId: z.string().min(1),
  status: ChipStatus,
  cite: z.array(CitePrefix),
  reasoning: z.string().min(1),
  /** Present only when status === "miss". Honest framing of the gap. */
  gapFraming: z.string().min(1).optional(),
});
export type Match = z.infer<typeof Match>;

export const MatchResponse = z.object({
  matches: z.array(Match).min(1),
});
export type MatchResponse = z.infer<typeof MatchResponse>;

/**
 * Sample JD chip — pre-baked status across all three stretch levels so
 * sample-JD chip grids render instantly without an API call.
 */
export const SampleChip = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  /** Default (balanced) status. */
  baseStatus: ChipStatus,
  /** Optional override at strict — falls back to baseStatus if absent. */
  strictStatus: ChipStatus.optional(),
  /** Optional override at generous — falls back to baseStatus if absent. */
  generousStatus: ChipStatus.optional(),
  cite: z.array(CitePrefix),
  reasoning: z.string().min(1),
  /** Pre-written candid framing surfaced when a Miss chip is expanded. */
  gapFraming: z.string().min(1).optional(),
});
export type SampleChip = z.infer<typeof SampleChip>;

export const SampleJD = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  text: z.string().min(1),
  chips: z.array(SampleChip).min(1),
});
export type SampleJD = z.infer<typeof SampleJD>;

export const SampleJDsSchema = z.array(SampleJD).min(1);
export type SampleJDs = z.infer<typeof SampleJDsSchema>;

/**
 * Resolve a chip's effective status at a given stretch level.
 * Falls back to baseStatus when the level-specific override isn't set.
 */
export function statusAtLevel(chip: SampleChip, level: StretchLevel): ChipStatus {
  if (level === "strict") return chip.strictStatus ?? chip.baseStatus;
  if (level === "generous") return chip.generousStatus ?? chip.baseStatus;
  return chip.baseStatus;
}

/**
 * Resolve a continuous slider position (0..1) to a discrete stretch level.
 * Boundaries match the design source (cv-jd.html `levelLabel`).
 */
export function levelFromPosition(value: number): StretchLevel {
  if (value < 0.34) return "strict";
  if (value > 0.66) return "generous";
  return "balanced";
}

/**
 * Default thumb position for a given level — used by the quick-snap buttons.
 */
export function positionFromLevel(level: StretchLevel): number {
  if (level === "strict") return 0.15;
  if (level === "generous") return 0.85;
  return 0.5;
}
