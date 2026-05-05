# TODO — deferred decisions and follow-up work

Lightweight catch-all for things that would otherwise live in your head or
get lost between sessions. Promote items into ADRs, GitHub issues, or
phase specs once they harden.

## Decisions deferred

- **Rename + write the four-sliders blog post.** `content/blog.json` ships
  a placeholder for `/blog/four-sliders` (title, summary, body all marked
  TODO). Linked from `RethemeFab` via
  `lib/blog-links.ts:FOUR_SLIDERS_POST_HREF`. Before any production deploy,
  rename the slug to a real one, write the body, and update both
  `content/blog.json` and `lib/blog-links.ts` atomically.
  - Surfaced: 2026-05-04, post-FAB ADR (0026) sync
  - Owner: Oliver
  - Blocks: production deploy

- **Anthropic monthly cost ceiling** — `ANTHROPIC_MONTHLY_LIMIT_USD`. Phase 2
  ships with the dev default ($20) wired in `lib/check-cost-ceiling.ts`. Pick
  a production value before Phase 3 ships (Phase 3 is the first phase that
  actually calls the API). Suggested range: $20–50.
  - Surfaced: 2026-05-03, Phase 2 planning
  - Owner: Oliver

## Phase 4 follow-ups

- **Phase 4 ADRs landed at 0021–0025, not the 0016–0019 the spec pre-allocated.**
  `docs/specs/phase-4.md` § "ADRs to write this phase" pre-allocated
  ADR-0016 through ADR-0019. Those numbers were taken in Phase 3 (0015
  two-stage pipeline, 0016 matcher conservative bias, 0017 stretch slider
  semantics, 0018 no top-line percentage, 0019 bullet reorder opt-in,
  0020 localStorage replaces URL-hash share). Phase 4 shipped as 0021
  (demo isolation), 0022 (additive ratelimit), 0023 (no demo side effects),
  0024 (linkout cards), 0025 (canned fallback). Same drift pattern as
  Phases 2 and 3 — specs pre-allocate too eagerly. Numbering settled.
  - Surfaced: 2026-05-04, Phase 4 spec reconciliation
  - Owner: n/a (numbering settled)

- **Phase 4 spec said "TTL 24h" on the retro cache; ADR-0009 says no TTLs.
  Dropped the TTL clause.** `docs/specs/phase-4.md` line 132 specifies
  "TTL 24h since this is a demo, not a permanent record." ADR-0009 is
  explicit: "Cache keys include `promptVersion`. The cache has no TTL."
  Followed the ADR. Cache invalidation is structural — bump
  `RETRO_PROMPT_VERSION` to namespace fresh entries.
  - Surfaced: 2026-05-04, Phase 4 spec reconciliation
  - Owner: n/a (decision settled in ADR-0009)

- **Retro prompt was authored fresh, not ported.** `docs/specs/phase-4.md`
  line 127 said "port from `cv-lab.html` if it's there, otherwise
  placeholder until Oliver supplies it." The HTML carries only canned
  outputs (`SAMPLES[id].retro`) — there's no real prompt to port.
  Authored placeholder `retro@v1` matching the four-section schema. Oliver
  edits in place; bumping `RETRO_PROMPT_VERSION` invalidates cache + fails
  the snapshot test until updated.
  - Surfaced: 2026-05-04, Phase 4 implementation
  - Owner: Oliver, ad-hoc — replace placeholder with the real workflow prompt

- **Phase 4 rate-limit added the per-route limiter ADR-0010 said was
  "later, additive."** ADR-0010 explicitly anticipated this and ADR-0022
  records it as additive (per-route, not global) — ADR-0010's "no global
  limiter (yet)" stance is preserved. Logged here so a future reader
  doesn't think 0022 supersedes 0010.
  - Surfaced: 2026-05-04, Phase 4 implementation
  - Owner: n/a (relationship settled in ADR-0022)

- **Confirm real CTA URLs for the three secondary `/lab` cards.**
  `content/projects.json` ships with placeholder anchors:
  `#language-writeup`, `#habit-testflight`, `#movement-writeup`. Edit the
  file directly when destinations are ready (TestFlight invite, blog post,
  GitHub README, etc.). External URLs (anything starting with `http`) are
  auto-handled by `ProjectCard.tsx` — they get `target=_blank` and
  `rel=noopener,noreferrer`.
  - Surfaced: 2026-05-04, Phase 4 ship
  - Owner: Oliver, ad-hoc

- **Pre-existing e2e failures inherited from `phase-3-jd` HEAD.** Six
  failures pre-exist on the Phase 3 commit; not introduced by Phase 4.
  Verified by stashing Phase 4 changes and re-running:
  - 5 × `tests/e2e/a11y.spec.ts` — axe a11y violations on `/tone` at
    representative slider positions (default + 4 slider combos).
  - 1 × `tests/e2e/jd-interactions.spec.ts:84` — "stretch slider strict
    snap re-colors chips (Sustainability r10 → Miss)" expects ≥11 hits at
    generous; current sample data falls one short.
  Scope: out for Phase 4 (would breach session-size discipline). Worth
  picking up in Phase 7 polish or earlier if it bites.
  - Surfaced: 2026-05-04, Phase 4 verification
  - Owner: TBD

- **Pre-existing lint errors in `tools/doc-lint/doc-lint.ts`.** 5 errors
  (`useTemplate` × 1, `noNonNullAssertion` × 1, `noAssignInExpressions` × 3)
  in the doc-system kit-bootstrap commit. Phase 4 changes are lint-clean;
  these are pre-existing and not blocking deploy. Worth a single cleanup
  pass when the doc-system is next touched.
  - Surfaced: 2026-05-04, Phase 4 verification
  - Owner: TBD

## Phase 4 polish (deferred from review, 2026-05-04)

Caught in the post-Phase-4 review (3 parallel reviewers — backend / frontend / docs). Should-fixes were applied in the same session; the items below are nice-to-haves that didn't justify the same-session scope. Pick up in Phase 7 polish or earlier if any one bites.

- **`RetroOutput` timestamp re-renders on every parent re-render.** `components/lab/RetroOutput.tsx:106-129` calls `new Date()` at render. Output is cleared on textarea edit, so the practical risk is small — but a long-idle output card will silently tick to a new minute without explanation. Snapshot the timestamp into state at `setOutput` time, or lift it to a prop derived once.
- **Reduced-motion gaps in `lab.css`.** `.lab-card-cta-arrow` translateX on hover and `.lab-run-btn :active translateY(1px)` aren't gated by `prefers-reduced-motion: reduce`. Trivial CSS additions.
- **`.lab-run-btn` arrow doesn't translate on hover.** `.score-btn:hover .arrow { transform: translateX(3px) }` is the established Phase 3 pattern (`globals.css:619`); `.lab-run-btn` (`lab.css`) is missing the rule. Cards do animate their arrow — visual inconsistency.
- **`.lab-pipeline-row[data-state="done"]` 0.5 opacity may fail WCAG AA.** Green-glyph + label at 0.5 opacity over `--terminal` (#0f0e0b) is borderline against `--terminal-fg` (#e8e2d0) for non-text contrast (3:1 minimum). Cheap fix: bump to 0.65.
- **Mobile/iOS: `.lab-transcript` font-size 0.82rem may trigger Safari tap-zoom.** iOS Safari auto-zooms `<input>`/`<textarea>` below 16px. Bump to 16px on `@media (max-width: 480px)` to avoid the zoom-jump on focus.
- **`RETRO_TOOL.input_schema` lacks per-string `maxLength` bounds.** `lib/retro-prompts.ts:48-104` carries `minItems`/`maxItems` for arrays but no string caps; the Zod schema (`RetroResponse`) does. The model could emit a 700-char bullet that the schema rejects in `schema-validate` (502 + fallback). Mirror the Zod bounds in the tool input_schema so the model self-bounds.
- **`MAX_OUTPUT_TOKENS = 2000`** in `app/api/retro/route.ts:25` leaves headroom but flirts with the cap if the model emits long `learnings.body` near the 600-char ceiling for several entries. Bump to 3000 to match JD matcher's 4000-token safety margin, or add a comment justifying 2000.
- **ADR-0021 "per-demo modules" claim slightly overreaches.** `0021-demo-isolation.md:91-92` lists `lib/retro-prompts.ts` as per-demo; line 4 of that file actually re-exports `extractToolInput` from `lib/jd-prompts.ts` (shared utility). Not a contradiction (the ADR allows shared utilities), but a one-line clarification or moving `extractToolInput` to `lib/anthropic-tools.ts` would make the claim uniformly true.
- **ADR-0023 is partly aspirational for Phase 5+.** "Game tools *will* simulate" — fine as a forward commitment, but a reader pulling 0023 in isolation may not realize the only currently-shipped enforcement is the retro endpoint's network-call topology. Re-frame slightly when Phase 5 lands.
- **Prompt doc honesty-bias wording.** `docs/prompts/retro-v1.md` § "Honesty bias (placeholder draft)" reads as if the bias was inherited from the JD matcher (ADR-0016); it was actually authored fresh in the same spirit. One-word edit ("aligned with" rather than "leans on the same").
- **`retro-snapshot.test.ts:18` heading regex is form-coupled.** Pattern `/^\d+\. (wentWell|slowed|learnings|additions) —/` requires the literal em-dash + leading number-dot-space. A prompt rephrased as "**wentWell** —" would empty the array and fail loudly (good — fails CI), but a one-line comment ("locks both section names AND heading shape") would prevent future churn.

## Phase 3 follow-ups

- **JD pipeline cold-path latency (~8s) exceeds the spec's <5s target.** Phase 3
  spec criterion 2 calls for "<5s for paste-to-chip-grid". Measured cold path on
  a short JD: 3.4s parser + 5.3s matcher = 8.7s. Cached subsequent calls are
  instant; sample JDs (the demo flow) bypass the API entirely. The cost is on
  the cold-paste path only. Options to consider in a polish pass:
  - Switch matcher to Haiku-4.5 (faster + cheaper, but pressure-test honesty
    first — Sonnet's conservative-bias adherence may not transfer 1:1).
  - Stream the matcher tool-use response (chips render progressively as the
    model emits each match). More work; bigger UX win.
  - Pre-warm cache for the most common JD shapes after deploy.
  - Accept it and rephrase the loading state ("scoring against your CV…")
    so the wait reads as deliberate rather than slow.
  - Surfaced: 2026-05-03, Phase 3 review (criterion 2 ⚠️ Partial)
  - Owner: TBD; not blocking Phase 3 commit. Pick up in Phase 7 polish or
    earlier if it bites in real use.

- **Vercel CLI `vercel env add … preview` blocked across 51.8.0 and 53.1.0.**
  Both versions reject the command from `main` with `git_branch_required`,
  even when the suggested next-step command is run verbatim. Workaround: set
  `ANTHROPIC_MONTHLY_LIMIT_USD=30` for preview env via the Vercel dashboard.
  Production env was set in Phase 2.5. Could file upstream once we confirm
  it isn't user error.
  - Surfaced: 2026-05-03, Phase 3 setup
  - Owner: Oliver, ad-hoc

- **`stretchThreshold: number` in spec became `stretchLevel: "strict" | "balanced" | "generous"` in the route.**
  `docs/specs/phase-3.md` lines 113, 136, 143 describe a continuous `0..1`
  threshold passed to `/api/jd-match`. The shipped handler at
  `app/api/jd-match/route.ts` accepts a discrete three-value enum instead.
  Rationale lives in ADR-0017 (cache cardinality cap at three matcher entries
  per JD; semantic clarity matching the `⊢ ⊨ ⊣` quick-snap labels). Spec text
  left as-is per `feedback_specs_lower_order_than_adrs.md`; the running
  implementation + ADR-0017 are the source of truth.
  - Surfaced: 2026-05-03, Phase 3 review
  - Owner: n/a (decision settled in ADR-0017)

- **Phase 3 ADRs renumbered from spec's pre-allocated 0011–0015 to 0015–0020.**
  `docs/specs/phase-3.md` § "ADRs to write this phase" pre-allocated
  ADR-0011 through ADR-0015. Those numbers were taken by the Phase 1 / 2 / 2.5
  ADRs that landed first (0011 tone-as-manifesto, 0012 ADR-editability tiers,
  0013 pre-written tone toggle, 0014 Anthropic-key + Redis provisioning).
  Phase 3 shipped as 0015 (two-stage pipeline), 0016 (matcher conservative
  bias), 0017 (stretch slider semantics), 0018 (no top-line percentage),
  0019 (bullet reorder opt-in), plus 0020 (localStorage replaces URL-hash
  share) added during Phase 3 fix-up batches. Same pattern as the Phase 2
  spec-drift entry below; specs are advisory, ADRs are first-class.
  - Surfaced: 2026-05-03, Phase 3 review
  - Owner: n/a (numbering settled)

- **Spec task 9's `/api/rewrite` endpoint for gap framings was never built — folded into the matcher response.**
  `docs/specs/phase-3.md` line 215 names a separate `/api/rewrite` endpoint
  (described as "Phase 2 infrastructure, first real use here") for tone-aware
  Miss framings. No such endpoint exists in `app/api/`. The matcher at
  `app/api/jd-match/route.ts` returns gap framings inline on every Miss in the
  same response. Rationale in ADR-0015 § Decision and § Alternatives considered
  ("Three calls"): the matcher already has CV + requirement + Miss context
  loaded, so a third round-trip + third cache key would be pure overhead. Flagged
  here so a future reader doesn't go looking for a route that was deliberately
  never built.
  - Surfaced: 2026-05-03, Phase 3 review
  - Owner: n/a (decision settled in ADR-0015)

## Phase 2.5 — follow-up work before Phase 2 is marked Done

- **3-voice tone toggle (Pessimistic / Honest / Absurd) on `/` — closed.**
  Shipped pre-written under Phase 2.5 (see ADR-0013) and subsequently
  removed on 2026-05-05 (see ADR-0030). The live-API variant originally
  envisioned in this TODO entry was never built; the pre-written version
  that did ship was retired because the JD adapter (ADR-0016) carries the
  honesty signal more substantively, and the 3× content maintenance cost
  was not earning its keep. Manifesto on `/tone` stays per ADR-0011.
  - Closed: 2026-05-05, ADR-0030

- **Manifesto content (14 tenets) for `/tone`** — shipped as Oliver-edits-later
  placeholder. Edit `content/tone.json` directly when ready; no rebuild
  needed in dev, no schema migration as long as the shape stays the same.
  Source draft: `design-references/source/cv-tone-tenets-draft.md`.
  - Surfaced: 2026-05-03, Phase 2 ship
  - Owner: Oliver, ad-hoc

## Documentation drift

- **`design-references/README.md` "2. cv-tone.html — Tone manifesto" section
  is wrong** — describes a 14-tenet manifesto with formal/personal voices
  that doesn't exist in `cv-tone.html`. The file actually contains the
  3-voice (honest/pessimistic/absurd) toggle on standard CV content. Once
  the manifesto direction is settled (see above), rewrite this section to
  match what's actually there OR generate a new design reference that
  matches the description.
  - Surfaced: 2026-05-03, Phase 2 planning
  - Owner: Oliver

- **`design-references/screenshots/02-cv-tone.png` is the main CV page**, not
  a tone manifesto. Looks like it was captured against the wrong file or
  never regenerated post-reshape. Replace once Phase 2 ships.
  - Surfaced: 2026-05-03, Phase 2 planning

## Known benign warnings

- **Hydration mismatch warning on every route** — the inline bootstrap
  script (Phase 1, `lib/bootstrap-script.ts`) writes the CSS-token style
  attribute on `<html>` *before* React hydrates, so shared URLs render
  with the right theme without flash. React's hydration check sees the
  pre-set inline `style` attribute and warns:
  `"A tree hydrated but some attributes of the server rendered HTML
  didn't match the client properties."`
  This is benign by design — the bootstrap winning is the whole point —
  but it shows up as a console error in dev. Two paths if it ever
  matters: (a) suppress with `suppressHydrationWarning` on `<html>`,
  (b) move the bootstrap to write to a different surface (e.g. a CSS
  custom-property registry script that React doesn't audit). Neither is
  worth doing today; the parity test (`tests/bootstrap-parity.test.ts`)
  already locks the contract.
  - Surfaced: 2026-05-03, end of Phase 2

## AI infra — to verify on first real exercise (Phase 3)

These were scaffolded in Phase 2 but never exercised end-to-end. Each is a
small concern that should be checked the moment `ANTHROPIC_API_KEY` is
configured and `/api/smoke` is hit for the first time. Listed here so they
don't get lost between sessions.

- **`lib/cost-log.ts:34` — `kv.scan` cursor + `kv.mget` generic untested
  against `@vercel/kv@3.0.0`'s actual signature.** The code passes a
  `number` cursor; many KV libs want a string. The `kv.mget<CostEntry[]>`
  generic may not match the SDK's actual shape. Likely fine, but unverified.
  When the smoke endpoint runs for the first time, watch for runtime type
  errors on the second invocation (cache-hit path bypasses `kv.scan`; only
  `getMonthSpend()` exercises it).
  - Surfaced: 2026-05-03, end-of-Phase-2 review
  - Resolves: when smoke endpoint completes a write + a subsequent
    `getMonthSpend()` call without runtime errors

- **`lib/pricing.ts` + `app/api/smoke/route.ts:103` — model-ID lookup may
  fail on dated model IDs.** `calculateCostUSD(resp.model, ...)` does an
  exact `PRICING[resp.model]` lookup. Anthropic's API may return
  `claude-sonnet-4-6-20251201` (dated suffix) where `PRICING` only has
  `claude-sonnet-4-6` (alias). If so, the function throws **after the paid
  API call but before `logCost`** — so the call is billed but never
  recorded. Cost leakage. Fix on first exercise: add a prefix-tolerant
  lookup, or normalise `resp.model` before lookup.
  - Surfaced: 2026-05-03, end-of-Phase-2 review
  - Resolves: when first real Anthropic call returns and `costUSD` is
    written to the log

## Spec drift (Phase 2)

- **`docs/specs/phase-2.md` § 12 references `app/api/_smoke/route.ts`** — the
  underscore prefix makes a folder *private* in Next.js (excluded from
  routing), so the route would never register. Implemented at `app/api/smoke/`
  instead. Spec text left as-is (captured intent); the running implementation
  is the source of truth.
- **`docs/specs/phase-2.md` § "ADRs to write" labels the tone-reshape ADR as
  0007.** That number was taken in Phase 1 by `0007-muted-color-wcag-aa-deviation.md`.
  Tone-reshape ADR will be `0011` when the manifesto direction is settled.
  Infra ADRs landed as 0008, 0009, 0010 per the spec.

## Closed (kept for context)

- ~~Vercel auto-deploy on push wired but unverified~~ — confirmed working
  on push of `a5d1128` (Phase 1). Closed 2026-05-03.

- ~~Phase 3 spec task 12 — snapshot test of worked-example matcher outputs~~ —
  `docs/specs/phase-3.md` line 248 required a snapshot test on the matcher
  prompt's worked examples to catch drift. Phase 3 initial ship missed it; fix-up
  batch 3 landed `tests/jd-matcher-snapshot.test.ts`, which locks
  `MATCHER_PROMPT_VERSION`'s `jd-matcher@vN` shape, the seven worked-example
  headings in canonical order, and a full-text snapshot of `MATCHER_SYSTEM`.
  Any prompt edit must bump the version (per ADR-0009) and update the snapshot.
  Closed 2026-05-03.
