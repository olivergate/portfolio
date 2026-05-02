# 0007 — `--muted` color deviation for WCAG AA at refined polish

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

Phase 0 ported the design-tokens CSS verbatim from `design-references/`. One of
those tokens — `--muted: #7a746c` — is the warm-grey used for every mono kicker,
section numeral, and meta line on the CV. On the cream `--bg: #faf7f2`, that
foreground/background pair scores **~4.3:1** contrast — *below* the WCAG AA
threshold of 4.5:1 for normal-size text.

In Phase 0 the value was static, so it was wrong everywhere by the same small
amount and visually felt fine. In Phase 1 the slider deck retheme this token
across the polish axis: at brutalist polish the muted endpoint is `#3a3a3a`
(very high contrast), at refined polish it lerps up to `#7a746c` (the design
value) and fails AA.

Phase 1 spec criterion #5 is explicit:

> The CV remains readable at WCAG AA contrast at every position.

The conflict: design-tokens says `#7a746c`; the spec says AA. Both are
authoritative. Something gives.

CLAUDE.md guidance: "deviations from design references need explicit approval
and an ADR." This is that ADR.

## Decision

Move the **refined endpoint** of the `--muted` interpolation from `#7a746c` to
`#6b645b`. The brutalist endpoint (`#3a3a3a`) is unchanged.

- New contrast on cream: ~5.0:1 (clears AA with margin).
- Visually nearly indistinguishable from `#7a746c` — same warm-grey character.
- Implemented in two places, kept in lockstep:
  - `lib/style-tokens.ts:64` — runtime `mix()` second argument
  - `lib/bootstrap-script.ts:30` — pre-hydration script (must mirror)
- A bootstrap/runtime parity test (`tests/bootstrap-parity.test.ts`) locks
  the two implementations together so future drift fails loudly.

## Consequences

**Wins**

- AA contrast holds at every slider position. Verified by `@axe-core/playwright`
  scoped to `.cv-surface` across five representative positions including
  refined+kinetic.
- The accessibility guarantee is now structural: the spec criterion is enforced
  by the test suite, not by reviewer eyeballs.
- The deviation is small enough that the design's warm-parchment / muted-grey
  palette character is preserved — anyone comparing to the screenshots won't
  see the difference without a colour-picker.

**Costs**

- Documented deviation from `design-references/design-tokens.css`. Future
  contributors looking at the design source as ground truth will see one value
  and read another in the running site. The inline comment at
  `lib/style-tokens.ts:60-63` calls this out at the source.
- The deck itself (hardcoded dark, doesn't retheme) was unaffected — no
  parallel adjustment needed there.
- If the design-tokens file is ever re-imported wholesale, this fix would be
  silently undone. Worth a CI guard later, but cheaper to rely on the parity
  test catching the resulting axe failure.

## Alternatives considered

- **Disable axe color-contrast in the test suite.** Rejected — the spec
  criterion is hard. The test exists to enforce it; suppressing it makes the
  guarantee unverifiable.
- **Apply a darker `--muted` only at refined polish (threshold flip rather
  than smooth lerp).** Rejected — would create a visible jump as the slider
  crossed the threshold. The smooth lerp toward a slightly darker endpoint
  preserves the continuous feel.
- **Restrict the muted color to large text only.** Rejected — most muted text
  on the page is small (mono kickers at 0.78rem ≈ 12.5px). The non-AA-passing
  failure mode is exactly the population we'd be trying to whitelist.
- **Increase the bg-fg contrast by darkening `--fg` instead.** Rejected — `--fg`
  is the body copy. Darkening it shifts the whole page weight toward higher
  contrast and undermines the "warm parchment" feel the design specifies.

## References

- `design-references/design-tokens.css` — original `--muted: #7a746c`
- `lib/style-tokens.ts:60-64` — runtime fix + inline rationale
- `lib/bootstrap-script.ts:30` — pre-hydration mirror
- `tests/bootstrap-parity.test.ts` — locks the two in sync
- `tests/e2e/a11y.spec.ts` — axe color-contrast scoped to `.cv-surface`
- `docs/specs/phase-1.md` § Success criterion #5
- `CLAUDE.md` § "Decisions about visual design that diverge from the design
  references — the design is locked in; deviations need explicit approval and
  an ADR"
