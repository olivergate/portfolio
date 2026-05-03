# Phase 2.5 — Live tone toggle on `/` (pre-written)

> Read this whole file. Read the design references. Plan, then execute.
>
> NOTE: this is a follow-up to Phase 2 reinstating the tone-toggle surface
> that was reshaped out of Phase 2 in favour of the `/tone` manifesto. See
> ADR-0011 for the manifesto-vs-toggle split, and ADR-0013 (this phase) for
> the live-API-vs-pre-written decision.

## Goal

Three deliverables, in this order:

1. **Latent infra fixes** — resolve the two AI-infra concerns deferred in
   `docs/TODO.md` (kv.scan cursor type + dated-model-ID alias lookup) and
   verify the smoke endpoint runs end-to-end against real
   `ANTHROPIC_API_KEY` + Vercel KV. First commit of this phase.
2. **Tone toggle on `/`** — segmented control swapping role blurbs +
   experience bullets between three pre-written voices: Pessimistic /
   Honest / Absurd. Sticky satire banner when Absurd is active. No live
   API calls (see ADR-0013).
3. **Marks Phase 2 as Done** in `docs/specs/README.md` once the toggle
   ships and the smoke endpoint is verified.

## Why pre-written, not live

ADR-0013 documents the decision in full. Short version: live API gives
spectacle but introduces honesty risk (AI-generated copy claiming to be
Oliver), ongoing cost, cache invalidation complexity, and a fallback UX
problem when the cost ceiling is hit. Pre-written gives Oliver final
edit on every voice, costs $0 ongoing, and frees Phase 3 (the JD matcher)
to be the AI-spectacle surface where live generation is clearly
appropriate (matching against an unknown JD, not rewriting Oliver's
own bio).

The Phase 2 AI infra (`lib/anthropic.ts`, `lib/kv-cache.ts`,
`lib/cost-log.ts`, `lib/check-cost-ceiling.ts`, `lib/pricing.ts`,
`app/api/smoke/route.ts`) is **still exercised in this phase** — via the
smoke endpoint, against a real Anthropic key + Vercel KV — to verify it
works before Phase 3 depends on it. That's where the latent bugs
surface and get fixed.

## Design references

Required reading:

- `design-references/source/cv-tone.html` — the 3-voice toggle, satire
  banner, and CV layout. The visual treatment of the segmented control
  (lines 57–115) and the satire ticker (lines 320–356) are the design.
  The pre-written copy in `cv-data` is illustrative; this phase ships
  Oliver-edited copy seeded by the agent.
- `design-references/screenshots/02-cv-tone.png` — currently the wrong
  image (captured against `/` not the toggle); see `docs/TODO.md`
  documentation drift. Not blocking.
- `design-references/README.md` — section "2. cv-tone.html" describes
  the manifesto, not the toggle. Documentation drift, captured in
  `docs/TODO.md`.

The design has settled:

- **Segmented 3-button control** placed between Experience overview (02)
  and Experience (03). Distinct thumb colours per tone (charcoal /
  cream / amber gradient). Mono kicker `03 / Tone` matching the section
  header pattern.
- **Crossfade transition** (320ms, motion-gated) when switching tones.
- **Sticky satire banner** with a scrolling ticker when Absurd is active.
  The `SATIRE` chip in the banner is non-negotiable — honesty guardrail.
  Banner slides down from the top (motion-gated `badge-anim` keyframe).
- **Honest is the default** on every visit. Tone state is in-memory only;
  not persisted to URL hash, sessionStorage, or anywhere else (URL hash
  state is reserved for the JD matcher in Phase 3).

## Success criteria

1. `/api/smoke` returns 200 on first GET, 200 cache-hit on second GET,
   logs costUSD to KV, and `getMonthSpend()` returns a non-zero number.
   Run against real key + KV before any toggle work begins.
2. The toggle on `/` swaps role blurbs + experience bullets between
   Pessimistic / Honest / Absurd. Skills, Projects, Education, About,
   Avocations stay constant in all three tones.
3. Crossfade is smooth (320ms, `cubic-bezier(.2,.7,.2,1)`) and skipped
   under `prefers-reduced-motion`.
4. Satire banner renders only when Absurd is active. Sticky to top.
   Slide-down + ticker animations skipped under reduced motion.
5. The four UX sliders from Phase 1 retheme this surface unchanged.
   16-corner test passes for `/` × { Pessimistic, Honest, Absurd }.
6. Axe AA passes on `/` for all three tone states at five representative
   slider positions.
7. ADR-0013 (pre-written vs live) and ADR-0014 (Anthropic key + Redis
   provisioning) committed.
8. `docs/specs/README.md` table updated: Phase 2 marked Done.

## Tasks

### Track A — Pre-flight + infra fixes (commit 1)

#### A1. Provision Anthropic key

Create a new key in the Anthropic Console named `portfolio-prod`. Set a
$30/month usage cap on the key itself (belt-and-braces above the in-app
ceiling). Add to:

- `.env.local` for dev
- Vercel project envs for production + preview + development:
  `vercel env add ANTHROPIC_API_KEY production preview development`
- Set `ANTHROPIC_MONTHLY_LIMIT_USD=30` for production + preview.
  Leave development as the in-code default ($20).

Owned by Oliver — code waits.

#### A2. Provision Upstash Redis (Vercel Marketplace)

Vercel KV is no longer a standalone product (deprecated Dec 2024;
existing stores were auto-migrated to Upstash Redis). For new projects,
install the Redis integration from the Marketplace:

https://vercel.com/olivergates-projects/~/integrations/redis

Link to the portfolio project. Vercel auto-injects the Redis env vars
across all three environments. Pull locally with
`vercel env pull .env.local`.

**Library implication:** `lib/kv-cache.ts` and `lib/cost-log.ts` currently
import from `@vercel/kv`. That package may or may not still work against
Upstash Redis env vars; verify via context7 (`mcp__claude_ai_Context7__query-docs`
on `@upstash/redis` and `@vercel/kv`) before wiring. If the migration
needs a swap to `@upstash/redis`, do it in this commit — it's the same
shape of operations (`get`, `set`, `scan`, `mget`).

Owned by Oliver to provision; code agent fetches current docs and adapts.

#### A3. Verify smoke endpoint end-to-end

Once A1 + A2 are done:

```sh
bun run dev
curl http://localhost:3000/api/smoke   # expect 200, stage: complete, costUSD > 0
curl http://localhost:3000/api/smoke   # expect 200, stage: cache-hit, cached: true
```

Both calls must return 200. The second must be a cache hit. `costUSD`
must be a non-zero number on the first call.

#### A4. Fix `lib/cost-log.ts` cursor type

The Redis client (whether `@vercel/kv` still works or `@upstash/redis`
takes over per A2) may want a string cursor not a number. Update
`getMonthSpend()` to match the SDK's actual signature. Determine via
TypeScript error + context7 docs first; don't speculate.

Add a unit test in `tests/cost-log.test.ts` exercising the scan loop
(against real client mocks, or live Redis in a test fixture if simpler).
This is a Phase 2 latent bug we're explicitly locking down.

#### A5. Fix `lib/pricing.ts` model-ID alias lookup

Anthropic returns dated model IDs (e.g. `claude-sonnet-4-6-20251201`)
in `resp.model`, but `PRICING` keys are the alias (`claude-sonnet-4-6`).
`calculateCostUSD` currently does an exact lookup → throws AFTER the
paid call → cost leakage.

Fix: prefix-tolerant lookup. If `PRICING[model]` is undefined, try
matching by longest prefix from `Object.keys(PRICING)`. Throw only if
no prefix matches.

Add a unit test in `tests/pricing.test.ts` covering: exact alias hit,
dated suffix hit, unknown model throws.

#### A6. Re-verify smoke endpoint after fixes

Repeat A3. Both calls 200, second cached, costUSD logged correctly,
`getMonthSpend()` returns the right total.

**Commit 1 lands here:** infra fixes + smoke verification only. No
toggle code yet.

### Track B — Tone content (commit 2)

#### B1. Schema extension

Extend `lib/schemas.ts` to add per-tone variants on bullets and role
summaries:

```ts
const TonedText = z.object({
  honest: z.string().min(1),
  pessimistic: z.string().min(1),
  absurd: z.string().min(1),
});

const Bullet = z.object({
  id: slug,
  text: TonedText,
});

const Role = z.object({
  // ...
  summary: TonedText,
  // ...
});
```

The migration is breaking. Update `cv.json` in the same commit so
`bun run content:validate` passes.

#### B2. Draft Pessimistic + Absurd voices for both roles

Source: `design-references/source/cv-tone.html` `cv-data` const has the
three voices already drafted. Port them across, mapping bullet IDs to
the right cv.json bullet IDs. Some bullets in cv.json may not have a
direct counterpart in cv-tone.html — for those, draft fresh voices
following the established voice patterns:

- **Honest:** verbatim from existing cv.json (don't change).
- **Pessimistic:** self-aware, slightly self-deprecating, names the
  trade-offs that come with the honest claim. ~1.2× the length of
  Honest.
- **Absurd:** satirical, voice-of-Oliver-being-funny-about-himself.
  References specifics from Honest (Plotly Dash, Kuzu, robusta index)
  but with absurd framing. ~1.3× length.

Drafts go into `cv.json` as the `pessimistic` + `absurd` fields. Mark
them `approved-as-placeholder` in a working note so Oliver knows they're
agent-drafted and edits-required.

Oliver reviews and edits before commit. Same pattern as the `/tone`
tenets in Phase 2.

**Commit 2 lands here:** schema + content. Toggle UI not yet wired.

### Track C — Toggle UI (commit 3)

#### C1. `components/cv/ToneToggle.tsx` (Client Component)

Segmented 3-button control. Visual treatment from `cv-tone.html` lines
57–115:

- 3-column grid of buttons inside a card-bg container with rounded
  corners
- Animated thumb that slides between positions on tone change
- Per-tone thumb colours: charcoal (#2b2622) for Pessimistic, cream
  (#f4eee0) for Honest, amber gradient for Absurd
- Each button shows tone name (Fraunces 1.08rem) + description kicker
  (mono uppercase: "Self-aware" / "As written" / "Satire")
- ARIA: `role="tablist"`, each button `role="tab"` with `aria-selected`
- Mono kicker `03 / Tone` and Fraunces title "How would you like the
  bullets framed?" above the control

#### C2. `components/cv/SatireBanner.tsx` (Client Component)

Sticky banner. Visual treatment from `cv-tone.html` lines 320–356:

- `position: sticky; top: 0; z-index: 50`
- Amber gradient background, charcoal `SATIRE` chip
- Scrolling ticker text: "Satire mode active — these bullets are
  deliberately ridiculous · " repeated infinitely via CSS keyframe
- Slide-down `badge-anim` keyframe on mount
- Right-side dismissal hint: "switch tone to dismiss"
- Renders only when tone === 'absurd'
- All animations gated behind `@media (prefers-reduced-motion: reduce)`

#### C3. Refactor `components/cv/Experience.tsx`

Split into:

- `Experience.tsx` (Server Component) — keeps the section shell, passes
  toned data down
- `ExperienceClient.tsx` (Client Component) — holds tone state via
  `useState`, renders the toggle, and renders `<Role>` with the
  resolved-per-tone text

The crossfade transition lives on the bullet/blurb text via a
`crossfade` class that toggles `is-out` for 280ms when tone changes,
then swaps the text and fades back in. Per `cv-tone.html` `CrossfadeText`
component pattern. Motion-gated.

#### C4. Banner placement

`SatireBanner` mounts in `app/(site)/page.tsx` above `<main>` so it can
sit sticky at the top of the viewport. Tone state needs to be lifted to
a context (or to a parent Client Component) so the banner and the
toggle share state.

**Decision:** introduce `components/cv/ToneProvider.tsx` (Client
Component, React Context) that holds the tone state. `ToneToggle` and
`SatireBanner` both consume it. The provider wraps `<main>` in
`page.tsx`, but `page.tsx` itself stays a Server Component — the
provider is a Client Component and that's where the boundary lives.

Same pattern as `DeckProvider` from Phase 1.

#### C5. Sliders work here too

Already covered by Phase 1's `cv-surface` class. No changes needed; just
verify via the corner test (see Track D).

**Commit 3 lands here:** toggle UI + banner + provider. Interactive
end-to-end.

### Track D — Tests + ADRs (commit 4)

#### D1. Extend corner test

`tests/e2e/corners.spec.ts` already covers `/` and `/tone` × 16 slider
corners (32 total). Extend `/` coverage to include each of the 3 tone
states (so 48 total for `/`). Catches: tone-shifted bullet content
overflowing the layout at extreme slider positions.

#### D2. Extend axe test

`tests/e2e/a11y.spec.ts` already covers `/` and `/tone` at 5 slider
positions. Add: each of the 3 tone states on `/` at the default slider
position (3 additional checks). Catches: ARIA tab pattern correctness,
satire banner contrast, tone-shifted text contrast.

#### D3. Banner-only-on-absurd test

`tests/e2e/satire-banner.spec.ts` — Playwright test asserting:
- Banner not in DOM when tone === honest or pessimistic
- Banner present + visible when tone === absurd
- Banner has the `SATIRE` chip (selector test, locks the honesty
  guardrail)

#### D4. ADR-0013 — pre-written vs live tone toggle

Use `/adr <title>` to scaffold. Document:
- Original direction (live API rewriting on demand)
- Final decision (pre-written, agent-drafts, Oliver-edits)
- Reasons (honesty, cost, complexity, fallback UX)
- Trade-off accepted (less spectacle on `/`; recovered in Phase 3)
- Phase 2 AI infra still exercised via smoke endpoint

#### D5. ADR-0014 — Anthropic key + Redis provisioning model

Document:
- Separate Anthropic key per Vercel project (not shared with `blob-life`)
- Anthropic-side $30/month cap mirrors `ANTHROPIC_MONTHLY_LIMIT_USD`
  (belt-and-braces — defends against bugs in `check-cost-ceiling.ts`)
- Upstash Redis via Vercel Marketplace integration (free tier). Note
  Vercel KV's deprecation (Dec 2024) and the client-library implication
  for `lib/kv-cache.ts` + `lib/cost-log.ts`.
- This pattern carries forward to any future site that uses AI

#### D6. Mark Phase 2 Done in README

Update the table in `docs/specs/README.md` — Phase 2 status changes from
Not started to Done with completion date 2026-05-03 (or whenever the
phase actually ships). Update `current_state` in
`data/tasks/2026-05-portfolio-build.yaml` accordingly.

**Commit 4 lands here:** tests + ADRs + status update. Phase done.

## Out of scope

- Live API tone generation (deferred indefinitely; see ADR-0013)
- URL hash persistence of tone state (Phase 3 owns URL state)
- Tone shifts on Skills, Projects, Education, About, Avocations
- Re-capturing the wrong screenshot at `02-cv-tone.png` — separate
  documentation drift, captured in `docs/TODO.md`
- Generating new design references for the live toggle (the existing
  `cv-tone.html` is sufficient)

## Decisions to flag to Oliver

- **Confirm the agent-drafted Pessimistic + Absurd voices** before commit.
  Same edit-cycle as the `/tone` tenets in Phase 2.
- **Anthropic key + KV provisioning** are blocking on Oliver. Tracks B
  and C can run in parallel with provisioning, but Track A's smoke
  verification (A3, A6) blocks until both are wired.
- **Cost ceiling production value** — set to $30 per the resolved plan.
  Reduce or raise via env var if needed; document any change in the
  Phase 2 ADR-0010 or its successor.

## Pre-flight blockers

These must be resolved before Track A can finish:

1. `ANTHROPIC_API_KEY` set in Vercel + `.env.local` (new key
   `portfolio-prod`, $30/mo cap on the key itself)
2. Upstash Redis provisioned via the Vercel Marketplace integration
   (https://vercel.com/olivergates-projects/~/integrations/redis) and
   linked to the portfolio project
3. `vercel env pull .env.local` run locally to populate Redis envs

## Note on cross-phase invariants

This phase honours all cross-phase invariants from `docs/specs/README.md`:

- Server Components by default; only `ToneToggle`, `SatireBanner`,
  `ToneProvider`, `ExperienceClient` are Client Components
- All AI calls go through Route Handlers — but this phase has zero
  user-facing AI calls; only the smoke endpoint runs server-side
- Cost ceiling enforced via env var (`ANTHROPIC_MONTHLY_LIMIT_USD`)
- Design references authoritative — toggle visuals from `cv-tone.html`
  ported faithfully

## Workflow

Use `/phase-review` before declaring tracks done — it caught two real
spec drifts in Phase 2 and the cache-key collision bug. Run it at the
end of Track C (before Track D) and again at the end of Track D
(before `/phase-done`).
