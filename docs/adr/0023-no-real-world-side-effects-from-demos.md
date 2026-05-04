# 0023 — No real-world side effects from demos

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Oliver Kaikane Gate

## Context

Phase 4 ships the first demo (`/api/retro`) that takes user input and
forwards it to a third-party API (Anthropic). Phase 5+ will add a
prompt-safety game whose explicit subject matter is OWASP LLM Top 10
attacks — prompt injection, tool misuse, data exfiltration. Those demos
exist *because* the surface is interesting to attack.

The site is a personal portfolio. Oliver's email, calendar, and accounts
sit on the same machines as the dev environment. The temptation in any
"agentic system" demo is to wire it to real tools to make the signal
sharper — let visitors send Oliver a calendar invite, draft a real Slack
message, write to a real database. That trade gets ratioed by the worst
visitor, not the average one.

CLAUDE.md states the position ("Game tools are simulated; no real side
effects from any user input"). This ADR generalises it across all demos
and explains why.

## Decision

**Demos on this site never produce real-world side effects from user
input. Every tool the demos appear to invoke is simulated. No demo writes
to email, calendar, accounts, payment systems, version control, or external
HTTP services. No demo persists user input beyond the cache (which is
content-addressed and not visitor-attributable) and the cost log (which
records endpoint and tokens, not the input itself).**

Mechanically:

- The retro demo (`/api/retro`) reads the visitor's transcript, sends it
  to Anthropic, returns a structured retro. The visitor's transcript is
  not stored, not logged, not forwarded anywhere else.
- The game (Phase 5+) will simulate every tool the player tries to invoke.
  "Send email" returns a fake "delivered" payload; the agent never reaches
  a real SMTP server. Same for calendar, file write, shell exec.
- Game secrets / passwords / tokens are fake (CLAUDE.md is explicit about
  this) and regenerated per session.
- The retro demo's canned-response fallbacks (ADR-0025) are also
  side-effect-free: rendering canned text is not a side effect.
- The KV cache is the only persistent surface a visitor can touch, and
  it's keyed by content hash + prompt version (ADR-0009). Two visitors
  who paste the same transcript share a cache entry; nothing visitor-
  identifiable lives there.

## Consequences

**Wins**

- **Predictable blast radius.** No matter what a visitor types, the
  response is bounded to "tokens billed against the cost ceiling, possibly
  a cache write, an Anthropic round-trip." Nothing reaches Oliver's life.
- **Game can ship its subject.** A demo about prompt injection that
  *actually injects something* would be a liability. A demo where the
  injection succeeds against simulated tools is a teaching artifact.
- **Honest with visitors.** The site can credibly claim "no real side
  effects" because that's a structural property, not a promise.

**Costs**

- A simulated demo is less viscerally impressive than one that actually
  did the thing. The retro demo's "tell me what worked / what didn't" is
  inherently low-stakes; a "watch me delete a file in your repo on your
  command" demo would land harder. We trade impact for safety.
- Every tool the game adds requires a simulator on the server side.
  Acceptable on this site's small surface; the simulator code is part of
  what makes the game interesting to read.

**Deliberately not done**

- **No "are you sure?" gates that, when confirmed, do the real thing.**
  The line is structural: real-world effects are absent, not gated.
- **No per-visitor namespaces (Oliver's account vs visitor's account).**
  The site doesn't have visitor accounts; the question doesn't arise.
- **No analytics on visitor input.** The cost log records endpoint +
  tokens, not the prompt or the transcript text.

## Alternatives considered

- **Pure server-side simulation, no Anthropic call.** Rejected — the
  retro demo's value is that it's a *real* AI call. Simulating the model
  too erases the agentic-systems signal that makes the demo worth
  showing.
- **Real side effects in a sandboxed demo account.** Considered. Rejected —
  the demo would still need a "this is fake, no real account harmed"
  caption; the safety layer doesn't add fidelity worth the complexity.
- **Real tool calls scoped to a write-only "demo" inbox / channel.**
  Considered. Rejected — even write-only surfaces are spam vectors and
  attribution problems waiting to happen. The simulator stays.

## References

- `app/api/retro/route.ts` — no external HTTP beyond Anthropic + Upstash
  (both internal infra, not user-visible side effects)
- `lib/canned-retros.ts` — failure-path responses, side-effect-free
- `lib/cost-log.ts` — records endpoint, model, tokens, prompt version;
  not the user's input
- ADR-0008 (server-side AI calls only) — keys never reach visitors
- ADR-0021 (demo isolation) — each demo carries its own simulator surface
- CLAUDE.md § "Game secrets are always fake, regenerated per session" /
  "Game tools are simulated; no real side effects from any user input"
