---
title: Documentation Taxonomy
purpose: Map of every doc category in this project — what kind of doc, where it lives, what distinguishes it.
audience: agents + humans
last_verified: 2026-05-03
---

# 01 — Documentation Taxonomy

The portfolio uses a deliberate subset of the kit's twelve-category default. The categories listed here are the ones actually in use; deliberately-omitted categories (canonical reference, path-scoped rules, feature behavior specs, PRDs, harness hooks, harness skills, run artifacts) are noted in `06-target-system.md §1` with the rationale.

## Active categories

| # | Category | Answers the question | Location | Load cadence |
|---|----------|---------------------|---------|--------------|
| 1 | **Agent operating rules** | "What conventions must you follow every session?" | `CLAUDE.md` (root) | Auto-loaded every session |
| 2 | **Architectural decisions (ADRs)** | "Why did we choose X over Y?" | `docs/adr/NNNN-*.md` | On-demand; consult before arch changes |
| 3 | **Phase specs** | "What is being built in phase N?" | `<docs/specs/phase-N.md>` + `README.md` | Active during the phase; archival reference after |
| 4 | **Practice docs** | "How do we do X well?" | `docs/practices/<domain>/` (none authored yet) | Loaded by domain agents on first invocation |
| 5 | **Runbooks** | "How do I run this operational procedure?" | `docs/runbooks/<procedure>.md` (none authored yet) | On-demand — when a procedure needs executing |
| 6 | **Harness config** | "What can Claude Code do in this repo?" | `.claude/agents/`, `.claude/commands/`, `.claude/settings.local.json` | Read by Claude Code runtime |
| 7 | **Doc-system meta** | "How does the doc system itself work?" | `docs/doc-system/` | On-demand — first invocation of doc agents |
| 8 | **Deferred decisions** | "What's been kicked down the road?" | `docs/TODO.md` | On-demand — periodic triage |

External-audience landing pages (`README.md`) sit outside this taxonomy — they're for humans, not agents.

The visual / content side of the project — `design-references/` and `content/` — are authoritative *artefacts*, not docs in the doc-system sense, but the doc-steward treats them as references when validating spec / ADR claims that describe shipped UI.

---

## Per-category definitions

### 1. Agent operating rules — `CLAUDE.md`

**Purpose.** Tell every agent working in this repo the rules it must follow: stack, conventions, where things live, honesty guardrails. Highest-priority surface because every session loads it.

**Shape.** One canonical `CLAUDE.md` at repo root, ≤200 lines, written to the LLM-consumer style (absolute paths, concrete commands). Sits alongside the kit's `direction.md` (referenced from `CLAUDE.md`) for collaboration-stance rules.

**Distinguishing feature.** Short, imperative, command-first, loaded every turn. Not a handbook — an operating manual.

### 2. Architectural decisions (ADRs) — `docs/adr/`

**Purpose.** Capture why a non-obvious architectural choice was made, *at the moment it was made*, so future readers (human or agent) understand the rationale without re-litigating it. Public-facing — the `/decisions` page (Phase 7) renders these for site visitors.

**Shape.** `docs/adr/NNNN-<slug>.md` in Nygard format (Status / Context / Decision / Consequences / Alternatives), with the editability policy from ADR-0012 (mirrored at `docs/adr/INDEX.md §Editability policy`). The `/adr <title>` slash command scaffolds new files.

**Distinguishing feature.** Historical and numbered sequentially. An Accepted ADR's core decision does not rot — it accumulates. Factual enumerations stay current via amendment per ADR-0012 rather than supersession.

### 3. Phase specs — `docs/specs/`

**Purpose.** In-flight design artefacts, one per build phase. Describe what gets built and how the pieces fit, before coding starts. Cross-referenced from `CLAUDE.md` workflow rules ("one phase per spec, one spec per session").

**Shape.** `<docs/specs/phase-N.md>`, indexed by `docs/specs/README.md` which holds the phase status table. The `/spec` slash command scaffolds; `/phase-done` updates status on completion.

**Distinguishing feature.** Time-bound but not archived — the portfolio is small enough that completed phase specs stay in place as historical record. The README's status table flips a phase from `Not started` → `Done` with a date when it ships. Spec text is *not* updated post-ship; the live code + ADRs are the source of truth.

### 4. Practice docs — `docs/practices/<domain>/`

**Purpose.** Encode *how we work well* in a domain — philosophy, anti-patterns, priorities. Read by domain agents on first invocation.

**Shape.** Per-domain folder following the **three-doc pattern**: an authoritative practices doc (`<DOMAIN>_BEST_PRACTICES.md`, evergreen, `authoritative: true`) + an audit/snapshot (`<DOMAIN>_COVERAGE_AUDIT.md`, point-in-time) + an append-only gap log (`PRODUCTION_GAPS_FROM_<DOMAIN>.md`). See `02-style-atlas.md §4`.

**Status.** No domains authored yet. Likely first authors: testing (e2e + visual + parity patterns), AI infrastructure (cost-log + KV cache + prompt versioning).

### 5. Runbooks — `docs/runbooks/`

**Purpose.** Step-by-step operational procedures — environment setup, common workflows. Not principles, not behavior specs.

**Shape.** `docs/runbooks/<procedure-slug>.md` with frontmatter `kind: runbook`, `title`, `status`, `date`. Body is imperative and step-numbered. See `02-style-atlas.md §5`.

**Status.** None authored yet. Likely first authors: env setup (Vercel + Anthropic + KV envs), local dev startup, ADR scaffolding workflow.

### 6. Harness config — `.claude/`

**Purpose.** Claude Code runtime assets — sub-agent prompts and slash commands. Configuration for the tool, not docs for humans.

**Shape.** `.claude/agents/<name>.md` (sub-agent prompts) and `.claude/commands/<name>.md` (slash commands). YAML frontmatter with `description` and (for commands) `argument-hint` is mandatory; `model`, `tools` apply to agents. Body is 2nd-person imperative — "You are the …".

**In use.** Symlinked from kit: `commands/doc-sync.md`, `agents/doc-steward.md`, `agents/doc-reviewer.md`. Project-local: `commands/{adr,phase-done,phase-review,spec}.md`. No hooks, skills, or path-scoped rules.

### 7. Doc-system meta — `docs/doc-system/`

**Purpose.** The meta-layer that describes the doc system itself. The doc-steward and doc-reviewer agents read these on first invocation per session. Drift here is unusually damaging because the agents take it as authoritative.

**Shape.** `docs/doc-system/NN-<slug>.md`, numbered in authoring order (01 taxonomy → 07 migration). Frontmatter: `title`, `purpose`, `audience`, `last_verified`. See `02-style-atlas.md §7`.

### 8. Deferred decisions — `docs/TODO.md`

**Purpose.** Lightweight catch-all for things that would otherwise live in head or get lost between sessions. Promote items into ADRs, GitHub issues, or phase specs once they harden.

**Shape.** Markdown file with grouped sections (deferred decisions, follow-up work per phase, documentation drift, AI infra to verify, etc.). Each item names a surfacing date and an owner.

**Distinguishing feature.** Not a backlog tool. Items are durable enough to not need a ticket but not yet stable enough to commit to a real category. When an item hardens, it leaves TODO.md (gets promoted), not the other way around.
