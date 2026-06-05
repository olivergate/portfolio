---
post: 5
slug: claude-gui
status: published
date: 2026-05-25
title: "Reviewing agent code without reading it"
summary: "A GUI that decides what agent output reaches you: substrate-first detection, Haiku as structure extractor, and one optimistic default I'm still watching."
kicker: "Agent tooling"
length: "~800 words"
source_brief: "content/_six-post-roadmap-2026-05-25.md"
---

I spent multiple rounds brainstorming how to detect when a code review happened.

Then I checked the substrate.

That's the whole post, really. The long version follows.

The problem: I'm one human running a swarm of small LLMs that write code faster than I can read it. Solo dev with Claude Code, four subagents at a time on a busy session, sometimes more. The diff lands. The diff is correct, usually. And the only honest answer to *did anyone read this* is "no, not really. I read the bits that looked load-bearing."

You can't auto-merge agent code. You can't read every line either. The tool I wanted lives in between: not a tool that does the review, but one that decides what reaches you. That was the brief for claude-gui. One conversation, commit range `425d9b6` to `3040f8a`, multi-window Electron app by the end.

## The substrate was sitting there the whole time

The move I'm proudest of in this project is barely a move.

I wanted the GUI to know when a subagent had finished something worth my attention. A code review, specifically. The plan was to detect it, so I brainstormed strategies. There were four.

1. Pattern-match the agent's output for "Issues:" or "Findings:" or "Recommendations:" headers.
2. Wrap the review prompt with a sentinel string and grep for it on the way out.
3. Tag the subagent at dispatch time with a `purpose: review` field and have the parent forward it.
4. A small classifier model that watches the output stream and emits an event when it smells like a review.

Every one of those required a contract somewhere. With the model. With the user. With future me, remembering to wrap the prompt right.

Then, before committing to any of them, I ran `ls ~/.claude/projects/` for unrelated reasons.

```
<cwd>/<parent-id>/subagents/agent-<id>.meta.json
<cwd>/<parent-id>/subagents/agent-<id>.jsonl
```

Per-subagent traces. The model name, the prompt, the tool calls, the full transcript, all on disk in a directory structure Claude Code was already maintaining for its own purposes. The detection problem dissolves. I don't need to detect that a review happened. I need to point at the trace that ran the reviewer prompt and say: that one. Give me its output.

> [!pull]
> The lesson: if you're enumerating strategies that all require a contract somewhere, you're probably solving the wrong problem. Check the substrate. It's often already doing what you wanted.

It sounds trivial said out loud. It is trivial. It's also the move I see missed most consistently in agent tooling: clever model contracts built on top of platforms that already write the data to disk. I've done it. I'll do it again. The discipline is checking first.

## Haiku reads what Sonnet wrote

Second move, briefly, because the principle generalises. Sonnet writes the review in prose, because Sonnet writes good reviews in prose. But a human reading prose is exactly what we're trying to avoid. So Haiku reads Sonnet's prose and converts it to JSON. `{file, severity, title, description}`, one row per finding. Only findings that name a specific file survive. Praise gets dropped. Process notes get dropped. What lands in the Review panel is structured, sortable, and clickable.

> [!pull]
> You get Sonnet's judgment and Haiku's discipline. The cost is pennies.

## What might be wrong here

The cleverest decision in the UI is the one I'm least sure about. Findings flip from "open" to "addressed" automatically when the file they reference gets edited. The reasoning: if claude is editing the file, claude is probably fixing the thing. Sometimes the reasoning is wrong. Claude edits files for all sorts of reasons: adding a comment, renaming a variable two functions away, touching the file because a test broke for an unrelated cause. Each of those flips findings to "addressed" when they aren't.

There's a manual reopen button. It isn't enough on its own. The question I can't answer without real-use data: is the false-positive rate annoying but tolerable, or does it erode trust in the panel? If a user opens the Review tab, sees three findings marked addressed, and one turns out to have been auto-resolved by a stylistic edit, do they trust the next "addressed" badge? I don't know yet. I shipped the optimistic default because the alternative was manual triage on every edit, which is the thing the tool exists to avoid. I'm watching it.

## One currency

Substrate-first detection: free, because the platform already wrote the data down. Haiku as structure extractor: cheap, because small models are good at narrow jobs. Addressed-on-edit: optimistic, because manual triage was the thing being avoided. Three bets on the same currency: the human's attention, the scarce resource in this whole story.
