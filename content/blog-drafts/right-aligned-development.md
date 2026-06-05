---
slug: right-aligned-development
title: "I miss right-aligned development"
date: 2026-05-25
status: draft
summary: "Multi-agent fanout gives a solo developer the parallelism of a team back. It gives back none of the mutual reading. Naming the loss, so the recovery layer gets built on purpose."
kicker: "Team patterns lost"
length: "~1100 words"
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

I've been running my own work for six weeks. The agent reads the code. I read the agent. Reviewer subagents read what I missed. Diffs land, tests pass, deploys go out. By any measure of throughput it works.

I miss having a teammate read it.

The teams I worked on before LLMs practised what I'll call **right-aligned development**, RAD. Before pulling new work, you scanned the board right to left: who needs a review, who is stuck on something I know, who is working where I'm about to be. Done and In-Review were where collaboration happened. Pairing, mob debugging, cross-stream review. The work moved right through that collaboration, and the people learned by following it.

The solo-LLM pattern is the inverse: **left-aligned development**, LAD. Pull from Ready, dispatch the agent, review the output, ship. Work moves right by throughput alone. The person stays at the left edge of the board, dispatching.

RAD was less a process than a school.

## What RAD was doing

Pairing put two engineers inside one problem at the same time, one driving, one navigating. No single session transferred much. A year of it kept the team's mental models roughly aligned. Mob debugging did the same for outages: three people in front of one stack trace, each spotting something different, each learning what the others saw first.

Code review caught bugs, but the catch was the smaller half of its value. The larger half was what the reviewer absorbed by reading. Reviewing a PR you wouldn't have authored is how you come to know a codebase. Most teams had an engineer who knew an area cold without having written a line of it, because they'd reviewed every PR that touched it. That engineer doesn't exist in a solo workflow. There is nobody around to become them.

None of this appeared on the kanban board. It was a side-effect of how the work moved across it, and you noticed it only when it stopped.

## What fanout recovers

Solo plus LLM keeps more of the old model than the nostalgia suggests. Reviewer fanout, run well, recovers a real share of what code review did.

I run four reviewer scopes in parallel, each with its own brief. Security reads for privilege escalation and RLS holes. Framework checks the code against installed-version API shapes. Ops walks the runbook cold. Corpus-audit reads the rest of the repo for contradictions between the change and the documented record.

It catches real defects. Three from recent weeks.

A security reviewer found three RLS bugs that single-agent review and eleven self-review checklist items had all missed: a NULL email constraint on auth.users that would have broken phone-only signup, an email-uniqueness violation that collides with soft-delete-and-recreate, and a token INSERT policy that let any authenticated user mint themselves any role. The reviewer wasn't smarter. It was uncorrelated.

A framework reviewer flagged a phantom: advice to pass a `headers` argument to `@supabase/ssr`'s `setAll()`, remembered from training data. The installed version takes one argument. Caught at synthesis, before being applied. Reviewers projecting remembered API shapes onto installed reality is a structural failure mode of every LLM review; the fix is a synthesis step that verifies premises, not more careful reviewers.

A corpus-audit reviewer caught a change that was correct in isolation and contradicted an ADR one document over. Lint, typecheck, and three other reviewers had no opinion. Authority-chain drift is exactly what that scope exists to find.

Fanout earns its keep. It finds blockers the implementer cannot find alone.

## Nothing accumulates

When a reviewer flags issues and fix-agents address them, the fix-agents' code goes unread, end to end, by anyone. The parent dispatches, the children fix, the diff lands. "Verification skipped" reappears one level up the orchestration tree.

The obvious answer is to review the reviewers. I've done it. It works, in the narrow sense. It still doesn't produce what mutual reading produced, because mutual reading was never verification with extra steps. Verification asks a binary question: did anyone check this. Mutual reading was a side-effect. Two humans loaded the same context for different reasons, and both walked away carrying it. You can recurse verification forever; each pass is a fresh context-load, discarded when the pass ends. Nothing accumulates. No second person carries the codebase, because there is no second person.

Team code review had a quiet second job nobody scheduled. It kept knowledge of the system distributed across more than one mind. LLM review does the first job, verification, and not the second. Recursing the first does not produce the second.

That is where LAD's debt accumulates. Not in any diff, but in a codebase only its author can touch.

## What I'd take back

Mob review of LLM-authored code at PR boundaries. Pair-reading rather than pair-writing: two humans, one diff, loaded at the same time. The throughput cost is real, and worth paying for any commit that future maintenance will lean on.

Pair sessions with another solo-LLM engineer working the same way. Drive your agent on your codebase while I watch, then swap. Half the value is watching someone else operate the loop. The other half is the cross-codebase context-load.

Cross-reads where the reviewer explains the diff back to the author in their own words. The mutual-reading mechanism cut down to its smallest enforceable form. Painful to mandate, worth it where it matters.

None of these restore RAD. Each pays back some of what LAD costs.

## The case against this post

Solo-LLM is fast, and the speed is not a detail. One person now does what four did, and that economics makes LAD the default for a wave of new work. I'm not arguing for going back. I'm arguing that what LAD costs should have a name, so the recovery layer gets built on purpose.

Mutual reading may not be irreplaceable. A reviewer stack stateful enough, persistent enough, and open to the human between sessions might reproduce the distributed-knowledge effect. I haven't seen that tool. I'd like to.

And six weeks is too short to size the debt. A codebase drifting toward only-the-author-can-touch-it shows up over months, not weeks; my evidence is structural, not measured. The real measure arrives when a second engineer takes over a year of this output cold, and either walks in easily or can say exactly why they couldn't.

For now I'm betting it's real. I miss having a teammate read it.
