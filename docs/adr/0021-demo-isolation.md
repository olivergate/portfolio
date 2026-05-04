# 0021 — Demo isolation

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Oliver Kaikane Gate

## Context

Phase 4 ships the first surface (`/lab`) intended to host live, agentic-feel
demos. The featured demo is the Claude Code retrospective generator; the
spec calls out that more demos may follow over time (Phase 5+ game; possibly
others as the lab page grows).

This ADR is a forward-looking guardrail: define how new demos compose so the
first one doesn't accidentally constrain the second one. The shape that
matters across demos is the AI-call topology — every demo making a network
call needs its own rate-limit budget, its own fallback strategy, its own
prompt version, and its own cache namespace. Sharing those across demos is
the kind of coupling that hurts later, not now.

## Decision

**Each demo on `/lab` (and any sibling page) is a self-contained pair: one
Route Handler under `app/api/<demo>/` and one Client Component under
`components/<page>/<Demo>.tsx`. Demos do not share Route Handlers, prompt
versions, cache prefixes, or rate-limit buckets.**

Mechanically:

- One `app/api/<slug>/route.ts` per demo. The retro demo lives at
  `app/api/retro/route.ts`.
- One demo-specific module under `lib/` for prompts (`lib/retro-prompts.ts`)
  and one for the schema (`lib/retro-schemas.ts`). No shared "demo prompts"
  module.
- Cache keys include the endpoint string (`/api/retro`) — the kv-cache
  helper namespaces by endpoint already (ADR-0009), so two demos cannot
  collide on cache by accident.
- Rate limits are per endpoint (ADR-0022), keyed `ratelimit:<demo>`.
- Cost-log entries record `endpoint`, so spend is attributable per demo.
- Canned-response fallbacks live next to the demo's component
  (`lib/canned-retros.ts`) — not in a shared catalogue.

## Consequences

**Wins**

- **Independent failure modes.** A regression in the retro prompt cannot
  affect a future game endpoint; a noisy attacker on one demo doesn't
  burn another demo's rate-limit budget.
- **Easy to add demos.** The pattern is a single Route Handler + Client
  Component — same shape every time. The next demo (game L-01 in Phase 5)
  follows this template.
- **Cost attribution stays clean.** `cost:YYYY-MM:*` entries already record
  the endpoint; per-demo dashboards are a `where endpoint = ?` away.

**Costs**

- A small amount of duplication across demos (each one re-imports cache,
  ceiling, cost log, ratelimit). The shared-utilities layer (`lib/anthropic`,
  `lib/kv-cache`, `lib/check-cost-ceiling`, `lib/cost-log`, `lib/ratelimit`,
  `lib/jd-prompts:extractToolInput`) absorbs the real common logic; demos
  only repeat the wiring, which is short and worth the clarity.
- No "all demos at once" admin surface — pausing every demo means setting
  `ANTHROPIC_MONTHLY_LIMIT_USD` low enough that the cost ceiling fires for
  all of them. Acceptable: that's the nuclear option anyway.

**Deliberately not done**

- No demo registry, no demo plugin system, no shared Route Handler that
  switches on a demo id. The "make adding a demo a one-line config change"
  itch is real but premature; the duplication cost only bites at >5 demos
  and we're at 1.

## Alternatives considered

- **Single shared `/api/demos/<slug>` Route Handler.** Rejected — couples
  prompt versions, fallback policies, and rate-limit buckets across demos
  for negligible code-share gain.
- **Demo registry module (`lib/demos.ts` listing every demo).** Rejected —
  premature abstraction. The `/lab` page already imports its featured demo
  directly; the game page in Phase 5 will too. No central index needed.
- **Server Actions instead of Route Handlers.** Rejected — Route Handlers
  give us the explicit `Request → Response` envelope that pairs cleanly
  with the staged error pattern (`{ ok: false, stage, detail }`) that's
  now standard across `/api/jd-parse`, `/api/jd-match`, `/api/retro`.

## References

- `app/api/retro/route.ts` — the canonical wiring
- `components/lab/RetroDemo.tsx` — the canonical client island
- `lib/retro-prompts.ts`, `lib/retro-schemas.ts`, `lib/canned-retros.ts` —
  per-demo modules
- ADR-0008 (server-side AI calls only) — the topology this builds on
- ADR-0009 (cache key includes prompt version) — the namespacing primitive
- ADR-0010 (cost ceiling per endpoint) — endpoint-attributed spend
- ADR-0022 (additive ratelimit) — per-demo limits
