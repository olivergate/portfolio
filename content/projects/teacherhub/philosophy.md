---
slug: teacherhub/philosophy
status: published
---

## Decisions are written down

I keep a record of the bigger decisions. Cloud-only Supabase, one UI system, GPT-4o direct rather than a gateway, Dexie for offline, Daily.co for video: each records the alternatives and what was given up. Docs follow an explicit authority chain (tests and schemas outrank ADRs, ADRs outrank feature docs), and a GitHub Action archives a spec automatically when the commit that ships it lands.

## Real users over imagined scale

The first users were my Spanish teacher and me. I built for what we actually did in lessons. That meant choosing boring, managed infrastructure (Supabase, Vercel) and spending the saved effort where this product actually differentiates: the AI pipelines and their evals. There is no Kubernetes here, on purpose.

## Trade-offs, stated plainly

Things I would flag in my own code review:

- Test coverage started at an honest 11% baseline. The target is 60% meaningful coverage, and the audit that set those numbers is in the repo. The eval suites and pgTAP came first because AI output and RLS policies are where wrongness hurts most.

## Built with agents, reviewed by me

Much of TeacherHub was written with Claude Code, under the working practices that became the [retro-claude](/projects/retro-claude) project: session retros, documented decisions, sub-agent reviewers for tests and docs. The eval-first habit exists because agent-written AI features need a harness that proves they still work after the next change.
