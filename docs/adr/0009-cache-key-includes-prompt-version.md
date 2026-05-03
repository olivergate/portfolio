# 0009 — Cache key includes prompt version; no TTLs

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

The KV cache (`lib/kv-cache.ts`) memoizes the output of every Anthropic call,
keyed by the inputs. Two design questions sit on top:

1. **What do we key on?** — Just the user input? Or also the prompt, the
   model, and any other non-input variable that affects the output?
2. **When does cache expire?** — TTL (time-based)? Manual purge? Or
   structural invalidation via the key?

Both questions matter because the cache lives behind features that change.
The JD matcher prompt will get refined in Phase 3 and beyond. If the cache
keeps serving the old answers from the old prompt, the site silently lies —
a bullet that today shows as a "Hit" might tomorrow show as a "Stretch" once
the prompt is tightened, but only for users with cold caches.

## Decision

**Cache keys include `promptVersion`. The cache has no TTL. Cache invalidation
is structural: bumping the prompt version creates a new key namespace; the
old entries become unreachable and age out only via KV's underlying limits,
not via our logic.**

`makeCacheKey` (`lib/kv-cache.ts`) takes:

```ts
{ endpoint: string; promptVersion: string; input: unknown }
```

…serializes deterministically (sorted keys), sha256-hashes, and prefixes the
result with `cache:<endpoint>:<promptVersion>:`. A prompt revision = bump
the version string in the calling Route Handler = automatic full
invalidation for that endpoint. No purge step.

`promptVersion` is a string under the developer's control — convention is
`feature@vN` (e.g. `jd-match@v3`, `game-l01@v1`). Bumping it lives next to
the prompt edit in the same commit; the diff carries both.

## Consequences

**Wins**

- **Honesty.** Stale answers from old prompts cannot leak into the UI. The
  cache and the prompt move together by construction.
- **No expiry tuning.** TTLs are a confusing knob: too short and the cache
  is ineffective; too long and the staleness window is unpredictable.
  Removing them removes a category of bugs.
- **Diff visibility.** The git history is the audit log: "this commit
  bumped the prompt version" reads cleanly. No separate "purge cache"
  ritual at deploy time.
- **Replay-friendly.** If the same input + same prompt = same key, you can
  hit the cache from any environment (preview, prod) and get the same
  answer back. Useful for debugging a regression: load the cache key
  locally and inspect the cached response.

**Costs**

- KV will accumulate orphaned entries across version bumps. Acceptable on
  this site's scale (low traffic, small response payloads). If it becomes a
  problem, a janitor cron can scan for keys with `promptVersion` not in the
  current allow-list.
- "Same input, same prompt, but the model is now smarter" doesn't bust the
  cache. Mitigation: when changing the model, bump `promptVersion` even if
  the prompt text didn't change. The version is the model+prompt tuple in
  spirit; the convention covers it.

**Deliberately not done**

- No `cacheSetWithTTL`. The wrapper exposes only `cacheGet` / `cacheSet` /
  `makeCacheKey`. Adding TTLs later is reversible; making them the default
  is the slope I want to avoid.
- No automatic cleanup of old-version keys. Until KV's free tier is in
  view, the cost is rounding error.

## Alternatives considered

- **TTL-based expiry (e.g. 7 days).** Rejected — staleness window is the
  thing the site can't afford. A "Hit" rendered yesterday might no longer
  be a Hit; the user should see today's answer, not yesterday's.
- **Hash the prompt itself into the key.** Considered. Equivalent in effect
  for prompt edits, but `promptVersion` reads better in logs (you see
  `jd-match@v3`, not a hex hash) and lets the version intentionally lag a
  prompt rewrite if the developer judges the change is bug-fix-only.
- **Manual purge CLI.** Rejected — adds a deploy step that's easy to forget.
  Structural invalidation removes the human from the loop.
- **No cache at all.** Rejected — Anthropic costs and per-call latency
  both want a cache. The honesty concern is solved by the version key, not
  by removing the cache.

## References

- `lib/kv-cache.ts:8-14` — `CacheKeyParts` type
- `lib/kv-cache.ts:16-20` — `makeCacheKey` implementation
- `app/api/smoke/route.ts` — `PROMPT_VERSION = "smoke@v1"` example
- `docs/specs/phase-2.md` § 8 (KV cache utility)
- ADR-0008 (server-side AI calls only) — context for where the cache lives
