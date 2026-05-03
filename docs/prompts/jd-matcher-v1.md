---
version: jd-matcher@v1
endpoint: /api/jd-match
model: claude-sonnet-4-6
last_updated: 2026-05-03
---

# JD matcher — v1

Scores a CV against parsed JD requirements at a given stretch level. Conservative-bias (ADR-0016): every Hit must be defensible.

## System prompt

The full system prompt is in `lib/jd-prompts.ts` (`MATCHER_SYSTEM`). Mirror updates here when iterating.

The structure is:

1. **Three load-bearing rules** (Hit requires cite, Stretch is partial-not-weak-Hit, Miss says so plainly).
2. **Stretch level semantics** — strict / balanced / generous shifts the Hit/Stretch boundary only; Miss floor is fixed.
3. **Citation rules** — only cite IDs that appear in the provided CV evidence; don't invent.
4. **Reasoning style** — one short sentence per chip, specific not generic.
5. **Gap framing style** — 1–2 sentences, first-person, candid, no filler.
6. **Worked examples** — 7 examples covering clear Hit, clear Miss, borderline Hit/Stretch at all levels, Miss-stays-Miss across levels, project-cited Hit, skill-list-adjacency Stretch, and (Example 7) the role-level tech-list trap where a stack entry is not a bullet and must not be cited as one.

## Tool schema

Single tool: `submit_matches`. Match shape:

```json
{
  "requirementId": "string",
  "status": "hit | stretch | miss",
  "cite": ["role:opensc-1", "project:claude-code-setup"],
  "reasoning": "string (one sentence)",
  "gapFraming": "string (Misses only)"
}
```

## User message structure

Three fenced sections:

1. `## CV evidence` — formatted by `formatCVForPrompt(cv)`; bullets tagged `[role:<id>]`, projects tagged `[project:<id>]`.
2. `## Stretch level` — one of `strict | balanced | generous`.
3. `## Requirements` — JSON list of parsed requirements (id, text, category, weight).

The model returns one match per requirement, in input order.

## Notes for future iteration

- If matcher ever returns a Hit with empty cite, treat as latent prompt drift; check the worked examples and add a counter-example.
- If matcher confuses adjacent skills with shipped evidence (e.g. claims a Hit on something only mentioned in skills.ai training list), tighten Example 6 in MATCHER_SYSTEM.
- If matcher cites a role bullet to justify a Hit when the actual evidence is only in the role's tech-list (not a bullet), tighten Example 7 — the failure mode is "cite the closest-adjacent bullet just to satisfy the schema".
- If gapFraming starts pivoting away from gaps ("I'd love to learn this!"), add a counter-example showing a tight, unfilled-but-honest Miss.
- Bump version to `jd-matcher@v2` for any prompt change. Cache key includes the version (per ADR-0009).
