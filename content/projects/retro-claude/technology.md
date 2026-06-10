---
slug: retro-claude/technology
status: published
---

## The substrate is files

Solo mode is YAML on disk: one file per session record, one per task, under dated directories. No database required to participate, nothing to host, everything reviewable in a diff. The ontology and event vocabularies are canonical YAML files with TypeScript Zod mirrors, and a CI check fails the build if the two ever disagree.

## The skills

The working surface is Claude Code itself: `/clear-review` and `/session-note` slash commands, plus a doc-system kit (a `/doc-sync` orchestrator and doc-steward / doc-reviewer sub-agents) and a markdown doc linter. Three further skills are specified but unbuilt, waiting until the corpus is big enough to justify them.

## Team mode

The multi-user product layers on top without replacing the file substrate:

- **Web**: Next.js 15 dashboard on Vercel for tasks, sessions, drift signals, and predictions.
- **MCP server**: Hono with HTTP + SSE on Railway, exposing 23 tools for substrate reads and writes, every one of which emits to an append-only audit ledger (23 event types).
- **CLI**: `retroctl`, for the same operations from a terminal.
- **Database**: Supabase Postgres via Drizzle, 15 migrations, row-level security, with session detail held as JSONB event captures rather than flattened columns.

## Verification layers

Tier 1 is the drafting agent auditing itself with required evidence references. Tier 2 dispatches a fresh, smaller-model agent to independently verify high-consequence entries, and disagreement between the tiers is preserved rather than overwritten. The same pluggable library backs drift detection.
