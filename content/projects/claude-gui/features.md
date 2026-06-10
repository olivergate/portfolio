---
slug: claude-gui/features
status: published
---

## The cockpit panels

Each session tab carries a sidebar: files touched, tool calls grouped by purpose, sub-agents with the scope each one actually read, errors (rejected tool calls, denied permissions), and token usage. File rows deep-link into diffs in VS Code.

<figure>
<img src="/projects/claude-gui/cockpit-panels.png" alt="claude-gui showing a fresh session with empty panels for files touched, tool calls, subagents, errors, and token usage" />
<figcaption>The panel set on a fresh session, before any tool calls land.</figcaption>
</figure>

## Arcs and the rundown

An arc is a declared problem space. Sessions bind to one at launch, and the rundown view assembles the whole history of an arc (decisions, code changes, reviews, commits, across every session) from one SQL traversal. This is the feature the rest of the app exists to feed.

## The clear flow

Ending a session is a first-class act. The GUI flushes a structured session record, runs a Haiku pass over the frozen transcript to draft the decisions that were made (you accept or strike each one), and gates the next turn on a background-generated state delta, so the next session starts informed rather than cold.

## Review without reading everything

A diff viewer lets you annotate hunks line-by-line and compose the comments into a prompt, injected straight into the live session or queued for the next one. An escalation scorer flags risky changes first, using additive signals: churn, diff size, auth-touching paths, files with zero test coverage.

## Agent replay

Project agents can be replayed against recorded session transcripts before you commit to an edit, which turns the captured-session corpus into a regression suite for agent prompts.
