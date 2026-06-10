---
slug: claude-gui/philosophy
status: published
---

## Observe, don't reimplement

The cockpit runs the genuine CLI and reads the artifacts it already produces. No forked client, no hooks into Claude Code's internals, nothing that breaks when the CLI updates. The version on screen is always the real tool.

## Files and git are the source of truth

Arcs, session records, and reviews are YAML in the repo; the SQLite graph is a disposable cache rebuilt from them. That choice costs some write-path convenience and buys portability, versioning for free, and recovery that is one `rm` away. The two exceptions (review comments, the next-turn gate) are documented as exceptions.

## Decisions have a ledger

The design phase produced a decision record before the build started: five costly-to-reverse calls, twenty cheap-to-reverse defaults, and two product questions explicitly deferred to a human, each with the fork it resolves. When the window-per-project pivot landed mid-build in June 2026, it got the same treatment: a written plan, a ratified re-sequencing, and the session-ID race bugs it fixed named in the document.

## Designed by a fleet, verified by reviewers

The initial plan came out of an overnight multi-agent run: about 30 agents and 2.9M tokens producing competing data-model proposals, adversarial critiques, and a synthesis, then a three-reviewer pass for consistency, completeness, and buildability whose corrections are published in the repo. The same pattern the app itself is built to supervise.

## Attention is the budget

Within one arc, sessions serialise: the next turn waits until the retro of the last one is ready. Across arcs, they run free. That mirrors how a person actually works: parallel projects, sequential thought within each.
