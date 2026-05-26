# 0034 — Project pages pipeline (unified projects list + markdown bodies)

- **Status:** Accepted
- **Date:** 2026-05-26
- **Deciders:** Oliver Kaikane Gate

## Context

Two surfaces on the site listed projects with two different taxonomies:

- `content/cv.json projects[]` (six entries: claude-code-harness,
  portfolio-site, teacherhub, habit-forming-app, retro-gui-app,
  movement-app) drove the Projects section at the bottom of `/`,
  rendered as plain cards with no links.
- `content/projects.json secondary[]` (three entries: language, habit,
  movement) drove the linkout cards on `/lab`, with `ctaUrl` set to
  anchor hashes (`#language-writeup`, `#habit-testflight`,
  `#movement-writeup`) that didn't lead anywhere.

There was no project landing page. Hover a card on either surface and
you got the same dead end: a blurb and nothing to click. The JD matcher
prompt feeds CV projects to the LLM via cite IDs like
`project:habit-forming-app`, but that contract referenced
the cv.json side only, so the lab cards weren't part of the same
identity space.

The request: every project should have a URL pointing at a real page
that describes it, and projects with deeper material (features,
videos, write-ups) should offer sub-routes accessible from a sidebar.

## Decision

**One canonical list, separate routes, markdown bodies.**

1. **Single source of truth.** `content/projects.json` carries the
   project registry. The `featured` field stays (it drives the live
   RetroDemo on `/lab` and is structurally different — embedded
   transcripts, not a linked page). `secondary[]` is replaced by
   `projects[]` of a new shape: `slug`, `title`, `summary`, `stack`,
   `techPills`, optional `glyph`/`gradient`/`hero`/`links[]`,
   `subPages[]` (default empty), and `showOn { cv, lab }` controlling
   which surfaces include the project.

2. **CV stops storing project data.** `cv.json projects[]` is replaced
   by `cv.projectSlugs[]` — an ordered list of slugs referencing the
   canonical registry. The CV Projects component resolves each slug
   via `getProjects()`. `lib/jd-prompts.ts` and `lib/cv-evidence.ts`
   resolve the same way, and `project:<slug>` cite IDs continue to
   point at the canonical record.

3. **Routes.** `/projects/[slug]/page.tsx` renders the project's
   `index.md` body. `/projects/[slug]/[sub]/page.tsx` renders a
   sub-page's `<sub>.md` body. Both are statically generated via
   `generateStaticParams` from the registry. The
   `ProjectSidebar` component is rendered only when `subPages.length
   > 0`; projects with just an overview render full-width.

4. **Markdown bodies.** Each project page lives in
   `content/projects/<slug>/index.md`; each sub-page lives in
   `content/projects/<slug>/<sub>.md`. The bodies are processed
   through the same pipeline ADR-0033 wired up for blog posts
   (gray-matter → remark + remark-gfm → rehype-raw → rehype-sanitize
   with the SVG allowlist → react-markdown), so figures, code, and
   pull quotes work the same way they do in posts. No new sanitiser
   surface.

5. **Migration.** Four canonical projects are recognised at landing
   time: `teacherhub`, `claude-gui`, `blob-life`, `retro-claude`.
   The previous `portfolio-site` and `movement-app` cv.json entries
   are dropped — the user's explicit project list is the four named
   above, and the unification keeps that exact set.

## Consequences

**Wins.** One taxonomy. JD cite IDs are stable across the unification
(slugs were chosen to match the names the author has been using in
prose). Project pages get the same prose ergonomics as blog posts.
Adding a feature page to a project is a markdown file plus one entry
in `subPages[]`.

**Costs.** The unification touches several call sites: CV component,
LabSection, ProjectCard, jd-prompts, cv-evidence, the validator. The
existing dead anchors (`#language-writeup` etc.) disappear; if any
external page linked to those they 404. (None known.) Two cv.json
project ids change: `habit-forming-app` → `blob-life`,
`retro-gui-app` → `claude-gui`, `claude-code-harness` → `retro-claude`.
The LLM-emitted cite IDs in any cached jd-match responses would no
longer resolve, but JD match results aren't persisted, so this is
zero-impact.

**Scope creep guard.** This ADR does not promise: inline project-
mention linking inside CV bullet prose (would need a tokenisation
step), per-project comments, video transcripts, or the four projects
having real content beyond a stub paragraph. Each of those is its
own decision.

## Alternatives considered

- **Keep two taxonomies; just add links.** Add a `slug` field to cv.json
  projects so each card links to a new project page; leave projects.json
  secondary[] alone. Rejected: keeps the dual identity problem; "habit"
  and "habit-forming-app" continue to refer to the same project under
  different ids.

- **In-page sections with sidebar anchors instead of sub-routes.**
  `/projects/[slug]` is the whole project; the sidebar links jump to
  `<section id=...>` anchors. Rejected: longer pages get unwieldy fast,
  and child pages let projects grow without inflating the parent route's
  build size or scroll depth.

- **Tabs inside one project page (`?tab=features`).** Rejected: tab state
  in URL fragments has worse share semantics than real routes, and the
  static-generation story for tabbed content is awkward in App Router.

- **MDX instead of remark + react-markdown.** Rejected for the same
  reason ADR-0033 rejected it: the page bodies are prose with occasional
  figures, not component compositions. Revisit if a project needs an
  interactive demo embedded in its description.

## References

- ADR-0033 — Blog markdown pipeline (the sanitiser and reader this
  reuses)
- `content/projects.json`, `content/cv.json` — pre-change content
- `lib/retro-schemas.ts`, `lib/schemas.ts` — schemas updated by this
  change
- `lib/jd-prompts.ts`, `lib/cv-evidence.ts` — JD matcher integration
  with the projects list
- `app/(site)/lab/page.tsx`, `components/cv/Projects.tsx` — surfaces
  whose card links change
