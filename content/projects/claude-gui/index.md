---
slug: claude-gui
status: published
---

Run three Claude Code sessions in parallel and your attention becomes the bottleneck: which files changed, which agents are running, what got rejected, what did I agree to an hour ago. claude-gui is a Mac Electron cockpit that answers those questions on one surface. Parts of this portfolio site were built inside it.

It wraps the real `claude` CLI in a pseudo-terminal, so the full TUI works exactly as normal. Around the terminal, panels track files touched (clickable through to diffs), tool calls, sub-agents and what each one read, errors and rejected calls, and token usage. Everything comes from tailing the session transcript Claude Code already writes; the GUI observes, it never reimplements.

<figure>
<img src="/projects/claude-gui/cockpit-live.png" alt="claude-gui cockpit with the Claude Code terminal on the left and live panels listing files touched and tool calls on the right" />
<figcaption>A live session: the real CLI on the left, what it is doing on the right.</figcaption>
</figure>

The deeper idea is the *arc*: declare a problem you're working on, bind sessions to it, and every decision, code change, and review accumulates into a queryable history. One click answers "show me everything that happened on this task across nine sessions" without scrolling logs.

Current state: v0.3, roughly 15,500 lines of JavaScript across 43 modules, in daily use on my own projects while the diff-review surface is still landing. There's a longer write-up in [Reviewing agent code without reading it](/blog/claude-gui).
