# 0016 — JD matcher prompt is conservative-biased

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

The JD adapter at `/jd` is the first surface on the site that makes claims
about Oliver's CV in the presence of a hiring manager's actual requirements.
The temptation for a matching system is to maximize Hits — a higher Hit count
looks better on the page. The pressure-test framing from the Phase 3 spec is
the opposite: every Hit must be defensible if a hiring manager asks Oliver
"which bullet is this?"

A neutral or generous matcher will produce Hits that don't have concrete
supporting bullets, will paper over partial matches as full ones, and will
generate a chip grid that looks good in a screenshot but loses trust on
contact with anyone reading it carefully.

The honesty stance the site takes (CLAUDE.md "Honesty guardrails (non-negotiable)":
"JD matcher prompt is biased conservative — prefer Stretch over Hit") is
load-bearing for the whole portfolio's credibility, not just this page.

## Decision

The matcher prompt encodes three rules at the top of the system message:

1. **A Hit requires concrete supporting evidence.** The matcher must name a
   specific `cite` ID (role bullet `role:opensc-1`, or project `project:claude-code-setup`).
   If no such evidence exists, return Stretch — never Hit.
2. **A Stretch is "adjacent skill or partial match" — not a euphemism for
   weak Hit.** If the requirement is genuinely not covered, return Miss.
3. **A Miss is "no evidence in the CV" — say so plainly in the gap framing.**
   The framing acknowledges the gap rather than pivoting away from it.

The prompt includes 4–6 worked examples covering: clear Hit, clear Stretch,
clear Miss, and at least two borderline cases at different stretch levels
(strict / balanced / generous) so the model learns where the boundary actually sits.

The `stretchLevel` parameter shifts the Hit/Stretch boundary only — it does not
change the Stretch/Miss floor. A Miss at strict is still a Miss at generous.
This is enforced in the prompt and in the worked examples (see ADR-0017).

The prompt template is versioned — `docs/prompts/jd-matcher-vN.md` —
and the cache key includes the version (per ADR-0009). Iterating the prompt
invalidates the matcher cache without touching parser cache.

## Consequences

**Wins:**
- Every Hit on the page is defensible. Visitors can click to see the cited bullet.
- Stretches read as honest signals rather than soft Hits, which builds trust
  in the rest of the page.
- Misses become a visible feature ("honest gaps") rather than something the
  page hides — exactly the editorial tone the design encodes.

**Costs:**
- Aggregate Hit count will be lower than a generous matcher would produce.
  This is the whole point. Visitors who came expecting a 90% match are
  meant to leave with a more honest read.
- Pressure-testing requires Oliver to actually read every chip on every test
  JD and confirm "yes, I'd defend this Hit" before the prompt is locked.
  This is a real human cost, not a free one. Documented in
  `docs/test-runs/jd-pressure-tests.md`.

**Deliberately not done:**
- No "confidence score" on chips. A score implies measurable certainty the
  matcher does not have. The three-state Hit/Stretch/Miss is the granularity
  that's honest.
- No "explain your work" debug output exposed in the UI. Reasoning text is
  available on hover, but the chain-of-thought is not.

## Alternatives considered

- **Neutral / generous matcher.** Higher Hit count, prettier screenshot,
  lower trust on second glance. Rejected — this directly contradicts the site's
  stated honesty stance.
- **Two-stage scoring (matcher + verifier).** A second model pass that
  re-checks every Hit. Rejected: doubles cost for marginal gain — the
  conservative-bias prompt + cited-bullet requirement covers the same territory
  in one pass.
- **Heuristic-only matcher (no LLM).** Keyword overlap against bullet text.
  Rejected: brittle on synonyms, misses adjacent-skill stretches, and the
  ambiguity is exactly where LLM matching pays its rent.

## References

- Phase 3 spec: `docs/specs/phase-3.md` §Tasks 2 and 11
- CLAUDE.md "Honesty guardrails (non-negotiable)"
- Stretch slider semantics: ADR-0017
- Cache key includes prompt version: ADR-0009
- Server-side AI policy: ADR-0008
