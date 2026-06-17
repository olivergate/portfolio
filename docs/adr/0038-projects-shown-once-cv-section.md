# 0038 — Projects shown once, in the CV's 06 section

- **Status:** Accepted
- **Date:** 2026-06-17
- **Deciders:** Oliver Kaikane Gate

## Context

After the single-page consolidation (ADR-0028) the home page rendered the same
five projects twice: once in the CV's `06 Projects` section
(`components/cv/Projects.tsx`, plain `cv-card` markup) and again at the foot of
the page in the Lab section's "Side projects" grid
(`components/lab/LabSection.tsx`, the richer gradient `lab-card` treatment from
`components/lab/ProjectCard.tsx`). Both grids resolved from the same data — the
CV's `projectSlugs` and the projects whose `showOn.lab` is true are the same set
— and both linked to the same `/projects/[slug]` pages. A visitor scrolling the
home page met the project list, then met it again a screen later.

The CV's 06 cards also carried the `data-project-id` attributes that the JD
matcher scrolls to and pulses when a project-citation chip is clicked
(ADR-0029); the Lab grid did not.

## Decision

Show the projects once on the home page, in the 06 section, using the gradient
`ProjectCard` treatment; drop the duplicate grid from the home Lab section.

- `components/cv/Projects.tsx` now renders `ProjectCard` (the gradient hero +
  glyph + tech-pills card) inside `cv-projects-grid`, replacing the plain
  `cv-card` markup.
- `ProjectCard` gained two opt-in props: `citeTarget` (renders
  `data-project-id` so the JD matcher keeps working) and `reveal` (renders
  `data-reveal` for the scroll-reveal animation). Only the 06 section sets them.
- The grid stays `cv-projects-grid` rather than the Lab's `lab-secondary-grid`,
  so the density slider's `--proj-cols` keeps driving its column count.
- `components/lab/LabSection.tsx` (home page) now shows only the featured live
  demo; its "Side projects" sub-section was removed and the hero copy updated so
  it no longer points at projects "below".

The standalone `/lab` route (`app/(site)/lab/page.tsx`) is unchanged — it keeps
its own featured demo + full side-projects grid.

## Consequences

- The home page lists the projects exactly once, and they keep the more
  distinctive gradient-card look rather than the plainer CV cards.
- JD project-citation chips still resolve, because `data-project-id` moved onto
  the new cards via `citeTarget`. `data-bullet-id` role citations are unaffected.
- The home Lab section is now "featured demo only". Its purpose narrows to
  showcasing the one interactive demo; the full project list lives in 06 (home)
  and on `/lab`.
- `ProjectCard` is now shared by three surfaces (home 06, home Lab via /lab, and
  the `/lab` route). The two new props are off by default, so /lab behaviour is
  byte-for-byte unchanged.
- The print CV (`components/cv/ProjectsPrint.tsx`) was deliberately left alone —
  the PDF wants plain cards, not gradient heroes.

## Alternatives considered

- **Do nothing (keep both grids).** Rejected: the duplication is the problem
  being fixed.
- **Keep the plain CV cards in 06, just delete the Lab grid.** Smaller diff, but
  the user preferred the gradient treatment as the single surviving presentation.
- **Drop the 06 section entirely and keep projects only in the Lab section.**
  Rejected: it would have moved `data-project-id` onto the Lab cards and pulled
  the project list out of the CV reading order, where a recruiter expects it.
- **Switch 06 to `lab-secondary-grid` for an exact visual match with the old Lab
  grid.** Rejected: that grid is `auto-fit` and ignores the density slider;
  keeping `cv-projects-grid` preserves the slider-deck feature on this grid.

## References

- ADR-0028 — single-page consolidation
- ADR-0029 — JD matcher cites the canonical CV element (no duplicate CV)
- ADR-0024 — linkout cards, not embedded screens
- ADR-0034 — project pages pipeline (`/projects/[slug]`)
- `components/cv/Projects.tsx`, `components/lab/ProjectCard.tsx`,
  `components/lab/LabSection.tsx`
