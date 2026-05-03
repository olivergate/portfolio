---
title: Documentation — Top-Level Index
purpose: Map of every doc category and its index, for humans and agents triaging which doc to open.
audience: humans + agents
last_verified: 2026-05-03
---

# Documentation — Top-Level Index

This is the entry point to the project's documentation. It's an llms.txt-style index: each category links to its own index, which then links to the individual docs.

Agents triaging which doc to open should start here, not by `ls`-ing `docs/` blind.

## Categories

| Category | Index | What it answers |
|----------|-------|-----------------|
| Doc-system meta | [doc-system/01-taxonomy.md](./doc-system/01-taxonomy.md) | "How does the doc system itself work?" |
| Architectural decisions (ADRs) | [adr/INDEX.md](./adr/INDEX.md) | "Why did we choose X over Y?" |
| Phase specs | [specs/README.md](./specs/README.md) | "What gets built in phase N?" |
| Practice docs | [practices/INDEX.md](./practices/INDEX.md) | "How do we do X well?" *(no domains authored yet)* |
| Runbooks | [runbooks/INDEX.md](./runbooks/INDEX.md) | "How do I run this operational procedure?" *(none authored yet)* |
| Deferred decisions / follow-ups | [TODO.md](./TODO.md) | "What's been kicked down the road?" |

## Outside `docs/`

| Surface | Location | What it answers |
|---------|----------|-----------------|
| Agent operating rules | [`CLAUDE.md`](../CLAUDE.md) | "What rules do agents follow every session?" |
| Harness config | [`.claude/commands/`](../.claude/commands/), [`.claude/agents/`](../.claude/agents/) | "What slash commands and sub-agents are available?" |
| Design references | [`design-references/`](../design-references/) | "What does the page actually look like?" — authoritative visual spec |
| Content source | [`content/`](../content/) | "What CV / tone copy goes on the page?" |

## How to read this index efficiently

- **Touching architecture?** → start at `adr/INDEX.md`, scan the table.
- **Starting a phase?** → `specs/phase-N.md`, then `CLAUDE.md` for cross-phase invariants.
- **Don't know which category?** → start at `doc-system/01-taxonomy.md` for the per-category disambiguator.
- **Following up a deferred decision?** → `TODO.md`.
