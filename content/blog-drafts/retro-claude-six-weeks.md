---
post: 2
slug: retro-claude-six-weeks
status: draft
date: 2026-05-25
title: "Six weeks of structured retros: what the corpus made me change, and what it didn't"
summary: "What 74 structured Claude session retros against a closed-set ontology actually changed about my workflow, and where measurement still hits its limit."
kicker: "Retros"
length: "~2150 words"
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

The agent that ran the session has investment in its own decisions, recency framing, and a coherent narrative it will defend. Ask the same agent "did this work?" and you get systematically optimistic answers. Not lies, exactly. Just the answers you'd expect from someone who's spent the last three hours building a particular interpretation of what they did.

Six weeks ago I started running a slash command called `/clear-review` at the end of every Claude Code session. The command captures a structured retro into a YAML file, against a closed-set ontology, with mandatory evidence citations on every self-assessment. The corpus now contains 74 session retros. It has changed my behaviour in specific named ways, and it has also shown me where measurement hits its limit. This post is about both halves.

## What the tool actually does

The retro moment is the only point in the lifecycle where four things are true at once: full session context is still in the agent's working memory, the transcript is still accessible cheaply, the user is present, and the next session has not started so signals are still cleanly attributable. ADR-0011 makes this the load-bearing rationale for the whole tool. The window is small. It closes within minutes of `/clear`. If you don't capture it then, the next session's prefix overwrites whatever you might have learned.

I tried doing the retro by hand for a month before building the tool. The pattern from that month: doing it once teaches you what the command should be. Building first is what you do when the work is daily; doing by hand is what you do when the work is monthly. Six weeks ago the work crossed the threshold.

Retro-claude's substrate is a closed-set ontology. Six axes (`session_mode`, `correction_type`, `direction_angle`, `capability_angle`, `surface`, `user_flags`), each with a finite enum of values. Every entry carries a `fit_confidence` of `high`, `forced`, or `other`. If no tag fits the situation, you use `other` with a mandatory free-text note. If a tag was used but didn't quite fit, you mark it `forced`.

That `forced` field is the one that makes the ontology evolve. When five or more forced entries share a theme, the tag splits. When three or more `other` entries share a theme, a new tag gets added. When a tag goes unused across two review cycles, it gets retired. The ontology is meant to drift, deliberately, under pressure from the data. The current version is v0.2, cut early at N=3 sessions because two of those three had about 25% forced/other density — well above the implicit threshold for "the vocabulary isn't keeping up."

The single biggest bias reducer in the design is the `evidence_refs` requirement. Every self-assessment entry has to cite specific turn IDs or event IDs from the session. The schema rejects empty `evidence_refs`.

> [!pull]
> The agent can rationalise an interpretation, but it cannot fabricate a turn that does not exist.

A self-rating without evidence is invalid by schema. The agent's narrative still gets to be the agent's narrative; it just has to point at the artefacts.

## What the corpus looks like

Numbers from the current state of the corpus, end of week six:

74 session retros. 873 classified entries at `fit_confidence: high`. 44 entries at `forced`. 7 at `other`. The forced/other density across the corpus is about 5%, which is what told me the v0.2 ontology cut was holding. The v0.1 ontology had been hovering around 25% on the sessions that triggered the cut.

One signal dominates the corpus by frequency. `verification-skipped-self` fires 199 times across the 74 sessions. It is, by some distance, the single most-recurring observation in the data. I will come back to this number, because it is both the strongest evidence the tool produces and the clearest example of where the tool stops being able to help.

## What the data forced me to change

Three named behaviour changes from the corpus, each anchored to a specific session.

**Codified reviewer scopes.** Early on the corpus showed me that running parallel reviewers in fanout was catching BLOCKERs that single-agent code review and unit tests both missed. The Phase 0.6 portfolio session was the one that surfaced the pattern with enough density to act on — eight reviewer dispatches across two parallel waves, three real defects caught that the original implementer's self-review had not. I wrote `docs/process/reviewer-scopes.md` after that session, codifying four standing scopes: security, framework, ops, and corpus-audit. The scopes now bind at the `/clear-review` pre-flight gate via ADR-0014. Reviewers fire automatically on changed-files density, not on my remembering.

**Added the corpus-audit lens after a missed ADR contradiction.** A two-round adversarial review on the 2026-05-12 retro-claude session caught the lint and typecheck issues on the first pass but missed an ADR contradiction (ADR-0007 vs ADR-0015) that only became visible when someone read the corpus rather than the diff. The post-commit found-it-second moment was uncomfortable. I added the corpus-audit lens to the standing scopes that same week. Reviewer-fanout briefs are no longer just "read the diff." At least one reviewer is now asked to read the corpus alongside the diff and flag contradictions between the change and the ADR record.

**Named the deferral-on-scope-addition rule.** The 2026-05-03 portfolio Phase-3 session ran 285 minutes, included three distinct mid-stream scope additions, and produced an agent self-rating of 4/5 against a user rating of 2/5. The +2 gap is the largest divergence in the corpus to date. The session's commits all passed typecheck and lint. The work shipped clean. But the *shape* of the session was the failure. After that retro I wrote a deferral rule into the project's collaboration direction: when the user adds scope mid-session, the agent must offer to defer to a fresh session rather than silently absorbing the new work. Sessions over 120 minutes get an explicit pause-point check. Both rules came directly out of one retro yaml's `gap_self_minus_user: 2` field.

> [!pull]
> The corpus didn't generate the rule. It surfaced the pattern with enough citation density that the rule became unignorable.

The retro yaml is the substrate. The rule is what you do once the substrate has accumulated enough evidence to point at.

## Where measurement isn't enough

Here is where the post gets honest.

`verification-skipped-self` has appeared 199 times across the corpus. That number is high. It is the highest-volume observation in the data. And yet: counting it has not fixed it. The signal is real. The recurrence persists. The corpus measures it cleanly. The corpus does not, on its own, do anything about it.

The structural answer to verification-skipped-self turned out not to be a measurement change at all. It was a workflow change. Bounded multi-agent fanout, the four-reviewer-scope pattern above, recovers some of what verification-skipped-self represents, because parallel uncorrelated readers catch the things a single self-reviewing agent misses. The corpus told me verification was being skipped. The corpus could not tell me to dispatch reviewers in parallel. That move came from outside the schema.

The 4/5 vs 2/5 case is the cleanest example of the same limit. The agent rated the session 4/5 on outcome and confidence-drift. The user rated it 2/5 on felt-quality. The agent was rating outputs. The user was rating experience. Both ratings were correct. The corpus captures both numbers and the gap between them. The corpus has no field for "the agent should have noticed it was running too long" because that judgement lives outside any individual artefact. It's about the shape of the whole session, not the shape of any commit or any decision.

> [!pull]
> Structured measurement gets you to the gap. It does not, by itself, close the gap.

The closing has to happen in workflow design — the deferral rule, the pause-point check, the reviewer scopes. The data tells you where to look. It does not tell you what to do once you've looked.

## What I might be wrong about

The corpus has selection bias. Sessions where `/clear-review` actually ran are not a random sample of all sessions. They tend to be ones I had time for, ones where the work was substantial enough to be worth retro-ing, and ones where the session didn't crash out in a way that bypassed the slash command entirely. The corpus over-represents successful-enough sessions and under-represents the genuinely catastrophic ones. If catastrophic sessions have systematically different observation profiles, my "199 occurrences of verification-skipped-self" is an underestimate.

The closed-set ontology trades coverage for queryability. Things that aren't in the schema don't show up. I added `verification-skipped-self` because I noticed the pattern, but I noticed it because I was already paying attention. There is presumably a class of failure modes I'm not paying attention to, and those failures are invisible to the corpus by construction. The `forced/other` density is a partial defence — it surfaces "the vocabulary isn't keeping up" — but it cannot surface "there's a whole axis you haven't named." That has to come from outside.

I might be wrong that the named behaviour changes were caused by the corpus. Each of the three is anchored to a specific session, but in each case I could plausibly have noticed the same pattern without the structured retro. The strongest claim I can defend is that the corpus accelerated the noticing and gave me citation density to act on. That is a real benefit. It is not the same as "the corpus produced the change."

What would change my mind on any of this: a longer corpus run (six months instead of six weeks), or someone else running the same tool against their own work and either reproducing the named changes or finding different ones. The first version of that experiment is already underway. I have no data yet.

The thesis stands at the half-true line. What is measurable is improvable. And measurement is not the same as improvement. The honest post is both halves.
