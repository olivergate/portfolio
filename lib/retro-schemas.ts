import { z } from "zod";

/**
 * The set of sample-ids that have a canned retro at lib/canned-retros.ts.
 * Defined here (not in canned-retros.ts) because retro-schemas.ts is
 * imported by client components for type info, while canned-retros.ts is
 * server-only — keeping the id list out of the server-only module lets the
 * schema constrain it without leaking server modules into the client bundle.
 * Adding a fourth canned retro means extending this tuple AND adding a key
 * to CANNED_RETROS in canned-retros.ts.
 */
export const CANNED_SAMPLE_IDS = ["refactor", "debug", "feature"] as const;
export type CannedSampleId = (typeof CANNED_SAMPLE_IDS)[number];

/**
 * Phase 4 schemas for /lab.
 *
 * Two unrelated concerns share this file because they ship together and both
 * are scoped to the lab page:
 *
 * 1. RetroResponse — the structured retrospective the /api/retro Route Handler
 *    emits via Anthropic tool use. The same schema validates the canned
 *    fallback responses (lib/canned-retros.ts) so failure paths render
 *    indistinguishably from live responses (ADR-0025).
 *
 * 2. LabProjects — the content schema for content/projects.json (one featured
 *    demo + N secondary cards). Validated by lib/content.ts:getProjects() on
 *    load, mirroring the cv.json / tone.json convention.
 */

// ─── Retro response ────────────────────────────────────────────────────────

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "must be a kebab-case slug");

const Bullet = z.string().min(1).max(400);

export const Learning = z.object({
  title: z.string().min(1).max(140),
  body: z.string().min(1).max(600),
});
export type Learning = z.infer<typeof Learning>;

export const Addition = z.object({
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(600),
});
export type Addition = z.infer<typeof Addition>;

export const RetroResponse = z.object({
  wentWell: z.array(Bullet).min(1).max(8),
  slowed: z.array(Bullet).min(1).max(8),
  learnings: z.array(Learning).min(1).max(6),
  additions: z.array(Addition).min(0).max(6),
});
export type RetroResponse = z.infer<typeof RetroResponse>;

// ─── Lab projects content ──────────────────────────────────────────────────

export const TechPill = z.string().min(1).max(40);

export const FeaturedProject = z.object({
  slug: z.literal("claude-code-retro"),
  title: z.string().min(1),
  blurb: z.string().min(1),
  techPills: z.array(TechPill).min(1).max(8),
  samples: z
    .array(
      z.object({
        // Constrained to the canned-retro id set. If a sample is renamed,
        // every fallback would silently degrade to "refactor" without this —
        // see lib/canned-retros.ts.
        id: z.enum(CANNED_SAMPLE_IDS),
        label: z.string().min(1),
        transcript: z.string().min(20).max(8000),
      }),
    )
    .min(1)
    .max(CANNED_SAMPLE_IDS.length),
});
export type FeaturedProject = z.infer<typeof FeaturedProject>;

export const ProjectLink = z.object({
  label: z.string().min(1).max(40),
  url: z.string().min(1),
  // Shown alongside the link — e.g. "Private repo: ask for view access".
  note: z.string().min(1).max(120).optional(),
});
export type ProjectLink = z.infer<typeof ProjectLink>;

export const ProjectSubPage = z.object({
  slug: slug,
  title: z.string().min(1).max(80),
});
export type ProjectSubPage = z.infer<typeof ProjectSubPage>;

export const ProjectGradient = z.object({
  from: z.string().min(1),
  via: z.string().min(1).optional(),
  to: z.string().min(1),
});

export const Project = z.object({
  slug: slug,
  title: z.string().min(1),
  summary: z.string().min(1),
  stack: z.string().min(1),
  techPills: z.array(TechPill).min(1).max(8),
  glyph: z.string().min(1).max(4).optional(),
  gradient: ProjectGradient.optional(),
  links: z.array(ProjectLink).default([]),
  subPages: z.array(ProjectSubPage).default([]),
  showOn: z.object({
    cv: z.boolean().default(true),
    lab: z.boolean().default(true),
  }),
});
export type Project = z.infer<typeof Project>;

export const LabProjects = z.object({
  featured: FeaturedProject,
  projects: z.array(Project).min(1).max(8),
});
export type LabProjects = z.infer<typeof LabProjects>;
