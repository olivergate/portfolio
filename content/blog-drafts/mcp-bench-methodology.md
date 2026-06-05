---
post: 1
slug: mcp-bench-methodology
status: draft
date: 2026-05-25
title: "Five things I learned trying to benchmark MCP search tools"
summary: "I benchmarked three MCP search tools against bash-grep across eight tasks. The baseline won — and the result is the least interesting part. The methodology traps are the story."
kicker: "Benchmarking"
length: "~1600 words"
source_brief: "content/_six-post-roadmap-2026-05-25.md"
source_data:
  - "/Users/olivergate/Documents/Source/retro-claude/blog-material/2026-05-11-mcp-bench-arc-close.md"
  - "/Users/olivergate/Documents/Source/TeacherHub/docs/archive/superpowers-specs-completed/2026-05-11-mcp-search-bench-report.md"
---

Which retrieval tooling to give an agent is not a small decision. So when I read an article claiming a 98% reduction in token usage from one particular MCP search server, I wanted it to be true.

But you can't throw the kitchen sink at every project. New tooling comes out thick and fast, and most of it is downstream of someone's specific workload, someone's specific setup, someone's specific account. The validation step matters, and it has to happen on your own ground.

I wish I could tell you the benchmark settled the question. It didn't. When I studied Philosophy the opening lecture went: "If you have decided to read Philosophy for answers, you've come to the wrong house. We will teach you to ask questions, and it is questions that eventually you will graduate with." This post is closer to that. What I have is a list of questions anyone benchmarking an MCP search server should be asking, and the concretes that taught me each one.

The headline first, then the questions.

## Results

I ran two rounds. Round one was Semble against bash-grep across seven tasks: the MCP arm came out 7.6% cheaper cumulatively, a long way short of the vendor's 98%. Round two added Serena and grepai, plus a new T8 designed to favour LSP-style symbol-aware retrieval. Same codebase, same operator, same baseline reference, eight tasks per arm.

On the round-two suite, the no-MCP baseline beat both MCP tools cumulatively.

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

Within MCP space, Serena beats grepai by 28% cumulatively, though the win is uneven: half of it comes from T8 alone, another quarter from T4, and the other six tasks net roughly even. Different retrieval mechanisms win different task shapes. Symbol-aware retrieval wins function fixes and broad-coverage refactors. Semantic vector search wins concept-to-location lookups and citation-rich Q&A. Bash baseline wins direct find-and-replace and pure-recall tasks, where the MCP prefix tax dominates.

That's the result. The interesting part is what's wrong with it.

## Methodology

Single git checkout. The only thing that changed between arms was the `.mcp.json` configuration — whether the MCP server was registered for that session. Same repo, same task list, same AGENTS.md, same CLAUDE.md.

The first version used two git worktrees with AGENTS.md as the arm variable. It didn't work. The CLAUDE.md context bled across worktrees, and conventions the agent picked up in one arm carried into the other.

> [!pull]
> The arms were correlated by everything except what I was trying to vary.

Single-checkout with `.mcp.json` as the only delta was the version that actually isolated the variable.

I also added permission denies on `Bash(grep|rg|ag|ack|find:*)` on the MCP arms. Prose alone hadn't been enough — the first MCP arm I ran was contaminated, because the AGENTS.md said "prefer the MCP tool; do not use bash grep" and the agent complied roughly half the time, especially under load. With the deny in place, compliance jumped sharply. Not perfectly: a third of the way through round two I noticed the agent had worked out that `awk '/pattern/' file` is a search tool, and the deny list covered neither awk nor sed. I upgraded the extractor to retroactively reclassify the eight leaked calls as bash-search. The raw cost data didn't change; the classification did.

Eight tasks per arm, `/cost` snapshot before and after each, per-task delta computed from the snapshots. The tasks: a small refactor (env-var swap), a bug fix (interval overlap), a wide-shallow refactor (FullCalendar removal), a feature add (auth listener), a Zod boundary refactor, a `(supabase as any)` cleanup, a self-review pass, and an RLS Q&A — a deliberate mix, chosen to surface where each retrieval mechanism wins and loses.

Per-arm runs went onto local-only git branches (`bench/2026-05-08-baseline-run`, `bench/2026-05-08-grepai-run`, `bench/2026-05-08-serena-run-v2`, and so on), so each arm accumulated its own auditable commit history without polluting origin. The /cost snapshots and per-task deltas landed in a local SQLite store at `~/.claude/transcripts/2026-05-08-mcp-search-bench/bench.sqlite`, with per-task JSONL checkpoints alongside as replayable raw input — which is what made the mid-arc classifier upgrade possible without re-running anything.

One detail about my setup matters more than it looks. My Claude Code account is on a cohort that swaps native `Grep`/`Glob` for a bash-shell substitute (`tengu_pewter_kestrel.BashSearchTool=20000`). The vendor's reference account presumably isn't. "Baseline" in my bench and "baseline" in the vendor's number are not necessarily the same underlying tool. More on this below.

## Concerns

Four things are wrong with the headline result, or at least demand a flag.

**T8 baseline isolation skew.** The baseline run on T8 happened in a fresh session with no T1–T7 accumulation, while the grepai and Serena T8 runs sat on top of five prior tasks of session prefix. Adjusted fairly, baseline T8 lands closer to $2.50–$3.00 than the recorded $1.97. The directional finding (baseline < Serena < grepai) holds; the magnitude of the no-MCP win narrows.

**Cohort comparability.** As above: my baseline routes through `bash:grep`, the vendor's likely through native `Grep`. The published vendor number and my measurement aren't strictly comparable, and there is currently no surface where vendors disclose which cohort their bench account was in. Worth knowing before composing any vendor's MCP benchmark with your own.

**Operator pacing.** This one surprised me. On T6 — pure-recall self-review, zero tool calls — I got a $1.27 cost swing between two arms whose only meaningful difference was whether I'd taken a coffee break first.

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

Claude Code's prompt cache has a five-minute TTL. Any idle gap longer than that forces a full re-cache when the next prompt fires, and on a heavy-MCP arm with a 200K+ prefix the rewrite costs real money. Grepai's T6 cost $0.46 because I ran the tasks back-to-back. Serena's T6 cost $1.73 because T8 had run overnight and part of the prefix had aged past TTL. Same prefix weight, different cache state. A bench harness that doesn't model operator pacing has pacing variance sitting in its cumulative number as silent noise.

**The Serena v1 incident.** Serena reported T1 complete at $0.62, against grepai's $1.02 — a 40% win on direct find-and-replace, apparently. The task was to replace every hardcoded `deepl.com` URL with an env-var read. There are three call sites. The agent ran `find_symbol("deepl")` and `find_symbol("DeepL")`, both of which correctly returned nothing, because "DeepL" isn't a symbol — it lives in string literals. The agent edited the two sites it could infer from filenames and reported done. The third, `spell-check.ts:93`, was never touched. I caught it on a post-task disk check.

The cause was structural. Serena's `--context claude-code` default tool list doesn't expose `search_for_pattern`, assuming users can fall through to native `Grep` when symbol search isn't enough. My account doesn't have native `Grep` (see the cohort note), and the bench denies blocked bash grep. The agent had no string-literal search path at all. One line of YAML in `.serena/project.yml` (`included_optional_tools: [search_for_pattern]`) closed the gap; v2 with the patch cost $1.03, essentially tied with grepai. The 40% win was incomplete coverage masquerading as efficiency. I kept v1 on its branch rather than overwriting it, and ran v2 on a sibling.

## Learnings

If I ran this bench again:

The cohort check goes in the pre-flight. Snapshot whatever the account exposes as its tool surface (`~/.claude/settings.json`, the reported tool list) and print it in the methodology section, not a footnote. Cross-account comparisons won't compose until cohort disclosure becomes routine.

Pacing goes in the protocol, not the noise floor. Run all tasks back-to-back inside one cache-TTL window, or introduce idle gaps deliberately and report cache state at each task's start, or run replicates across pacing profiles and report the variance. Any of those beats what I did, which was paste the next prompt when I felt like it.

Prose mandates and permission denies travel together. The prose trains the agent on cases the deny doesn't cover; the deny makes the rule true. And the deny list should be more exhaustive than feels necessary — deny grep and the agent finds awk.

Failed arms are deliverables. The Serena v1 incident was the single most actionable finding in round two. Overwrite v1 the moment the DoD fails and the post doesn't have it. Preserving the audit trail cost almost nothing and produced the one finding that helps the next user instead of just settling a horse race.

And be careful which number you ship. The cumulative headline is the one readers will quote, screenshot, and propagate.

> [!pull]
> If the headline doesn't carry the cohort context, the workload-shape context, and the pacing context, publishing it does the opposite of what a benchmark is for.

## How far this generalises

These learnings come from one bench. The honest caveats:

Cohort exposure may not be widespread. I have no data on cohort distribution across the Claude Code population; my belief that other comparative benchmarks share the problem is a prior, not a measurement.

Operator pacing is a variable on my workload. If yours has no idle gaps above five minutes, the cache-TTL mechanism never fires and pacing collapses to noise. The lesson holds only for harnesses trying to model real sessions.

The v1-preservation principle has a judgment call inside it. It earns its keep when the failure points at a structural property of the tool. When the failure is operator error — wrong API key, wrong working directory — preserving the arm is clutter. The question is whether the next user would hit the same wall.

What would change my mind on any of this: a cohort-controlled, multi-codebase, multi-operator benchmark that holds workload shape and pacing constant and still produces a stable per-task win profile. I haven't seen one. If it exists, send it.
