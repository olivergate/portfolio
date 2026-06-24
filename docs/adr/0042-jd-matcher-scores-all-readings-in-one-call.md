# 0042 — JD matcher scores all three readings in one call; slider is a client-side projection

- **Status:** Accepted
- **Date:** 2026-06-17
- **Deciders:** Oliver Kaikane Gate

## Context

The JD adapter scores a pasted JD in two server calls: `/api/jd-parse`
extracts requirements, then `/api/jd-match` scores them against the CV. Under
ADR-0017 the matcher scored **one stretch reading per call** (strict /
balanced / generous), and the request carried the discrete level. The client
cached results per-level in a `matchesByLevel` map and re-fetched `/api/jd-match`
the first time the visitor dragged the slider to a not-yet-scored reading.

Two problems with that shape, both raised directly:

1. **The slider reloads the analysis.** Each new reading is a fresh network
   round-trip plus a model call — a debounced refetch that makes the slider
   feel laggy and re-runs honesty-critical work the visitor has already paid
   for. Pre-baked sample JDs never had this problem: `content/sample-jds.json`
   stores all three readings per chip (`baseStatus` + optional `strictStatus`
   / `generousStatus`) and projects them client-side via `statusAtLevel()`.
   Only the live path lacked that model.

2. **The wait is unexplained.** Two sequential model calls take several
   seconds, and the only feedback was the Score button label flipping
   `Parsing… → Matching…`. The `/lab` retro demo already solved "show the work"
   with `LoadingPipeline` — a terminal-styled, timer-driven staged pipeline
   with an accessible live region (ADR-0025's demo).

Separately: scoring one reading per call means three fresh scores send the full
CV evidence to the model three times (no prompt caching today), which is the
expensive part of the matcher call.

## Decision

**The matcher scores all three readings in a single call, and the stretch
slider becomes a pure client-side projection with no refetch.** The loading
state reuses the shared `LoadingPipeline`.

Concretely:

- `Match` carries `baseStatus` + optional `strictStatus` / `generousStatus`
  (dropping the single `status`) — the **same shape** `SampleChip` already
  uses. Live and sample chips now project through one helper, `statusAtLevel()`
  (generalised to a structural `LeveledStatus` type).
- The matcher prompt is rewritten to return all three readings in one pass and
  re-versioned `jd-matcher@v2 → @v3` (invalidates the cache per ADR-0009). The
  seven worked examples are retained and rewritten to the new output shape.
- `/api/jd-match` no longer accepts a `stretchLevel`; the cache key drops it
  (now `cvHash + requirements`). `JDAdapter` makes one match call on Score and
  the slider re-projects locally — the per-level refetch `useEffect` is deleted.
- The server-side honesty validator now checks every reading: a Hit at **any**
  reading needs a (shared) cite; a Miss is all-or-nothing across readings
  (you can't slide into or out of a gap); a Miss still needs empty cite +
  gapFraming. `strictStatus`/`generousStatus` are typed `OverrideStatus`
  (`hit | stretch`) so "miss" can't even be expressed as an override.
- The **pre-baked sample JDs** are brought into line with the same floor — they
  bypass the matcher route, so the rule is enforced on `SampleChip` directly: a
  `.superRefine` rejects any chip whose three readings cross the Stretch/Miss
  floor, run by `bun run content:validate`. Eight existing sample chips that
  softened a gap (Miss→Stretch at generous) or hardened a Stretch (→Miss at
  strict) — latent violations of ADR-0017 that predated this change — were
  corrected so a gap stays a gap at every reading.
- `LoadingPipeline` moves from `components/lab/` to `components/ui/` with a
  `steps` prop; its CSS moves from `lab.css` to `globals.css` renamed
  `.lab-pipeline* → .pipeline*`. `/lab` and `/jd` share it. The JD pipeline
  shows: read JD → extract requirements → match against CV → score
  strict/balanced/generous, on a fixed timer decoupled from the fetch.

## Consequences

- **Slider is instant.** Changing the reading is now pure client computation —
  identical to how sample JDs already behaved. No network, no second model call.
- **The Miss-invariant is enforced structurally, not just by prompt.** One
  reasoning pass produces all three readings, so "a Miss stays a Miss at every
  reading" (ADR-0017's honesty principle) can no longer drift between
  independent stochastic calls. The validator backs it with a hard 502.
- **Cheaper.** One matcher call per fresh score instead of up to three, so the
  CV evidence is sent once, not three times.
- **One fewer moving part.** The `matchesByLevel` map, the debounced refetch
  effect, and the generation-guard around it are gone; the live path mirrors
  the sample path.
- **Cost of the change:** it touched a honesty-guardrailed prompt (re-versioned,
  re-snapshotted) and the validator, and the loader extraction churned `/lab`'s
  component + CSS (mechanical: import path + class names; `/lab` behaviour
  unchanged). Slightly more model output per call (per-level fields) — trivial
  next to sending the CV three times.
- **Not done:** per-reading `reasoning` (the v2 prompt could phrase a borderline
  chip's reasoning differently at strict vs generous). The single-call model
  carries one shared `reasoning` per chip — the same simplification sample
  chips already make. Acceptable; revisit only if the editorial loss shows.

## Alternatives considered

- **Three parallel match calls (`Promise.all` over the levels).** No prompt /
  schema / validator change, lowest implementation risk. Rejected: ~3× the
  matcher API cost per fresh score (CV sent three times), and three independent
  stochastic calls can disagree on whether a requirement is a Miss — exactly the
  invariant we most want to hold. The one-call model is both cheaper and more
  honest.
- **Keep refetch-on-slide, just add the loader.** Solves the "show the work"
  ask but not the "stop reloading the analysis" ask. Rejected — the lag was the
  primary complaint.
- **A bespoke JD-themed loader** (rust palette, chip skeletons) instead of
  reusing the terminal pipeline. Rejected: more design + build surface and a
  second loading idiom to maintain, for no functional gain. The terminal
  pipeline is established and accessibility-tested.
- **Do nothing.** Rejected — both problems were raised directly.

## References

- ADR-0016 — JD matcher prompt is conservative-biased (honesty rules the
  validator enforces).
- ADR-0017 — Stretch slider adjusts only the Hit/Stretch boundary. Its honesty
  principle (the reading never moves a Miss) is retained and now enforced
  structurally; its transport mechanism (API receives a discrete level +
  per-level refetch) is superseded by this ADR.
- ADR-0009 — Cache key includes prompt version; the `@v3` bump invalidates the
  matcher cache.
- ADR-0025 — Canned-response fallback for the retro demo, source of the
  `LoadingPipeline` cadence now shared by `/jd`.
- `components/jd/JDAdapter.tsx`, `app/api/jd-match/route.ts`, `lib/jd-prompts.ts`,
  `lib/jd-schemas.ts`, `components/ui/LoadingPipeline.tsx`.
