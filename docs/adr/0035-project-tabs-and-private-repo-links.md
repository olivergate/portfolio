# 0035 — Project pages: horizontal tabs, recruiter-shaped sections, private-repo links

- **Status:** Accepted
- **Date:** 2026-06-10
- **Deciders:** Oliver Kaikane Gate

## Context

ADR-0034 gave every project a real page and sub-routes, rendered with a
right-hand `ProjectSidebar`, but all four projects shipped as stubs:
one paragraph, an inline TODO, no links, no images. The request that
prompted this ADR: write the real copy from the actual source repos
(which sit alongside this one in `~/Documents/Source/`), surface
screenshots where the repos have them, give each project a horizontal
tab menu over sections a recruiter cares about, and link the GitHub
repos with a note that they are private.

Research on what recruiters and hiring managers read on project pages
(2024–2026 sources: NN/g on tab discoverability, hiring-manager
case-study guides, AI-hiring screening criteria) shaped the section
choices:

- Visitors mostly read the default tab; the overview must carry the
  whole pitch alone.
- "Decisions and trade-offs" content differentiates more than feature
  lists; candid limitations read as a trust signal.
- For AI roles, eval suites, cost controls, and prompt/output
  verification are the named screening criteria.
- For private repos, the accepted pattern is an evidence package
  (screenshots, write-up, explicit "ask for access") rather than a
  bare link.

## Decision

1. **Horizontal tabs over the existing sub-routes.** A `ProjectTabs`
   component replaces `ProjectSidebar`. Tabs are plain links to the
   real routes ADR-0034 created (`/projects/[slug]`,
   `/projects/[slug]/[sub]`); there is no client tab state. ADR-0034's
   rejection of `?tab=` URL state stands — this changes the
   navigation's shape, not its mechanism. Content renders full-width
   under the tab rail.

2. **Section set per project:** Overview (the index page, written to
   stand alone), Features, Technology, Philosophy. TeacherHub adds
   Evals & testing because its eval suite is the strongest hiring
   signal in the portfolio. Philosophy pages carry decisions and
   trade-offs, including unflattering ones (coverage baselines, typed
   debt), on purpose.

3. **GitHub links with a privacy note.** `ProjectLink` gains an
   optional `note` field, rendered after the link. All four repos are
   private (verified via `gh repo view`); each links with the note
   "Private repo. Ask me and I'll grant view access."

4. **Screenshots are copied into `public/projects/<slug>/`** from the
   source repos: real product UI for TeacherHub (4) and claude-gui
   (2), design mockups for BlobLife (3, captioned as mockups —
   honesty guardrail). retro-claude has no UI worth screenshotting;
   its page stays text-only. Images go through standard markdown
   `<figure>/<img>` (already permitted by the rehype-sanitize default
   schema) with plain `<img>`, not `next/image` — the markdown
   pipeline has no component mapping, the images are statically
   served, and adding one for five images is not worth the surface.

5. **Registry facts corrected against the source repos:** TeacherHub
   is Next.js 15 + GPT-4o (was "14, GPT-4, Whisper" — Whisper is
   historical); claude-gui's renderer is vanilla JavaScript, not
   TypeScript/React; retro-claude's telemetry is YAML + Supabase
   Postgres, not SQLite. These strings feed the JD matcher's evidence,
   so wrong stack claims were a live honesty bug.

## Consequences

Every project page now carries a complete case study a recruiter can
read in two to three minutes, with the AI-hiring signals (evals, cost
ceilings, verification layers) named rather than buried. The cost:
the copy makes concrete numeric claims (68 eval scenarios, 74 session
records, 101 migrations, 48 ADRs) that will drift as the source repos
move; they were verified by direct count on 2026-06-10, and updating
them is a content edit, not a code change.

`ProjectSidebar` is deleted. Sub-pages still build statically; nothing
about ADR-0034's pipeline changes.

## Alternatives considered

- **Client-side tabs on one page (`?tab=` or state).** Already
  rejected by ADR-0034; share semantics and static generation are
  worse.
- **Keep the sidebar and just add content.** The sidebar pattern
  reads as documentation, not a portfolio; a horizontal rail under the
  title is the requested and more conventional case-study shape.
- **A single "Engineering" tab instead of Technology + Philosophy.**
  Rejected: the philosophy/trade-offs material is the differentiator
  recruiters cite; merging it under a stack list buries it.

## References

- ADR-0034 — project pages pipeline (routes this builds on)
- `components/projects/ProjectTabs.tsx`, `lib/retro-schemas.ts`
- `content/projects/*/`, `public/projects/*/`
- Research synthesis in the 2026-06-10 session (NN/g tab
  discoverability; daily.dev AI-hiring screening criteria; NDA
  evidence-package pattern)
