# 0001 — Stack: Next.js 16 (App Router) on Vercel, with Bun as the package manager

- **Status:** Accepted
- **Date:** 2026-05-02
- **Deciders:** Oliver Kaikane Gate

## Context

The site is a five-page personal CV / portfolio. It is mostly static content
(four of the five pages), with one heavily interactive page (`/`) and one
AI-backed page (`/jd`) arriving in Phase 3.

The design handoff (see `design-references/README.md`) recommends Astro on the
grounds that "each page is mostly static, and Astro's per-page JS islands match
the 'one page = one mode' structure." That recommendation is sound.

The project was scaffolded in May 2026, by which time Next.js 16 had become the
current latest stable. The Phase 0 spec ("Phase 0 — Foundations", `docs/specs`)
was written assuming Next.js 15 was current.

## Decision

Build the site on **Next.js 16 App Router** deployed to **Vercel**, with **Bun**
as the package manager and runtime for tooling scripts.

- Next.js 16, not Astro.
- Next.js 16, not Next.js 15. Pin to the current latest stable; the spec's
  "15.x assumed" is treated as superseded.
- App Router, not Pages Router.
- Bun, not pnpm or npm. (The spec assumed pnpm; the user prefers Bun.)
- Vercel for hosting and previews.

## Consequences

**Wins**

- Server Components everywhere by default. The CV content lives on the server;
  zero client JS for the CV body itself in Phase 0. Tradeoff with Astro is
  small in practice on the static pages.
- Route Handlers and Server Actions give us a clean, typed surface for the
  Phase 3+ AI calls. Astro can do this too, but Next.js's ergonomics here are
  better and well-documented.
- Familiarity. Faster to ship, lower probability of getting blocked on
  unfamiliar primitives mid-phase.
- Bun is faster than pnpm/npm for both `install` and `run`, with a
  drop-in-compatible `package.json`. Lockfile (`bun.lock`) is text — diffable
  in PRs.

**Costs we're explicitly accepting**

- A heavier client bundle on pages that don't strictly need React hydration
  (e.g. `/tone`, `/lab`'s static cards). We mitigate by keeping
  `"use client"` boundaries small — Phase 0 has zero of them.
- We pay SSR/edge-render cost on each request even where SSG would suffice.
  Mitigate via static rendering (the default for these routes; no
  `dynamic = "force-dynamic"`).
- Bun is younger than pnpm; some packages occasionally trip on it. We accept
  the small risk in exchange for the speed and tooling fit. CI will catch
  regressions early.
- Going to Next.js 16 means our training data may not match runtime behavior.
  The bundled Next.js docs in `node_modules/next/dist/docs/` are authoritative
  during Phase 0 work.

## Alternatives considered

- **Astro + Tailwind.** The design handoff's preferred option. Genuinely
  better fit for static pages. Rejected on familiarity / ergonomics for the
  interactive and AI-backed pages, and to avoid a stack switch later.
- **Next.js 15.x (the spec's assumption).** Rejected — 16.x is the current
  latest stable and there's no reason to start a fresh project on the
  previous major.
- **Remix / React Router 7.** Plausible. Rejected for the same familiarity
  reason as Astro, and weaker out-of-box static export story.
- **pnpm.** Spec default. Rejected per user preference for Bun.
- **npm / yarn.** No reason to choose them over either Bun or pnpm.

## References

- `docs/specs/phase-0.md` — phase spec this ADR documents
- `design-references/README.md` — handoff that recommended Astro
- Next.js docs (bundled): `node_modules/next/dist/docs/01-app/`
- Bun: <https://bun.sh>
