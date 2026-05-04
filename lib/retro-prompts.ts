import "server-only";
import type Anthropic from "@anthropic-ai/sdk";

export { extractToolInput } from "@/lib/jd-prompts";

/**
 * Phase 4 retro prompt — placeholder v1 authored 2026-05-04.
 *
 * Bumping this string is the cache-invalidation handshake (ADR-0009): every
 * cache key includes promptVersion, so `retro@v1` → `retro@v2` namespaces a
 * fresh entry per (transcript, prompt) tuple. Same convention as the JD
 * parser/matcher (`jd-parser@v1`, `jd-matcher@v2`).
 *
 * Doc companion: docs/prompts/retro-v1.md.
 */
export const RETRO_PROMPT_VERSION = "retro@v1";

export const RETRO_SYSTEM = `You generate a structured retrospective for a Claude Code working session, given the session transcript. The audience is the engineer who ran the session — they want a sharp, honest read of what happened and what to take forward.

Four sections, every output:

1. wentWell — concrete behaviours from this session that were load-bearing wins. Not generalities ("good collaboration"); specifics ("read both auth files before suggesting an approach"). 1–8 items.

2. slowed — concrete frictions or near-misses. Things the engineer should have done differently, or process gaps the session exposed. Don't pad with mild critique; if the session was clean in some area, leave it out. 1–8 items.

3. learnings — durable takeaways worth keeping. Each learning has a short title (one phrase) and a body (1–3 sentences) that explains *why* this matters and how to apply it. Draw only from evidence in the transcript. 1–6 items.

4. additions — suggested skills, slash commands, or process changes that would have helped this session. Each has a short code-style title (e.g. "/audit-context", "skill: feature-spec-review") and a body describing what it does. Optional — emit zero if the transcript doesn't suggest any. Up to 6.

HONESTY RULES (load-bearing):

- Every item must be grounded in the transcript. No inferred wins, no inferred slowdowns, no learnings projected from outside the session.
- Praise only what's notable. "Claude responded promptly" is not a wentWell. "Claude flagged an out-of-scope race condition without expanding the PR" is.
- Name slowdowns plainly. First-person from the engineer's POV ("I didn't specify the caching policy up front") rather than blaming the model.
- Don't fabricate suggested additions. If the session ran without friction, return an empty array — better to be terse than to invent process.
- Don't pad. Five sharp items beat eight diluted ones.

WORKED EXAMPLE — for a transcript about debugging a deploy issue:
- wentWell: "Triaged the diff before the logs — fastest path given a clean failure window."
- slowed: "We should have caught this in CI — there was no test that would have failed on a missing env var."
- learnings.title: "Env-var renames need a sweep, not a search-and-replace"
- learnings.body: "PR diff doesn't capture string references in non-imported files. Make 'grep before merge' part of the rename ritual."
- additions.title: "/env-sweep <oldname> <newname>"
- additions.body: "Slash command that grep-renames across the repo and prints any references the diff missed."

You output via the submit_retro tool only. No prose response.`;

export const RETRO_TOOL: Anthropic.Tool = {
  name: "submit_retro",
  description: "Submit the structured retrospective. Call exactly once.",
  input_schema: {
    type: "object",
    required: ["wentWell", "slowed", "learnings", "additions"],
    properties: {
      wentWell: {
        type: "array",
        minItems: 1,
        maxItems: 8,
        items: { type: "string" },
        description:
          "Concrete behaviours from this session that were load-bearing wins. Specifics, not generalities.",
      },
      slowed: {
        type: "array",
        minItems: 1,
        maxItems: 8,
        items: { type: "string" },
        description: "Concrete frictions or near-misses. First-person from the engineer's POV.",
      },
      learnings: {
        type: "array",
        minItems: 1,
        maxItems: 6,
        items: {
          type: "object",
          required: ["title", "body"],
          properties: {
            title: { type: "string", description: "Short phrase headline." },
            body: { type: "string", description: "1–3 sentences explaining why and how to apply." },
          },
        },
      },
      additions: {
        type: "array",
        minItems: 0,
        maxItems: 6,
        items: {
          type: "object",
          required: ["title", "body"],
          properties: {
            title: {
              type: "string",
              description:
                "Code-style label, e.g. '/audit-context' or 'skill: feature-spec-review'.",
            },
            body: { type: "string", description: "What it does and why it would have helped." },
          },
        },
        description:
          "Suggested skills, slash commands, or process changes. Empty array allowed when nothing surfaced.",
      },
    },
  },
};
