---
slug: right-aligned-development
title: "I miss right-aligned development"
date: 2026-05-25
status: published
summary: "Multi-agent fanout gives a solo developer the parallelism of a team back. It gives back none of the mutual reading. Naming the loss, so the recovery layer gets built on purpose."
kicker: "Team patterns lost"
length: "~900 words"
post: 3
source_brief: "content/_six-post-roadmap-2026-05-25.md"
source_data:
  - "/Users/olivergate/Documents/Source/retro-claude/blog-material/2026-05-04-portfolio-ux-iteration.md"
  - "/Users/olivergate/Documents/Source/retro-claude/blog-material/2026-05-11-independent-reviewer-vs-self-review.md"
  - "/Users/olivergate/Documents/Source/retro-claude/blog-material/2026-05-11-phase-05-three-reviewer-fanout.md"
  - "/Users/olivergate/Documents/Source/retro-claude/blog-material/2026-05-15-reviewer-fanout-schema-check.md"
  - "/Users/olivergate/Documents/Source/retro-claude/blog-material/2026-05-21-feedback-pass-1-fanout-catches.md"
  - "/Users/olivergate/Documents/Source/retro-claude/docs/process/reviewer-scopes.md"
---

I've been running my own work for six weeks. The agent reads the code, I read the agent, and reviewer subagents read what I missed. Diffs land, tests pass, deploys go out. By any measure of throughput it works.

I miss having a teammate read it.

The teams I worked on before LLMs practised what I'll call **right-aligned development**, RAD. Before pulling new work, you scanned the board right to left: who needs a review, who is stuck on something I know, who is working where I'm about to be. Done and In-Review were where collaboration happened: pairing, mob debugging, cross-stream review. People learned by following the work.

The solo-LLM pattern is the inverse: **left-aligned development**, LAD. Pull from Ready, dispatch the agent, review the output, ship. Work moves right by throughput alone; the person stays at the left edge of the board, dispatching. RAD was less a process than a school.

## What RAD was doing

Pairing put two engineers inside one problem, one driving, one navigating. No single session transferred much, but a year of it kept the team's mental models aligned. Mob debugging did the same for outages.

Code review caught bugs, but most of its value was what the reviewer absorbed by reading. Reviewing a PR you wouldn't have authored is how you come to know a codebase. Most teams had an engineer who knew an area cold without having written a line of it, because they'd reviewed every PR that touched it. That engineer doesn't exist in a solo workflow.

None of this appeared on the kanban board. It was a side-effect of how the work moved across it, and you noticed it only when it stopped.

## Where fanout earns its keep

Reviewer fanout, run well, recovers a real share of what code review did, more of the old model than the nostalgia suggests.

I run four reviewer scopes in parallel, each with its own brief. Security reads for privilege escalation and RLS holes. Framework checks the code against installed-version API shapes. Ops walks the runbook cold. Corpus-audit reads the rest of the repo for contradictions between the change and the record.

It catches real defects. Three from recent weeks.

A security reviewer found three RLS bugs that single-agent review and eleven self-review checklist items had all missed: a NULL email constraint on auth.users that would have broken phone-only signup, an email-uniqueness violation that collides with soft-delete-and-recreate, and a token INSERT policy that let any authenticated user mint themselves any role. The reviewer wasn't smarter. It was uncorrelated.

A framework reviewer flagged a phantom: advice to pass a `headers` argument to `@supabase/ssr`'s `setAll()`, remembered from training data. The installed version takes one argument. Caught at synthesis, before being applied. Reviewers projecting remembered API shapes onto installed reality is a structural failure mode of every LLM review; the fix is a synthesis step that verifies premises.

A corpus-audit reviewer caught a change correct in isolation that contradicted an ADR one document over. Lint, typecheck, and three other reviewers had no opinion. Authority-chain drift is what that scope exists to find.

## Nothing accumulates

When a reviewer flags issues and fix-agents address them, the fix-agents' code goes unread by anyone. "Verification skipped" reappears one level up the orchestration tree.

The obvious answer is to review the reviewers, and I've done it; it works in the narrow sense, but not the one that matters. Verification asks a binary question: did anyone check this. Mutual reading was a side-effect of two humans loading the same context for different reasons, both walking away carrying it. You can recurse verification forever, each pass a fresh context-load discarded when it ends. No second person ever carries the codebase.

Team code review had a quiet second job nobody scheduled: keeping knowledge of the system distributed across more than one mind. LLM review does the first job, verification, and recursing it never produces the second. The debt sits in the codebase, not in any diff: in code only its author can touch.

## The practices worth adding back

Mob review of LLM-authored code at PR boundaries. Pair-reading rather than pair-writing: two humans, one diff, loaded at the same time. The throughput cost is real, and worth paying for any commit future maintenance leans on.

Pair sessions with another solo-LLM engineer. Drive your agent on your codebase while I watch, then swap. Half the value is watching someone else operate the loop; the other half is the cross-codebase context-load.

Cross-reads where the reviewer explains the diff back to the author in their own words: the mutual-reading mechanism at its smallest enforceable size. None of these restore RAD; each pays back some of what LAD costs.

## The case against this post

Solo-LLM is fast. One person now does what four did, and that economics makes LAD the default for a wave of new work. I'm not arguing for going back, only that what LAD costs should have a name, so the recovery layer gets built on purpose.

Mutual reading may not be irreplaceable. A reviewer stack stateful and persistent enough, and open to the human between sessions, might reproduce the distributed-knowledge effect. No reviewer I run today is any of those.

And six weeks is too short to size the debt; my evidence is structural, not measured. The real measure arrives when a second engineer takes over a year of this output cold, and either walks in easily or can say exactly why they couldn't.

I miss having a teammate read it.
