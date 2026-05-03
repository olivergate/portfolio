---
title: Doc Lifecycle Patterns
purpose: When each doc category gets written, updated, or archived in this project — three lifecycle patterns covering every category.
audience: agents + humans
last_verified: 2026-05-03
---

# 03 — Lifecycle

When does each doc get written, updated, archived, or deleted? Three lifecycle **patterns** cover every category in `01-taxonomy.md`. Getting the pattern right matters more than getting the content perfect — a well-maintained rough doc outperforms a polished one that's gone stale.

---

## The three lifecycle patterns

| Pattern | Creation | Update | End-of-life |
|---------|----------|--------|-------------|
| **Evergreen** | When the convention first matters | When the convention changes | Never — superseded in place by rewrite |
| **Time-bound** | When work starts | During work only; frozen once shipped | Stays in place as historical record (portfolio is small enough that explicit archives aren't needed yet) |
| **Log** | When the log first needs to exist | Append-only as events occur | Entries deleted when resolved, doc persists |

Category → pattern:

| Category | Pattern | Why |
|----------|---------|-----|
| Agent operating rules (`CLAUDE.md`) | Evergreen | Always current; loaded every session |
| Architectural decisions (ADRs) | Two-tier (see ADR-0012) | Frozen sections (decision, rationale, alternatives, date) require a superseding ADR; amendable sections (current-state enumerations, cross-refs, factual corrections, forward spec pointers) update in place via `docs(adr): amend ADR-NNNN <what>` commits |
| Phase specs (`<docs/specs/phase-N.md>`) | Time-bound | Frozen post-ship; status table in `docs/specs/README.md` flips to `Done` |
| Practice docs (authoritative) | Evergreen | Domain wisdom accumulates |
| Practice docs (audit/snapshot) | Evergreen (rerun in place) | Snapshot is reissued, not accumulated |
| Practice docs (gap log) | Log | Appended by agents; entries removed on fix |
| Runbooks | Evergreen | Updated when the procedure itself changes |
| Harness config | Evergreen | Mirrors what agents actually do |
| Doc-system meta | Evergreen | Files are additive; the folder grows when the system itself evolves |
| TODO.md (deferred decisions) | Log | Items added when surfaced, removed when promoted to ADR/issue/spec |

ADRs deserve their own note: they are *created once, never edited in their core decision, and superseded by a successor ADR*. Structurally that's time-bound authorship with evergreen retention — the doc lives forever, the core statements it contains are frozen the moment it is accepted; current-state enumerations and cross-references update in place per ADR-0012's two-tier rule.

---

## Triggers — when each category is written or updated

### Agent operating rules (`CLAUDE.md`)

| Event | Action |
|-------|--------|
| New convention adopted | Add a line under Workflow rules / Honesty guardrails / When to stop and ask Oliver |
| Stack version bump or library swap | Update the Stack section |
| Slash command added or removed | Update the Commands section |
| Doc-system path changes | Update Where things live |
| 200-line cap exceeded | Split content: smallest-value rules out first |

Do **not** update for: a single bug fix, a one-off decision, a feature shipping.

### Architectural decisions (`docs/adr/NNNN-*.md`)

| Event | Action |
|-------|--------|
| Decision being made that will shape future work | Write a Proposed ADR before code ships |
| Team accepts the decision | Change `Status: Accepted`, set `Date:` |
| Factual detail or cross-reference in an Accepted ADR needs updating | Amend in place on a commit scoped `docs(adr): amend ADR-NNNN <what>`; `Status: Accepted` preserved |
| Decision revisited and reversed | Write a **new** ADR superseding it; mark old `Status: Superseded by NNNN`, add `Superseded by:` reference |

**Accepted ADRs have a two-tier editability policy** (see ADR-0012, `docs/adr/INDEX.md §Editability policy`). If code drifts from a frozen section, that's a new decision to make — write a new ADR. If it drifts from an amendable section, amend.

Agent rule (enforced in `CLAUDE.md`): *"Before making an architectural change, read `docs/adr/INDEX.md`. If your change would contradict an Accepted ADR, stop and surface it."*

### Phase specs (`<docs/specs/phase-N.md>`)

| Event | Action |
|-------|--------|
| Phase work begins | Spec already authored upfront in `<docs/specs/phase-N.md>` (all 8 phase specs were written at project start) |
| Mid-flight design change | Amend spec body in place with brief change note; do not delete original intent |
| Implementation diverges from spec | Capture the divergence in an ADR; do **not** rewrite the spec post-ship — the spec is intent, not record |
| Phase ships | Update `docs/specs/README.md` status table from `In progress` → `Done` with date; the `/phase-done` slash command drafts the update |
| Phase abandoned or reshaped | Note the reshape in `docs/specs/README.md` (see existing "Note on the Phase 2 reshape" section as exemplar) |

Phase specs are time-bound *intent*; the live code + ADRs are the source of truth post-ship.

### Practice docs

The three-doc pattern has three distinct lifecycles:

**Authoritative practices doc — Evergreen.**

| Event | Action |
|-------|--------|
| Philosophy or tier definition changes | Rewrite affected Part in place |
| New tier or new anti-pattern emerges | Add a new Part or anti-pattern entry |
| Tool deprecated or replaced | Update the tooling reference |
| Section renumbered | Grep for hardcoded section references in agent prompts; update them |

**Coverage/audit snapshot — Evergreen via rerun.**

| Event | Action |
|-------|--------|
| Phase of practice work completes | Manual rerun of the audit, replace contents |
| Metric changes definition | Rerun with new methodology, note the change |

**Gap log — Append-only log.**

| Event | Action |
|-------|--------|
| Agent discovers a gap during work | Append new entry. Entry must include a pointer to the test (or other artifact) guarding it |
| Gap fixed in production code | Remove entry *and* update the guarding test in the same commit |
| Gap re-emerges (regression) | New entry — do not resurrect the old one |

Pattern generalises: agents append, humans + agents resolve. Never edit past entries.

### Runbooks (`docs/runbooks/*.md`)

| Event | Action |
|-------|--------|
| New operational procedure needs documenting | Create `docs/runbooks/<procedure>.md` with `kind: runbook` frontmatter |
| Procedure itself changes | Edit the runbook in place — no archive, no supersession |
| Runbook content accretes principles and anti-patterns | Flag for promotion to a practice doc; split if hybrid |
| Referenced command or config path changes | Update the runbook body immediately — stale commands don't run |

### Harness config (`.claude/`)

| Event | Action |
|-------|--------|
| New agent ships | Create `.claude/agents/<name>.md` following 5-section template |
| Agent prompt needs tweaking based on observed failures | Edit in place — these are live config, not historical records |
| Referenced doc path changes | Grep all agent prompts for the old path, update references |
| Permissions change | Edit `settings.local.json` |

### Doc-system meta (`docs/doc-system/*.md`)

| Event | Action |
|-------|--------|
| New doc category introduced | Add row to `01-taxonomy.md` table, add `### N. <Category>` section in both `01-taxonomy.md` and `02-style-atlas.md`, add lifecycle row here, extend `06-target-system.md §2 Authority chain` if the category affects conflict resolution |
| Lifecycle pattern changes | Edit this file; cross-check every agent prompt that cites the old pattern |
| Editability policy or authority chain changes | Write or supersede the relevant ADR first (the ADR is the canonical source); then amend this file and the style atlas to match |
| Target directory layout evolves | Edit `06-target-system.md §1`; update taxonomy row if the category's location changes |

Doc-system meta files are additive — numbered `NN-<slug>.md` in authoring order. A new file is added when the system itself evolves; existing files are amended in place.

### TODO.md

| Event | Action |
|-------|--------|
| A decision is deferred without a hard deadline | Add to "Decisions deferred" with surfacing date and owner |
| A small follow-up emerges from a phase ship | Add to "Phase N.5 — follow-up work" |
| Documentation drift caught during planning | Add to "Documentation drift" with location and proposed fix |
| Item gets promoted to ADR / GitHub issue / phase spec | Remove from TODO.md (or move to "Closed" section with strikethrough) |

---

## Who updates

| Category | Update cadence | Primary author | Steward role |
|----------|----------------|----------------|--------------|
| Agent operating rules | Reactive | Oliver (with AI assistance) | Propose splits when >200 lines, flag broken references |
| Phase specs | Per phase | Oliver upfront, AI-assisted refinement during phase | Detect spec/code drift; surface for ADR or amendment |
| ADRs | Before each arch change | Oliver | Detect code patterns that contradict an Accepted ADR |
| Practice docs | Rarely | Oliver (with AI assistance for the domain) | Detect agent-discovered gaps; flag gap log orphans |
| Runbooks | Reactive | Oliver | Flag stale commands when referenced paths/versions change |
| Harness config | Reactive | Oliver | Propose updates when referenced doc paths change |
| Doc-system meta | When system evolves | Oliver | Cross-check claims against ADRs |
| TODO.md | Per session | Oliver | Surface stale items (>30 days untouched) for triage |

"Steward" here is the doc-steward agent shipped with the kit (`.claude/agents/doc-steward.md`).

---

## Freshness markers and the "last_verified" pattern

Every evergreen doc carries a `last_verified: YYYY-MM-DD` frontmatter field. This serves two purposes:

1. **Agents can assess freshness without reading git log.** An agent loading a doc can see `last_verified: <date>` and raise confidence appropriately: "this doc is N days old; cross-check claims against code."
2. **The steward has a priority queue.** Oldest `last_verified` across active docs = highest priority for re-verification.

`last_verified` is updated when a human or the steward has explicitly audited the doc against current code. It is **not** the same as "last edited" — a typo fix doesn't re-verify content.

---

## Production triggers — when /doc-sync fires

The `/doc-sync` pipeline is the production interface to the steward + reviewer agents. Triggers for the portfolio:

| Trigger | Detector | Mechanism | Required response | Path scope |
|---|---|---|---|---|
| Manual user invocation | Oliver | Types `/doc-sync <path>` or `/doc-sync <brief>` | Pipeline runs per `.claude/commands/doc-sync.md` Stages 1–9 | Whatever scope the brief names |
| Phase ships | Claude (during `/phase-done`) | The slash command notices the status table flip | Surface candidate `/doc-sync` run on adjacent docs (CLAUDE.md, ADRs, related specs); ask Oliver to confirm — do NOT auto-run | The shipped phase spec, plus any docs that referenced its in-progress state |
| `last_verified` >4 weeks stale | Claude | Frontmatter date check against today | Surface candidate, ask Oliver to confirm | The stale doc |
| ADR amendment needed | Claude (during architectural work) | Author identifies an editable-section change to an Accepted ADR per ADR-0012's editability policy | Surface candidate, ask Oliver to confirm; on apply, use commit grammar `docs(adr): amend ADR-NNNN <what>`, one commit per ADR | The single ADR being amended; cross-references in lower-authority docs follow as separate commits |
| Doc-lint failure | `bun run doc-lint` (also runnable in CI when wired) | Lint hard-fails on missing frontmatter, schema violations, broken cross-refs, AGENTS.md >200 lines, etc. | Fix the specific lint error directly when it is mechanical (a missing frontmatter field, a broken path); run `/doc-sync <path>` when the failure surfaces structural drift the steward should propose against | The file(s) lint reports |
