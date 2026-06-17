# 0039 — Home nav refresh + project-card screenshots

- **Status:** Accepted
- **Date:** 2026-06-17
- **Deciders:** Oliver Kaikane Gate

## Context

Two home-page changes shipped together, both about how projects are surfaced.

After ADR-0038 the projects appear once on the home page, in the CV's 06
Projects section, and the foot-of-page Lab section is just the featured live
demo. That left the top nav (`components/layout/ScrollSpyNav.tsx`) reading
`CV · JD · Tone · Lab | Blog` — "Lab" pointed at a section that is now only a
demo, and there was no nav affordance for the projects, the thing a recruiter
most wants to jump to.

Separately, the project cards (`components/lab/ProjectCard.tsx`, used by the 06
section and the `/lab` route) led with a coloured gradient + a glyph — a
placeholder treatment chosen before real screenshots existed. Screenshots now
exist under `public/projects/<slug>/` for four of the five projects
(`retro-claude` has none).

## Decision

**Nav.** `CV · Projects · JD · Tone | OWASP Trainer | Blog`.

- Replaced the `Lab` anchor with a `Projects` anchor (→ `#projects`). The Lab
  *section* stays on the page; it is only delisted from the nav.
- Nav order follows document order — `Projects` sits between `CV` and `JD`
  because `#projects` is the 06 section inside `#cv`, above `#jd`.
- Added an **external** `OWASP Trainer` route before `Blog`, linking to the live
  demo at `https://owasp-tester.vercel.app` (new tab, `rel="noopener
  noreferrer"`, with a small `↗` cue). Routes are now each prefixed with `|`
  (anchors keep `·`), so the route group reads as a distinct block.
- Fixed the scroll-spy IntersectionObserver to prefer the **innermost** visible
  section. `#projects` is nested inside `#cv`; the prior min-top rule always
  resolved to the enveloping `#cv`, so the `Projects` label would never light.
  The observer now skips any visible section that contains another visible
  section before picking the topmost. This avoided having to pull `#projects`
  out of `#cv` into a sibling (which would have broken the 06-before-07 reading
  order) — the approach the JD section took (see the page.tsx comment) was not
  worth the restructure here.

**Cards.** Project cards lead with a screenshot when the project has one.

- Added an optional `image { src, alt }` to the `Project` schema and populated
  it for `teacherhub`, `claude-gui`, `blob-life`, and `owasp-trainer`.
- `ProjectCard` renders a `next/image` cover hero (with the "Project / personal"
  pill over a bottom scrim, glyph dropped) when `image` is present, and falls
  back to the gradient + glyph otherwise — so `retro-claude` keeps the gradient
  until it has a screenshot.

## Consequences

- The nav gives projects a first-class jump target and pushes the public OWASP
  demo as a standalone destination; `Lab` is gone from the menu but the demo is
  still reachable by scrolling.
- The scroll-spy now bounces `CV → Projects → CV` as you scroll past the 06
  section into Outside work (07), because 07 has no anchor and Projects is a
  sub-region of CV. Acceptable; the alternative (restructuring `#cv`) costs more
  than the blemish.
- Cards look concrete instead of decorative. `next/image` optimises the
  screenshots and the `↗`/new-tab behaviour signals the external link.
- The `/lab` route's side-projects grid also gains screenshots (same component),
  which is consistent and desirable. Its e2e spec
  (`tests/e2e/lab.spec.ts`) still asserts three gradient cards — already stale
  since the fifth project landed (ADR-0036); flagged, not fixed here.
- `retro-claude` is now visually the odd one out (gradient among screenshots)
  until a screenshot is added.

## Alternatives considered

- **Keep `Lab` in the nav.** Rejected: it points at a now-thin section and there
  was no projects affordance; the user asked to swap them.
- **Make `#projects` a sibling section (like JD/Tone) for clean highlighting.**
  Rejected: it would force `#projects` and Outside work (07) out of `#cv`,
  breaking the 06-before-07 reading order and fragmenting the CV section. The
  observer tweak is smaller and localised.
- **OWASP Trainer → internal `/projects/owasp-trainer`.** Rejected by the user
  in favour of the live demo; the writeup is still reachable from the 06 card.
- **`object-fit: contain` for screenshots.** Rejected: letterboxing looks weak
  in a card grid; `cover` with `center top` keeps the heroes uniform.
- **Empty `alt` (decorative images).** Rejected: the screenshots carry real
  information; concise descriptive alts serve screen-reader users better.

## References

- ADR-0038 — projects shown once, in the CV's 06 section
- ADR-0034 — project pages pipeline (`/projects/[slug]`)
- ADR-0029 — JD matcher cites the canonical CV element
- ADR-0036 — OWASP trainer as project #5, external live deploy
- `components/layout/ScrollSpyNav.tsx`, `components/lab/ProjectCard.tsx`,
  `lib/retro-schemas.ts`, `content/projects.json`, `styles/lab.css`,
  `styles/globals.css`
