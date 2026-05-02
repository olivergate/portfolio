# 0003 — ADR format and the public /decisions page

- **Status:** Accepted
- **Date:** 2026-05-02
- **Deciders:** Oliver Kaikane Gate

## Context

This is a personal site. Personal sites typically don't have ADRs — the
overhead of writing one usually outweighs the value. That heuristic doesn't
hold here, for two reasons:

1. The project is itself a portfolio piece. A reader of the site is also a
   prospective hiring signal-evaluator. Showing the reasoning behind
   non-trivial decisions — stack choice, design lock, AI-honesty guardrails —
   *is* part of the portfolio.
2. The site is built phased over many sessions. A future-Oliver coming back
   to this in three months will absolutely need to know why decisions were
   made.

ADRs cost ~10–20 minutes to write at the time of decision. Not writing one
costs an hour of archaeology later, plus the risk of overturning a decision
without realizing it had been made deliberately.

## Decision

Use ADRs in the **Nygard format** for any decision a future reader might
question. Make them **public** as a `/decisions` page in Phase 7.

Specifically:

- One ADR per file, sequentially numbered: `docs/adr/NNNN-slug.md`
- Template at `docs/adr/0000-template.md` — copy and renumber when scaffolding
- Sections: Context, Decision, Consequences, Alternatives considered, References
- Status: Proposed | Accepted | Superseded by NNNN | Deprecated
- Don't edit accepted ADRs. Supersede them with a new ADR if the decision
  changes.
- Slash command `/adr <title>` scaffolds the next file with the right number.
- The `/decisions` page (Phase 7) renders the ADR markdown directly. Format
  it as a list of titles with collapsible bodies.

When to write one:

- Stack and tooling choices that aren't obvious from package.json
- Visual/design decisions that diverge from `design-references/` (rare)
- Honesty / safety guardrails (the JD page, the game)
- Choices a future reader might overturn without realizing they were
  considered

When not to write one:

- Routine fixes, refactors, formatting changes
- Decisions that are fully captured in the spec for the current phase

## Consequences

**Wins**

- Future-Oliver and reviewers can read the reasoning behind decisions
  instead of reverse-engineering them.
- Public ADRs are themselves part of the portfolio — they show how the
  builder thinks.
- New ADRs are cheap to scaffold (`/adr`) so the friction is low.

**Costs**

- ~15 minutes of writing per non-trivial decision.
- Some discipline required: ADRs only retain value if they're actually
  written at decision time, not retro-fitted.
- Public ADRs mean reasoning is on display. That's an asset only if the
  reasoning is sound.

## Alternatives considered

- **No ADRs.** The default for personal projects. Rejected — see Context.
- **Write decisions inline in commit messages.** Rejected — commit messages
  are not a stable home for cross-cutting reasoning, and they don't show up
  on the rendered site.
- **MADR or full IEEE-style format.** Rejected — Nygard's four sections are
  enough for a single-author project. More structure would just slow ADR
  writing.
- **Keep ADRs private.** Rejected — the "build process is itself a feature"
  framing only works if the artifacts are public. Privacy here is shyness,
  not security.

## References

- Michael Nygard, "Documenting Architecture Decisions" (2011) —
  <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions>
- `docs/specs/phase-7.md` — `/decisions` page implementation
- `.claude/commands/adr.md` — the scaffolder
