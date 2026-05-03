# 0008 — Server-side AI calls only

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

Phase 2 lays the AI infrastructure that Phase 3+ will exercise: an Anthropic
SDK wrapper, a KV cache, a cost log, and a per-request cost-ceiling check.
A foundational question for that infrastructure is *where* the API calls
live: on the client (calling Anthropic directly from the browser) or on the
server (calling from Route Handlers / Server Actions).

The site is on Next.js with the App Router, so both topologies are
straightforward to build. CLAUDE.md already states the position
("All AI calls go through Route Handlers in `app/api/*`. Never expose API
keys to the client.") but the rationale belongs in an ADR so future
contributors don't relitigate it.

## Decision

**All Anthropic calls go through server Route Handlers (or Server Actions).
The browser never holds the API key, never makes a direct call to
`api.anthropic.com`, and never sees the system prompt verbatim.**

Mechanically:

- `lib/anthropic.ts` is marked `import "server-only"` — the SDK can only be
  imported from server modules. A client-component import fails at build.
- `ANTHROPIC_API_KEY` is a server-only env var. It is **not** prefixed with
  `NEXT_PUBLIC_` and so is unavailable to client bundles.
- Every AI feature (Phase 3 JD matcher, Phase 5+ game) reaches the model via
  a Route Handler under `app/api/*`. The handler runs cost-ceiling check →
  cache lookup → SDK call → cost log → cache write → response.
- `lib/check-cost-ceiling.ts`, `lib/cost-log.ts`, and `lib/kv-cache.ts` are
  similarly `server-only`.

## Consequences

**Wins**

- **Key safety.** The Anthropic key cannot leak via DevTools, source maps,
  or a stale browser cache. Even a fully compromised client cannot bill the
  account.
- **Cost ceiling is enforceable.** A single chokepoint per endpoint runs the
  ceiling check. Browser-direct calls would let any visitor exhaust the
  monthly budget by holding the call button.
- **Prompt-as-IP.** The system prompts (JD matcher conservative bias, game
  defenses) are part of what makes this site interesting. Server-side keeps
  them off the wire.
- **Caching works.** The KV cache lives where the call lives. Clients
  benefit from a hit without having to hold the cache themselves.

**Costs**

- Latency: a server hop between browser and Anthropic adds ~10–80ms vs. a
  direct client call. Acceptable for the use cases here (JD parse is async
  user-initiated; game replies are conversational, not time-critical).
- Streaming requires Route Handlers to proxy the SSE stream rather than
  pipe it from the browser. Not a Phase 2 concern; budgeted for Phase 3.

**Deliberately not done**

- No client-side fallback path. If the server is down, the feature is down —
  there is no "let the browser call directly" escape hatch. The cost surface
  area is more important than that resilience corner.

## Alternatives considered

- **Client-side calls with a short-lived JWT minted by the server.** Rejected
  — even a 60-second token can fan out to thousands of calls before
  expiring. The cost-ceiling check has to live in front of every call, and
  that's only true if every call is server-side.
- **Edge Functions instead of Node.js Route Handlers.** Rejected for the
  initial scaffold because the Vercel KV client and the Anthropic SDK both
  work better in Node. Fluid Compute on Node is the current Vercel default
  and gives us the warm-instance behavior we'd otherwise reach for at the
  edge. Revisit per-endpoint if a clear latency case appears.
- **A separate dedicated AI service.** Rejected — overkill for a personal
  site. The Route Handler topology scales perfectly well to the four or
  five AI-touching surfaces this site will ever have.

## References

- `lib/anthropic.ts` — server-only SDK factory
- `lib/check-cost-ceiling.ts`, `lib/cost-log.ts`, `lib/kv-cache.ts`
- `app/api/smoke/route.ts` — exercises the full server-side path
- `CLAUDE.md` § "All AI calls go through Route Handlers in `app/api/*`.
  Never expose API keys to the client."
- `docs/specs/phase-2.md` § Part B
