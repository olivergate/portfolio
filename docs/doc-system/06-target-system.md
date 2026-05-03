---
title: Target Doc System
purpose: This project's target doc-system shape — authority chain, target directory layout, target agents, and drift-detection signals.
audience: agents + humans
last_verified: 2026-05-03
---

# 06 — Target Doc System

The portfolio's target doc shape is intentionally narrower than the kit's twelve-category default. The portfolio is a single-author personal site (one stack, one author, ~10 components per page) — adding doc categories that don't carry weight for this kind of project is overhead, not signal.

## 1. Target directory layout

```
docs/
  adr/              — ADRs (currently 12; ADR-0003 establishes the format)
  doc-system/       — these meta-docs
  practices/        — to be authored as domains stabilise (testing, AI infra)
  runbooks/         — to be authored as operational friction surfaces
  specs/            — phase specs (phase-0.md … phase-7.md + README.md)
  TODO.md           — deferred decisions and follow-up work
  INDEX.md          — top-level docs index
.claude/
  agents/           — doc-steward, doc-reviewer (symlinked from kit)
  commands/         — adr, phase-done, phase-review, spec, doc-sync (last symlinked)
  settings.local.json
design-references/  — authoritative visual spec (HTML/JSX prototypes + screenshots)
content/            — CV / tone source-of-truth JSON (validated by lib/schemas.ts)
```

What's deliberately *not* here (kit-default categories the portfolio omits — paths in angle-brackets are placeholder shapes, not real paths):

- **`<docs/reference/>`** — the portfolio is small enough that `CLAUDE.md` + `docs/adr/` + per-component code is the system map. A separate reference dir would duplicate code.
- **`<docs/features/>`** — same reason; the phase specs cover the same ground per shipped page.
- **`<docs/superpowers/specs/>` + `<docs/superpowers/plans/>`** — the portfolio uses `<docs/specs/phase-N.md>` as its phased planning surface. That's the time-bound-work category; no separate plans.
- **`<docs/archive/>`** — nothing has been archived yet; if archiving becomes useful, add the dir then.
- **`<prd/>`** — there's no separate PRD for a personal site; the design-references and the README are the closest equivalent.
- **`<.claude/rules/>`, `<.claude/hooks/>`, `<.claude/skills/>`** — the portfolio uses commands + agents only.

## 2. Authority chain

When docs disagree, the higher-numbered tier defers:

1. **Tests and type schemas** (Vitest, Playwright, Zod, TypeScript strict) — runtime-verifiable, top.
2. **Accepted ADRs** (`docs/adr/`) — durable decisions.
3. **Design references** (`design-references/`) — authoritative visual spec for shipped pages.
4. **Doc-system meta** (`docs/doc-system/`) — describes the doc container.
5. **Agent operating rules** (`CLAUDE.md`) — universal session rules.
6. **Phase specs** (`<docs/specs/phase-N.md>`) — intent during a phase, not after it ships.
7. **Practice docs** (when authored) — domain conventions.

When two docs at the same tier disagree, surface to Oliver — don't pick silently.

## 3. Drift-detection signals

Per category, what the steward watches for:

| Signal | Category | Action proposed |
|---|---|---|
| `last_verified` >90 days old | Any frontmatter-bearing doc | Re-read against current code; refresh date or amend |
| ADR cites a file that no longer exists at that path | ADR | Amend in place per ADR-0012's editable-tier rule |
| Phase spec marked `Done` but route doesn't render | `docs/specs/` | Surface as P0 — spec/code mismatch on a shipped phase |
| `cv.json` shape diverges from `lib/schemas.ts` | `content/` | Re-run `bun run content:validate`; surface schema gap |
| Component file mentioned in `CLAUDE.md §Where things live` doesn't exist | `CLAUDE.md` | Amend `CLAUDE.md` |
| ADR-0008 contradicted by client-side AI call | ADR | CRITICAL — propose code revert or supersede ADR-0008 |
| New `app/api/*` route without ADR + cost-log wiring | `docs/adr/` + `lib/cost-log.ts` | Surface as P0 — review ADR-0010 (cost ceiling) compliance |

## 4. Target agents

The portfolio uses two agents from the kit:

- **`doc-steward`** — proposes doc-drift fixes. Symlinked from `~/Documents/Source/retro-claude/kit/skills/doc-system/agents/doc-steward.md`.
- **`doc-reviewer`** — audits steward proposals. Symlinked from same.

No project-specific agents yet. Candidates if friction surfaces: a phase-spec-checker (cross-references shipped page against its phase spec), an ADR-amend-vs-supersede classifier (suggests tier per ADR-0012's rule of thumb).

## Why this file exists

Without an explicit target, every steward proposal makes an implicit decision about authority chain and target shape. Naming the chain means the agent can cite this file when surfacing conflicts (e.g. "the design reference and the spec disagree on the slider count; per §Authority chain, the design wins") instead of reasoning ad hoc each time.
