# Phase 4.5 — Accessibility foundation

> Read this whole file. Read `design-references/README.md` and the existing
> a11y-adjacent ADRs (0007, 0017) first. Plan, then execute.
>
> This phase lands between Phase 4 (Lab) and Phase 5 (game). It supersedes
> task §5 of `phase-7.md` ("Accessibility pass") — that task is folded into
> this phase plus a Phase 5 amendment so the game is born accessible rather
> than retrofitted at launch.

## Goal

Make the site meet **WCAG 2.2 AA across every page and every reachable
slider position**. Three deliverables, in this order:

1. **Foundation** — landmark structure, skip link, focus token system,
   route-change focus management, label fixes on existing forms, Biome a11y
   rule group. Lands first; visually invisible.
2. **Slider safety net** — refactor `lib/style-tokens.ts` to pre-vetted
   token tuples so no reachable combination of the four sliders produces
   sub-4.5:1 contrast on body, muted, or accent pairings. Enforced by a
   build-time Vitest snapshot covering the full reachable grid. Adds
   `prefers-contrast: more` and `forced-colors: active` handling via CSS
   cascade — slider controls are not touched.
3. **Live regions + CI gates** — single persistent `role="status"` in
   `/jd` that coalesces AI-streaming announcements, chip-grid `<ul>`
   semantics, `@axe-core/playwright` wired into the e2e suite at WCAG 2.2
   AA tags across all routes × representative slider extremes, Lighthouse
   CI accessibility budget at 100 on `/`, `/jd`, `/lab`, aggregate
   `bun run a11y` script. Plus the user-facing deliverables: ADR-0032
   ("Accessibility approach"), an `/accessibility` route with the
   conformance statement, and `docs/runbooks/a11y-manual.md`.

## Why AA, not AAA

ADR-0032 (this phase) records the decision in full. Short version: the
refined-polish default theme can't hit AAA 7:1 body contrast without
losing the warm-cream character the design references settled on, and
chasing AAA across the four-slider state space forces the token tuples
into a narrower trajectory than the design language can absorb. AA is
the WCAG-recommended target for general content, is the EN 301 549 floor
referenced by the EU EAA, and is achievable across the full slider
state space with the safety net in §2.

Focus rings stay thick (3px solid accent) because that's already on-brand
and free — not because we're chasing 2.4.13 AAA.

## Why now, not Phase 7

`phase-7.md` §5 currently carries the a11y pass as one task among six.
Two reasons to lift it forward:

- **Phase 5 (game) is the most a11y-rich surface on the site** — keyboard
  bindings, turn output, focus traps, timing controls. Baking a11y into
  the Phase 5 spec before it ships is materially cheaper than retrofitting
  in Phase 7.
- **The slider safety net is structural.** ADR-0007 fixed `--muted`
  contrast at refined polish; that was a point fix. The combinatorial
  state space `(density × polish × hierarchy × motion)` is currently
  enforced only at five sampled positions in `tests/e2e/a11y.spec.ts`.
  The longer that drift continues, the more existing token usage gets
  baked in around the unsafe trajectory.

## Non-goals

- AAA across the site. Focus rings happen to satisfy 2.4.13 but the
  conformance claim is AA.
- React Aria adoption beyond modals. Native `<dialog>` covers the help
  and decision-detail overlays Phase 5–7 will need.
- A signed VPAT or third-party audit. The `/accessibility` page makes a
  self-assessed conformance claim per the W3C model.
- Cognitive-accessibility rewrites or plain-language alternatives.
- Multi-language support.
- Touching the LineSlider control's enabled/disabled state in response to
  OS preferences. OS prefs win via CSS cascade; the slider thumb stays
  where the user put it.

## Design references

No new design references for this phase. Reuse:

- `design-references/README.md` — established palette, typography, and
  the section-header pattern that focus rings need to coexist with
- `design-references/screenshots/` — visual baseline for the slider
  token-tuple refactor (§2). Any visible drift needs an ADR.

## Cross-phase amendments

This spec edits three other specs as part of its delivery:

- `phase-5.md` — adds task §13 "Accessibility (non-negotiable)" with the
  game-specific patterns: turn output in `role="log"`, visible `<kbd>`
  legend, native `<dialog>` for help/confirm modals, motion-gated
  scanlines, axe gate at L-01/L-02 in idle/mid-conversation/win states.
  Adds success criterion #9 to Phase 5.
- `phase-6.md` — amends task §1 to require the same axe gate on L-03/04/05;
  adds requirement that L-04's editable-resume + fixed-user-message UI is
  rendered as a labeled `<form>`-shaped structure.
- `phase-7.md` — task §5 ("Accessibility pass") marked superseded;
  rewrites to "Verify Phase 4.5 conformance claim still holds at launch;
  re-run `bun run a11y`; refresh `last-audited` date on `/accessibility`."

These edits land in Session A so Phase 5 cannot start without them.

## Success criteria

1. `<main id="main" tabIndex={-1}>` wraps route children in
   `app/(site)/layout.tsx`. Skip link is the first focusable element on
   every page and lands focus on `<main>` when activated.
2. Route changes move focus to `<main>` (the Next.js built-in route
   announcer continues to announce the new page title).
3. Every focusable surface paints a 3px solid `var(--accent)` ring on
   `:focus-visible`, with a `prefers-contrast: more` fallback to
   `var(--focus-ring-strong)` and a `forced-colors: active` fallback to
   `CanvasText`.
4. `tests/style-tokens-contrast.test.ts` enumerates the reachable slider
   grid (step 0.1, 11⁴ = 14,641 combinations) and asserts ≥ 4.5:1 for
   `fg/bg`, `muted/bg`, `accent/bg`, `inverse-fg/inverse-bg`,
   `hit/bg`, `stretch/bg`, `miss/bg`, and ≥ 3:1 for `card-border/card-bg`.
5. JD textarea has a real `<label>` (visually hidden), `aria-describedby`
   wired to the paste-hint and char-count, and sample-JD pills are a
   labeled `<div role="group">`. The chip legend block at the bottom is
   `aria-hidden="true"` to avoid double-announce with `Chip`'s
   `aria-label`.
6. `/jd` has a single persistent `<div role="status" aria-live="polite"
   aria-atomic="false">` outside the chip grid that announces
   "Analyzing JD…" on start and the existing summary line on completion.
   Never announces per-token streams.
7. `prefers-contrast: more` swaps to a high-contrast token set via CSS
   cascade. `forced-colors: active` maps tokens to system colors (Canvas,
   CanvasText, LinkText, GrayText, Highlight) and keeps the slider deck
   operable via `forced-color-adjust: none` on its container.
8. `bun run lint` passes with Biome's a11y rule group set to error.
9. `bun run test:e2e tests/e2e/a11y.spec.ts` passes axe-core at tags
   `wcag2a wcag2aa wcag21a wcag21aa wcag22aa` on `/`, `/tone`, `/jd`,
   `/lab`, `/blog`, and the first `/blog/[slug]` — each at the five
   representative slider positions already covered, plus `/jd` after
   typing in the textarea, scoring a sample, and expanding a miss chip.
10. `bun run a11y:lhci` returns Lighthouse accessibility = 100 on `/`,
    `/jd`, `/lab` at default slider state.
11. `bun run a11y` aggregates lint + contrast test + axe e2e + Lighthouse
    and fails on any one.
12. `/accessibility` route renders, axe-clean, linked from the site
    footer.
13. ADR-0032 ("Accessibility approach") committed.
14. `docs/runbooks/a11y-manual.md` exists and the keyboard + VoiceOver +
    NVDA + 400% zoom + forced-colors checklist is signed for this
    release.
15. `docs/specs/README.md` table updated: Phase 4.5 row added, status
    Done with completion date. `phase-7.md` task §5 marked superseded.

## Tasks

The work splits into three sessions per `CLAUDE.md` session-size
discipline. Land in order; each session ends with a green tree so an
abort doesn't leave the site in a worse state.

### Session A — Foundation (~90 min, commit 1)

#### A1. Main landmark + skip link

**File:** `app/(site)/layout.tsx`
- Wrap `{children}` in `<main id="main" tabIndex={-1} className="site-main">`.
- Add `<a href="#main" className="skip-link">Skip to content</a>` as the
  first focusable child of `SiteShell`, before `<Nav>`.

**File:** `styles/globals.css`
- Add `.skip-link` (off-screen) + `.skip-link:focus-visible` (visible,
  top-left, padded, outlined). z-index above the sticky nav.
- Add `html { scroll-padding-top: clamp(3.25rem, 7vw, 4.25rem); }` for
  WCAG 2.4.11 (Focus Not Obscured Min, AA). Mirrors the existing
  per-element `scroll-margin-top` pattern.

#### A2. Focus token system + universal focus-visible

**File:** `styles/tokens.css`
- Add to `:root`:
  ```css
  --focus-ring: 3px solid var(--accent);
  --focus-offset: 3px;
  --focus-ring-strong: 3px solid #000;
  ```

**File:** `styles/globals.css`
- Add the default focus rule:
  ```css
  :where(a, button, input, select, textarea, [tabindex]):focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-offset);
  }
  @media (prefers-contrast: more) {
    :where(a, button, input, select, textarea, [tabindex]):focus-visible {
      outline: var(--focus-ring-strong);
    }
  }
  @media (forced-colors: active) {
    :where(a, button, input, select, textarea, [tabindex]):focus-visible {
      outline: 3px solid CanvasText;
    }
  }
  ```
- Audit the six existing `outline: none` sites in `globals.css` (lines
  169, 290, 667, 743, 868, 881). Each must be paired with a
  `:focus-visible` sibling rule that paints something. Two already are;
  fix the others.

#### A3. Focus-on-route component

**File (new):** `components/layout/MainFocus.tsx`
- Client component (~15 lines). Uses `usePathname()` with a `useEffect`
  that, when `pathname` changes vs a ref (skip first render, ignore
  pure-hash changes), calls
  `document.getElementById("main")?.focus({ preventScroll: false })`.
- Mounted as the first child of `<main>` in `app/(site)/layout.tsx`.

#### A4. JD label fixes

**File:** `components/jd/JDAdapter.tsx`
- Add `const labelId = useId(); const hintId = useId(); const charCountId = useId();`
- Replace placeholder-as-label with a visually-hidden `<label htmlFor={textareaId}>Paste a job description</label>`.
- `aria-describedby={`${hintId} ${charCountId}`}` on the textarea, with
  matching `id`s on the hint paragraph and the char-count span.
- Wrap the sample-JD pills in `<div role="group" aria-labelledby={sampleLabelId}>`;
  promote the existing "Sample JDs /" span to `id={sampleLabelId}`.
- Set `aria-hidden="true"` on the chip-legend `<p>` at the bottom of the
  results section (Chip already carries `aria-label` — legend repeating
  it causes double-announce).

**File:** `components/jd/Chip.tsx`
- For miss chips (toggle behaviour), add `aria-expanded={expanded}`.
- Hit/stretch chips need no change — existing `aria-label` carries
  category + content.

#### A5. Biome a11y rule group

**File:** `biome.json`
- Under `linter.rules`, add `"a11y": { "recommended": true }` and
  explicitly upgrade to `"error"`:
  - `useValidAriaProps`
  - `useAriaPropsForRole`
  - `noRedundantRoles`
  - `useKeyWithClickEvents`
  - `useFocusableInteractive`
  - `noPositiveTabindex`
  - `useAltText`
  - `useButtonType`
  - `useHeadingContent`
- Run `bun run lint:fix`; resolve any flagged Phase 0–4 code in the same
  commit. `tabIndex={-1}` on `<main>` is allowed by `noPositiveTabindex`.

#### A6. Cross-phase spec amendments

Edit `docs/specs/phase-5.md`, `docs/specs/phase-6.md`, `docs/specs/phase-7.md`
per the "Cross-phase amendments" section above. Five minutes per file.

**Commit 1 lands here:** foundation + spec amendments. Site is
landmarked, focusable, route-aware, and Biome-a11y-clean. Visual diff
is zero. The /jd live region is *not yet* added — that's Session C.

### Session B — Slider safety net (~90 min, commit 2)

Most risk-bearing session. TDD: write the test first, watch it fail,
refactor until it passes.

#### B1. Contrast snapshot Vitest (write first)

**File (new):** `tests/style-tokens-contrast.test.ts`
- Hand-roll relative-luminance + contrast (`srgbToLin → relativeLuminance → contrast`),
  ~20 lines. No new dependency.
- Enumerate the grid: `density, polish, hierarchy, motion` each stepping
  0 → 1 in 0.1 increments = 14,641 combinations.
- For each, call `stateToTokens(state)` and compute ratios for:
  `fg/bg`, `muted/bg`, `accent/bg`, `inverse-fg/inverse-bg`,
  `hit/bg`, `stretch/bg`. Aggregate failures; emit one assertion at end
  with a table of the worst-10 violations. Snapshot the per-pair
  minimum-ratio-across-grid so regressions surface as snapshot diffs.

#### B2. Token tuple refactor — **NOT NEEDED** (finding 2026-05-14)

The contrast Vitest at B1 passes against the current `lib/style-tokens.ts`
implementation. Worst-case ratio across the 14,641-state grid is
`muted/bg = 5.46:1`, a 0.96 margin above the AA floor of 4.5:1. The
free-form `mix()` interpolation introduced in Phase 1 (plus the ADR-0007
muted-endpoint fix) is provably safe across the full slider state space.

The original plan called for a pre-vetted `POLISH_STOPS` refactor to
make the safety bounded *by construction*. With the test in place,
safety is bounded *by verification* — any future edit to
`lib/style-tokens.ts` (or to the static chip semantic colors) that
drives a pair below 4.5:1 fails CI before it merges. That is the same
guarantee at a lower cost, and avoids the visual-discretisation risk
the refactor would have introduced.

**Acceptance**: B1 green on the current implementation. ADR-0032
records this finding and supersedes the planned refactor.

#### B3. OS-pref handling via CSS cascade

**File:** `styles/tokens.css`
- Existing `@media (prefers-reduced-motion: reduce)` block (line 118)
  stays. Add a parallel `@media (prefers-contrast: more)` block that
  overrides the contrast-sensitive tokens (`--bg`, `--fg`, `--muted`,
  `--accent`, `--card-border`) to the highest-contrast values from
  `POLISH_STOPS[0]` (brutalist).
- Add `@media (forced-colors: active)` block mapping tokens to system
  colors (Canvas, CanvasText, LinkText, GrayText, Highlight, Mark).
  Add `forced-color-adjust: none` to the slider deck's container class
  (`.fab-toggle`, `.fab-panel`) so the deck stays operable; let
  everything else inherit the system theme.
- LineSlider component is not touched. Slider state is preserved; the
  cascade simply wins when the OS pref is on.

#### B4. Visual diff against design references

Run the site locally; compare `/` at default and at the four corner
states against `design-references/screenshots/`. Any visible drift
beyond the slider-tuple discretisation gets called out in ADR-0032
or fixed before commit.

**Commit 2 lands here:** slider safety net green. Contrast Vitest in
CI gate. CSS cascade respects OS prefs without touching slider state.

### Session C — Live regions + CI + deliverables (~100 min, commit 3)

#### C1. JD live region

**File:** `components/jd/JDAdapter.tsx`
- Add local state `const [announce, setAnnounce] = useState("");` and
  render a single persistent `<div role="status" aria-live="polite"
  aria-atomic="false" className="sr-only">{announce}</div>` near the
  top of the component (outside any conditional).
- Set `announce` to `"Analyzing JD…"` on `handleScore` start, then to
  the existing summary text (e.g. `"7 hits, 4 stretches, 1 honest gap"`)
  on completion. Clear on reset.
- Do **not** announce per-token streams. If long match operations need
  intermediate progress, coalesce updates to at most every 2 seconds.
- The existing `<p role="alert">` for errors (line ~376) stays.

#### C2. Chip-grid list semantics

**File:** `components/jd/ChipGrid.tsx`
- Container becomes `<ul role="list">` (the explicit role defeats
  Safari's list-styling-removal heuristic). Each chip wraps in `<li>`.
- Chips themselves remain `<button>` with the existing `aria-label`.

#### C3. axe Playwright fixture

**File (new):** `tests/e2e/fixtures/axe.ts`
- Export `makeAxeBuilder(page)` returning
  `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'])`.

**File:** `tests/e2e/a11y.spec.ts`
- Refactor to use the fixture.
- Expand `ROUTES` to include `/jd`, `/lab`, `/blog`, the first
  `/blog/[slug]`. Keep `/tone` and `/`.
- Keep the existing `.include('.cv-surface')` scoping for `/`; run other
  routes unscoped.
- Add three new test cases on `/jd`: idle, after typing 20 chars in the
  textarea, after scoring the first sample, after expanding the first
  miss chip.

#### C4. Lighthouse CI

**File (new):** `lighthouserc.json`
- Collect: `/`, `/jd`, `/lab` against `http://localhost:3100`, 1 run each.
- Assert: `categories:accessibility` minScore 1.0, error level.

**File:** `package.json`
- Add `"a11y:lhci": "lhci autorun"` and `@lhci/cli` to `devDependencies`.

#### C5. Aggregate script

**File:** `package.json`
- Add:
  ```json
  "a11y": "bun run lint && bun run test -- tests/style-tokens-contrast.test.ts && bun run test:e2e -- tests/e2e/a11y.spec.ts && bun run a11y:lhci"
  ```

#### C6. ADR-0032 — Accessibility approach

Scaffold via `/adr accessibility approach`. Sections:
- **Context** — state at end of Phase 4: scattered ARIA labels, axe
  installed but unwired, ADR-0007 fixed one token pair.
- **Decision** — WCAG 2.2 AA across all pages and reachable slider
  positions. No AAA reach.
- **Slider-token clamping strategy** — references `POLISH_STOPS` in
  `lib/style-tokens.ts`. Generalises ADR-0007.
- **OS-pref strategy** — cascade wins; slider control not modified.
- **Forced-colors strategy** — system tokens; `forced-color-adjust:
  none` only on the slider deck; document the Chromium-only emulation
  constraint.
- **Screen-reader strategy** — single persistent live regions in `/jd`
  and `/game`; never per-token; visually-hidden labels.
- **Conformance claim format** — self-assessed, no signed VPAT.
- **Consequences** — wins, costs, follow-up at Phase 5/6/7.
- **Alternatives considered** — full-site AAA (rejected: default theme
  can't hit 7:1 without losing warm-cream character); React Aria
  everywhere (rejected: one modal isn't worth the weight); disable
  slider under OS prefs (rejected: cascade is simpler and preserves user
  state).

#### C7. /accessibility page

**File (new):** `app/(site)/accessibility/page.tsx` — Server Component.

Sections (typography-led, matches established design):
1. **Conformance** — "This site targets WCAG 2.2 AA across every page
   and every reachable slider position."
2. **Tested against** — axe-core in CI (axe Playwright with WCAG 2.2 AA
   tags), Lighthouse CI accessibility budget at 100, manual keyboard +
   VoiceOver/Safari + NVDA/Firefox + 400% zoom + forced-colors checks.
3. **Known limits** — explicit list:
   - At extreme slider positions, the contrast floor is 4.5:1 (AA), not
     7:1 (AAA).
   - The slider deck panel is hardcoded dark and does not re-theme. It
     is keyboard-operable and labeled but is not part of the AAA reach.
   - The game's amber-on-black terminal (Phase 5) is the dark theme by
     design; it meets AA.
4. **How to reproduce locally** — `bun run a11y`.
5. **Last audited** — hand-stamped date; updated at every `/phase-done`
   from this phase forward.
6. **Contact** — `oliver.kg2@gmail.com`.
7. Link to ADR-0032 and to the `/decisions` page.

**File:** `components/layout/Footer.tsx` — add an "Accessibility" link
next to the existing footer links.

#### C8. Manual checklist runbook

**File (new):** `docs/runbooks/a11y-manual.md`. Sections:
- Keyboard-only walkthrough × all routes
- VoiceOver + Safari pass
- NVDA + Firefox pass
- 400% browser zoom on `/` and `/jd`
- `prefers-reduced-motion` OS toggle
- Forced colors (Edge devtools emulation or Windows HCM)
- Tab order audit on `/`
- iOS Safari VoiceOver quick check on real device

Each item: pass/fail + date + tester. Run at every `/phase-done` from
Phase 4.5 onward.

#### C9. Mark phase done

Update `docs/specs/README.md` table — add Phase 4.5 row with completion
date. Update `data/tasks/2026-05-portfolio-build.yaml` if it tracks
phase status.

**Commit 3 lands here:** /jd live region wired, CI gates green, ADR +
/accessibility + manual checklist shipped. Phase done.

## Out of scope

- Live API tone generation (already out of scope; ADR-0030)
- AAA reach on contrast or focus appearance
- React Aria adoption beyond Phase 5's modal needs
- A signed third-party VPAT
- Cognitive-accessibility rewrites; plain-language alternatives
- Multi-language support
- Re-styling the slider deck panel for forced-colors beyond
  `forced-color-adjust: none`
- Touching LineSlider's enabled/disabled state in response to OS prefs

## Decisions to flag to Oliver

- **The token-tuple refactor is visually load-bearing.** B2 may produce
  small but visible discretisation steps along the polish axis compared
  to the current continuous interpolation. Visual diff against
  `design-references/screenshots/` happens before commit; any visible
  drift is called out in ADR-0032. If Oliver sees something he doesn't
  like at review time, the resolution is to add more stops, not to
  unwind the safety net.
- **`/accessibility` route placement.** Default: standalone route,
  linked from the footer (not the scrollspy). Confirm before C7 lands.
- **Lighthouse 100 vs 95.** Default: 100 on the three target routes at
  default slider state. Will fail on any single Lighthouse-flagged issue.
  Acceptable; if Lighthouse-axe divergence becomes noisy in CI, downgrade
  to 95 with a note in ADR-0032.

## Pre-flight blockers

None. All work can begin from current `main`.

## Note on cross-phase invariants

This phase honours all cross-phase invariants from `docs/specs/README.md`:

- Server Components by default; `MainFocus` is the only new Client
  Component (15 lines)
- All AI calls already go through Route Handlers — unchanged
- Cost ceiling enforced via env var — unchanged
- Design references authoritative — the only design surface this phase
  touches is the slider polish axis (B2), where any visible drift gets
  an ADR

## Workflow

- TDD on B1 (write the failing test before B2).
- Visual diff against `design-references/screenshots/` before B2 lands.
- Use `/phase-review` at the end of Session B (before Session C) and
  again at the end of Session C (before `/phase-done`). The slider
  safety net is the kind of change reviewers reliably catch issues on.
- Per `CLAUDE.md`'s session-size discipline, do **not** absorb scope
  mid-session. If a phase 5 a11y idea comes up while wiring Session A,
  defer it.
