# 0018 — No top-line match percentage on `/jd`

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

A natural-feeling output for a JD-vs-CV scorer is "73% match." It's compact,
sharable, and instantly comparable across JDs. It's also dishonest at the
scale of evidence the matcher actually has.

A percentage implies:

- **Quantitative measurement.** The matcher is making qualitative three-state
  judgements (Hit / Stretch / Miss). Reducing those to a single number adds
  precision the underlying signal doesn't carry.
- **Comparability between JDs.** A "73% match" against a 12-chip JD and a
  "73% match" against a 6-chip JD are not the same thing, but they look identical.
- **Aggregation across requirement types.** Counting a hard-requirement Hit
  the same as a nice-to-have Hit pretends they're equivalent. They aren't.

A "67% match" on the page, screenshotted into a recruiter Slack channel, also
reads as a self-rating Oliver does not endorse.

## Decision

The page displays an editorial summary line in body type, not a score:

> Reading the JD as written, this CV lands **7 hits**, **4 stretches**, and
> **1 honest gap**.

The phrasing is locked. The numbers are computed from the chip grid. Plurals
are computed too (`1 hit` vs `7 hits`). The colour-coded counts use the same
hit/stretch/miss palette as the chips themselves so the line reads as a
table-of-contents, not a verdict.

Below it, a smaller mono kicker:

> Conservative matching — when uncertain, defaults to stretch over hit.

This is editorial copy. The components rendering it (`SummaryLine.tsx`)
hardcode the phrasing — there is no "summaryFormat" prop or template
configuration. A future change would require an ADR superseding this one.

There is also no:

- "Match score" attribute anywhere in the API response
- Aggregate progress bar
- "Overall fit: strong / moderate / weak" label
- Out-of-N number ("7 / 12 hits") — phrased as a plain count without
  the implicit denominator

## Consequences

**Wins:**
- The page can't be screenshotted into a misleading single number.
- The chip grid stays the unit of analysis — visitors are nudged to read
  individual chips rather than glance at a summary.
- The editorial tone matches the rest of the site (Fraunces, balanced
  text-wrap, no UI-as-verdict patterns).

**Costs:**
- Some visitors will skim and want a number. They'll have to read the
  summary line.
- A/B-style "this JD scores higher than that JD" comparisons aren't
  trivially possible from the UI. (They aren't really possible accurately
  with a percentage either; this just makes the limitation visible.)

**Deliberately not done:**
- No exposed numeric score in the JSON response either, even for downstream
  consumers, to avoid creating a foothold for future percentage UI.

## Alternatives considered

- **Percentage match.** Compact, conventional, dishonest at this evidence
  scale. Rejected — directly contradicts the honesty stance.
- **"Strong / moderate / weak fit" label.** Less numeric but still a
  single-bucket verdict. Rejected: same shape, same problem.
- **Per-category breakdowns** (X% on hard requirements, Y% on nice-to-haves).
  Rejected: more honest than a single percentage, but still imposes false
  precision on what the matcher can actually distinguish.

## References

- Phase 3 spec: `docs/specs/phase-3.md` §Tasks 6 and 11
- CLAUDE.md "Honesty guardrails (non-negotiable)" (no percentage rule)
- Conservative-bias matcher: ADR-0016
- Cross-phase invariants: `docs/specs/README.md`
