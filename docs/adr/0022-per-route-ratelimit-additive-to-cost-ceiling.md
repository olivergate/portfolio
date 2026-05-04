# 0022 — Per-route rate limit, additive to ADR-0010

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Oliver Kaikane Gate

## Context

ADR-0010 chose the cost ceiling (`ANTHROPIC_MONTHLY_LIMIT_USD`) as the
primary defence against runaway spend on AI Route Handlers, and explicitly
left a per-route rate limiter for "later, additive" work:

> **Deliberately not done — No global rate limiter.** If the ceiling proves
> insufficient — e.g. a single attacker burns the budget in a minute —
> adding a rate limiter in front of the AI routes is a later, additive
> change.

Phase 4 ships the first AI Route Handler (`/api/retro`) where that scenario
is plausible: the demo invites pasting an ~8KB transcript and clicking a
button. A determined visitor can burn the monthly Sonnet budget in a few
minutes' worth of fresh pastes (every paste is a cache miss; cache + ceiling
together don't bound *rate*, only *aggregate spend*). The cost ceiling still
caps the bleed at $30/month, but the failure mode is "feature unavailable
for everyone for the rest of the month after one bad actor."

A scoped, per-IP rate limit handles that DOS / abuse-pattern case without
disturbing the cost-ceiling-as-primary stance.

## Decision

**The retro endpoint (`/api/retro`) adds a per-IP sliding-window rate
limiter (10 requests / 1 hour) via `@upstash/ratelimit` on top of the
existing cost ceiling. The check runs *after* the cache lookup (cache hits
remain free) and *before* the cost-ceiling check (rate-limited requests
never reach `getMonthSpend`). This is additive to ADR-0010, not a
supersession — ADR-0010's "no global rate limiter (yet)" stance is preserved
because the limit is per-route, not global.**

Mechanically:

- `lib/ratelimit.ts` exports `getRetroLimiter()` (cached) using
  `Ratelimit.slidingWindow(10, "1 h")` keyed `ratelimit:retro:<ip>`.
- `getClientIP(req)` extracts `x-forwarded-for` (first hop) with
  `x-real-ip` fallback; misconfigured environments share the `unknown`
  bucket — strict by design, errs toward tripping the limit rather than
  bypassing it.
- On block: `429` with `stage: "ratelimit-blocked"` and a canned-response
  payload (per ADR-0025) so the demo still renders something useful.
- Same Upstash Redis the cache + cost-log already use — no new infra.

The handler ordering is:

```
validate-input
  ↓
cache-get        (free)
  ↓
ratelimit-check  (NEW — this ADR)
  ↓
ceiling-check    (ADR-0010)
  ↓
anthropic call
  ↓
cost-log → tool-extract → schema-validate → cache-set → respond
```

## Consequences

**Wins**

- **Bounds attack rate.** A hostile visitor from a single IP gets 10 fresh
  pastes per hour, not 600. The cost ceiling still caps total spend; this
  caps *time-to-burn*.
- **Free for the cache.** Cache hits skip the rate limiter entirely. A
  visitor who clicks Run repeatedly on the same transcript is unaffected.
- **Per-demo budget.** ADR-0021 (demo isolation) means a future game
  endpoint gets its own rate-limit prefix; the retro endpoint can't
  exhaust it.
- **No new infra.** `@upstash/ratelimit` is one dep on the existing
  Upstash Redis instance.

**Costs**

- 10/hour is a guess. Could be too tight for a real visitor who's curious
  enough to try four samples + edit + re-run; could be too loose for a
  bored actor who runs 10 fresh pastes/hour for the whole month.
  Acceptable: tunable in the literal in `lib/ratelimit.ts:getRetroLimiter`,
  no schema migration to revisit.
- Behind CGNAT, multiple users share an IP and one bad actor can trip the
  whole household. Mitigated by the canned-response fallback (ADR-0025) —
  the limited user still sees output, just not a fresh one.
- Adds one Redis round-trip per cache-miss request. Trivial; rounding
  error on the existing per-request budget.

**Deliberately not done**

- **No global rate limiter.** This is per-route only. ADR-0010's "no
  global limiter (yet)" remains true. Adding one would be a separate ADR.
- **No daily budget alerts.** Same as ADR-0010 — the user-visible signal
  (429 + fallback) is the only one. If month-spend > 70% becomes worth
  paging on, a cron is the next step.
- **No per-IP attribution in the cost log.** The cost log still records
  `endpoint`, not `ip`. Sufficient for trend analysis. Adding IP attribution
  is privacy-laden and not yet warranted.

## Alternatives considered

- **Skip the rate limit entirely; rely on the cost ceiling.** Considered.
  Rejected — the cost ceiling alone allows time-compressed exhaustion. A
  bad day at 9am means feature paused until next month; the rate limit
  spreads the bleed and gives a normal visitor most of the month even
  during a sustained low-rate attack.
- **Daily token cap per IP (e.g. 50K tokens / day / IP).** Considered.
  Rejected — couples the limit to model output size, which the visitor
  doesn't control directly. Per-request limit is simpler and lines up
  with the user mental model ("you've made too many requests").
- **Vercel Edge Middleware rate-limit, not per-Route-Handler.** Rejected
  for the same reason ADR-0010 rejected middleware-level cost-ceiling
  enforcement: middleware can't cleanly distinguish AI routes from static
  routes without leaking knowledge it shouldn't have. Per-handler is the
  right granularity.
- **`@vercel/firewall` IP rules.** Out of scope — those are reactive
  blocks, not proactive bounds.

## References

- `lib/ratelimit.ts` — implementation
- `app/api/retro/route.ts` — call site (after `cacheGet`, before
  `checkCostCeiling`)
- `tests/retro-rate-limit.test.ts` — locks the 429-with-fallback contract
- ADR-0010 (cost ceiling per endpoint) — the primary defence; this one is
  additive
- ADR-0021 (demo isolation) — why per-route, not global
- ADR-0025 (canned-response fallback) — what the visitor sees on block
