---
date: 2026-05-25
status: roadmap-brief
purpose: Detailed briefs for six blog posts, derived from the blog-material/ corpus and the four sibling repos. Intended to be handed to the project (portfolio /lab) that will host them.
authoring_session: cowork workshop, not /clear-review
---

# Six-post roadmap

Six posts, ordered by evidence density (write first → write last). Each brief contains: thesis, hook, outline, source seeds with paths, verbatim quotes, scope guards, and connections to the other posts. Four of the six are already 60–80% drafted in `blog-material/` — the lift is editorial, not generative.

Two cross-cutting notes:

1. **Voice.** First-person, observational, willing to be wrong. Most of the source seeds already read this way. Don't sand off the uncertainty when editing — the open-questions blocks are part of the value.
2. **Honesty carveouts.** Five of the six posts make a substantive claim about how a tool / workflow / pattern fails. Each post should end with a paragraph naming what it *can't* solve, what it might be wrong about, and what would change the author's mind. Treat the carveout as a load-bearing section, not a footnote.

---

## Post 1 — Grep / Semble bench: the methodology is the contribution

**Status:** ready-to-write — primary seed is 80% drafted
**Audience:** AI tooling builders, eng leaders evaluating MCP adoption, anyone benchmarking agents
**Length target:** 2,000–3,000 words (long-form technical)
**Working titles:**
- "MinishLab claims 98%. I measured 7.6%. Both numbers are right."
- "Three things my agent search benchmark got wrong before it measured anything"
- "What benchmarking MCP search taught me about benchmarking agents"

### Thesis

When you benchmark agent tools on real workflows, the methodology *is* the contribution. Three pivots in this bench — contaminated arms, prose-mandates-with-50%-compliance, mid-bench cohort discovery — each mattered more than the headline ratio.

### Hook

> MinishLab claims 98%. I measured 7.6%. Both numbers are right.

### Source seeds (in `blog-material/`)

Primary: `2026-05-07-semble-bench.md` (5 seeds, 100+ lines).
Supporting: `2026-05-06-semble-bench-setup.md`, `2026-05-06-semble-bench-pivot.md`, `2026-05-06-semble-bench-v2-pivot.md`, `2026-05-08-mcp-search-bench-spec.md`, `2026-05-11-mcp-bench-arc-close.md`.

Session: `data/sessions/2026-05-07/17-30-bench-execution-and-verdict/session.yaml`.

### Outline

1. **The headline.** 98% vs 7.6%, and why both are correct (synthetic retrieval vs mixed real-work).
2. **Methodology v1: two worktrees, AGENTS.md as the arm variable.** Why it failed (CLAUDE.md context bled across branches).
3. **Methodology v2: single checkout, `.mcp.json` as the only arm variable.** What it bought.
4. **The cohort breakage.** `tengu_pewter_kestrel.BashSearchTool=20000`. Native Grep/Glob aren't in every Claude Code account. Why all comparative agent benchmarks are reproducibility theatre until cohort capture exists.
5. **Prose-mandates vs permission-denies (~50% vs 100% compliance).** Discovered by running the first Semble arm contaminated, then restarting with `Bash(grep|rg|ag|ack|find:*)` denied at the permission layer.
6. **The cost lives in `cache_w`, not `tool_calls`.** Why long sessions with idle gaps punish MCP-augmented arms — the recurring cache-rewrite tax bash-grep doesn't pay.
7. **Driver / navigator.** When a recorder session is worth its cost. The bonus pattern that emerged.
8. **What I'd publish if I had to ship one number. What I'd publish honestly.** The honest version names the cohort, the codebase shape, the idle-gap profile, and a confidence interval. The fast version doesn't, and that's why the headline numbers in this space are unreliable.

### Verbatim quotes worth lifting

From `2026-05-07-semble-bench.md`:

> The headline ratio depends entirely on what task you measure. Per-task ratio ranged from 0.35× (T7 RLS Q&A — Semble's biggest win at −65%) to 5.57× (T6 self-review — Semble's catastrophic loss at +457%). Cumulative across all 7 tasks: Semble 7.6% cheaper.

> The cost lives in `cache_w`, not `tool_calls`. Semble's MCP-search results are bigger payloads than bash-grep's match-line outputs… By T6 the Semble session's accumulated prefix was meaningfully heavier. Then a 3+ hour idle gap blew past the 5-minute prompt-cache TTL. When T6 fired, the entire prefix had to be re-written to cache — and re-writing 280K cache_w tokens costs more than re-writing 100K.

> The bench broke before it measured anything — and the breakage was the most important finding.

> The "baseline" arm of MinishLab's headline benchmark and the "baseline" arm of mine are not the same thing. MinishLab measured against canonical `Grep`. We measured against `bash:grep` because that's what our agent had.

> The AGENTS.md prose was documentation; the `permissions.deny` block was enforcement. Anyone deploying any tool-routing rule into a real workflow needs both, but the deny rules are the load-bearing part.

### Risks / scope guards

- Don't oversell. n=1 codebase, one Claude Code account, one MCP tool. The honest framing is *"what I learned about benchmarking agents"*, not *"the right answer about Semble"*.
- Don't make MinishLab the villain. Their number is correct for what they measured. The post's argument is about *workload shape*, not vendor honesty.
- Resist the temptation to publish a clean table. The whole point is that the clean table misleads.

### Connections

Feeds Post 5 (claude-gui) — cohort-driven tool exposure is exactly the kind of substrate a session UI should surface. Also feeds Post 2 (retro-claude) — this bench session is the most-cited entry in the corpus for "what /clear-review made possible".

---

## Post 2 — Retro-claude: what is measurable is improvable (and where it isn't)

**Status:** ready-to-write — corpus is the evidence; editorial selection only
**Audience:** AI tool builders, dev-productivity engineers, anyone running solo agent workflows
**Length target:** 1,500–2,500 words
**Working titles:**
- "What is measurable is improvable — and where it isn't"
- "Retro-claude: storing agent collaboration as queryable data"
- "Six weeks of /clear-review: what the corpus made me change, and what it didn't"

### Thesis

Retro-claude exists because what is measurable is improvable. Six weeks in, the corpus has changed my behaviour in specific named ways — and shown me where measurement isn't enough. The honest post is both halves.

### Hook

> I wrote a tool because I couldn't trust my agent's retro on its own work. Six weeks in, the tool has changed my behaviour — and shown me where measurement hits its limit.

### Source seeds and files

In `blog-material/`: `2026-04-24-clear-review-design.md`, `2026-04-25-clear-review-v011-handoff.md`, `2026-04-30-manual-review-and-kit-v0-1.md`, `2026-05-12-retro-claude-update.md`, `2026-05-11-independent-reviewer-vs-self-review.md`, `2026-05-03-portfolio-phase-3.md` (the 4/5 vs 2/5 gap), `2026-05-12-clear-review-askuserquestion-retro.md`, `2026-05-20-v0-5-substrate-and-guard-commit.md`.

In `docs/decisions/`: ADR-0011 (the same-agent bias rationale), ADR-0012 (turn events), ADR-0014 (clear-review redesign).
In `schemas/`: `ontology.v0.2.yaml`, `turn-event-types.v1.yaml`.
In `.claude/commands/`: `clear-review.md`.

### Outline

1. **The premise.** Same-agent self-verification is biased — the agent that wrote the code defends it. The retro window is the cheapest moment to capture honest signal *despite* the bias (full context still in working memory, transcript still accessible, user present, next session not started).
2. **The schema.** Closed-set ontology, `fit_confidence: high | forced | other` as the evolution driver, `blog_seeds` as a structured side-output. Why closed sets, why append-only data, why `forced` is more interesting than `high`.
3. **What changed because the data forced it.** Named, with sessions cited:
   - `docs/process/reviewer-scopes.md` was codified after parallel-fanout caught BLOCKERs unit tests missed (Phase 0.6 session).
   - The corpus-audit lens was added to the standing reviewer scopes after one session's pre-commit pass missed an ADR contradiction.
   - The deferral-on-scope-addition rule was named after the 285-minute Phase-3 session that produced the 4/5 self-rating vs 2/5 user-rating gap.
4. **What didn't change.** "Verification-skipped-self" appears 21+ times across 7 sessions. Counting it isn't fixing it. The structural answer was bounded fanout, not "try harder" — but that's a workflow change, not a *measurement* change.
5. **The 4/5 vs 2/5 case study.** *"I was rating outputs. The user was rating experience. Both ratings were correct."* What that data point unlocked.
6. **The honest carveout.** The system measures what it can measure. Things that aren't in the schema don't show up. Closed-set ontology trades coverage for queryability. And: the tool has selection bias — sessions where /clear-review ran are not a random sample of sessions.

### Verbatim quotes worth lifting

From ADR-0011 §Context:

> The agent that ran the session has investment in its own decisions, recency framing, and a coherent narrative it will defend. Asking the same agent 'did this work' produces systematically optimistic answers.

> The retro moment at `/clear-review` is the only point in the lifecycle where (a) full session context is still in the agent's working memory, (b) the transcript is still accessible cheaply, (c) the user is present, and (d) the next session has not started, so signals are still cleanly attributable.

From `2026-05-03-portfolio-phase-3.md`:

> I was rating outputs. The user was rating experience. Both ratings were correct. The work shipped clean… But the *shape* of the session was the failure: 11 commits, 8 sub-agent dispatches, three distinct mid-stream scope additions, no pause-points where I asked "want to defer to a fresh session?"

From `2026-05-11-independent-reviewer-vs-self-review.md`:

> The reviewer didn't have to be smarter — it had to be uncorrelated. A fresh context, no investment in the design holding up, reading the artifacts as if for the first time.

From `2026-05-12-retro-claude-update.md`:

> The agent's job becomes 'draft + dispatch + triage' rather than 'write + hope.'

### Risks / scope guards

- Don't write a tool ad. The interesting thing is what happened when the tool was used on the author — including where it didn't help.
- Don't bury the carveout. A reader should walk away knowing what the schema *can't* see, not just what it can.
- Don't over-quote the ADRs. They are dense; one quote per ADR is enough.

### Connections

Sibling to Post 7 (RAD/LAD) — that post is the editorial conclusion the corpus enables. Sibling to Post 5 (claude-gui) — runtime-layer answer to the same problem retro-claude addresses at the persistence layer.

---

## Post 3 — Right-aligned development: what solo-LLM workflows quietly lose

**Status:** ready-to-write — direct repo evidence + clear thesis
**Audience:** engineering leaders, solo engineers, anyone in the pre-LLM-team → solo-LLM transition
**Length target:** 1,500–2,000 words
**Working titles:**
- "I miss right-aligned development"
- "The pairing layer agentic workflows leave out"
- "Right-aligned development: what solo-LLM dev quietly loses"

### Thesis

Right-aligned development (swarming on Done in pre-LLM human teams) wasn't process — it was a *learning structure*. Solo-LLM left-aligned dev reproduces the parallelism via reviewer-fanout but loses the mutual-reading. Tech debt accumulates in the gap.

### Hook

> I've been running my own work for six weeks. I miss having a teammate read it.

### Definitions to set up early

- **RAD (right-aligned development):** the pre-LLM team pattern where engineers swarmed on the Done / In-Review column of a kanban board. Pairing, mob debugging, cross-stream code review, design walkthroughs. The work moved right via collaboration; the *people* learned by following the work right.
- **LAD (left-aligned development):** the post-LLM solo pattern where engineers pull from Ready/Todo and execute through agentic delegation. Work moves right by *throughput*; the person stays at the left edge, dispatching.

### Source seeds and files

In `blog-material/`: `2026-05-04-portfolio-ux-iteration.md` (the "blind spot the fanout creates" seed — load-bearing), `2026-05-11-independent-reviewer-vs-self-review.md`, `2026-05-11-phase-05-three-reviewer-fanout.md`, `2026-05-15-reviewer-fanout-schema-check.md`, `2026-05-21-feedback-pass-1-fanout-catches.md`.

In `docs/process/`: `reviewer-scopes.md` (the codified four-scope pattern).

### Outline

1. **What RAD was.** Swarming on Done as a learning structure, not a process optimisation. Pair-programming built shared models. Mob debugging transferred knowledge as a side effect. Code review made the reviewer *know the codebase*, not just approve the diff.
2. **What LAD is.** Solo + LLM. Pulling from Ready. Agentic execution. Reviewer-fanout as the parallelism primitive that *tries* to replace pairing.
3. **The fanout pattern.** Three parallel reviewers, non-overlapping scopes (security/framework/ops/corpus-audit). What it recovers from solo work — independent uncorrelated reading.
4. **The blind spot the fanout creates.** Quote the seed directly. The fix-agents' code goes un-end-to-end-read because no second human is doing it. *"The same shape of 'verification skipped' reappears one level up the orchestration tree."*
5. **Why this is structurally different from "review the reviewers".** You can't recurse your way out of needing mutual reading. Mutual reading isn't just verification — it's the *learning side-effect* of two humans loading the same context simultaneously. Recursion gets you more verification but not more learning.
6. **What I'd want back, operationally.** Concrete asks, not nostalgia: mob review of LLM-authored code at PR boundaries; periodic pair sessions with another solo-LLM engineer; required cross-reads where the reviewer must explain the diff back to the author. Each is a recovery vector, not a full restoration.
7. **The honest carveout.** Solo-LLM is fast, and the speed matters. Tech debt from LAD is real and invisible until it isn't. The post isn't "go back to RAD" — it's "name what LAD costs so we can build the recovery layer deliberately".

### Verbatim quotes worth lifting

From `2026-05-04-portfolio-ux-iteration.md` (the blind-spot seed — load-bearing):

> Multi-agent dispatch creates an inverse blind spot to the one it solves. Single-agent code review caught the must-fix bugs the original implementer missed… but the fix-agent dispatch then created a new gap where the parent agent didn't review the agents' work. The same shape of "verification skipped" reappears one level up the orchestration tree.

From `2026-05-11-independent-reviewer-vs-self-review.md`:

> The reviewer didn't have to be smarter — it had to be uncorrelated.

> Thorough self-review is not adversarial review. My 11 checklist items asked "did I check?" — and the answer was yes, I checked every item. The blind spots were the things one layer up: what assumptions did I import from the upstream contract without questioning?

From `2026-05-11-phase-05-three-reviewer-fanout.md`:

> Reviewers using training-data API shapes against installed-version reality is a structural failure mode of every LLM review.

### Risks / scope guards

- Don't get nostalgic. The post is "what solo-LLM loses", not "the old days were better". The reader is someone making the transition *now* and needs honest tradeoffs.
- Don't propose a tool. The recovery vector is process, not software (mostly). If you propose tooling at all, it's Post 5's territory.
- Be precise about RAD. Many readers won't have lived it; the early definitions need to land.

### Connections

Editorial conclusion of Post 2 (retro-claude). Sibling to Post 5 (claude-gui) — that project is one partial tooling answer to this problem.

---

## Post 4 — Bias in CV-vs-JD tools, and why mine goes the other way

**Status:** needs-research (one external citation)
**Audience:** hiring managers, candidates, AI tooling people, ICs writing CVs
**Length target:** 1,500–2,000 words
**Working titles:**
- "I built a CV-vs-JD tool that goes against every other CV-vs-JD tool"
- "Conservative bias as a design choice"
- "Why my JD matcher refuses to give you a percentage"

### Thesis

Most CV-vs-JD tools optimise for higher match scores. Mine optimises for honest gaps. The bias is *designed*, not learned — and it's structurally fighting three things: candidate self-presentation bias (especially asymmetric by demographic), recruiter-tool aesthetics (the percentage as social signal), and the keyword-stuffing arms race.

### Hook

A side-by-side: a generic JD matcher's output (75% match, optimistic chips) vs the portfolio's (*"7 hits, 4 stretches, 1 honest gap"*). Same JD. Same CV.

### Source files

In `portfolio/`:
- `lib/jd-prompts.ts` — the matcher prompt with Example 7 trap (lines 58–134, especially 62, 74, 128–132).
- `docs/adr/0016-jd-matcher-honesty.md` — *"Every Hit must be defensible if a hiring manager asks Oliver 'which bullet is this?'"*
- `docs/adr/0017-no-stretch-slider-out.md` — the slider that can't slide a Miss out.
- `docs/adr/0018-no-percentage.md` — *"A '67% match' on the page, screenshotted into a recruiter Slack channel, also reads as a self-rating Oliver does not endorse."*
- `docs/specs/phase-3.md` — the rationale.

In `blog-material/`: `2026-05-03-portfolio-phase-3.md` (the "agent rates outputs / user rates experience" parallel).

### Outline

1. **The market is biased toward optimism.** CV Wolf, Teal, recruitRyte, MyJobMag — all optimise the match score. Screenshots of 80% land in recruiter Slacks. Candidates optimise keywords for the metric. Walk through why this is structurally bad for hiring signal.
2. **The research on self-presentation bias.** *Needs research.* The widely-cited HP-internal finding that women apply when they meet 100% of requirements and men apply at 60%. Find the actual source (it's frequently misattributed); current research from McKinsey, LinkedIn data, or academic JD studies. Cite carefully — this stat has been disputed and refined.
3. **Why a percentage is the wrong UI.** ADR-0018 quote. A score implies comparability across JDs that doesn't exist, and aggregation across requirement types that's category-confused (a "Hit" on a stack item is not equivalent to a "Hit" on a years-of-experience claim).
4. **The conservative-bias prompt.** Example 7 trap (citing a tech-stack entry as a bullet). The slider that can't slide a Miss out. The locked editorial copy (*"7 hits, 4 stretches, and 1 honest gap"*) instead of a numeric output.
5. **The "agent rates outputs / user rates experience" parallel.** Same bias shape, one level up. The candidate rates their own CV's match generously; the recruiter reads it as evidence; the gap is invisible until contact.
6. **What this tool can't fix.** A candidate's conservative tool doesn't fix the recruiter's optimistic one. The asymmetry persists. This is the carveout: honest tooling on one side of an asymmetric system doesn't restore symmetry.
7. **The wider point.** Honesty as a design constraint, not bias correction. The matcher isn't fighting an LLM bias — it's fighting three social pressures (presentation, aesthetic, convention) that the LLM would otherwise reproduce.

### Verbatim quotes worth lifting

From `portfolio/lib/jd-prompts.ts`:

> A Hit requires concrete cited evidence. You must name a specific cite ID… If you cannot name a specific bullet or project that supports the requirement, return Stretch — never Hit.

> The stretch level NEVER moves Stretch/Miss. A Miss at strict is still a Miss at generous. The visitor cannot slide their way out of an honest gap.

From ADR-0016:

> Every Hit must be defensible if a hiring manager asks Oliver 'which bullet is this?' A neutral or generous matcher will produce Hits that don't have concrete supporting bullets, will paper over partial matches as full ones, and will generate a chip grid that looks good in a screenshot but loses trust on contact with anyone reading it carefully.

From ADR-0018:

> A '67% match' on the page, screenshotted into a recruiter Slack channel, also reads as a self-rating Oliver does not endorse.

> No exposed numeric score in the JSON response either, even for downstream consumers, to avoid creating a foothold for future percentage UI.

### Research to do before writing

- **Find a current citation for the application-threshold gender asymmetry.** The HP report is widely quoted but the original source is contested. Current academic research (post-2020) is the safer cite. Hewlett & Marshall 2014 ("Women and the Vision Thing") or the Harvard Business Review write-up of the HP data are the typical references. A 2026-current source is preferable.
- **Find one comparison screenshot of a competing tool** for the side-by-side hook.
- **Optionally:** survey 3–5 of the current CV-vs-JD tools and document their score outputs to ground the "market is biased toward optimism" claim.

### Risks / scope guards

- Don't make it about Oliver's CV specifically. The strongest version uses the tool as a vehicle for the argument — the tool-as-essay framing.
- The application-threshold stat is contested. Cite carefully. If the cite isn't solid, drop the specific number and use a softer framing about self-presentation asymmetry.
- Don't claim the tool fixes hiring bias. It doesn't. The carveout is that the asymmetry persists.

### Connections

Sibling to Post 2 (retro-claude) and Post 3 (RAD/LAD) — all three are essays about preferring honest signal over optimistic signal. Shares the conservative-bias pattern with Post 6 (portfolio /chat).

---

## Post 5 — Reviewing agent code without reading it: claude-gui

**Status:** WIP project — write as project-in-flight retrospective
**Audience:** engineers using Claude Code, tool builders, anyone navigating large agent-authored diffs
**Length target:** 1,500–2,500 words
**Working titles:**
- "Reviewing agent code without reading it: substrate-driven UIs"
- "I built a GUI over my agent's sessions in one conversation"
- "Three smart moves and one open question: building claude-gui"

### Thesis

When you can't read every line an agent writes, the tool's job is to filter what you *do* read. claude-gui's smartest move was finding the substrate — Claude Code's per-subagent JSONL traces — and building UI on top of it. The second-smartest was using a small LLM (Haiku) to extract structure from another LLM's prose.

### Hook

> I spent multiple rounds brainstorming how to detect when a code review happened. Then I checked the substrate.

### Source seeds and files

In `blog-material/`: `2026-05-24-claude-gui-build-arc.md` (three blog seeds — load-bearing).

In `claude-gui/`:
- `README.md`, `package.json`
- `electron/ai.js` — the `FINDINGS_SYSTEM_PROMPT` and `extractFindings` helper
- `public/index.html` — the addressed-on-edit UI text
- Commit range 425d9b6 → 3040f8a (the one-conversation build arc)

### Outline

1. **The problem.** Solo-LLM dev produces too much code to read line-by-line. Manual review doesn't scale. Auto-merge isn't safe. The middle path is *filtered* review — the GUI's job is to decide what reaches the human.
2. **Three smart moves in this project.**
   - **(a) Subagent JSONL traces as the detection signal.** Quote: *"When you find yourself enumerating five strategies that all require a model-side or user-side contract, you're probably solving the wrong problem; check whether the substrate already gives you what you need."* Walk through the discovery — five proposed strategies, then a one-tool-call check that surfaced the real signal at `~/.claude/projects/<cwd>/<parent-id>/subagents/agent-<id>.{meta.json,jsonl}`.
   - **(b) Haiku as a structure-extractor for Sonnet's prose.** The `extractFindings` pattern. Sonnet writes the review; Haiku converts it into `{file, severity, title, description}` JSON. The human reads structured findings, not paragraphs.
   - **(c) Custom tab rail when tabs carry telemetry.** *"The platform's tab bar is structurally too thin."* Why native macOS tabs were the wrong default for a session telemetry product.
3. **One quietly clever architectural choice: addressed-on-edit.** Findings flip to "addressed" when the file is edited — optimistic but reversible. Reduces the manual resolve burden in the common case (claude edits = claude is fixing); manual reopen exists as the escape hatch.
4. **What's next — the WIP features.** Frame each as a sketch, not a promise:
   - Single-click reviewer dispatch per file / selection. UI sketch: right-click a file → "Review" → scope picker from `docs/process/reviewer-scopes.md` → spawns subagent → findings extracted via Haiku → appears in Review panel.
   - Spaghetti / simplicity analyser. Static metrics (cyclomatic complexity, dependency fan-in/out, call-graph depth) + Haiku-extracted "what is this file doing?" → severity bucket on the intent-vs-complexity mismatch.
   - Per-finding diff drill-through. Click a finding marked "addressed" → see the diff hunk that addressed it.
5. **The wider principle: substrate-driven UIs > pattern-driven UIs.** If you find yourself designing five strategies that all rely on model or user contracts, the substrate already has what you need. Most agent-tooling UI is currently pattern-driven; substrate-driven is more durable.
6. **Open question (the honest carveout).** Does the addressed-on-edit heuristic false-positive enough to annoy real users? It presumes too much when an edit is unrelated to outstanding findings. Shipped with manual reopen as the escape; needs real-use data.

### Verbatim quotes worth lifting

From `2026-05-24-claude-gui-build-arc.md`:

> Started with a basic localhost pty+xterm prototype on the right side of a browser tab. Ended with a multi-window Electron app… One conversation, one git arc (425d9b6 → 3040f8a).

> When you find yourself enumerating five strategies that all require a model-side or user-side contract, you're probably solving the wrong problem; check whether the substrate already gives you what you need.

> The "use the platform" instinct is right when the platform's affordances cover the use case. When the use case is "glance across N concurrent agent sessions and see which one needs attention", the platform's tab bar is structurally too thin.

From `claude-gui/electron/ai.js`:

> You convert free-form code review text into a structured list of findings. A finding is a single concrete issue with: which file, severity, a short title, and a brief description… Only include findings that name a specific file. Skip generic praise, summaries, or process notes.

### Risks / scope guards

- Don't overclaim. This is WIP. Frame as *"here's what's worked and what's next"*, not *"here's a finished tool"*.
- Audience risk: the post is most useful to people who already use Claude Code. Frame each move around the *principle* (substrate-driven, structure-over-prose, telemetry-tab-rail) so non-users still get value.
- One-sentence ClipFix nod fits naturally in §1 — *"the small clipboard utility I built earlier follows the same logic: accept the friction the platform won't remove, then minimise it"* — without expanding into a separate post.

### Connections

Post 3 (RAD/LAD) names the problem this tool addresses. Post 1 (Semble bench) uses the same per-session JSONL substrate to extract cost data — the substrate-driven principle generalises.

---

## Post 6 — Four sliders, one chat: character of UX as the abstraction

**Status:** retrospective + feature design — longest brief (needs both backward- and forward-looking halves)
**Audience:** design engineers, portfolio/CV authors, anyone building styling systems with LLMs in the loop
**Length target:** 2,000–3,000 words
**Working titles:**
- "Four sliders, one chat: character of UX as the abstraction"
- "How my portfolio rethemes itself live (and why I'm adding a chat)"
- "Styling isn't decoration — it's character assignment"

### Thesis

The four sliders aren't decoration; they assign *character* to the UX. A11y is the floor. The same abstraction (a pure function from four input axes to ~50 derived CSS custom properties, written without React re-renders) extends naturally to a `/chat` feature whose response visualisation depends on what the user asks. The post argues that *character-of-UX is the abstraction*, not the decoration.

### Hook

> The portfolio has four sliders that retheme the page live. They aren't styling decisions; they're character assignments.

### Source files

In `portfolio/`:
- `lib/style-tokens.ts` — `stateToTokens()`, `bulletCapFor()`, `mix()` (linear-RGB hex blending), `lerp`
- `styles/tokens.css` — ported design tokens
- `docs/adr/0001-stack.md` — the Astro-vs-Next-16 decision
- `docs/adr/0002-design-system.md` — design-as-authoritative (no relitigation)
- `docs/adr/0005-style-tokens.md` — no-React-re-render, pure-function-from-axes
- `app/layout.tsx` + `lib/bootstrap-script.ts` — bootstrap inline script to avoid first-paint flash
- `design-references/README.md`, `design-references/design-tokens.css`, screenshots

In `blog-material/`: `2026-05-02-portfolio-phase-0.md`, `2026-05-02-portfolio-phase-1-three-rounds-of-all-green.md`, `2026-05-04-portfolio-ux-iteration.md`.

### Outline — retrospective half

1. **What the sliders actually do.** The four axes (density, polish, hierarchy, motion) and the ~50 derived tokens. Show the pure function.
2. **The architectural choice.** CSS custom properties as the layer, not React props. No re-renders on slider movement. Why this is the right layer for live retheming.
3. **A11y as the floor.** The WCAG `--muted` correction (`#7a746c` → `#6b645b`) — a guardrail dressed as a style decision. The design didn't catch it; the code did. *Accessibility is what survives the slider extremes.*
4. **Design as authoritative.** ADR-0002. Why "no relitigation" was load-bearing — every phase that reopened a settled colour or font would have eaten a session. Locking the design was a *velocity* decision, not a control one.

### Outline — forward half: `/chat`

5. **The extension.** A `/chat` page where response visualisation depends on the question.
   - **Question router (LLM intent classifier).** "What's Oliver's most data-heavy project?" → chart of bullets-by-quant. "Tell me about OpenSC" → timeline. "Does he know Ethereum?" → JD-matcher-style chip with conservative bias. "What's his writing voice like?" → toggleable two-voice render keyed off `/tone`.
   - **Shared token system.** The active slider state carries through. Brutalist mode reskins chat the same way it reskins the CV. The chat doesn't re-render content — only presentation.
   - **Conservative-bias chat.** Same Example-7 defense as the JD matcher. If the answer isn't in `content/cv.json`, the chat says *"Not in the CV"*. Refuses to invent. Same honesty architecture, different surface.
6. **Why this matters.** Demonstrates that *character-of-UX is the abstraction* — axes → tokens → presentation generalises beyond decoration. The chat is the same system, applied to a different content shape.
7. **What I'd be careful of.** Don't over-engineer. The router is an LLM classifier, not a state machine. Keep visualisations few (4–6 max) and well-built rather than many and shallow. The token system constrains visualisations more than it enables them — that's a feature.
8. **Open question (the honest carveout).** Does the chat add a rhetorical mode the five existing pages don't already cover? `/` is the CV. `/tone` is voice. `/jd` is comparison. `/lab` is process. `/game` is play. `/chat` would be… conversational synthesis? Justify or kill before building.

### Verbatim quotes worth lifting

From `portfolio/docs/adr/0005-style-tokens.md`:

> Moving a slider 200 times in a second triggers 200 calls to setProperty on one element — fast and GPU-friendly. The CV's React tree never re-renders.

From `portfolio/CLAUDE.md`:

> Treat the design as authoritative. Colors, typography, copy, spacing, and interactions in the design are real and must be recreated faithfully.

From ADR-0002:

> Two failure modes are likely: (1) Drift. Per-phase decisions slowly walk away from the locked design, each individually defensible, none caught. (2) Relitigation. Each phase reopens decisions the design has already answered.

### Feature design notes (for the future Claude session executing /chat)

When this post graduates from blog to feature spec, the following design constraints should hold:

- **Intent classifier returns a discrete `visualisation_kind` from a closed set** (`chart`, `timeline`, `chip`, `prose`, `voice-toggle`, `not-in-cv`). Closed set, not free-text — same ontological rigour as retro-claude's schema.
- **Each visualisation is a separate React component** that reads from `content/cv.json` (typed via the existing Zod schemas) and the active style-token state. No bypasses.
- **The conservative-bias guard is the prompt-level Example-7 pattern**, applied to *any* answer that names a company, technology, or project: if it can't be cited to `cv.json`, return `not-in-cv`. Mirror the JD matcher's contract.
- **Cost ceiling is shared with the JD matcher route**, not separate. One Anthropic API budget; one cost-log table; the /chat route is a peer of `/api/jd`, not a new tier.
- **No localStorage / sessionStorage** (per portfolio's existing artifact constraints). Chat history lives in `nuqs`-style URL state or server-side per-session storage.

### Risks / scope guards

- The `/chat` design is speculative. Be honest about that in the post — frame the forward-half as *"here's where I'd extend the abstraction next"*, not *"here's the next phase"*.
- Don't relitigate the design system in the retrospective half. ADR-0002 says design is authoritative; the post should honour that.
- The post is *long*. If word budget tightens, drop the forward half into a follow-up rather than compressing both.

### Connections

Shares the conservative-bias pattern with Post 4 (JD matcher). Shares the substrate-driven design principle with Post 5 (claude-gui). The retrospective half is grounded; the forward half is the most speculative content in the roadmap — flag accordingly when handing off.

---

## Cross-post structural notes

**Order to write.**

| # | Post | Why this order |
|---|---|---|
| 1 | Grep / Semble bench | Strongest evidence, most-drafted seed. Builds momentum. |
| 2 | Retro-claude | The frame the rest sit inside. Posts 3 and 5 reference it. |
| 3 | RAD vs LAD | Editorial conclusion of Post 2. Best argued with the corpus fresh. |
| 4 | JD matcher | Needs one external research pass (the application-threshold cite). Slot here once research is done. |
| 5 | claude-gui | WIP, frame as project-in-flight. Sits well after Posts 2 + 3 set up the problem. |
| 6 | Portfolio + /chat | Longest brief, mixes retro + feature design. Write last when the editorial muscle is warm. |

**If publishing as a series** (one umbrella narrative: *"What I learned building agent-collaboration tools in 2026"*), the reading order is: retro-claude → Semble bench → RAD/LAD → claude-gui → JD matcher → portfolio. Substrate → measurement → critique → tool → application → presentation.

**Shared editorial discipline.**

- Each post ends with an "honest carveout" paragraph naming what the post / tool / pattern can't do.
- Each post links forward and backward to its siblings (footer cross-link block).
- Voice stays first-person observational. The seeds already read this way. Don't sand off the uncertainty.
- All factual claims about retro-claude state (recurrence counts, session quotes, ADR numbers) should be **re-verified against the live repo** at write-time. The corpus moves; the briefs are point-in-time.

**Where each post will be hosted.**

Assumption: all six land on the portfolio's `/lab` page (per the portfolio's Phase 4 plan). If the venue changes (Substack, HN-targeted long-form, technical conference write-up), the cross-link footer block changes but the body content doesn't.
