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

/**
 * Per-reading status overrides may only shuffle a chip between Hit and Stretch.
 * The Stretch/Miss floor is fixed across readings (ADR-0017) — a Miss is a Miss
 * at every reading — so "miss" is not a legal override value.
 */
export const OverrideStatus = z.enum(["hit", "stretch"]);
export type OverrideStatus = z.infer<typeof OverrideStatus>;

/**
 * Floor-invariant check shared by the live Match (enforced server-side in the
 * matcher route) and the pre-baked SampleChip (enforced below, since sample
 * chips bypass that route): the three reading statuses must not mix "miss" with
 * any non-miss status. A gap can't be slid into a partial-match (ADR-0017/0042).
 */
function crossesMissFloor(c: LeveledStatus): boolean {
  const levels = [c.strictStatus ?? c.baseStatus, c.baseStatus, c.generousStatus ?? c.baseStatus];
  return levels.includes("miss") && !levels.every((s) => s === "miss");
}

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
  /**
   * Status at the balanced (default) reading. The matcher scores all three
   * readings in one pass (ADR-0042) — same shape sample chips already use —
   * so the stretch slider is a pure client-side projection with no refetch.
   */
  baseStatus: ChipStatus,
  /** Optional override at strict — falls back to baseStatus if absent. */
  strictStatus: OverrideStatus.optional(),
  /** Optional override at generous — falls back to baseStatus if absent. */
  generousStatus: OverrideStatus.optional(),
  cite: z.array(CitePrefix),
  reasoning: z.string().min(1),
  /** Present only when the match is a Miss. Honest framing of the gap. */
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
export const SampleChip = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    /** Default (balanced) status. */
    baseStatus: ChipStatus,
    /** Optional override at strict — falls back to baseStatus if absent. */
    strictStatus: OverrideStatus.optional(),
    /** Optional override at generous — falls back to baseStatus if absent. */
    generousStatus: OverrideStatus.optional(),
    cite: z.array(CitePrefix),
    reasoning: z.string().min(1),
    /** Pre-written candid framing surfaced when a Miss chip is expanded. */
    gapFraming: z.string().min(1).optional(),
  })
  // Pre-baked chips bypass the matcher route's honesty validator, so enforce
  // the Stretch/Miss floor here: a Miss must stay a Miss at every reading
  // (ADR-0017). Caught by `bun run content:validate` and the schema tests.
  .superRefine((chip, ctx) => {
    if (crossesMissFloor(chip)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `chip "${chip.id}" crosses the Stretch/Miss floor across readings — a Miss must stay a Miss at every reading (ADR-0017)`,
      });
    }
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
 * The per-level status fields shared by SampleChip (pre-baked) and Match
 * (live, scored in one call). statusAtLevel projects either to a single
 * effective status, so both paths feed the same client-side slider.
 */
export type LeveledStatus = {
  baseStatus: ChipStatus;
  strictStatus?: ChipStatus;
  generousStatus?: ChipStatus;
};

/**
 * Resolve a chip's effective status at a given stretch level.
 * Falls back to baseStatus when the level-specific override isn't set.
 */
export function statusAtLevel(chip: LeveledStatus, level: StretchLevel): ChipStatus {
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
