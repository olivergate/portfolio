import "server-only";
import { CANNED_SAMPLE_IDS, type CannedSampleId, type RetroResponse } from "@/lib/retro-schemas";

export { CANNED_SAMPLE_IDS, type CannedSampleId };

/**
 * Canned retro responses keyed by sample-id. Used as the graceful fallback
 * when /api/retro can't make a live Anthropic call (rate-limit blocked,
 * cost-ceiling blocked, API error, schema-validate failure). Per ADR-0025
 * the demo's value to the visitor is the *output shape* — failure should
 * still teach what a retro looks like, not show an error toast.
 *
 * Each canned response is a hand-curated retrospective that matches the
 * shape of `lib/retro-schemas.ts:RetroResponse` exactly. The route handler
 * routes a failed transcript to `refactor` (the most "neutral") unless the
 * transcript matches one of the three sample transcripts in
 * `content/projects.json` verbatim.
 */
export const CANNED_RETROS: Record<CannedSampleId, RetroResponse> = {
  refactor: {
    wentWell: [
      "Claude read both auth files before suggesting an approach — no premature solutioning.",
      "Surfaced an out-of-scope race condition without trying to expand the PR.",
      "Caught the localStorage-shaped test failures and fixed them in one pass instead of asking.",
    ],
    slowed: [
      "I didn't specify the caching policy up front — Claude proposed 5min/refetch-on-focus and I accepted, but I'd have wanted to think about it for 30 seconds first.",
      "The /me consolidation should arguably have been a design discussion before code; we got lucky that the answer was obvious.",
    ],
    learnings: [
      {
        title: "Read-before-write is doing real work",
        body: "Two files read before any code change is the move. The follow-up question quality goes up dramatically when context is loaded first.",
      },
      {
        title: "Out-of-scope finds belong in TODO.md, not the PR",
        body: "Pattern worth keeping: the agent flagged the logout race and parked it instead of derailing. Tighten this in the system prompt.",
      },
    ],
    additions: [
      {
        title: "/audit-context",
        body: "A slash command that prints which files have been read this session, so I can sanity-check coverage before reviewing a diff.",
      },
    ],
  },
  debug: {
    wentWell: [
      "Triaged the diff before the logs — fastest path given a clean failure window.",
      "Followed the one-line fix with a repo-wide grep for stragglers; cheap and exactly the right paranoia.",
      "Suggested a deploy-checklist update without me asking.",
    ],
    slowed: [
      "We should have caught this in CI — there was no test that would have failed on a missing env var.",
      "The rename PR review was approved by me without grepping; I'd run a stricter checklist next time.",
    ],
    learnings: [
      {
        title: "Env-var renames need a sweep, not a search-and-replace",
        body: "PR diff doesn't capture string references in non-imported files. Make 'grep before merge' part of the rename ritual.",
      },
      {
        title: "CI gap: no env-var contract",
        body: "Worth a contract test that asserts every required env var is present on boot. Would've caught this in pre-deploy.",
      },
    ],
    additions: [
      {
        title: "/env-sweep <oldname> <newname>",
        body: "Slash command that grep-renames across the repo and prints any references the diff missed.",
      },
    ],
  },
  feature: {
    wentWell: [
      "Plan-first request worked — Claude surfaced the auth + rate-limit ambiguity before any code was written.",
      "Self-flagged the format-options-as-constant smell and asked rather than silently expanding scope.",
      "Commit message draft saved a couple of minutes at the end.",
    ],
    slowed: [
      "I didn't pre-write the plan template, so the structure of the plan response was Claude's default rather than what I'd want for this codebase.",
      "Modal UX wasn't in the spec; we made decisions on the fly that should've been mocked first.",
    ],
    learnings: [
      {
        title: '"Plan first, no code" is the highest-leverage prompt I have',
        body: "When the agent has to commit to a plan before any tokens are spent on code, the plan is sharper. Make this the default for any feature >2 hours.",
      },
      {
        title: "UX decisions hidden in specs",
        body: "The spec described the behaviour but not the surface — we ended up designing the modal in chat. Catch this earlier.",
      },
    ],
    additions: [
      {
        title: "skill: feature-spec-review",
        body: "A skill that, given a spec, returns: (1) explicit assumptions, (2) ambiguous points needing clarification, (3) UX surfaces that aren't covered. Run before any feature work.",
      },
    ],
  },
};

/**
 * Pick a canned retro for a transcript on a fallback path.
 *
 * If the transcript matches one of the three sample transcripts (after
 * trim), return the matching id. Otherwise default to `refactor` — the most
 * "neutral" sample that reads sensibly even when the transcript was about
 * something else. The caller treats this as a graceful fallback, never as
 * a guess at the user's intent.
 */
export function pickCannedRetro(
  transcript: string,
  sampleTranscripts: Record<CannedSampleId, string>,
): CannedSampleId {
  const trimmed = transcript.trim();
  for (const id of Object.keys(sampleTranscripts) as CannedSampleId[]) {
    if (sampleTranscripts[id].trim() === trimmed) return id;
  }
  return "refactor";
}
