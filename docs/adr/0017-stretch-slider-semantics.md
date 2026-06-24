# 0017 — Stretch slider adjusts only the Hit/Stretch boundary; API receives a discrete level

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

The JD adapter has a stretch slider distinct from the four UX style sliders on
`/`. It lets the visitor tune how generously the matcher interprets ambiguous
evidence. The design source (`design-references/source/cv-jd.html`) renders it
with three quick-snap labels (`⊢ strict`, `⊨ balanced`, `⊣ generous`) and a
continuous thumb position from 0 to 1.

Two questions need a decision:

1. **What does the slider actually control semantically?** Does it shift the
   floor for Misses (so generous mode produces fewer Misses) or only the
   boundary between Hit and Stretch?
2. **What does the API accept — a continuous 0..1 value or a discrete level?**

On (1), shifting the Stretch/Miss floor would mean "generous mode invents
adjacent experience." That violates the matcher's honesty rules from ADR-0016
("a Miss is no evidence in the CV — say so plainly"). Misses must remain
Misses regardless of slider position; the visitor can't slide their way out
of an honest gap.

On (2), a continuous 0..1 value gives infinite cache cardinality —
`sha256(cvHash + jdHash + 0.34 + …)` and `sha256(cvHash + jdHash + 0.35 + …)`
are different keys for the same intended outcome. The visual thumb is
continuous for feel, but the actual matcher behaviour only varies at the level
boundaries (<0.34 strict, 0.34–0.66 balanced, >0.66 generous — same as the
design source's `levelLabel(v)` helper). Sending the discrete level to the API
caps cache cardinality at three per JD.

## Decision

**Semantics:** the slider shifts only the Hit/Stretch boundary. Stretch/Miss
is fixed.

- **Strict** — only chips with concrete cited bullets are Hits. Adjacent or
  partial evidence is Stretch.
- **Balanced** (default, 0.5) — Hit/Stretch boundary at the matcher's natural
  judgement. The "default reading" of the CV.
- **Generous** — borderline-cited evidence can become Hit. Genuine gaps remain Miss.

A Miss never becomes a Stretch by sliding the slider. The matcher prompt
encodes this rule explicitly and the worked examples include a borderline
Stretch/Miss case that stays Miss across all three levels.

**API contract:** `app/api/jd-match` accepts `stretchLevel: "strict" | "balanced" | "generous"`,
not a number. The UI thumb is continuous for feel but resolves to a level
before the API call:

- thumb position < 0.34 → `"strict"`
- 0.34 ≤ thumb position ≤ 0.66 → `"balanced"`
- thumb position > 0.66 → `"generous"`

Quick-snap buttons set the thumb to {0.15, 0.5, 0.85}. The slider call to
`/api/jd-match` is debounced (~400ms) to avoid mid-drag refetches.

## Consequences

**Wins:**
- Cache cardinality is capped at three matcher entries per JD instead of
  unbounded. Same wins compounding for the cost log and pressure-test
  reproducibility.
- The slider's effect is bounded and explainable in one sentence: "tuning how
  generously borderline cases score, never inventing evidence for Misses."
- Honesty-rule from ADR-0016 holds across all slider positions.

**Costs:**
- The continuous thumb gives the visual impression of finer control than the
  matcher actually exercises. The level label visible on the slider mitigates this.
- Sample JDs in `content/sample-jds.json` need three pre-computed status sets
  per chip (`strictStatus`, `baseStatus`, `generousStatus`) to render
  instantly. The design source already encodes this.

**Deliberately not done:**
- No floating-point `stretchThreshold` parameter on the API.
- No fourth or finer level. Three is the granularity the worked examples can
  cover honestly.

## Alternatives considered

- **Continuous 0..1 to API.** Maximum slider expressiveness on paper. Rejected:
  unbounded cache, no real matcher behaviour at non-boundary values.
- **Slider also moves Stretch/Miss floor.** Would let generous mode "claim more"
  by reframing Misses as Stretches. Rejected: violates ADR-0016.
- **Five levels.** More granularity, but the worked-example budget for the
  matcher prompt would balloon and the marginal user value over three levels
  is small.

## References

- Phase 3 spec: `docs/specs/phase-3.md` §Tasks 2 and 7
- Conservative-bias matcher: ADR-0016
- Two-stage pipeline: ADR-0015
- Design source: `design-references/source/cv-jd.html` (`levelLabel`, `levelToValue`)
- **Transport superseded by ADR-0042:** the API no longer receives a discrete
  level and the slider no longer refetches — the matcher scores all three
  readings in one call and the slider projects them client-side. The honesty
  principle above (the slider never moves the Stretch/Miss floor; a Miss is a
  Miss at every reading) is retained and now enforced structurally by that
  single reasoning pass plus the server validator.
