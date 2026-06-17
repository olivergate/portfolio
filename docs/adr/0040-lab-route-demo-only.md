# 0040 — /lab route is demo-only; projects live solely in section 06

- **Status:** Accepted
- **Date:** 2026-06-17
- **Deciders:** Oliver Kaikane Gate

## Context

ADR-0038 removed the duplicated projects grid from the home page but kept the
standalone `/lab` route unchanged — "it keeps its own featured demo + full
side-projects grid." Since then, ADR-0039 dropped "Lab" from the nav (so `/lab`
is no longer linked from the site chrome) and pointed projects at the CV's 06
Projects section, and the `/lab` hero was rewritten to frame the page as a single
thing: the **Retro Claude** demo.

With that hero, the "02 Side projects" grid still sitting below the demo on
`/lab` was incongruous — it re-introduced the project list the rest of the site
had just consolidated into section 06.

## Decision

`/lab` is now demo-only. Removed the side-projects `<section>` (and the
`ProjectCard` import + `labProjects` filter) from `app/(site)/lab/page.tsx`,
leaving the hero + the featured `RetroDemo`. The meta description was rewritten
to describe only the demo.

This reverses the "/lab keeps its grid" consequence of ADR-0038. Projects now
appear in exactly one place: the CV's 06 Projects section.

## Consequences

- `/lab` reads as one coherent page (the Retro Claude demo) rather than a
  demo-plus-projects hub.
- Projects have a single home (section 06), matching the dedup intent of
  ADR-0038 — now extended to the standalone route too.
- `ProjectCard` is still used by section 06; only `/lab` stopped rendering it.
- `tests/e2e/lab.spec.ts` was updated: it no longer asserts a side-projects grid
  and checks the new "Retro Claude / Demo" hero.
- `/lab` is reachable by direct URL and via the sitemap but is unlinked from the
  nav (ADR-0039); that is unchanged here.

## Alternatives considered

- **Keep the grid (status quo per ADR-0038).** Rejected: it contradicts the new
  single-demo hero and re-duplicates section 06.
- **Hide the grid with CSS / a flag.** Rejected: dead markup is worse than
  removal; the data still drives section 06.
- **Redirect `/lab` to the home `#lab` demo section.** Rejected for now — the
  route hosts a fuller demo writeup and the user edited it as a standalone page.

## References

- ADR-0038 — projects shown once, in the CV's 06 section (the consequence this
  reverses)
- ADR-0039 — nav refresh (Lab delisted) + project-card screenshots
- `app/(site)/lab/page.tsx`, `tests/e2e/lab.spec.ts`
