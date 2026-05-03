# CLAUDE.md

Persistent context for this project. Kept short on purpose — pointers, not copies.

## Collaboration direction

This project follows the retro-claude kit's collaboration direction. See:

- `~/Documents/Source/retro-claude/kit/direction.md` — two stance rules (probe before dispatch; surface alternatives, don't pick silently).
- `~/Documents/Source/retro-claude/kit/practices/` — operational rules (output verification, fanout provenance, input verification).

These rules apply to all agent work in this repo unless explicitly overridden in a per-task brief.

## Doc system

Doc-system meta lives in `docs/doc-system/01-taxonomy.md` (and 02–07). The system was bootstrapped from the retro-claude kit on 2026-05-03 — `06-target-system.md` and `07-migration.md` carry portfolio-specific content; `04-current-state-audit.md` is still a kit-shipped placeholder to fill in when worth the time. ADR editability follows the two-tier policy in ADR-0012; the `/doc-sync` slash command and `doc-steward` / `doc-reviewer` sub-agents are available via `.claude/`. Run `bun run doc-lint` (or `bun run doc-lint:changed`) before pushing doc-touching commits.

## What this is

A personal CV site for Oliver Kaikane Gate that doubles as a portfolio of AI-native product
thinking. Built phased — see `docs/specs/` for the per-phase plan. Currently in Phase 0.

The site is **five pages**, each in a different rhetorical mode:

| Route | Phase | Purpose |
|---|---|---|
| `/` | 0–1 | Main CV with four UX style sliders that retheme the page live |
| `/tone` | 2 | Voice & values manifesto — 14 tenets in two voices side-by-side |
| `/jd` | 3 | JD adapter — paste a JD, get hit/stretch/miss chips against the CV |
| `/lab` | 4 | Things being built with LLMs — featured Claude Code retro demo + 3 cards |
| `/game` | 5–6 | Playable prompt-safety game teaching OWASP LLM Top 10 attacks |

Plus two meta pages introduced in Phase 7: `/decisions` (ADR log) and `/build` (process story).

The build process is itself a feature: ADRs are public, the build page tells the story.

## Stack

**Next.js 16 App Router** + TypeScript (strict, `noUncheckedIndexedAccess`) + Tailwind v4 +
Biome + Vitest + Playwright (Phase 1+) + Vercel + Anthropic API (server-side only, via Route
Handlers and Server Actions). Zod for runtime schemas. nuqs for URL state.

**Package manager: Bun** (`bun install`, `bun run <script>`). The phase specs were drafted
assuming pnpm; treat that as superseded.
Three fonts: Fraunces (display), Inter (body), JetBrains Mono (kickers, terminal) — loaded
via `next/font/google`.

The design handoff recommended Astro for its lighter MPA model on mostly-static pages.
We chose Next.js anyway — see ADR-0001 for the rationale. The pattern: Server Components
by default, Client Components only where state or browser APIs are needed.

## Design references

The full visual design has been mocked up as HTML/JSX prototypes and lives at
`design-references/`. Key files:

- `design-references/README.md` — design system summary, token list, per-page details
- `design-references/design-tokens.css` — consolidated CSS variables (port directly into
  the project's global stylesheet)
- `design-references/screenshots/` — five PNGs, one per page, used as visual acceptance
  criteria
- `design-references/source/` — HTML/JSX prototypes (NOT to be copied verbatim — they
  use Babel-in-browser and Tailwind CDN; port to Next.js idiom)

**Treat the design as authoritative.** Colors, typography, copy, spacing, and interactions
in the design are real and must be recreated faithfully. The screenshots are acceptance
criteria — phases aren't done until the running site matches them visually. Do not relitigate
design decisions the design has already settled (palette, fonts, section-header
pattern, slider deck visual treatment, etc.).

## Where things live

- CV/project content: `content/*.json` (validated by `lib/schemas.ts`)
- Style tokens: `styles/tokens.css` (ported from `design-references/design-tokens.css`)
- Slider state mapping: `lib/style-tokens.ts`
- ADRs: `docs/adr/NNNN-slug.md` — see `docs/adr/0000-template.md`
- Per-phase specs: `docs/specs/phase-N.md`
- AI prompt templates: `docs/prompts/` (versioned, Phase 3+)
- Pages and route handlers: `app/(site)/*` and `app/api/*`
- Components: `components/{cv,controls,tone,jd,lab,game,layout,ui}/`

## Workflow rules

- **One phase per spec, one spec per session.** Read `docs/specs/phase-N.md`, then execute.
- **Read the design references for the current phase before coding.** Each spec lists the
  relevant artifacts and screenshots.
- **Write an ADR for any decision a future reader might question.** Use `/adr <title>` to
  scaffold. ADRs are public and part of the deliverable.
- **Plan mode for non-trivial work.** Shift+Tab twice, agree the plan, then execute.
- **Fresh sessions are cheap; degraded context is expensive.** Start a new session per phase.
- **Session-size discipline.** One phase per session is the default. When the user adds
  scope mid-session (a refactor, a UI fix, a doc-sync run, a related-but-distinct task),
  do not silently absorb it. Offer the deferral: *"This is mid-stream scope addition —
  want to commit what's here and start a fresh session, or fold it in?"* The cost of
  asking is one short message. Phase 3 (turn 6) ran 285 minutes with three undeferred
  scope additions and was rated 2/5 specifically because of session size, not output
  quality. Especially for sessions running >120 minutes or after >2 distinct sub-agent
  dispatch waves: the bias should be deferral, not absorption.
- **Don't fight the linter.** Biome auto-fixes. Fix the code, not the rule.
- **Visual diffs against screenshots.** Before declaring a phase done, compare the running
  site to `design-references/screenshots/` for that page. Note any intentional deviation
  in an ADR.

## Commands

- `bun run dev` — local dev (Next.js)
- `bun run build` — production build (run before declaring a phase done)
- `bun run test` — Vitest unit tests
- `bun run test:e2e` — Playwright (Phase 1+, when slider tests exist)
- `bun run typecheck` — `tsc --noEmit`
- `bun run lint` — Biome (`bun run lint:fix` to autofix)
- `bun run content:validate` — Zod-validate `content/cv.json`

## Coding conventions

- **Server Components by default.** Add `"use client"` only when the component needs state,
  browser APIs, or event handlers. Keep client boundaries small.
- All AI calls go through Route Handlers in `app/api/*`. Never expose API keys to the client.
- All AI calls log usage to the cost table — see `lib/cost-log.ts` (Phase 2+).
- Cache aggressively. Anything keyed on (input + prompt-version) belongs in Vercel KV.
- Style via design tokens (CSS custom properties from `tokens.css`) + Tailwind utilities.
  Avoid inline `style` except for token overrides driven by slider state.
- Use `next/font/google` for all fonts (no external CSS imports for fonts).
- Use `next/image` for any raster images (rare on this site — most visuals are CSS).
- Route data with `nuqs` for URL-as-state where applicable (Phase 1 sliders).

## Honesty guardrails (non-negotiable)

These exist because the site makes claims about Oliver's experience. Don't relax them.

- JD matcher prompt is biased conservative — prefer Stretch over Hit
- The summary line is text, never a percentage ("7 hits, 4 stretches, 1 honest gap")
- Game secrets are always fake, regenerated per session
- Game tools are simulated; no real side effects from any user input
- API key never reaches the client
- Cost ceiling enforced via env var; route returns 429 + cached fallback when hit

## When to stop and ask Oliver

- Anything that costs money outside the planned API budget
- Decisions about CV content (don't fabricate experience)
- Decisions about visual design that diverge from the design references — the design
  is locked in; deviations need explicit approval and an ADR
- Architectural forks not anticipated in the spec — draft an ADR with both options and ask

## Content edits

`content/cv.json` is the source of truth for all CV data. The markdown in
`source/oliver_cv_draft.md` is a human-readable version for editing — when it changes,
regenerate `cv.json` and re-run `bun run content:validate`.

## Useful pointers

- ADR format: `docs/adr/0000-template.md`, `docs/adr/0003-adr-format.md`
- Stack rationale: `docs/adr/0001-stack.md`
- Design system rationale: `docs/adr/0002-design-system.md`
- Phase plan overview: `docs/specs/README.md`
