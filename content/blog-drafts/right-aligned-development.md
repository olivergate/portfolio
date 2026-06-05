---
slug: right-aligned-development
title: "I miss right-aligned development"
date: 2026-05-25
status: draft
summary: "Solo-LLM development recovers the parallelism of pre-LLM team workflows via multi-reviewer fanout. It doesn't recover the mutual reading. Naming what we lost so the recovery layer can be built deliberately rather than not at all."
kicker: "Team patterns lost"
length: "~1800 words"
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

I've been running my own work for six weeks. The agent reads the code. I read the agent. Reviewer subagents read what I missed. The diffs land, the tests pass, the deploys go out. By every measure of throughput it works.

I miss having a teammate read it.

This is going to sound like nostalgia. It isn't, quite. Solo-LLM development recovers most of the *parallelism* of a human team via multi-agent fanout. What it doesn't recover is the mutual reading. The thing two humans do when they load the same context at the same time, for different reasons, and walk out of the session with different things in their heads. That layer was never on the kanban board. It was the side-effect of how the work moved across it. We don't have a replacement for it yet, and I don't think we've named what's missing clearly enough to start building one.

A quick definition before going further. Pre-LLM teams I worked on operated what I'll call **right-aligned development**, or RAD. Before pulling new work, engineers scanned the board right-to-left looking for: someone who needed a review, someone stuck on something they had context on, someone working in an area they were about to touch. The Done and In-Review columns were where collaboration happened. Pairing, mob debugging, cross-stream code review, design walkthroughs. The work moved right through that collaboration. The people learned by following the work right.

The post-LLM solo pattern is the inverse. Engineer pulls from Ready, dispatches the agent, reviews the output, ships it. I'll call this **left-aligned development**, or LAD. Work moves right by *throughput*. The person stays at the left edge of the board, dispatching.

RAD wasn't process. It was a learning structure. That's the part I want to argue for in this post.

## What RAD was actually doing

Pair-programming built shared mental models. Two engineers in the same context, one driving, one navigating, both loading the same problem at the same time. The driver's understanding of the codebase didn't transfer in any single moment, but over a year of intermittent pairing the team's models stayed roughly aligned. Mob debugging did the same thing for outage-shaped problems: three engineers in front of a stack trace, each spotting a different thing, each learning what the others noticed first.

Code review's value was always partly the diff catch. But the larger value was what the reviewer absorbed in the process of reading. Reviewing a PR you wouldn't have authored makes you know the codebase. Approving without reading carefully makes nobody know it. Most teams I worked on had at least one engineer who knew an area not because they wrote it but because they'd reviewed every PR that touched it. That role doesn't exist on a solo LLM workflow.

None of this was a *deliverable*. It was load-bearing for the team's long-run capability. You only noticed it was missing when it stopped being there.

## What LAD recovers, and what fanout actually catches

Solo plus LLM doesn't lose everything from the old model. Multi-agent reviewer fanout, run well, recovers a chunk of what code review used to do.

The pattern I run is four non-overlapping reviewer scopes, dispatched in parallel: security and data-perimeter; framework and runtime correctness; ops and runbook completeness; corpus-audit and authority-chain coverage. Each reviewer reads with a different brief. Security looks for privilege escalation and RLS holes. Framework checks that installed-version API shapes match the code. Ops simulates a cold-runbook walk. Corpus-audit reads the rest of the repo for contradictions between the change and the documented record.

It catches real things. Three load-bearing examples from the last few weeks of running it.

A security reviewer caught three RLS bugs on an auth phase that single-agent review and eleven self-review checklist items had all missed. A NULL email constraint on auth.users that would have broken phone-only signup. An email-uniqueness violation that collides with soft-delete-and-recreate. A token INSERT policy that let any authenticated user mint themselves any role. Self-review hadn't found any of the three. The reviewer didn't have to be smarter, just uncorrelated.

A framework reviewer flagged a phantom: a recommendation to pass a headers argument to `@supabase/ssr` setAll(), based on the model's training-data memory of the API shape. The installed version of the library had a single-argument signature. Caught at synthesis, before being applied. Reviewers using training-data API shapes against installed-version reality is a structural failure mode of every LLM review. The fix is a synthesis step that verifies premises, not more careful reviewers.

A corpus-audit reviewer caught an ADR-vs-shipped-reality contradiction on a substrate commit that lint, typecheck, and three other reviewers had missed entirely. The change was correct in isolation. It contradicted the documented record one ADR over. That kind of authority-chain drift is what corpus-audit specifically exists to find.

That's the good news. Reviewer-fanout isn't theatre. It catches BLOCKERs the implementer wouldn't have.

## What fanout doesn't recover

Now the part I keep tripping over.

Single-agent code review catches the must-fix bugs the original implementer missed. When the reviewer flags issues and the implementer dispatches fix-agents to address them, those fix-agents' code goes un-end-to-end-read by anything human. The parent agent dispatches, the children fix, the diff lands. The same shape of "verification skipped" reappears one level up the orchestration tree.

I've thought about this and the obvious response is: review the reviewers. Add a recursive pass. A reviewer-of-reviewers reads the fix-agents' output before anything lands.

You can do this. I've done it. It works, sort of. It also doesn't get you what mutual reading got you.

Mutual reading isn't verification with extra steps. Verification is a binary: did anyone check this. Mutual reading is a side-effect: two humans simultaneously loaded the same context for different reasons, and now both of them have it in their heads. Verification can be recursed all the way up. The reviewer of the reviewer of the reviewer still verifies. But each step is a fresh context-load that's discarded as soon as the step completes. Nothing accumulates. The codebase isn't carried in any second person's head because there is no second person.

The team-version of code review had a quiet second job that nobody put on the calendar. It kept knowledge of the codebase distributed across more than one mind. The LLM-version of code review does the first job (verification) and not the second (distribution). Recursing the first job doesn't produce the second.

This is the gap I think LAD's tech debt accumulates in. Not in any individual diff. In the fact that no second person knows the system the way the original author does, because there is no second person. The engineer who knew the area in a team setting didn't carry the memory between meetings; their understanding rebuilt itself each time they re-engaged. Mine sometimes does and sometimes doesn't, and either way it's only one person's understanding.

## What I'd want back, operationally

Three things, each a recovery vector rather than a full restoration.

Mob review of LLM-authored code at PR boundaries. Not pair-programming the writing. Pair-reading the result. Two human engineers, one diff, both loading the change at the same time. The throughput cost is real and worth paying for any commit that's load-bearing for future maintenance.

Periodic pair sessions with another solo-LLM engineer working in a similar shape. Not "review my PR." More like "drive your agent on your codebase while I watch; then I drive mine while you watch." Half the value is in seeing how someone else operates the loop. The other half is the cross-codebase context-load.

Required cross-reads where the reviewer has to explain the diff back to the author in their own words. This forces the reviewer to actually load the context rather than skim it. It's the mutual-reading mechanism distilled down to its smallest enforceable shape. Painful to put into a workflow. Worth it for the things that need it.

None of these restore RAD. They're each a recovery vector that pays back some of what LAD costs. Whether they pay back enough is an open question.

## What I might be wrong about

Solo-LLM is fast, and the speed matters. The economics of one person doing what a team of four used to do are real, and that economic reality is what makes LAD the default for a wave of new work. The post isn't an argument to go back to RAD. It's an argument to name what LAD costs so the recovery layer gets built deliberately rather than not at all.

I might be wrong that mutual reading is irreplaceable. There might be a tooling shape I haven't imagined where a recursive reviewer stack actually produces the distributed-knowledge effect. The "loaded the same context for different reasons" property might be reproducible by structurally diverse agent reviewers if they're stateful enough, persistent enough, and accessible to the human between sessions. I don't know what that tool looks like. I haven't seen one.

I might be wrong about how big the tech debt actually is. Six weeks of solo-LLM work isn't long enough to see the full cost. The pattern I'm describing is one where the codebase becomes increasingly only-the-author-can-touch-it, and that pattern shows up over months and years, not weeks. My evidence is structural, not measured.

I might be wrong that other solo-LLM engineers experience this the same way. The pair-session vector above is partly a check on this. I'd want to find out whether the gap I'm naming is widespread or specific to my workflow shape.

What would change my mind: a year of LAD output evaluated by a second engineer who has to take over the codebase cold. If the takeover is painless, the gap I'm describing isn't load-bearing. If it's painful in ways the second engineer can articulate clearly, the gap is real and recovery vectors are worth building.

For now I'm betting it's real. I miss having a teammate read it.
