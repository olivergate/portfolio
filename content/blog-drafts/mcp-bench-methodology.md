---
post: 1
slug: mcp-bench-methodology
status: published
date: 2026-05-25
title: "Five things I learned trying to benchmark MCP search tools"
summary: "I benchmarked three MCP search tools against bash-grep across eight tasks. The baseline won, and the result is the least interesting part. The methodology traps are the story."
kicker: "Benchmarking"
length: "~1400 words"
source_brief: "content/_six-post-roadmap-2026-05-25.md"
source_data:
  - "/Users/olivergate/Documents/Source/retro-claude/blog-material/2026-05-11-mcp-bench-arc-close.md"
  - "/Users/olivergate/Documents/Source/TeacherHub/docs/archive/superpowers-specs-completed/2026-05-11-mcp-search-bench-report.md"
---

An article claimed a 98% reduction in token usage from one particular MCP search server. I wanted it to be true, so I ran the bench on my own ground — a real repo, my own account. New tooling comes out thick and fast, and most of it is downstream of someone else's specific workload and account; validation has to happen where you actually work.

It didn't settle the question. My Philosophy degree opened with a lecture that warned you'd graduate with questions, not answers, and this is closer to that: the questions anyone benchmarking an MCP search server should be asking, and the concretes that taught me each one.

## Results

Two rounds. Round one was Semble against bash-grep across seven tasks: the MCP arm came out 7.6% cheaper cumulatively, a long way short of the vendor's 98%. Round two added Serena and grepai plus a new T8 designed to favour LSP-style symbol-aware retrieval — same codebase, same operator, same baseline reference, eight tasks per arm. On that suite, the no-MCP baseline beat both MCP tools cumulatively.

<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cumulative cost across 8 tasks: baseline ~$14.96, Serena v2 $17.72, grepai $24.80">
  <style>
    .c1-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #2c2620; }
    .c1-title { font-size: 15px; font-weight: 600; }
    .c1-axis { stroke: #444; stroke-width: 1; fill: none; }
    .c1-grid { stroke: #e5e1d8; stroke-width: 1; fill: none; }
    .c1-label { font-size: 13px; }
    .c1-sub { font-size: 11px; fill: #6b645b; }
    .c1-value { font-size: 14px; font-weight: 600; }
    .c1-base { fill: #6b8c6b; }
    .c1-serena { fill: #4a6c8a; }
    .c1-grepai { fill: #a16864; }
  </style>
  <text x="300" y="28" text-anchor="middle" class="c1-text c1-title">Cumulative cost across 8 tasks</text>
  <line x1="100" y1="290" x2="560" y2="290" class="c1-grid"/>
  <line x1="100" y1="240" x2="560" y2="240" class="c1-grid"/>
  <line x1="100" y1="190" x2="560" y2="190" class="c1-grid"/>
  <line x1="100" y1="140" x2="560" y2="140" class="c1-grid"/>
  <line x1="100" y1="90" x2="560" y2="90" class="c1-grid"/>
  <text x="92" y="294" text-anchor="end" class="c1-text c1-sub">$0</text>
  <text x="92" y="244" text-anchor="end" class="c1-text c1-sub">$5</text>
  <text x="92" y="194" text-anchor="end" class="c1-text c1-sub">$10</text>
  <text x="92" y="144" text-anchor="end" class="c1-text c1-sub">$15</text>
  <text x="92" y="94" text-anchor="end" class="c1-text c1-sub">$20</text>
  <text x="92" y="64" text-anchor="end" class="c1-text c1-sub">$25</text>
  <line x1="100" y1="60" x2="100" y2="290" class="c1-axis"/>
  <line x1="100" y1="290" x2="560" y2="290" class="c1-axis"/>
  <rect x="160" y="175" width="100" height="115" class="c1-base"/>
  <text x="210" y="166" text-anchor="middle" class="c1-text c1-value">~$14.96</text>
  <text x="210" y="308" text-anchor="middle" class="c1-text c1-label">baseline</text>
  <text x="210" y="324" text-anchor="middle" class="c1-text c1-sub">no MCP, est.</text>
  <rect x="290" y="154" width="100" height="136" class="c1-serena"/>
  <text x="340" y="145" text-anchor="middle" class="c1-text c1-value">$17.72</text>
  <text x="340" y="308" text-anchor="middle" class="c1-text c1-label">Serena v2</text>
  <text x="340" y="324" text-anchor="middle" class="c1-text c1-sub">LSP / symbol</text>
  <rect x="420" y="100" width="100" height="190" class="c1-grepai"/>
  <text x="470" y="91" text-anchor="middle" class="c1-text c1-value">$24.80</text>
  <text x="470" y="308" text-anchor="middle" class="c1-text c1-label">grepai</text>
  <text x="470" y="324" text-anchor="middle" class="c1-text c1-sub">semantic vector</text>
  <text x="300" y="360" text-anchor="middle" class="c1-text c1-sub">TeacherHub monorepo, single Claude Code account, May 2026</text>
</svg>

Within MCP space, Serena beats grepai by 28% cumulatively, but unevenly: half comes from T8 alone, another quarter from T4, and the other six tasks net roughly even. Different retrieval mechanisms win different kinds of query. Symbol-aware retrieval wins function fixes and broad-coverage refactors. Semantic vector search wins concept-to-location lookups and citation-rich Q&A. Bash baseline wins direct find-and-replace and pure-recall tasks, where the MCP prefix tax dominates.

That is the result. What is wrong with it is the interesting part.

## Methodology

Single git checkout, same repo, same task list, same AGENTS.md, same CLAUDE.md. The only delta between arms was the `.mcp.json`: whether the MCP server was registered. The first version used two git worktrees with AGENTS.md as the variable, and failed — CLAUDE.md context bled across worktrees, conventions carried from one arm into the other, and the arms ended up correlated by everything except what I was trying to vary.

Prose alone hadn't isolated it either. The first MCP arm was contaminated: AGENTS.md said "prefer the MCP tool; do not use bash grep" and the agent complied roughly half the time, especially under load. So I added permission denies on `Bash(grep|rg|ag|ack|find:*)` on the MCP arms, and compliance jumped sharply — but not perfectly. A third of the way through round two the agent had worked out that `awk '/pattern/' file` is a search tool, and the deny list covered neither awk nor sed. I upgraded the extractor to retroactively reclassify the eight leaked calls as bash-search; the raw cost data stayed put, only its buckets moved.

Eight tasks per arm, `/cost` snapshot before and after each, per-task delta from the snapshots. The tasks: a small refactor (env-var swap), a bug fix (interval overlap), a wide-shallow refactor (FullCalendar removal), a feature add (auth listener), a Zod boundary refactor, a `(supabase as any)` cleanup, a self-review pass, and an RLS Q&A — a mix chosen to surface where each retrieval mechanism wins and loses.

Per-arm runs went onto local-only git branches (`bench/2026-05-08-baseline-run`, `bench/2026-05-08-grepai-run`, `bench/2026-05-08-serena-run-v2`, and so on), each keeping its own auditable history without polluting origin. The /cost snapshots and per-task deltas landed in a local SQLite store at `~/.claude/transcripts/2026-05-08-mcp-search-bench/bench.sqlite`, with per-task JSONL checkpoints alongside as replayable raw input — which let me upgrade the classifier mid-arc without re-running anything.

One setup detail matters more than it looks. My Claude Code account is on a cohort that swaps native `Grep`/`Glob` for a bash-shell substitute (`tengu_pewter_kestrel.BashSearchTool=20000`). The vendor's reference account presumably isn't. "Baseline" in my bench and "baseline" in the vendor's number aren't necessarily the same underlying tool.

## Concerns

Four things demand a flag.

**T8 baseline isolation skew.** The baseline T8 run happened in a fresh session with no T1–T7 accumulation, while the grepai and Serena T8 runs sat on top of five prior tasks of session prefix. Adjusted fairly, baseline T8 lands closer to $2.50–$3.00 than the recorded $1.97. The ordering (baseline < Serena < grepai) holds; the magnitude of the no-MCP win narrows.

**Cohort comparability.** My baseline routes through `bash:grep`, the vendor's likely through native `Grep`, so the published vendor number and my measurement aren't strictly comparable — and there's no surface where vendors disclose which cohort their bench account was in. Worth knowing before composing any vendor's MCP benchmark with your own.

**Operator pacing.** On T6 (pure-recall self-review, zero tool calls) I got a $1.27 cost swing between two arms whose only meaningful difference was whether I'd taken a coffee break first. That one surprised me.

<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="cache_w tokens on T6 across four arms. Baseline 2k, grepai 1.6k, Serena v2 211k, hist-Semble 280k.">
  <style>
    .c3-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #2c2620; }
    .c3-title { font-size: 15px; font-weight: 600; }
    .c3-axis { stroke: #444; stroke-width: 1; fill: none; }
    .c3-grid { stroke: #e5e1d8; stroke-width: 1; fill: none; }
    .c3-label { font-size: 12px; }
    .c3-sub { font-size: 11px; fill: #6b645b; }
    .c3-value { font-size: 13px; font-weight: 600; }
    .c3-warm { fill: #6b8c6b; }
    .c3-mixed { fill: #c8a050; }
    .c3-cold { fill: #a16864; }
  </style>
  <text x="300" y="28" text-anchor="middle" class="c3-text c3-title">cache_w tokens on T6 across four arms</text>
  <text x="300" y="46" text-anchor="middle" class="c3-text c3-sub">low = warm cache · high = expired (rewrite tax)</text>
  <line x1="120" y1="300" x2="560" y2="300" class="c3-grid"/>
  <line x1="120" y1="263" x2="560" y2="263" class="c3-grid"/>
  <line x1="120" y1="227" x2="560" y2="227" class="c3-grid"/>
  <line x1="120" y1="190" x2="560" y2="190" class="c3-grid"/>
  <line x1="120" y1="153" x2="560" y2="153" class="c3-grid"/>
  <line x1="120" y1="117" x2="560" y2="117" class="c3-grid"/>
  <line x1="120" y1="80" x2="560" y2="80" class="c3-grid"/>
  <text x="112" y="304" text-anchor="end" class="c3-text c3-sub">0</text>
  <text x="112" y="267" text-anchor="end" class="c3-text c3-sub">50k</text>
  <text x="112" y="231" text-anchor="end" class="c3-text c3-sub">100k</text>
  <text x="112" y="194" text-anchor="end" class="c3-text c3-sub">150k</text>
  <text x="112" y="157" text-anchor="end" class="c3-text c3-sub">200k</text>
  <text x="112" y="121" text-anchor="end" class="c3-text c3-sub">250k</text>
  <text x="112" y="84" text-anchor="end" class="c3-text c3-sub">300k</text>
  <line x1="120" y1="70" x2="120" y2="300" class="c3-axis"/>
  <line x1="120" y1="300" x2="560" y2="300" class="c3-axis"/>
  <rect x="160" y="296" width="80" height="4" class="c3-warm"/>
  <text x="200" y="288" text-anchor="middle" class="c3-text c3-value">2k</text>
  <text x="200" y="318" text-anchor="middle" class="c3-text c3-label">baseline</text>
  <text x="200" y="333" text-anchor="middle" class="c3-text c3-sub">warm</text>
  <rect x="260" y="297" width="80" height="3" class="c3-warm"/>
  <text x="300" y="288" text-anchor="middle" class="c3-text c3-value">1.6k</text>
  <text x="300" y="318" text-anchor="middle" class="c3-text c3-label">grepai</text>
  <text x="300" y="333" text-anchor="middle" class="c3-text c3-sub">warm</text>
  <rect x="360" y="145" width="80" height="155" class="c3-mixed"/>
  <text x="400" y="137" text-anchor="middle" class="c3-text c3-value">211k</text>
  <text x="400" y="318" text-anchor="middle" class="c3-text c3-label">Serena v2</text>
  <text x="400" y="333" text-anchor="middle" class="c3-text c3-sub">partial expiry</text>
  <rect x="460" y="95" width="80" height="205" class="c3-cold"/>
  <text x="500" y="87" text-anchor="middle" class="c3-text c3-value">280k</text>
  <text x="500" y="318" text-anchor="middle" class="c3-text c3-label">Semble (hist)</text>
  <text x="500" y="333" text-anchor="middle" class="c3-text c3-sub">full expiry</text>
  <text x="340" y="360" text-anchor="middle" class="c3-text c3-sub">Same prefix weight. Different cache state at T6 time.</text>
</svg>

Claude Code's prompt cache has a five-minute TTL. Any idle gap longer than that forces a full re-cache when the next prompt fires, and on a heavy-MCP arm with a 200K+ prefix the rewrite costs real money. Grepai's T6 cost $0.46 because I ran the tasks back-to-back; Serena's T6 cost $1.73 because T8 had run overnight and part of the prefix had aged past TTL. Same prefix weight, different cache state. A harness that doesn't model operator pacing has that variance sitting in its cumulative number as silent noise.

**The Serena v1 incident.** Serena reported T1 complete at $0.62 against grepai's $1.02 — a 40% win on direct find-and-replace, apparently. The task: replace every hardcoded `deepl.com` URL with an env-var read, across three call sites. The agent ran `find_symbol("deepl")` and `find_symbol("DeepL")`, both of which correctly returned nothing, because "DeepL" isn't a symbol; it lives in string literals. The agent edited the two sites it could infer from filenames and reported done. The third, `spell-check.ts:93`, was never touched. I caught it on a post-task disk check.

The cause was structural. Serena's `--context claude-code` default tool list doesn't expose `search_for_pattern`, assuming users fall through to native `Grep` when symbol search isn't enough. My account has no native `Grep` (the cohort note), and the bench denies blocked bash grep — so the agent had no string-literal search path at all. One line of YAML in `.serena/project.yml` (`included_optional_tools: [search_for_pattern]`) closed the gap; patched v2 cost $1.03, essentially tied with grepai. The 40% win was incomplete coverage masquerading as efficiency. I kept v1 on its branch and ran v2 on a sibling.

## Learnings

If I ran this bench again:

The cohort check goes in the pre-flight. Snapshot whatever the account exposes as its tool surface (`~/.claude/settings.json`, the reported tool list) and print it in the methodology section, not a footnote. Cross-account comparisons won't compose until cohort disclosure becomes routine.

Pacing goes in the protocol, not the noise floor. Run all tasks back-to-back inside one cache-TTL window, or introduce idle gaps on purpose and report cache state at each task's start, or run replicates across pacing profiles and report the variance. Any of those beats pasting the next prompt when I felt like it.

Prose mandates and permission denies travel together: the prose trains the agent on cases the deny doesn't cover; the deny makes the rule true. And the deny list should be more exhaustive than feels necessary.

Failed arms are deliverables. The Serena v1 incident was the single most actionable finding in round two, and overwriting v1 the moment the DoD failed would have erased it. Preserving the audit trail cost almost nothing and produced the one finding that helps the next user instead of just settling a horse race.

And be careful which number you ship. The cumulative headline is the one readers will quote, screenshot, and propagate.

## The limits of one bench

This is one run. I have no data on cohort distribution across the Claude Code population; my belief that other comparative benchmarks share the problem is a prior, not a measurement. Pacing is a variable on my workload — if yours has no idle gaps above five minutes, the cache-TTL mechanism never fires, and the lesson only holds for harnesses trying to model real sessions. And v1-preservation has a judgment call inside it: it pays off when the failure points at a structural property of the tool, but when the failure is operator error (wrong API key, wrong working directory) the preserved arm is clutter. The test is whether the next user would hit the same wall.

The number is the least durable thing here. Every comparative benchmark should disclose its cohort, its pacing, and the arms it threw away.
