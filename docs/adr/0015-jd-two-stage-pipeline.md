# 0015 — JD adapter uses a two-stage parse-then-match pipeline

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

The JD adapter at `/jd` takes a free-text job description from the visitor and
produces a chip grid scoring Oliver's CV against each requirement. Two distinct
sub-problems sit inside that:

1. **Parsing**: extract a deduplicated, weighted list of requirements from the
   raw JD, separating hard requirements from soft and nice-to-haves, and
   skipping generic boilerplate ("good communication", "team player").
2. **Matching**: for each parsed requirement, decide whether the CV is a Hit
   (concrete supporting bullet exists), a Stretch (adjacent or partial), or a
   Miss (honest gap), citing the supporting bullet ID where applicable.

A single combined Anthropic call could do both — read the JD, read the CV, and
emit chips in one pass. That would be simpler at the call-site and cheaper
on round-trip count, but it bundles two concerns whose iteration cadence and
cache cardinality are different:

- Parser output depends only on JD text. Cache key: `sha256(jdText + parserPromptVersion)`.
- Matcher output depends on CV + parsed requirements + stretch level. Cache key:
  `sha256(cvHash + jdHash + stretchLevel + matcherPromptVersion)`.

If the matcher prompt iterates (it will — Phase 3 spec calls it "the deliverable
that gets the most iteration"), bumping its version invalidates only matcher
cache entries, not the more expensive parser entries. With a combined call the
two are coupled and every prompt tweak burns the whole cache.

The parser is also the right place to enforce the "5–15 requirements is the
target, more than 20 is noise" budget — keeping it out of the matcher's input
window simplifies the matcher's job.

## Decision

Two route handlers, two prompts, two cache keys, two prompt-version strings:

- `app/api/jd-parse/route.ts` — JD text → parsed requirements list. Tool-use
  enforces the schema. Cached on `sha256(jdText + parserPromptVersion)`.
- `app/api/jd-match/route.ts` — `(cvHash, parsed requirements, stretchLevel)` →
  matches with cited bullet IDs and gap framings. Tool-use enforces the schema.
  Cached on `sha256(cvHash + jdHash + stretchLevel + matcherPromptVersion)`.

The matcher response includes gap framings inline for every Miss — there is no
separate `/api/rewrite` endpoint. (Phase 3 spec mentioned one; folding the
framing into the matcher response avoids a third endpoint, a third cache, and
a third round-trip, since the matcher already has CV + requirement + Miss
context loaded.)

The pipeline is sequential — the matcher needs parsed requirements as input.
For pasted JDs, the client makes two calls in series. For pre-baked sample JDs,
both calls are skipped and chips render from `content/sample-jds.json`.

## Consequences

**Wins:**
- Parser cache invalidation is independent of matcher prompt churn.
- Each prompt is shorter, more focused, easier to iterate.
- The schema for parsed requirements is a stable interface — visitors who want
  to debug "why this chip" can compare parser output across runs.
- The matcher's worked-example budget can be larger (no JD-parsing examples
  competing for tokens with chip-scoring examples).

**Costs:**
- Two API calls per pasted JD instead of one. Both are Sonnet-4.6 calls; cold
  path measured at 3.4s parser + 5.3s matcher = ~8.7s end-to-end (see
  `docs/test-runs/jd-pressure-tests.md`), which exceeds the Phase 3 spec's
  <5s budget — criterion 2 was marked ⚠️ Partial in the phase review. Cache
  hits are instant; sample JDs bypass the API entirely. Tracked as a follow-up
  under `docs/TODO.md` "Phase 3 follow-ups".
- Two prompt-version strings to manage. Tracked in the cost log per endpoint.
- Two route handlers to error-boundary, ceiling-check, and cost-log.

**Deliberately not done:**
- No streaming — chip grids are short enough that full-response wait is
  acceptable, and streaming a structured tool-use response is fiddly.
- No `/api/rewrite` for gap framings — folded into the matcher response.

## Alternatives considered

- **Single combined call.** Cheaper round-trip, simpler client. Rejected:
  couples parser and matcher cache invalidation, makes prompt iteration
  more expensive.
- **Three calls (parse, match, then rewrite gap framings per Miss).** Closest
  to the literal Phase 3 spec text. Rejected: extra round-trips on every Miss
  click, third cache to maintain, and the matcher already has the context to
  write gap framings in the same call.
- **Pre-bake everything.** Visitors couldn't paste their own JDs. Rejected:
  the paste-and-score interaction is the point of the page.

## References

- Phase 3 spec: `docs/specs/phase-3.md` §Architecture, §Tasks 1–2
- Cache infrastructure: `lib/kv-cache.ts`, ADR-0009 (cache key includes prompt version)
- Server-side AI policy: ADR-0008
- Cost ceiling enforcement: ADR-0010
