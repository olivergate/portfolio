# 0010 — Cost ceiling enforced per-endpoint, not via global rate limiting

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

This site is a personal portfolio. The Anthropic API costs real money, and
the surface area is small (two AI-touching routes today: the JD matcher in
Phase 3 and the prompt-safety game in Phase 5+). The CV surface is publicly
linkable: the hostile case is "someone discovers the JD endpoint and runs
it in a loop until the credit card screams." The design constraint is
*cap the worst case* without disabling the feature for everyone else.

Two broad shapes:

- **Rate limit per IP / per session.** Standard web defense. Doesn't
  bound cost; bounds requests. A single attacker behind CGNAT or rotating
  IPs can still walk past it; a benign demo at a conference can trip it.
- **Cost ceiling on the spend itself.** Bounds the only thing that matters
  (USD per month). Doesn't care about IPs.

The choice isn't either/or — but ranking them, the cost ceiling is what
actually answers the question "will my AWS-equivalent bill be predictable
this month?"

## Decision

**Each AI Route Handler calls `checkCostCeiling()` *first*, before any
Anthropic call. If the month-to-date spend is at or above
`ANTHROPIC_MONTHLY_LIMIT_USD`, the handler returns 429 and falls back to a
cached or pre-canned response. No global rate limiter (yet).**

Mechanically:

- `lib/check-cost-ceiling.ts` reads `ANTHROPIC_MONTHLY_LIMIT_USD` from env
  (default $20 in dev). Returns `{ ok, current, limit }`.
- The check is per-Route-Handler, not middleware — middleware can't
  cleanly distinguish "AI route" from "static route" without leaking
  knowledge it shouldn't have.
- Fallback when ceiling is hit: return 429 with the most recently cached
  result for the same input if present, otherwise a curated "service is
  paused for the month, here's a static fallback" payload. The UX surface
  for each AI feature designs its own fallback; the ceiling check just
  signals "don't call".
- Spend is read from KV via `getMonthSpend()` (sums all `cost:YYYY-MM:*`
  keys for the current month). Inexpensive — tens of entries per month at
  this site's scale. Cache the result in-process per request if it ever
  matters.

## Consequences

**Wins**

- **Bounded cost.** The worst case is `ANTHROPIC_MONTHLY_LIMIT_USD` plus
  one in-flight request's worth of overshoot. Predictable enough to run
  on a personal credit card.
- **Per-endpoint accuracy.** Each AI route knows its own fallback.
  Middleware would have to fan out the fallback policy.
- **Honest UX.** A 429 with a cached response is functionally indistinguishable
  from a slow-but-fresh response for the user. The honesty signal lives in
  the cost-log, not the front door.
- **No premature complexity.** Skipping the global rate limiter avoids
  adopting Upstash, Redis-backed sliding windows, or framework middleware
  for a problem this site doesn't yet have.

**Costs**

- A determined attacker can still consume the full monthly budget in the
  first hour of the month. The ceiling caps the bleed, not the burst.
  Acceptable: every subsequent call returns a cached fallback, and the
  recovery is "wait until next month or raise the limit" rather than
  "rebuild the system."
- The cost ceiling is *behind* the cache check (cache check is free; only
  cache misses provoke the ceiling check). Means `checkCostCeiling()` runs
  on every cache miss; trivial cost but worth noting.
- Cost log writes are themselves billed against KV; at this site's scale,
  rounding error.

**Deliberately not done**

- No global rate limiter (per-IP, per-session, per-fingerprint). If the
  ceiling proves insufficient — e.g. a single attacker burns the budget
  in a minute — adding a rate limiter in front of the AI routes is a
  later, additive change.
- No alert when the ceiling is approached. The site won't page anyone;
  the user-visible signal (429 + fallback) is the only one. If this
  becomes uncomfortable, a daily cron to email when month-spend > 70%
  is the natural next step.
- No per-IP attribution in the cost log. The log captures `endpoint`,
  `model`, tokens, and prompt version — not the caller. Sufficient for
  trend analysis; insufficient for revoking access by IP. Add later if
  the threat model warrants.

## Alternatives considered

- **Global rate limiter (Upstash / Vercel Edge Config / Redis).** Rejected
  for now — solves a different problem (request burst) at the cost of
  adopting infrastructure. The cost ceiling solves the cost problem
  directly. Revisit if a real attack pattern emerges.
- **Hard kill switch (env var disables AI features entirely).** Rejected —
  too coarse. The ceiling already provides a hard kill at the spend
  threshold. A separate switch adds another lever to forget.
- **Per-route monthly budgets.** Considered. Ruled out as premature: with
  two AI routes and a small budget, dividing it doesn't help and creates
  the "JD matcher exhausted, but the game still has $5 left" UX hole.
- **Front-end debouncing only.** Rejected — relying on the client to be
  honest is the bug. Every defense lives server-side.

## References

- `lib/check-cost-ceiling.ts` — the helper itself
- `lib/cost-log.ts` — month-spend computation
- `app/api/smoke/route.ts` — the canonical wiring (ceiling → cache → call → log)
- `docs/specs/phase-2.md` § 11 (cost ceiling middleware — note that the
  "middleware" framing in the spec was loose; the implementation is a
  per-handler helper rather than Next middleware)
- ADR-0008 (server-side AI calls only) — why the ceiling can be enforced at all
- ADR-0009 (cache key includes prompt version) — why the cache is the
  natural fallback layer
- `CLAUDE.md` § "Cost ceiling enforced via env var; route returns 429 +
  cached fallback when hit"
