---
title: Doc-System Migration Plan
purpose: Record of how this project adopted the retro-claude doc-system kit, plus the open follow-ups still to land.
audience: humans + agents
last_verified: 2026-05-03
---

# 07 — Migration Plan

This project bootstrapped the retro-claude doc-system kit on **2026-05-03**, during a session that doubled as the kit's first dogfood install. This file records what landed, what was reframed for the portfolio's pre-existing conventions, and what remains.

## What landed on bootstrap (2026-05-03)

- **ADRs.** ADR-0012 (`docs/adr/0012-adr-editability-tiers.md`) adopted the two-tier (frozen / amendable-in-place) editability doctrine, refining ADR-0003's stricter "don't edit accepted ADRs" rule. ADR-0001 through ADR-0011 already existed and were not touched. `docs/adr/INDEX.md` was authored in full from the existing ADR set.
- **Doc-system meta.** `docs/doc-system/01-taxonomy.md` through `07-migration.md` copied from the kit and adapted to the portfolio's path conventions (`docs/adr/` rather than the kit's default `<docs/decisions/>`; ADR-0012 rather than ADR-0001 for editability references). `04-current-state-audit.md`, `06-target-system.md`, and this file were rewritten with portfolio-specific content; `01-taxonomy.md`, `02-style-atlas.md`, `03-lifecycle.md`, and `05-agentic-best-practice.md` were edited to drop categories the portfolio doesn't use (kit-default `<docs/reference/>`, `<docs/superpowers/>`, `<docs/archive/>`, `<.claude/rules/>`, `<.claude/hooks/>`, `<.claude/skills/>`, `<.claude/test-runs/>`).
- **Practice and runbook scaffolding.** `docs/practices/` and `docs/runbooks/` were created with INDEX + template files; no domains have been authored yet.
- **Top-level docs index.** `docs/INDEX.md` describes the actual portfolio doc shape (six categories, not the kit's twelve).
- **doc-system skill.** `/doc-sync` slash-command + `doc-steward` and `doc-reviewer` sub-agents wired via symlinks at `.claude/commands/doc-sync.md`, `.claude/agents/doc-steward.md`, `.claude/agents/doc-reviewer.md`. Symlinks point at the kit, so kit improvements propagate automatically.
- **doc-lint.** Copied to `tools/doc-lint/`, with `doc-lint.config.json` tailored to the portfolio's actual root directories (`app/`, `components/`, `lib/`, `content/`, `design-references/`, `styles/`, `tests/`, `scripts/`). Wired as `bun run doc-lint` and `bun run doc-lint:changed` in `package.json`.
- **Collaboration direction.** `CLAUDE.md` references `~/Documents/Source/retro-claude/kit/direction.md` and `kit/practices/` — the kit's two-rule stance and three operational practices apply here.

## What's deferred

- **Pre-commit / CI doc-lint.** The script runs on demand; not yet wired as a Husky hook or GitHub Actions check. Consider once a doc-touching commit lands without `bun run doc-lint` first.
- **Practice docs for testing and AI-infrastructure.** The portfolio has substantive testing patterns (e2e + visual + parity tests) and AI-infra patterns (cost-log + KV cache + prompt versioning) that warrant authoritative practice docs once they stabilise. Bootstrap deferred — no domain author authored on day one.
- **Runbooks.** None authored yet. Candidates: env setup (Vercel + Anthropic + KV), local dev startup, ADR scaffolding workflow. Author as friction surfaces.

## What stays hard (workflow obligations)

The bootstrap produced the *capacity* for a healthy doc system. Sustaining it is downstream work:

- **`last_verified` updates** require honest re-reading of the doc against current code. A bumped date without a real audit is worse than a stale date.
- **ADR amendment grammar** (`docs(adr): amend ADR-NNNN <what>`) requires the author to choose tier per amendment, per ADR-0012's two-tier rule. When in doubt, supersede.
- **`/doc-sync` triggers.** Run when a feature ships, when an ADR is amended, when a phase completes — not on a schedule. The trigger conditions live in `03-lifecycle.md §Production triggers`.
