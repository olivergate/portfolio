# 0036 — OWASP trainer as project #5, featured via an external live deploy

- **Status:** Accepted
- **Date:** 2026-06-11
- **Deciders:** Oliver Kaikane Gate

## Context

The OWASP Top 10 Trainer (`../owasp-tester`) was built as a standalone
React/Vite app and is now deployed at https://owasp-tester.vercel.app
as its own public Vercel project, with a public GitHub repo at
github.com/olivergate/owasp-tester. ADR-0034/0035 established the
project-page pattern (a registry entry plus markdown sub-pages); the
four existing projects all link to **private** repos with an
"ask for access" note. The trainer is the first project that is both
open-source and has a working public demo.

The recruiter research behind ADR-0035 named a live, working demo as the
single highest-value signal on a project page, ahead of the repo link.

## Decision

Add `owasp-trainer` as the fifth project in `content/projects.json` and
to `cv.projectSlugs`, following the existing shape: Overview plus
Features / Technology / Philosophy sub-pages, screenshots in
`public/projects/owasp-trainer/`.

Two departures from the existing four, both driven by this project being
public and live:

1. **The first `links` entry is a "Live demo"**, pointing at the Vercel
   deployment, with a note that it runs entirely in the browser. The
   GitHub link is marked "Public repo" rather than the private
   ask-for-access note the others carry.
2. **Screenshots are captured from the live deployment**, not local
   mockups — real product UI (home, a code lab, the account page), the
   same standard TeacherHub and claude-gui screenshots meet.

No code changes: the project loaders resolve by slug, so the registry
entry and markdown are sufficient (per ADR-0034).

The trainer's own backend (email progress sync) is documented in its
ADR-0011, not here; this ADR only concerns featuring it on the
portfolio.

## Consequences

- The portfolio now has a project a reviewer can click into and *use*,
  which the four private repos can't offer. The demo link is load-tested
  by being the deploy we just shipped, so it won't be a dead link (the
  failure mode ADR-0035's research flagged hardest).
- A second public surface to keep honest: copy here makes concrete
  claims (twenty modules, two tracks, live exploit tests) that must stay
  true as the trainer evolves. Verified against the deploy on
  2026-06-11.
- The `projects[]` array is now 5 of a max 8 (`lib/retro-schemas.ts`),
  still within bounds.

## Alternatives considered

- **Embed the trainer inside the portfolio** (iframe or ported routes) —
  rejected in the approved plan: two React majors and build pipelines for
  no gain over a linked deploy.
- **Link the repo but not a demo** — wastes the project's biggest
  advantage over the others (it's the only one a stranger can run).
- **Keep it private like the others** — it's open-source by choice;
  hiding it would forfeit the public-demo signal.

## References

- ADR-0034 (project pages pipeline), ADR-0035 (tabs + private-repo links)
- owasp-tester ADR-0011 (the trainer's optional sync backend)
- `content/projects.json`, `content/cv.json`,
  `content/projects/owasp-trainer/`, `public/projects/owasp-trainer/`
- Live: https://owasp-tester.vercel.app · Repo:
  https://github.com/olivergate/owasp-tester
