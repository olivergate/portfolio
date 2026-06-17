---
post: 2
slug: retro-claude-six-weeks
status: published
date: 2026-05-25
title: "Six weeks of structured retros: what the corpus made me change, and what it didn't"
summary: "74 structured session retros against a closed-set ontology: three workflow changes the data forced, and the limit where measurement stopped helping."
kicker: "Retros"
length: "~950 words"
source_brief: "content/_six-post-roadmap-2026-05-25.md"
source_data:
  - "/Users/olivergate/Documents/Source/retro-claude/blog-material/"
  - "/Users/olivergate/Documents/Source/retro-claude/docs/decisions/0011-retro-self-assessment-and-tier-architecture.md"
  - "/Users/olivergate/Documents/Source/retro-claude/docs/decisions/0012-turn-events-schema-and-extensibility.md"
  - "/Users/olivergate/Documents/Source/retro-claude/docs/decisions/0014-clear-review-flow-restructure-v2.md"
  - "/Users/olivergate/Documents/Source/retro-claude/schemas/ontology.v0.2.yaml"
  - "/Users/olivergate/Documents/Source/retro-claude/schemas/turn-event-types.v1.yaml"
  - "/Users/olivergate/Documents/Source/retro-claude/data/sessions/ (74 session yamls)"
---

I wrote a tool because I couldn't trust my agent's retro on its own work.

An agent that just ran a session is invested in its own decisions and defends a coherent narrative. Ask it "did this work?" and you get optimistic answers — the answers you'd expect from someone who just spent three hours building an interpretation of what they did.

So for six weeks I've ended every Claude Code session with a slash command, `/clear-review`. It captures a structured retro into YAML, against a closed-set ontology, with mandatory evidence citations on every self-assessment. The corpus stands at 74 sessions. It has changed how I work in three named ways, and shown me exactly where measurement stops helping.

## The tool

The retro moment is the only point in the lifecycle where the session is in working memory, the transcript is cheap to reach, and the user is present — so signals are still cleanly attributable. That window closes within minutes of `/clear`; ADR-0011 rests the whole tool on it.

I did the retro by hand for a month before building anything; a month of that teaches you what the command should be. When it became daily work, I built the tool.

Underneath is a closed-set ontology. Six axes (`session_mode`, `correction_type`, `direction_angle`, `capability_angle`, `surface`, `user_flags`), each a finite enum. Every entry carries a `fit_confidence` of `high`, `forced`, or `other`. No tag fits? Use `other` with a mandatory free-text note. A tag fits badly? Mark it `forced`. Those two fields let the vocabulary evolve under pressure from the data: five forced entries sharing a theme split a tag, three `other` entries sharing a theme add one, a tag unused across two review cycles retires. The current version is v0.2, cut early at N=3 sessions because two of those three ran about 25% forced/other density. The vocabulary wasn't keeping up.

The single biggest bias reducer is the `evidence_refs` requirement. Every self-assessment has to cite specific turn IDs or event IDs, and the schema rejects empty refs.

> [!pull]
> The agent can rationalise an interpretation, but it cannot fabricate a turn that does not exist.

The narrative stays the agent's. It just has to point at the artefacts.

## The corpus, week six

74 retros. 873 entries classified at `fit_confidence: high`, 44 at `forced`, 7 at `other` — about 5% forced/other across the corpus, which is how I know the v0.2 cut is holding. v0.1 had hovered near 25% on the sessions that triggered it.

One signal dominates: `verification-skipped-self`, 199 occurrences across the 74 sessions — the most-recurring observation in the data. Hold that number. It is both the strongest evidence the tool produces and the clearest mark of its limit.

## Three changes the data forced

**Codified reviewer scopes.** The corpus showed parallel reviewer fanout catching blockers that single-agent review and unit tests both missed. The Phase 0.6 portfolio session surfaced the pattern with enough density to act on: eight reviewer dispatches across two waves, three real defects the implementer's self-review had not found. After that session I wrote four standing scopes into `docs/process/reviewer-scopes.md`: security, framework, ops, corpus-audit. They now fire automatically on changed-files density at the `/clear-review` pre-flight gate (ADR-0014), not on my remembering.

**Added the corpus-audit lens.** A two-round adversarial review on the 2026-05-12 retro-claude session caught the lint and typecheck issues on its first pass and still missed an ADR contradiction (ADR-0007 vs ADR-0015) that only surfaced by reading the corpus rather than the diff. Finding it post-commit was uncomfortable. That same week, reviewer briefs stopped being "read the diff": at least one reviewer now reads the documented record alongside the change and flags contradictions between them.

**Named the deferral rule.** The 2026-05-03 portfolio Phase-3 session ran 285 minutes with three mid-stream scope additions and produced the corpus's largest divergence: agent self-rating 4/5, user rating 2/5. Every commit passed typecheck and lint. The work shipped clean. The shape of the session was the failure. From that retro's `gap_self_minus_user: 2` field came two standing rules: when the user adds scope mid-session, offer to defer it to a fresh session rather than silently absorbing it; and check for a pause-point once a session passes 120 minutes.

## Where measurement stops

`verification-skipped-self`: 199 occurrences, cleanly measured, still recurring. Counting it has not fixed it.

The needle moved when the workflow changed: reviewer fanout, the four scopes above. Independent readers catch what a single self-reviewing agent misses. The corpus said verification was being skipped. It could not say "dispatch reviewers in parallel." That came from outside the schema.

The 4/5-versus-2/5 session is the same limit, cleaner. The agent rated outputs. The user rated experience. Both ratings were correct. The corpus records both numbers and the gap. It has no field for "the agent should have noticed the session was running too long," because that judgement is about the whole session, not any commit or decision inside it.

## What the corpus can't see

The corpus has selection bias. Sessions where `/clear-review` ran are the ones I had time for, where the work was substantial enough to retro, and where nothing crashed out past the slash command. It over-represents successful-enough sessions, so 199 is likely an undercount.

The closed set trades coverage for queryability. Failure modes nobody has named are invisible by construction. The forced/other density can say "the vocabulary is lagging." It cannot say "there's a whole axis you haven't thought of." That comes from outside.

The three changes are each anchored to a specific session, but I can't prove the corpus caused them. I could plausibly have noticed the same patterns unaided. The claim I can defend is narrower: the corpus accelerated the noticing and gave me citation density to act on. Real benefit, weaker claim.

One other person has now started running the tool against their own work.
