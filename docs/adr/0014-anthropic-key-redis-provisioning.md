# 0014 — Anthropic key + Upstash Redis provisioning model

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

Phase 2 built the AI infrastructure (`lib/anthropic.ts`, `lib/kv-cache.ts`,
`lib/cost-log.ts`, `lib/check-cost-ceiling.ts`, `lib/pricing.ts`) but
deferred end-to-end verification — there was no real Anthropic key and
no real KV store wired up at the time. ADR-0010 set the policy that the
monthly cost ceiling is enforced per-endpoint via the
`ANTHROPIC_MONTHLY_LIMIT_USD` env var.

Two operational questions had to be settled before the smoke endpoint
could be verified end-to-end at the start of Phase 2.5:

1. **Anthropic key.** Should the portfolio site share an Anthropic key
   with other Oliver-controlled projects (e.g. `blob-life`), or have
   its own?
2. **KV store.** The original Phase 2 spec named "Vercel KV" as the
   cache. Vercel KV was deprecated in December 2024; existing stores
   were auto-migrated to Upstash Redis, and new projects are expected
   to install the Redis integration directly from the Vercel
   Marketplace. The `@vercel/kv` client may still work against
   Upstash-injected env vars, but its long-term support is unclear.

A third sub-question fell out of (1): the in-app cost ceiling
(`ANTHROPIC_MONTHLY_LIMIT_USD`, ADR-0010) is one defence against
runaway spend, but bugs in `check-cost-ceiling.ts` could let it leak.
Is a second defence — a hard cap on the Anthropic key itself — worth
the operational cost?

## Decision

**Three operational decisions, all in force from Phase 2.5:**

1. **Per-project Anthropic key.** A new key named `portfolio-prod` was
   provisioned in the Anthropic Console specifically for this site. It
   is not shared with `blob-life` or any other project. Cost telemetry
   per-project, blast radius per-project, revocation per-project.
2. **Anthropic-side $30/month cap mirrors `ANTHROPIC_MONTHLY_LIMIT_USD`.**
   The `portfolio-prod` key has a $30/month usage cap configured on the
   key itself in the Anthropic Console. The in-app
   `ANTHROPIC_MONTHLY_LIMIT_USD` is also set to $30 in production. The
   in-app ceiling is the primary defence (returns 429 + cached
   fallback); the key-side cap is the belt-and-braces backstop that
   catches bugs in `check-cost-ceiling.ts`.
3. **Upstash Redis via Vercel Marketplace; client is `@upstash/redis`.**
   The Redis integration is installed from the Marketplace and linked
   to the project. Vercel auto-injects the Upstash env vars across
   production / preview / development. The library imports were swapped
   from `@vercel/kv` to `@upstash/redis@1.37.0` in `lib/kv-cache.ts` and
   `lib/cost-log.ts` — same shape of operations (`get`, `set`, `scan`),
   but with the supported, native client.

The smoke endpoint at `/api/smoke` was used to verify the full chain
(key + Redis + cost log + cache) end-to-end before any tone-toggle
work began. First call: 200, `costUSD ≈ $0.000111`, logged to Redis.
Second call: 200, cache hit. `getMonthSpend()` correctly summed the
single charge.

Production `ANTHROPIC_MONTHLY_LIMIT_USD=30` is set via `vercel env`.
Preview deferred to the first feature branch — Vercel CLI 51.8.0
rejects `vercel env add X preview --yes` without a git-branch arg even
when the help text says it's optional. Likely fixed in CLI 53.x.

## Consequences

**Wins**

- **Blast radius is per-project.** A leaked key, a runaway prompt, or a
  bug in `check-cost-ceiling.ts` only affects this site. Other projects
  on the same Anthropic account are unaffected.
- **Two-layer cost defence.** The in-app ceiling is the primary control
  (graceful 429 + cached fallback). The key-side cap is the backstop:
  even if `check-cost-ceiling.ts` regresses to a no-op, monthly spend
  is bounded by the Anthropic Console.
- **Supported Redis client.** `@upstash/redis` is the actively
  maintained client; Vercel KV's wrapper is in deprecation territory.
  Type signatures are accurate to the actual SDK (this surfaced two
  latent bugs in `cost-log.ts` and `pricing.ts` that Phase 2's
  `@vercel/kv`-typed code was hiding).
- **Auto-injected envs.** No manual copy-paste of Redis credentials.
  `vercel env pull .env.local` pulls them locally; production /
  preview / development are populated by the Marketplace integration.
- **Reusable pattern.** "Per-project Anthropic key + Anthropic-side
  cap mirroring the in-app ceiling + Upstash via Marketplace" is the
  template for any future Oliver-controlled site that uses AI.

**Costs**

- **One more thing to provision per project.** A new Anthropic key
  per site is one extra step at bootstrap time. The cost is small;
  the alternative (one shared key) was strictly worse.
- **Two places to set the limit.** The in-app env var and the
  Anthropic Console must agree. Drift between them is benign (the
  lower one wins) but worth noting in this ADR so future-Oliver
  doesn't forget to update both.
- **Preview env is not yet set.** Until the CLI bug is worked
  around (or upgraded to 53.x), the preview environment relies on
  the in-code default cost ceiling ($20). Acceptable because no
  preview branches exist yet.

**Deliberately not done**

- **No shared Anthropic key across projects.** Despite the convenience,
  the blast-radius argument wins. Every Oliver-controlled site that
  uses AI gets its own key.
- **No `@vercel/kv` compatibility shim.** When the Phase 2 code was
  written against `@vercel/kv`, it was already known the package was
  on borrowed time. Swapping rather than shimming was the right call.
- **No Upstash account managed outside Vercel.** The Marketplace
  integration is the surface; Upstash exists below it but isn't
  managed directly. This keeps environment-variable management
  inside the Vercel project envs, where ADR-0010's contract lives.
- **No automated test for the Anthropic-side cap.** The key-side cap
  is a backstop; verifying it would require triggering it, which
  would either cost $30 or require Anthropic Console mocking. Not
  worth it.

## Alternatives considered

- **One shared Anthropic key across all of Oliver's projects.**
  Rejected — blast radius, cost telemetry, and revocation all argue
  for per-project keys. The marginal cost of provisioning one extra
  key is negligible.
- **In-app cost ceiling only; no Anthropic-side cap.** Rejected —
  the cost ceiling is one piece of code; bugs there could leak
  spend. The key-side cap is a $0-cost hedge against that risk.
- **Anthropic-side cap only; no in-app ceiling.** Rejected — the
  Anthropic-side cap fails by killing API calls hard once exceeded.
  The in-app ceiling fails gracefully (429 + cached fallback per
  ADR-0010), which is the correct user-facing behaviour. Both
  layers serve different purposes.
- **Stay on `@vercel/kv` against the Upstash-injected env vars.**
  Considered. May still work today; almost certainly bit-rots over
  time. The shape of the operations is identical; the swap was a
  ~30-line patch.
- **Use a different cache (Vercel Edge Config, Vercel Blob,
  filesystem cache).** Rejected — Edge Config is read-mostly and
  doesn't support the `scan` we need for cost summing; Blob is
  object storage; filesystem cache doesn't survive function
  restarts on Vercel. Upstash Redis is the right shape.

## References

- ADR-0008 — server-side AI calls only
- ADR-0009 — cache key includes prompt version
- ADR-0010 — per-endpoint cost ceiling via `ANTHROPIC_MONTHLY_LIMIT_USD`
- ADR-0013 — pre-written tone toggle (sibling decision in this phase)
- `lib/anthropic.ts` — the only place `ANTHROPIC_API_KEY` is read
- `lib/kv-cache.ts` — Upstash Redis client; was `@vercel/kv` in Phase 2
- `lib/cost-log.ts` — Upstash Redis client; was `@vercel/kv` in Phase 2
- `lib/check-cost-ceiling.ts` — reads `ANTHROPIC_MONTHLY_LIMIT_USD`
- `app/api/smoke/route.ts` — verification harness for the full chain
- `tests/cost-log.test.ts` — locks the cursor type after the
  `@upstash/redis` swap
- `tests/pricing.test.ts` — locks dated-model-ID prefix lookup
- Vercel Marketplace Redis integration:
  https://vercel.com/olivergates-projects/~/integrations/redis
- Anthropic Console — `portfolio-prod` key (`$30/month` cap configured
  on the key itself)
