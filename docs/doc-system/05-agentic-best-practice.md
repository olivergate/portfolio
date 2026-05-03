---
title: Agentic-Coding Documentation Best Practice
purpose: Opinionated distillation of external research into what a well-designed doc system for an AI-assisted repo looks like in 2026.
audience: agents + humans
last_verified: 2026-05-03
---

# 05 — Agentic-Coding Documentation Best Practice

Synthesis of external research into what a well-designed doc system for an AI-assisted repo looks like in 2026.

This file is an opinionated distillation — 12 principles, each grounded in public sources. The next file (`06-target-system.md`) applies them to your specific project (if you author it).

---

## The shifting landscape

In the 18 months before this audit, several conventions have consolidated:

- **Cross-tool convergence on `AGENTS.md`.** 60,000+ repos ship one; it is read by OpenAI Codex, Google Jules, GitHub Copilot, VS Code, and Cursor. Claude Code integrates via `AGENTS.md` import in `CLAUDE.md` or a direct symlink.
- **Path-scoped rule files** (Cursor MDC, Claude `<.claude/rules/>`, Copilot instruction files) have replaced the older "import everything at launch" pattern. The change is significant: loading ~200 lines every session beats loading ~2000 lines imported from fifteen files. The portfolio doesn't use path-scoped rules — the project is small enough that `CLAUDE.md` covers the always-loaded surface — but the principle holds for larger projects.
- **ADRs** (Architecture Decision Records) are seeing a second wave of adoption, now specifically because they solve a problem agentic coding made worse: specs rot as code evolves, but a *decision at a point in time* doesn't rot.
- **Tests-as-living-specs** has matured from BDD-community doctrine into mainstream practice — if a spec can be expressed as a test, the test is the spec and the prose doc links to it.

---

## The 12 principles

### 1. Cap the always-loaded operating rules at ~200 lines

Anthropic's memory docs: "Longer files consume more context and reduce adherence." 200 lines is the stated number. This is the single most concrete guideline in the Claude Code documentation.

**Why.** CLAUDE.md / AGENTS.md is loaded every session. Every extra line costs context budget and weakens compliance. Adherence degrades measurably past 200 lines — not linearly, *step-change*.

**Implication.** Anything that doesn't apply every turn must move out: path-scoped rules, skill invocations, practice docs, reference material. Ruthless triage.

### 2. Split agent-facing and human-facing docs

`README.md` is for humans: marketing, setup, what the product is. `AGENTS.md` / `CLAUDE.md` is the operating manual for machines. They have **opposite information hierarchies**:

- Humans skim structure, tolerate ambiguity, fill in context with domain knowledge.
- Agents read linearly, weight tokens by position, cannot disambiguate "it/this/that", don't guess versions.

Next.js, Vercel AI SDK, and Anthropic Cookbook all do this split. None tries to serve both audiences from one file.

### 3. Ship one canonical operating-rules file; import or symlink everywhere else

The correct deployment: one `AGENTS.md` at repo root, then `.github/copilot-instructions.md`, `.cursor/rules/global.mdc`, and `CLAUDE.md` each point at it (symlink or `@AGENTS.md` import).

**Why.** Any diffusion across tool-specific files will drift. Next.js canonicalizes `AGENTS.md` and makes `CLAUDE.md` a symlink.

### 4. Separate rules by load-cadence, not by topic

Three tiers:
- **Load every session (≤200 lines):** `AGENTS.md` / `CLAUDE.md` — facts that matter every turn.
- **Load when matching files open:** `<.claude/rules/area.md>` with `paths:` frontmatter (not in use in this project).
- **Load only on explicit invocation:** `.claude/commands/<name>.md` slash commands (the portfolio's tier here) and `<.claude/skills/name/SKILL.md>` skills (not in use).

Topic-based imports (`@authentication.md`, `@database.md`) still load at launch. Path-based is the upgrade.

### 5. Use the three-tier boundary: Always do / Ask first / Never do

GitHub's analysis of 2,500+ AGENTS.md files: this is the single most common and most effective pattern for preventing destructive mistakes. Not a checklist of commands — a short, bright declaration of what the agent can do freely, what needs confirmation, and what is forbidden.

### 6. Command-first, example-first

Every workflow section starts with a runnable command block including exact flags. Every style rule has a good-vs-bad code pair. Abstract prose belongs in explanation docs, not in agent rules.

**Measurable outcome in GitHub's analysis:** concrete code examples dramatically outperform abstract guidance at reducing recurring agent failures.

### 7. Adopt ADRs for architectural choices

`docs/adr/NNN-title.md`, Nygard format (Title, Status, Context, Decision, Consequences). Editability of an Accepted ADR is governed by ADR-0012 §Editability policy (mirrored at `docs/adr/INDEX.md §Editability policy`).

The key move for agentic coding: **instruct the agent in AGENTS.md:**

> Before making an architectural change, read `docs/adr/INDEX.md`. If your change would contradict an Accepted ADR, stop and surface it before proceeding.

Vercel AI SDK's AGENTS.md implements this verbatim. ADRs don't rot — they accumulate. This is the one doc type that survives code drift by design, because it describes a moment in history, not current state.

### 8. Apply Diataxis quadrants to the live `docs/` folder

Diataxis (Daniele Procida) identifies four doc modes — tutorial, how-to, reference, explanation — and the core insight is that conflating them is the primary failure mode. A how-to written like a reference loses task-orientation; a tutorial written like explanation stops teaching.

In practice:
- **Tutorials:** a `tutorials/` section — getting-started, learn-by-doing. Rare; often lives in README.
- **How-to guides:** a `how-to/` section — task-oriented recipes ("how to add a new endpoint", "how to seed test data").
- **Reference:** `<docs/reference/>` — API contracts, directory structure, data model, config schema. The portfolio doesn't have a separate reference dir; the equivalent role is played by `CLAUDE.md §Where things live` plus inline JSDoc/types.
- **Explanation:** an `explanation/` section or `docs/adr/` (ADRs) — *why* something is the way it is.

Feature docs sit mostly in reference mode but lean explanation. Specs and PRDs are neither — they're time-bound artifacts, not stable docs, which is why they live in their own folders.

### 9. Prefer tests and type schemas over prose for contracts

If a behavior can be captured in a test (Vitest, pytest, etc.), a database assertion (pgTAP, etc.), or a runtime schema (Zod, Pydantic, etc.), the test is the living spec. The doc just points at it.

**Why this matters for agents.** Code drifts; prose docs can't sense drift. A test that runs in CI fails when the spec breaks. Agents are exceptionally good at keeping tests and docs aligned *if* the test is the canonical source.

This doesn't eliminate prose docs — narrative justification and user-flow diagrams still belong in prose. It *does* mean every endpoint contract, data-model constraint, and behavioral invariant should have a test-first representation.

### 10. Archive on merge, not on cleanup day

When a PR ships, `git mv` the plan/spec from the project's in-flight specs directory into its archive directory **in the same PR** as the shipping commit. Not later. Not in a monthly cleanup.

**Why.** Delayed archiving is the single most common cause of "live docs folder full of shipped work" rot. Agents reading live specs can't distinguish "this is current design" from "this is already shipped and archived." The discipline has to be a merge-time reflex.

**Portfolio note.** The portfolio doesn't archive yet — phase specs stay in `docs/specs/` post-ship and the README's status table flips to `Done`. Small enough that the rot risk is low; revisit if the specs dir gets noisy.

### 11. Every doc starts with a one-line purpose statement

First 50 tokens must answer: *what is this doc and when should I read it?* If an agent loads a section without that answer upfront, it wastes context trying to infer the doc's role.

Also adopt an `llms.txt`-style index: one `docs/INDEX.md` that lists every doc with a one-line description so agents can triage which to open without reading all of them. The llms.txt spec is at llmstxt.org; no major LLM vendor has confirmed they respect these files during web crawling, but for an internal index it's a zero-cost win.

### 12. Write for an LLM, not for a human with context

Measurably different from standard technical writing:

| Do | Don't |
|----|-------|
| Absolute paths: `src/lib/db/server.ts` | "the server client file" |
| Repeat the noun | "it / this / that" |
| One term per concept | Synonyms for variety |
| Version numbers: "Next.js 15.3" | "Next.js" |
| Tables and bullets | Prose paragraphs for factual content |
| Front-loaded summary (first 50 tokens) | Buried purpose statement |
| Self-contained headings | Headings that depend on previous context |
| Exact runnable commands with flags | "Run the deploy script" |

These choices are measurably worse for a human skimming with full project context. Accept the tradeoff: keep `README.md` and tutorials in human-reader style; write agent-facing docs in LLM-reader style.

---

## Agent-maintained docs: what works and what doesn't

Taken from Swimm (drift-detection-first), Mintlify (AI-assisted edits), Stainless (reference-gen from OpenAPI), and public writeups.

**Works:**
- **Drift detection.** Agent diffs code against doc, surfaces suspected stale claims, proposes updates. Swimm is the strongest commercial example; enterprise-adopted in legacy codebases.
- **Auto-regenerated reference material** (API signatures, CLI usage, type exports) from a machine-readable source.
- **ADR discipline.** ADRs don't rot because they don't need to stay in sync — they're historical.
- **Archive-on-merge enforcement.** A PR-merge hook that moves a spec to archive when a specific marker is present.

**Fails:**
- **Autonomous doc writing without review.** Tone goes flat; details become plausible-but-wrong; humans reject the output. Every production success still has a human-approval step.
- **Fully regenerated tutorials.** The teaching voice is distinctive; agents flatten it.
- **Silent doc edits.** An agent editing a doc invisibly loses trust and drift sneaks in the other direction.

**Consensus.** Agents are best at **proposing** doc changes and **flagging drift**, not owning docs end-to-end. Design the steward as agent-proposes / human-approves, with the proposal mechanism automatic (git hook, CI check, or slash command).

---

## Notable repos to reference

- **Next.js** (`vercel/next.js/AGENTS.md`) — ~400 lines, command-heavy, uses `$skill-name` references pointing at `.agents/skills/<name>/SKILL.md`. `CLAUDE.md` is a symlink to `AGENTS.md`.
- **Vercel AI SDK** (`vercel/ai/AGENTS.md`) — ~250 lines, tight. Explicit task-completion guidelines ("Bug fix = reproduction example + unit test + fix + changeset"). ADR-first instruction to agents. "Do Not" section at the bottom.
- **Anthropic Cookbook** (`anthropics/anthropic-cookbook/CLAUDE.md`) — ~90 lines. Minimalist. Hard-coded model aliases in "Key Rules" section — a rule that would rot without regular maintenance, kept in CLAUDE.md precisely because it matters every session.

These are three concrete reference points for calibrating "what does good look like" when sizing your project's `AGENTS.md`.

---

## Principles to evaluate per-project

Some principles in this file may not apply to every project. Worth naming explicitly so you don't over-adopt:

- **Stainless-style SDK autogen** — only applies if your project ships an SDK or public API surface. A pure product app may not need this.
- **Public-facing `llms.txt` for web crawlers** — useful only if your docs are publicly indexed. The `llms.txt` format is still a useful *internal* index convention regardless.
- **Heavy Cursor MDC convention** — adopt the path-scoped file pattern (generic across tools); inherit Cursor-specific MDC features only if your team uses Cursor.
- **AGENTS.md monorepo pattern with nested files per package** — only worth the overhead if package boundaries justify their own convention sets. For thin packages, one root `AGENTS.md` covers it.
