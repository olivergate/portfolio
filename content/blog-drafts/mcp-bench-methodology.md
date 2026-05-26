---
post: 1
slug: mcp-bench-methodology
status: draft
date: 2026-05-25
title: "Five things I learned trying to benchmark MCP search tools"
summary: "How I tried to benchmark MCP search tools against bash-grep. What the methodology pivots taught me, and why the headline number was the wrong thing to ship."
kicker: "Benchmarking"
length: "~2500 words"
source_brief: "content/_six-post-roadmap-2026-05-25.md"
source_data:
  - "/Users/olivergate/Documents/Source/retro-claude/blog-material/2026-05-11-mcp-bench-arc-close.md"
  - "/Users/olivergate/Documents/Source/TeacherHub/docs/archive/superpowers-specs-completed/2026-05-11-mcp-search-bench-report.md"
---

RAG is one of the key building blocks of an agent harness, and the decision about which retrieval tooling to use isn't a small one. So when I read an article claiming a 98% reduction in token usage from one particular MCP search server, I was immediately interested.

But you can't throw the kitchen sink at every project. New tooling comes out thick and fast, and most of it is downstream of someone's specific workload, someone's specific setup, someone's specific account. I'm trialing RuFlow in another repo right now for the same reason: see what it does, see how it changes my workflow, see whether the marginal value beats the marginal cost. The validation step matters.

I wish I could tell you I have a clear answer on RAG tooling. I don't. When I studied Philosophy the opening lecture went: "If you have decided to read Philosophy for answers, you've come to the wrong house. We will teach you to ask questions, and it is questions that eventually you will graduate with." This post is closer to that. What I have, instead, is a list of questions I now think anyone benchmarking an MCP search server should be asking, and the concretes that taught me each one.

The headline first, then the questions.

## Results

I ran two rounds. Round one was Semble against bash-grep across seven tasks. I came out at 7.6% cheaper cumulatively on the MCP arm, well below the 98% the vendor's article had claimed. Round two added Serena and grepai, with a new T8 designed to favour LSP-style symbol-aware retrieval. Same codebase, same operator, same baseline reference, eight tasks per arm.

On the round-two suite, the no-MCP baseline came out ahead of both MCP tools cumulatively.

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

Within MCP space, Serena beats grepai by 28% cumulatively. The win is uneven — half of it comes from T8 alone, another quarter from T4, and the other six tasks net roughly even. Different retrieval mechanisms win different task shapes: symbol-aware retrieval wins function-fixes and broad-coverage refactors; semantic vector search wins concept-to-location lookups and citation-rich Q&A; bash baseline wins direct find-and-replace and pure-recall tasks where the MCP prefix tax dominates.

That's the result. The interesting part is what's wrong with it.

## Methodology

Single git checkout. The only thing that changed between arms was the `.mcp.json` configuration — whether the MCP server was registered for that session. Same repo, same task list, same AGENTS.md, same CLAUDE.md.

The first version of this used two git worktrees and tried to use AGENTS.md as the arm variable. It didn't work. The CLAUDE.md context bled across worktrees, and conventions the agent picked up in one arm carried into the other. The arms were correlated by everything except what I was trying to vary. Single-checkout with `.mcp.json` as the only delta was the version that actually isolated the variable.

I also added permission denies on `Bash(grep|rg|ag|ack|find:*)` on the MCP arms. Prose alone hadn't been enough — the first MCP-tool arm I ran was contaminated, because the AGENTS.md said "prefer the MCP tool; do not use bash grep" and the agent complied roughly half the time, especially under load. Once the deny was in place, compliance jumped sharply. Not perfectly though: about a third of the way through round two I noticed the agent had worked out that `awk '/pattern/' file` is a search tool, and the deny list didn't cover awk or sed. I upgraded the extractor to retroactively reclassify the eight leaked calls as bash-search rather than letting them sit in the generic bash bucket; the raw cost data didn't change, the classification did.

Eight tasks per arm, with `/cost` snapshot before and after each one and the per-task delta computed from the snapshots. The tasks covered a small refactor (env-var swap), a bug fix (interval overlap), a wide-shallow refactor (FullCalendar removal), a feature add (auth listener), a Zod boundary refactor, a `(supabase as any)` cleanup, a self-review pass, and an RLS Q&A — i.e. a mix of task shapes designed to surface where different retrieval mechanisms win and lose.

Per-arm runs went onto local-only git branches (`bench/2026-05-08-baseline-run`, `bench/2026-05-08-grepai-run`, `bench/2026-05-08-serena-run-v2`, and so on) so each arm accumulated as its own auditable commit history without polluting origin. The /cost snapshots and per-task deltas landed in a local SQLite store at `~/.claude/transcripts/2026-05-08-mcp-search-bench/bench.sqlite`, with per-task JSONL checkpoints alongside as replayable raw input — useful when I had to upgrade the classifier mid-arc (see above) and reclassify earlier calls without re-running anything.

One detail about my setup worth flagging: my Claude Code account is on a cohort that swaps native `Grep`/`Glob` for a bash-shell substitute (`tengu_pewter_kestrel.BashSearchTool=20000`). The vendor's reference account presumably isn't. That means "baseline" in my bench and "baseline" in the vendor's number are not necessarily measuring the same underlying tool. I'll come back to this in the concerns.

## Concerns

Several things are wrong with the headline result, or at least worth flagging.

**T8 baseline isolation skew.** The baseline run on T8 happened in a fresh session with no T1–T7 accumulation, while the grepai and Serena T8 runs sat on top of five prior tasks of cumulative session prefix. Adjusted fairly, baseline T8 lands closer to $2.50–$3.00 rather than $1.97. The directional finding (baseline < Serena < grepai) holds, but the magnitude of the no-MCP win narrows.

**Cohort comparability.** As above. My baseline routes through `bash:grep`; the vendor's likely routes through native `Grep`. Different underlying tool. The published vendor number and my measurement aren't strictly comparable, and there's currently no surface where vendors disclose which cohort their bench account was in. This isn't the post's main argument, but it's worth knowing before composing any vendor's MCP benchmark with your own.

**Operator pacing.** This one surprised me. On T6 (pure-recall self-review, zero tool calls), I got a $1.27 cost swing between two arms whose only meaningful difference was whether I'd taken a coffee break between T8 and T6.

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

Claude Code's prompt cache has a five-minute TTL. Any idle gap longer than that forces a full re-cache rewrite when the next prompt fires, and on a heavy-MCP arm with a 200K+ prefix the rewrite costs real money. Grepai's T6 cost $0.46 because I ran the tasks back-to-back. Serena's T6 cost $1.73 because T8 ran overnight before T6 started and some of the prefix had aged past TTL. Same prefix weight, different cache state at T6 time. If a bench harness doesn't model operator pacing explicitly, the pacing variance becomes silent noise in the cumulative number.

**The Serena v1 incident.** Serena reported T1 complete at $0.62, against grepai's $1.02. Looked like a 40% Serena win on direct find-and-replace. It wasn't. The task was to replace every hardcoded `deepl.com` URL with an env-var read, and there are three call sites. The agent ran `find_symbol("deepl")` and `find_symbol("DeepL")`, both correctly returned nothing because "DeepL" isn't a symbol name — it lives in string literals. The agent edited the two sites it could find by inference from filenames and reported done. The third site, `spell-check.ts:93`, was never touched. I caught it on a post-task disk check.

Serena's `--context claude-code` default tool list doesn't expose `search_for_pattern`, on the assumption that users can fall through to native `Grep` when symbol search isn't enough. My account doesn't have native `Grep` (see Cohort above), and the bench denies blocked bash grep. The agent had no string-literal search path at all. One line of YAML in `.serena/project.yml` (`included_optional_tools: [search_for_pattern]`) closed the gap; v2 with the patch cost $1.03, essentially tied with grepai. The 40% Serena win in v1 was incomplete coverage masquerading as efficiency. I kept v1 on its branch rather than overwriting, and ran v2 on a sibling.

## Learnings

If I ran another benchmark like this, here's what I'd do differently.

I'd build the cohort check into the pre-flight. Snapshot whatever the account exposes as the tool surface (`~/.claude/settings.json`, the reported tool list) and put it in the methodology section rather than treating it as a footnote. Cross-account comparison isn't going to compose cleanly until cohort disclosure becomes routine.

I'd model operator pacing in the protocol rather than letting it sit in the noise floor. Either run all tasks back-to-back inside a single cache TTL window, or deliberately introduce idle gaps and report cache state at each task's start, or run multiple replicates with different pacing profiles and report the variance. Any of those would be better than what I did, which was paste the next prompt when I felt like it.

I'd keep prose-mandate documentation and permission-deny enforcement together by default, and I'd make the deny list more exhaustive than feels necessary. The prose trains the agent on cases the deny doesn't cover; the deny makes the rule true. But the deny only covers the tools it names — if you deny grep, deny awk and sed too, because the agent will find any adjacent tool that does the same job.

I'd treat failed arms as deliverables. The Serena v1 incident was the single most actionable finding in round two. If I'd overwritten it with v2 the moment the DoD failed, the post wouldn't have it. Audit-trail preservation costs almost nothing and produces the kind of finding that helps the next user instead of just settling a horse race.

I'd be careful what number I shipped. The cumulative headline is the one the reader will quote, screenshot, and propagate. If the headline doesn't carry the cohort context, the workload-shape context, and the pacing context, then publishing it does the opposite of what a benchmark is for.

## What I might be wrong about

The learnings above are what I took from this particular bench. Whether they generalise to other benches is a separate question.

I might be wrong about cohort exposure being widespread. I have no data on the cohort distribution across the Claude Code population. My belief that other comparative benchmarks have the same issue is a prior, not a measurement.

I might be wrong that operator pacing is a general variable. It is on my workload. If your workload has no idle gaps above five minutes, the cache-TTL mechanism doesn't fire and pacing collapses to noise. The lesson generalises only to bench harnesses that try to model real-world session shapes.

I might be wrong about the v1-preservation principle. It works for cases where the failure points at a structural property of the tool. If the failure is just an operator setup error — wrong API key, wrong working directory — preserving v1 is clutter. The judgment call is whether the failure points at something the next user will hit.

What would change my mind on any of this: a cohort-controlled, multi-codebase, multi-operator benchmark that holds workload shape and pacing constant and still produces a stable per-task win profile. I haven't seen one. If it exists, send it.
