---
post: 5
slug: claude-gui
status: published
date: 2026-05-25
title: "Reviewing agent code without reading it"
summary: "Building a GUI to triage subagent output without reading every line: substrate-first detection, Haiku as structure extractor, and one optimistic default I'm not yet sure about."
kicker: "Agent tooling"
length: "~900 words"
source_brief: "content/_six-post-roadmap-2026-05-25.md"
---

I spent multiple rounds brainstorming how to detect when a code review happened.

Then I checked the substrate.

That sentence is the whole post, basically. But you came here for the long version, so let me back up.

The problem: I am one human running a swarm of small LLMs that write code faster than I can read it. Solo dev with Claude Code, four subagents at a time on a busy session, sometimes more. The diff lands. The diff is correct, usually. But "usually" is doing a lot of work in that sentence, and the only honest answer to *did anyone read this* is "no, not really, I read the bits that looked load-bearing."

You can't auto-merge agent code. You also can't read every line. Welcome to the middle.

A GUI is one shape the middle can take. Specifically: a tool whose job is not to *do* the review but to decide *what reaches you*. That's the brief I started with when I built claude-gui. One conversation, commit range `425d9b6` to `3040f8a`, multi-window Electron app by the end.

## The substrate was sitting there the whole time

Here is the move I am most proud of in this project, and it is barely a move.

I wanted the GUI to know when a subagent had finished doing something I would want to look at. A code review, specifically. The plan was to detect it.

So I brainstormed strategies. There were four.

1. Pattern-match the agent's output for "Issues:" or "Findings:" or "Recommendations:" headers.
2. Wrap the review prompt with a sentinel string and grep for it on the way out.
3. Tag the subagent at dispatch time with a `purpose: review` field and have the parent forward it.
4. A small classifier model that watches the output stream and emits a structured event when it smells like a review.

Every one of those required a contract somewhere. With the model. With the user. With future me, remembering to wrap the prompt right.

Then, before committing to any of them, I ran `ls ~/.claude/projects/` for unrelated reasons.

```
<cwd>/<parent-id>/subagents/agent-<id>.meta.json
<cwd>/<parent-id>/subagents/agent-<id>.jsonl
```

Per-subagent traces. JSONL. The model name, the prompt, the tool calls, the full transcript, sitting on disk in a directory structure Claude Code was already maintaining for its own purposes. The detection problem dissolves. I do not need to detect that a review happened. I need to point at the trace and say "that one, the one that ran the reviewer prompt, give me its output."

The lesson: if you're enumerating strategies that all require a contract somewhere, you're probably solving the wrong problem. Check the substrate. It's often already doing what you wanted.

This will sound trivial when I say it out loud. It is trivial. It is also the move I see missed most consistently in agent-tooling work. People build clever model contracts on top of platforms that are already writing the data to disk for them. I have done it. I will do it again. The discipline is checking first.

## Haiku reads what Sonnet wrote

Second move, briefly, because the principle generalises. Sonnet writes the review in prose, because Sonnet writes good reviews in prose. But a human reading prose is exactly what we are trying to avoid. So I have Haiku read Sonnet's prose and convert it to JSON. `{file, severity, title, description}`, one row per finding. Only findings that name a specific file. Praise gets dropped. Process notes get dropped. What lands in the Review panel is structured, sortable, and clickable.

You get Sonnet's judgment and Haiku's discipline. The cost is pennies.

## What might be wrong here

The cleverest decision in the UI is the one I am least sure about. Findings flip from "open" to "addressed" automatically when the file they reference gets edited. The reasoning: if claude is editing the file, claude is probably fixing the thing. The reasoning is also wrong sometimes. Claude edits files for reasons. Adding a comment. Renaming a variable two functions away. Touching the file because a test broke for an unrelated cause. Each of those flips findings to "addressed" when they aren't.

There is a manual reopen button. It is not enough on its own. The question I cannot answer without real-use data is whether the false-positive rate is annoying-but-tolerable, or whether it actively erodes trust in the panel. If a user opens the Review tab, sees three findings marked addressed, and one of them turns out to have been auto-resolved by a stylistic edit, do they still trust the next "addressed" badge? I do not know yet. I shipped with the optimistic default because the alternative was manual triage on every edit, which is what the tool exists to avoid. I'm watching to see if it's the wrong call.

## One currency

Three moves, one currency. Substrate-first detection: free, because the platform already wrote the data down. Haiku as structure extractor: cheap, because small models are good at narrow jobs. Addressed-on-edit: optimistic, because manual triage on every edit was the thing the tool existed to spare you. All three bet on the same currency, which is the human's attention, which is the actual scarce resource in this whole story.
