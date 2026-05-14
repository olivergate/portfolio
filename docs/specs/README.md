# Phase plan

The site is built in eight phases. Each has a SPEC.md in this directory. One
phase per session — read the relevant spec, plan, execute, then start a fresh
session for the next phase.

| Phase | Title | Page delivered | Status | Completed |
|-------|-------|----------------|--------|-----------|
| 0 | Foundations | site shell, `/` (CV static) | Done | 2026-05-02 |
| 1 | UX style sliders | `/` (CV interactive) | Done | 2026-05-03 |
| 2 | Tone manifesto + AI infra | `/tone` | Done | 2026-05-03 |
| 2.5 | Pre-written 3-voice CV tone toggle | `/` (CV bullets) | Superseded by ADR-0030 | shipped 2026-05-03, removed 2026-05-05 |
| 3 | JD adapter | `/jd` | Done | 2026-05-03 |
| 4 | Lab + Claude Code retro demo | `/lab` | Done | 2026-05-04 |
| 4.5 | Accessibility foundation | `/accessibility` | Done | 2026-05-14 |
| 5 | Prompt-safety game scaffolding | `/game` (L-01, L-02) | Not started | — |
| 6 | Game expansion | `/game` (L-03 → L-05) | Not started | — |
| 7 | Polish | `/decisions`, `/build`, launch | Not started | — |

Update this table as phases complete. Use `/phase-done` to draft the update.

## Reading order

If you're new to the project: `CLAUDE.md` → `design-references/README.md` →
this file → the spec for the current phase → recent ADRs in `docs/adr/`.

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind, Biome, Vercel. Server
Components by default; Client Components for interactivity. The design handoff
recommended Astro; the rationale for choosing Next.js anyway lives in ADR-0001.

## Cross-phase invariants

These hold across every phase and don't get re-litigated:

- The design references are authoritative. Colors, typography, copy, and
  interactions are settled. Don't redesign without an ADR.
- JD matcher prompt is conservative-biased (Phase 3)
- Game secrets are fake and per-session (Phase 5+)
- All AI calls go through server Route Handlers; keys never reach the client
- Cost ceiling enforced via env var
- The summary line on `/jd` is text, never a percentage
- Server Components by default; `"use client"` only where needed

## Phase dependencies

- Phase 1 depends on Phase 0's design tokens being in place
- Phase 2 establishes the AI infrastructure (KV cache, cost log, prompt versioning)
  but doesn't make live AI calls — the manifesto page is pre-written content
- Phase 3 is the first phase to actually call the API — uses Phase 2's infrastructure
- Phases 4–6 are independent of each other but assume Phase 0's page shells
- Phase 7 depends on everything else

## Note on the Phase 2 reshape

An earlier version of these specs had Phase 2 as a live tone toggle (Pessimistic /
Honest / Absurd) that called the API to rewrite CV bullets in real time. The design
exploration in claude.ai produced something different and better: a separate page
(`/tone`) presenting Oliver's voice and values as 14 numbered tenets in two voices
side-by-side — formal vs how Oliver actually thinks, both pre-written.

This is simpler (no live AI), more honest (Oliver writes both voices himself), and
more interesting as a portfolio piece. Phase 2 has been reshaped accordingly. The
AI infrastructure originally built in Phase 2 is still built in Phase 2 — it's
just used for the first time in Phase 3.
