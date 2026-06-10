---
slug: retro-claude/philosophy
status: published
---

## Data before rules

The system captures observations raw and lets rules be authored by a human, later, from accumulated evidence. The alternative (letting an agent invent working rules on the fly) produces rules that sound right and bind nothing. Every rule in the kit can cite the sessions that earned it.

## Closed sets, honestly maintained

Free-text tags can't be aggregated; a closed vocabulary goes stale. The resolution is to make misfit measurable: every classification carries a fit confidence, forced fits and escapes are counted, and the vocabulary expands only when the counts cross a written threshold. Schema evolution becomes an evidence-driven decision instead of a vibe.

## Provenance everywhere

Self-assessments must cite evidence references. Fanned-out reviewer verdicts stay traceable to the reviewer rather than collapsing into a score. Tier-1 and Tier-2 judgments are stored side by side when they disagree. The audit ledger is append-only. If a claim about a session can't be traced, it doesn't get recorded.

## Decisions are frozen, amendments are new decisions

ADR sections marked frozen cannot be edited in place; changing course means writing a new ADR that supersedes the old one, so the decision log stays a history rather than a wiki. Nineteen accepted ADRs follow that policy, and the drift detector exists to catch work that contradicts them without saying so.

## Turns, not timestamps

Agents are unreliable narrators about wall-clock time, so ordering is recorded in turns. Small choice, but it's the kind the whole system is made of: design the record around what the recorder can actually know.
