---
title: Style Atlas
purpose: Format, tone, structure, and length rules for every doc category in this project — what a well-formed doc of each kind looks like.
audience: agents + humans
last_verified: 2026-05-03
---

# 02 — Style Atlas

For each doc category in `01-taxonomy.md`, this file specifies **format, tone, structure, and length** — what a well-formed doc of that category looks like. The portfolio uses a subset of the kit's twelve categories; this atlas covers only the categories in use. doc-lint enforces the mechanically-checkable parts (frontmatter shape, ISO dates, line caps, mandatory sections); the rest is reviewer judgement.

## Cross-category rules (apply to every doc)

- **One-line purpose** at the top — under the H1 — answering "what is this and when do I read it?".
- **Frontmatter is metadata, not narrative.** If you need a paragraph, put it in the body.
- **Tables over prose** when comparing or enumerating.
- **Front-load summaries.** First sentence of any section is the headline.
- **No marketing phrasing.** "Empowers", "revolutionizes", "best-in-class" → reference docs are not landing pages.
- **Date stamps are ISO** (`YYYY-MM-DD`). doc-lint enforces this.
- **`last_verified` is honest.** Bumping the date without re-reading is worse than letting it go stale — it signals "verified" when nothing was checked.

---

## 1. Agent operating rules — `CLAUDE.md`

**Length target.** ≤200 lines. doc-lint enforces this cap (`agentsMdLineLimit` in config).

**Frontmatter.** None — `CLAUDE.md` is markdown-as-prose, not metadata-bearing.

**Tone.** Imperative, second-person, command-first. Loaded every session, so every line earns its keep.

**Structure (template).**

```markdown
# CLAUDE.md

<one-paragraph: what this project is, what stack, what's the current state>

## Collaboration direction

<reference to retro-claude kit's direction.md + practices/>

## Doc system

<one-paragraph: where docs live, how to /doc-sync, how to lint>

## Stack

<bullet list>

## Where things live

<bullet list with absolute paths>

## Workflow rules

<bullet list, imperative>

## Commands

<table or list — bun run <script>>

## Honesty guardrails (non-negotiable)

<bullet list, never relaxable>

## When to stop and ask Oliver

<bullet list of escalation triggers>
```

**Anti-patterns specific to this category.**

- "Regenerated <date>" inline notes (belong in commit messages or frontmatter, not body).
- Full feature tutorials (belong in feature or runbook docs).
- Long-form rationale (belong in ADRs).

---

## 2. Architectural decisions (ADRs) — `docs/adr/NNNN-*.md`

**Length target.** One page. ≤300 lines; typically 80–150.

**Frontmatter.** None — the portfolio uses header-level metadata (per ADR-0003). Lines 2–4 of each ADR:

```markdown
- **Status:** Proposed | Accepted | Superseded by NNNN | Deprecated
- **Date:** YYYY-MM-DD
- **Deciders:** Oliver Kaikane Gate
```

**Template.** `docs/adr/0000-template.md`. The `/adr <title>` slash command scaffolds new files.

**Tone.** Historical, factual. Past tense for context, present/future for decision and consequences.

**Structure (Nygard format).**

```markdown
# NNNN — <Title>

- **Status:** Accepted
- **Date:** YYYY-MM-DD
- **Deciders:** Oliver Kaikane Gate

## Context
<what situation prompted the decision; what forces were in play>

## Decision
<what we chose>

## Consequences
<what becomes easier, harder, newly possible, newly constrained>

## Alternatives considered
<one paragraph each>

## References
<links to specs, screenshots, related ADRs, external sources>
```

**Editability (per ADR-0012 / `docs/adr/INDEX.md §Editability policy`).** An Accepted ADR is not uniformly frozen. Two tiers:

- **Frozen** — requires a superseding ADR to change: the core decision (the X-not-Y choice), the rationale, the Alternatives-considered record, the `Date:` stamp.
- **Amendable in place** — edit on a commit scoped `docs(adr): amend ADR-NNNN <what>`, no supersession: current-state enumerations (versions, file paths, call sites, carve-outs), cross-references to other ADRs, factual corrections, forward pointers to specs that did not exist at authoring time. `Status: Accepted` does not flip on amendment — it flips only on supersession.

Rule of thumb: if the edit would change what a reader believes we chose or why, write a new ADR. If it keeps that belief intact while updating a factual detail, amend in place.

**Anti-patterns.**

- Editing a FROZEN section of an Accepted ADR in place — supersede with a new ADR instead.
- Amending in place without the `docs(adr): amend ADR-NNNN <what>` commit grammar — the grammar is the audit trail.
- Writing an ADR as a plan ("we will do X") — ADRs describe decisions, not roadmaps.
- ADRs that just say what the code does — the doc must answer *why this and not something else*.

---

## 3. Phase specs — `<docs/specs/phase-N.md>`

**Length target.** 200–500 lines per phase spec. Larger phases may run longer.

**Frontmatter.** None — phase specs are markdown-as-prose.

**Template.** Use the existing `phase-0.md` through `phase-7.md` as informal templates; the `/spec <phase>` slash command scaffolds.

**Tone.** Prescriptive and contractual when describing what gets built ("the page must…"); descriptive when stating context ("the design reference shows…").

**Structure.**

```markdown
# Phase N — <Title>

<one-paragraph: what ships in this phase>

## Goals
<bullet list — what's done at the end of the phase>

## Non-goals
<bullet list — what's deliberately deferred to later phases>

## Design reference
<link to design-references/ files this phase implements>

## Implementation order
<numbered list — typically a few "tracks">

## Testing
<what e2e/visual/parity tests this phase adds>

## ADRs likely to land
<list — actual ADRs may differ; capture both planned + emergent>
```

**Lifecycle.** Phase status lives in `docs/specs/README.md`'s table, not inline in the spec. Phases flip from `Not started` → `In progress` → `Done` with a date. The spec body is **not** rewritten post-ship — the live code + ADRs are the source of truth.

**Anti-patterns.**

- Editing a shipped spec to match the code that drifted — if the spec is wrong post-ship, write an ADR documenting the drift, don't rewrite history.
- Specs that read like ADRs (heavy on rationale, light on what gets built) — strip the rationale into an ADR.
- Specs with no Testing section — every shipped phase should add at least one e2e or unit test.

---

## 4. Practice docs — `docs/practices/<domain>/`

**Length target.** 500–1500 lines for the authoritative practices doc. Audit and gap-log docs are shorter.

**Three-doc pattern per domain.** The portfolio adopts the kit's three-doc pattern:

1. **`<DOMAIN>_BEST_PRACTICES.md`** — authoritative principles. `authoritative: true` in frontmatter.
2. **`<DOMAIN>_COVERAGE_AUDIT.md`** — point-in-time snapshot of where the project stands against the practices.
3. **`PRODUCTION_GAPS_FROM_<DOMAIN>.md`** — append-only log of gaps discovered post-ship.

**Frontmatter.** Mandatory on all three.

```yaml
---
title: <DOMAIN> — Best Practices
purpose: <one sentence>
audience: humans + agents
last_verified: <YYYY-MM-DD>
authoritative: true   # only on the practices doc
---
```

**Tone.** Prescriptive, principle-first. Each principle is a section; each section answers "what works well, what doesn't, why."

**Structure (target template).**

```markdown
# <DOMAIN> — Best Practices

## Part I — Philosophy
## Part II — The adapted framework
## Part III–N — Per-tier or per-pattern guidance
## Part (N+1) — Implementation priorities
## Part (N+2) — Anti-patterns
## Appendices
```

**Anti-patterns.**

- A practice doc with no audit doc — half the trio. Audit docs are how you know the practice doc isn't aspirational.
- An audit doc that double-edits the practice doc instead of measuring against it.
- Practice docs in `docs/runbooks/` (those are procedural, not evergreen).

---

## 5. Runbooks — `docs/runbooks/`

**Scope.** Procedural guides — environment setup, one-off tooling workarounds, repeatable manual operations. Distinct from practice docs (§4), which are evergreen principles; runbooks are operational.

**Length target.** 30–200 lines. A runbook that grows past that is probably a practice doc or a feature doc in disguise.

**Frontmatter.** Mandatory.

```yaml
---
kind: runbook
title: <Procedure name>
status: active
date: <YYYY-MM-DD>
---
```

**Structure.** Free-form but follows the procedural pattern: a one-paragraph *why this exists*, then numbered or clearly-ordered steps, then a *known symptoms / fallbacks* section. Code blocks should be copy-pasteable.

**Audience.** Humans following the steps, plus agents that need to reference the workflow.

**Anti-patterns.**

- Evergreen principles tangled into a runbook — those belong in the relevant practice doc (§4).
- Runbooks in `docs/practices/<domain>/` — the practice tree is reserved for the three-doc pattern.
- Step sequences without a *why* paragraph — readers need context to know when the runbook applies.

---

## 6. Harness config — `.claude/{agents,commands,settings.local.json}`

The portfolio uses sub-agents and slash commands; no hooks, no skills, no path-scoped rules.

### Agent definitions — `.claude/agents/<name>.md`

**Length target.** 200–600 lines.

**Frontmatter.** Mandatory.

```yaml
---
name: <identifier>              # lowercase, hyphen-separated
description: <one line>         # when to invoke, what this agent does
model: <sonnet | haiku>         # most agents use sonnet
tools: <comma-separated>        # exact tools allowed (deny by omission)
---
```

**Tone.** Second-person imperative addressing the agent itself. "You are the X. Your job is to Y."

**Structure — the 5-section template.**

1. **Role & north-star question.** One-line identity + one-line central question.
2. **Context to load.** Numbered list of files the agent must read on first invocation.
3. **Hierarchical rules.** CRITICAL / WARNING / INFO or general + tier-specific.
4. **Output format.** Exact schema for the report the agent writes to disk, plus the one-paragraph summary returned to the caller.
5. **Hard rules — non-negotiable.** Numbered list, 5–10 items.

**Anti-patterns.**

- Hardcoded section numbers in referenced docs (`Part IX`) — these drift when the doc is renumbered. Reference section titles or use anchors.
- Missing tool restrictions — agents that shouldn't edit code should not have `Edit` in `tools:`.
- Body that's narrative rather than instructional.

### Slash command definitions — `.claude/commands/<name>.md`

**Frontmatter.** Mandatory.

```yaml
---
description: <one line>
argument-hint: <hint>     # empty string "" if the command takes no arguments
---
```

**Tone.** Addresses the main session as orchestrator. "You (the main session) are…".

**Structure.** Stage-numbered: Stage 1 — understand brief, Stage 2 — plan, Stage 3 — dispatch, … Stage N — summary. Each stage specifies the exact tool calls expected.

### Settings — `.claude/settings.local.json`

The portfolio has no committed `settings.json` — only `settings.local.json` for the local permissions allowlist. Settings are user/machine-scoped and intentionally not version-controlled at the repo level.

---

## 7. Doc-system meta — `docs/doc-system/`

**Scope.** The authoritative reference for the doc system itself — taxonomy, style atlas, lifecycle, current-state audit, agentic best-practice, target system, migration plan. Consumed by the doc-steward and doc-reviewer agents on first invocation, and by humans designing or evolving the system.

**Length target.** 100–400 lines each. These are narrative documents, but "shorter is better" still applies — front-loaded summaries, tables over prose, numbered sections that can be cited as anchors from other docs.

**Frontmatter.** Mandatory. Exactly these four fields; doc-lint enforces them via the `doc-system` category and will fail on any invented key.

```yaml
---
title: <short doc name>
purpose: <one sentence — what+when to read>
audience: agents + humans
last_verified: <ISO date>
---
```

**Tone.** Third-person descriptive ("This category answers…"). Meta-reflective and explanatory.

**Structure (target template).** An H1 title matching the file name (`# 01 — Documentation Taxonomy`, `# 02 — Style Atlas`, …), a one-paragraph purpose directly under the H1, then H2 sections covering the substantive content. Files are named `NN-<slug>.md` starting at `01-`; numbering is **authoring-order** (a historical record of when each concern was introduced), not a priority ranking.

**Authority placement.** On the authority chain (see `06-target-system.md §2`), doc-system meta sits **above** `CLAUDE.md` because `CLAUDE.md` defers to it for how docs are organized, but **below** Accepted ADRs and the design reference because those govern the actual decisions and shipped UI.

**Drift signal.** Doc-system meta drift is especially damaging because the doc-steward and doc-reviewer agents cite these files as authoritative. A contradiction between a doc-system file and an Accepted ADR, or between two doc-system files, should be treated as CRITICAL by the steward.

**Anti-patterns.**

- Contradicting an Accepted ADR without naming it. ADR-0012 is the authoritative source for ADR editability policy. A doc-system file silently stating a different rule is drift, not a new idea — supersede the ADR or align the doc.
- Inventing frontmatter fields outside the four-key schema (`title`, `purpose`, `audience`, `last_verified`). Doc-lint requires exactly those keys and will fail the run.
- Omitting `last_verified` or letting it stale past 90 days without re-reading. Doc-system meta is the reference other agents consult, so freshness matters more here than in most categories.
