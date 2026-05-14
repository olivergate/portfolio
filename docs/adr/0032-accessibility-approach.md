# 0032 — Accessibility approach (WCAG 2.2 AA across all pages and slider states)

- **Status:** Accepted
- **Date:** 2026-05-14
- **Deciders:** Oliver Kaikane Gate

## Context

At the end of Phase 4 the site had four narrowly-scoped accessibility hooks
in place (a `<html lang>` declaration, four scattered `aria-label`s, a
`prefers-reduced-motion` block on the motion-token row, and `@axe-core/playwright`
installed but unwired) plus two pre-existing ADRs that touched a11y at point:
ADR-0007 darkened `--muted` at refined polish to clear the WCAG AA floor on
cream backgrounds, and ADR-0017 documented the stretch slider's native-range
a11y posture. Neither addressed the combinatorial state space the four UX
sliders open up: at any pair of (font, contrast, density, motion) slider
positions, body, kicker, and accent text must hit ≥ 4.5:1 against whatever
background `stateToTokens()` produces, but this had only ever been verified
at five sampled positions in `tests/e2e/a11y.spec.ts`.

Phase 7 originally carried "Accessibility pass" as one task among six. With
Phase 5 (the prompt-safety game — the most accessibility-rich surface on the
site, full of keyboard input, turn output, focus traps, and motion) not yet
started, the cost of baking a11y in beat the cost of retrofitting in Phase 7.
Phase 4.5 was scoped to lift that work forward.

## Decision

**Target WCAG 2.2 AA across every page and every reachable slider position.
No AAA reach.**

Specifically:

1. **Conformance level.** WCAG 2.2 AA is the conformance claim. The 2.2 spec
   adds nine criteria over 2.1 AA; the ones that materially apply to this
   stack — 2.4.11 Focus Not Obscured (Min), 2.5.8 Target Size (Min) — are
   covered by the global `html { scroll-padding-top }` and the 24×24
   minimum on slider thumbs and JD chips. AAA criteria (2.4.13 Focus
   Appearance, 1.4.6 Contrast Enhanced) are not promised — though the focus
   ring tokens happen to satisfy 2.4.13 in practice, they're set for design
   reasons, not conformance.

2. **Slider state space safety net.** A Vitest contrast snapshot
   (`tests/style-tokens-contrast.test.ts`) enumerates the four-axis grid at
   step 0.1 (11⁴ = 14,641 combinations) and asserts every load-bearing pair
   meets ≥ 4.5:1: `fg/bg`, `muted/bg`, `accent/bg`, `inverse-fg/inverse-bg`,
   `hit/bg`, `stretch/bg`. The worst-case ratio per pair is snapshotted so
   any future regression surfaces as a snapshot diff.

   The original plan called for a `POLISH_STOPS` refactor of
   `lib/style-tokens.ts` to make the safety bounded *by construction*. The
   contrast test pass first-run against the existing free-form `mix()`
   interpolation (worst-case `muted/bg = 5.46:1`, a 0.96 margin above the
   AA floor), so the refactor was skipped. Safety is now bounded *by
   verification* — any future edit to `lib/style-tokens.ts` that drops a
   pair below 4.5:1 fails CI before it merges. Same guarantee, lower cost,
   no visual-discretisation risk.

3. **OS-pref strategy: cascade wins, slider controls untouched.**
   `prefers-contrast: more` and `forced-colors: active` are handled via
   `@media` blocks in `styles/tokens.css`. The slider controls (LineSlider
   inside the rethemer FAB) are not aware of these prefs — the user's
   slider state is preserved. On routes that don't run the rethemer
   bootstrap (everything except `/`) the cascade wins fully. On `/` the
   slider's inline-style declarations win over `:root` media blocks; this
   is acceptable because the contrast Vitest guarantees AA is held at every
   reachable slider state, so the user gets at least AA regardless of OS
   prefs. The forced-colors block additionally maps tokens to system colors
   (Canvas / CanvasText / LinkText / GrayText / Highlight) for the routes
   where the browser substitutes.

4. **Forced-colors opt-out for the rethemer FAB.** The slider deck pill +
   panel use `forced-color-adjust: none` so the design language survives
   Windows High Contrast Mode. The interactive surfaces inside (native
   `<input type="range">`) remain keyboard-operable; only the chrome is
   protected from system-color substitution. The skip-link is also
   protected so it remains visually distinct on appearance.

5. **Live-region strategy.** Every page that streams AI results has a
   single persistent `<div role="status" aria-live="polite"
   aria-atomic="false">` in the DOM (must exist on first render for SRs
   to subscribe). Announcements fire at two points only: start
   ("Analyzing…") and completion (the editorial summary). Per-token
   streams are never announced. Errors are announced separately via the
   existing `role="alert"` block.

6. **Focus management.** A 3px solid `var(--accent)` ring on every
   focusable element via a `:where()` universal `:focus-visible` rule
   (with `prefers-contrast: more` and `forced-colors: active` fallbacks).
   A 15-line `<MainFocus />` client component moves focus to `<main>` on
   route change. A skip link is the first focusable element on every page.

7. **Per-phase ownership going forward.** Phase 5 (game) inherits an
   explicit a11y task §13 — `role="log"` chat transcript, keyboard
   bindings legend, native `<dialog>` modals, motion gating, axe gate at
   L-01/L-02 in idle/mid-conversation/win states. Phase 6 (more game
   levels) extends the axe gate. Phase 7 (launch) verifies the
   conformance claim still holds and refreshes the `last-audited` date
   on `/accessibility`. Phase 7 task §5 is marked superseded.

## Consequences

**Wins.**

- Every reachable slider state is now provably AA on the load-bearing
  pairs. Future edits to `lib/style-tokens.ts` can't regress without
  failing CI.
- `bun run a11y` is one aggregate command: Biome a11y rules → contrast
  Vitest → axe Playwright across all routes + slider extremes + JD
  interaction states. Lighthouse CI is wired separately via
  `bun run a11y:lhci`.
- The site has a public `/accessibility` page that makes the conformance
  claim, lists known limits, and documents how to reproduce locally.
  Following the "process is visible" convention used for `/decisions` and
  `/build`, the limits are stated rather than hidden.
- Phase 5 starts with a11y as spec, not advice — the game becomes a
  showcase surface for a11y craft rather than a retrofit task.

**Costs.**

- The contrast Vitest at 14,641 states adds ~150ms to the unit-test run.
  Acceptable; the test runs in <500ms total.
- A new `@lhci/cli` devDependency (~75MB after install) for Lighthouse CI.
  Excluded from `bun run a11y` aggregate because it needs its own server
  lifecycle; runs on demand.
- A small `forced-color-adjust: none` on the rethemer FAB means under
  Windows High Contrast Mode users still see the brand-colored pill
  instead of system colors. The pill is decorative chrome; the operative
  control underneath (the `<input type="range">`) remains keyboard-operable
  and labelled.
- One biome-suppression on `ChipGrid`'s `role="list"` — defended in the
  comment as a known a11y workaround against Safari's `list-style: none`
  heuristic.

**Deliberately not done.**

- No AAA conformance claim. The refined-polish default theme can't hit
  AAA's 7:1 floor without losing the warm-cream character the design
  references settled on; chasing AAA across the slider state space
  would force the token trajectory into a narrower band than the design
  can absorb.
- No third-party VPAT or external audit. The `/accessibility` page makes
  a self-assessed claim per the W3C model.
- No React Aria adoption. Phase 5 modals will use the native `<dialog>`
  with `showModal()` (focus trap, ESC handling, inert background,
  `::backdrop` — all for free). Pulling in React Aria for a single
  overlay isn't worth the weight.
- No cognitive-accessibility rewrites or plain-language alternatives.
- No multi-language support.
- The slider controls do **not** disable themselves under
  `prefers-reduced-motion` or `prefers-contrast: more`. OS prefs win via
  CSS cascade only; user slider state is preserved.

## Alternatives considered

- **Full-site AAA.** Rejected: would force `--muted` and `--accent` into a
  narrower trajectory than the design tolerates; the refined-polish cream
  palette can't hit 7:1 on muted text without losing its character.
- **`POLISH_STOPS` token-tuple refactor for bounded-by-construction safety.**
  Rejected after the contrast Vitest passed first-run on the existing
  free-form `mix()` implementation. Verification gives the same guarantee
  at lower cost and without the visual-discretisation risk along the
  polish axis.
- **Disable the slider control under OS prefs.** Rejected per Oliver's
  call (2026-05-14): the slider position is user state, the OS pref is
  also user state, and the cascade is the right place to reconcile them
  silently. Disabling the control with an explanatory note adds UI for a
  redundant signal.
- **React Aria for modals, focus management, and form primitives.**
  Rejected for Phase 4.5: the foundation work is mostly CSS + one 15-line
  Client Component; pulling in a runtime focus library would be
  overkill. Phase 5 will revisit if the game's interaction model warrants
  it (current plan: native `<dialog>`).
- **Skip forced-colors handling.** Rejected: it's two `@media` blocks and
  one of the cheapest accessibility wins available.
- **Defer to Phase 7.** Rejected because Phase 5 ships the most
  accessibility-rich surface on the site; retrofitting after the game
  lands costs materially more than baking in.

## References

- Phase 4.5 spec: `docs/specs/phase-4.5.md`
- ADR-0007 — Phase 1 `--muted` AA fix at refined polish
- ADR-0017 — Stretch slider semantics
- ADR-0028 — Single-page consolidation (affects route topology / live regions)
- Phase 5 spec task §13 (cross-phase amendment from this phase)
- Phase 6 spec tasks §1, §2 (cross-phase amendments from this phase)
- Phase 7 spec task §5 (superseded by this phase)
- WCAG 2.2 Recommendation — https://www.w3.org/TR/WCAG22/
- Next.js 16 Accessibility — https://nextjs.org/docs/architecture/accessibility
- Playwright + axe-core — https://playwright.dev/docs/accessibility-testing
- WAI-ARIA `display: contents` listitem-role preservation — modern
  Safari/Firefox/Chrome (2024+) preserve the role under `display: contents`,
  which the chip grid relies on so each chip remains a grid item.
