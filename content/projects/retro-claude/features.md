---
slug: retro-claude/features
status: published
---

## The session retro

`/clear-review` runs at the end of a session: five to seven minutes, at most two questions to the human. It drafts a structured record (felt quality, corrections, observations, decisions, code changes), classifies each entry against the ontology, reconciles the task's open questions, and writes YAML to disk only after approval. 74 sessions went through it in the first five weeks.

## A closed ontology with escape hatches

Six axes (session mode, correction type, direction angle, capability angle, surface, user flags) and around 65 values. Every tag carries a fit confidence; when nothing fits, the entry takes `other` plus mandatory free text. Those misfits are data: the expansion policy bumps the vocabulary when forced and other tags pass a density threshold, which is exactly how v0.2 happened at session three.

## Tasks as multi-session arcs

A session is one turn on a task. Tasks hold rolling state that gets rewritten each turn plus an append-only turn history, so a ten-turn build arc reads as one story rather than ten disconnected logs.

## Rules earn their place

Nothing is auto-promoted. The collaboration direction (probe before dispatch; surface alternatives rather than picking silently) was authored from eight observations across seven sessions. The three practices each cite the sessions that justified them. The kit packages direction, practices, doc-system skills, and a doc linter for installation into other repos.

## Drift detection

Session activity is checked against accepted ADRs: a decision that contradicts the decision log raises a drift signal with its evidence, rather than silently diverging. High-consequence classifications get a second opinion from a fresh agent before they're trusted.
