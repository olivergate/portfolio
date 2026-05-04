# 0029 — JD adapter no longer renders a duplicate CV

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Oliver Kaikane Gate

## Context

Through Phase 3, the JD adapter rendered a `<JDExperience />` block beneath
the chip grid that re-rendered every role and project from `cv.json`, with
cited bullets given an accent left-border and pulse animation on chip click.
This was useful when JD lived on its own route (`/jd`) — the visitor pasting
a JD wouldn't otherwise see the CV alongside the chips.

After ADR-0028 collapsed routes onto a single page, the JD adapter sits on
the same scroll as the canonical CV. The duplicate block became a literal
re-iteration of content already on the page, which the user flagged: the
JD adapter "should not re-iterate the CV. When you click for evidence it
should go to that part of the actual CV."

ADR-0027 already removed the bullet-reorder feature — the only visual
operation the duplicate uniquely provided. With reorder gone, the duplicate
exists only to host cited-bullet markers and the pulse animation; both
can be driven against the canonical CV directly.

## Decision

Delete `<JDExperience />` outright. Move `<JDSection />` from a top-level
`<section id="jd">` into the CV section flow, placed after `<Avocations />`
(Outside work, kicker 08). Wrap the JD adapter in `<div id="jd">` so the
spy nav still has an anchor target.

Chip click resolution:

- The JD chip-click handler in `JDAdapter.onActivate` already uses
  `document.querySelector('[data-bullet-id="..."]')` and
  `[data-project-id="..."]` to find the target element. Previously those
  attributes lived only on the `<JDExperience />` duplicate.
- Add the same attributes to the canonical CV components:
  `components/cv/Experience.tsx` (each bullet `<li>` gets
  `data-bullet-id={bullet.id}`),
  `components/cv/Projects.tsx` (each project `<article>` gets
  `data-project-id={project.id}`).
- The selector now resolves to the canonical CV element. `scrollIntoView`
  + `scroll-margin-top` (from a sibling commit) lands the bullet
  underneath the sticky nav.

Pulse implementation:

- The previous pattern threaded a `pulseId` React state from `JDAdapter`
  into `<JDExperience />` so the matched bullet's render added a
  `bullet-pulse` class.
- The simpler pattern (no JD context provider, no `pulseId` state, no
  prop drilling) is to add `bullet-pulse` directly to the queried element
  via `el.classList.add(...)`, set a 1700ms `setTimeout`, and remove on
  cleanup. A `pulseElRef` tracks the currently pulsing element so
  back-to-back chip clicks clear cleanly.
- Component unmount also clears the lingering class — the only other
  shutdown path that needs handling.

The cited-bullet *border* (a persistent accent-left-border on bullets
referenced by chips, present in `<JDExperience />`) is **not** ported to
the canonical CV. Keeping persistent visual marks would require a JD
context provider feeding cited-bullet IDs to `Experience` / `Projects`,
which couples otherwise-independent components. The user's brief was to
*navigate* to evidence, not to *paint* the CV with overlay state.

## Consequences

**Wins:**
- One canonical place to render each role/bullet/project. Less code, no
  drift between CV and JD-side renderings.
- `<JDExperience />` deleted (the file plus the `useMemo` wiring in
  JDAdapter and the `cv` prop that was only used to feed it). About
  330 lines net.
- The visitor's mental model is simpler — chips link to evidence in the
  CV they were already reading, instead of revealing a parallel CV.
- DOM has unique `[data-bullet-id]` selectors after the delete; click
  resolution is unambiguous.

**Costs:**
- Persistent cited-bullet markers (the accent left-border) are gone.
  The cited-state is only visible at click-time (via pulse). For a
  visitor wanting a quick "what did the chips cite overall?" overview,
  the chip grid itself is the answer.
- Pulse is now imperative DOM (`classList.add/remove`) instead of
  declarative React state. The unmount cleanup path has to manually
  remove the class. This is acceptable because: (a) the pulse is
  decorative, (b) the timer ref already had imperative cleanup, (c)
  no other component reads pulse state.

**Deliberately not done:**
- No JD context provider. Components stay independent.
- No persistent cited-state on canonical CV bullets.
- No change to chip rendering or sample-JD content. Cite IDs unchanged.

## Alternatives considered

- **Keep the duplicate, hide it behind a toggle.** Same code, same
  re-iteration; the toggle just lets the visitor opt out. Rejected —
  doesn't address "should not re-iterate the CV."
- **Lift cite state to a JDProvider context.** Would let canonical CV
  components read cited-bullet IDs and apply persistent borders.
  Rejected for now — simplest design that meets the brief is to drop
  the persistent overlay; can be re-added later if missed.
- **Render cited markers via CSS-only attribute selectors.** Could
  hypothetically attach `data-cited-by` attributes to bullets at SSR
  time when sample JDs are pre-baked, but breaks for live JDs and adds
  build-time complexity for negligible gain.

## References

- Honesty chain: ADR-0017 (stretch slider semantics), ADR-0018 (no
  match percentage), ADR-0027 (bullet reorder removed).
- Single-page consolidation that motivated this: ADR-0028.
- Sticky-nav scroll offset (sibling commit): adds `scroll-margin-top`
  so chip-cite jumps clear the spy nav.
