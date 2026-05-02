# Phase 2 — Tone manifesto + AI infrastructure

> Read this whole file. Read the design references. Plan, then execute.
>
> NOTE: this phase has been reshaped from the original spec. See "Note on the
> reshape" at the bottom of this file for context.

## Goal

Two deliverables:

1. **`/tone` page** — Oliver's voice and values manifesto, 14 numbered tenets
   in two voices side-by-side. Pre-written content (no live AI). A toggle lets
   the reader collapse to a single voice.
2. **AI infrastructure scaffold** — KV cache utility, cost log, prompt-version
   pattern, Anthropic client setup. Not exercised in this phase; ready for Phase 3.

## Design references

Required reading:

- `design-references/screenshots/02-cv-tone.png` (visual target)
- `design-references/source/cv-tone.html` (the manifesto page — port to Next.js)
- `design-references/README.md` section "2. cv-tone.html — Tone manifesto"

The design has settled:

- **14 numbered tenets** with kickers `01 / 14`, `02 / 14`, etc. in mono.
- **Two-column grid** with vertical hairline divider between voices.
- **Left column:** formal, third-person, the way a recruiter expects to read.
- **Right column:** how Oliver actually thinks — first-person, sometimes
  self-deprecating, often funny.
- **Single global toggle:** "show only my voice / show both".
- **The two voices animate apart on initial reveal** (motion-gated).
- **Closing signature:** handwritten-style note in Fraunces italic.
- Centered max-width column for intro; manifesto itself is the 2-column grid.

The 14 tenets and both voices for each are in `cv-tone.html`. Port the copy
verbatim — Oliver wrote both voices. Do not regenerate them.

## Success criteria

1. `/tone` renders the 14 tenets matching `screenshots/02-cv-tone.png`
2. The voice toggle works smoothly — collapses to a single column when toggled,
   expands back when both are selected
3. The two voices animate apart on initial reveal (gated on motion preference)
4. The four UX sliders from Phase 1 visibly retheme this page too (dogfood)
5. AI infrastructure is scaffolded — `lib/anthropic.ts`, `lib/kv-cache.ts`,
   `lib/cost-log.ts`, `lib/pricing.ts` all exist with proper types and a
   tiny smoke-test endpoint, but no real product feature uses them yet
6. Cost ceiling check works (manually testable via the smoke endpoint)
7. ADRs documenting the infrastructure choices land in this phase, not Phase 3

## Tasks

### Part A — The /tone page

#### 1. Content

Port the 14 tenets from `design-references/source/cv-tone.html` into
`content/tone.json`:

```ts
{
  intro: { paragraphs: string[] },
  tenets: [
    {
      number: 1,             // 1..14
      title: string,         // e.g. "Honesty over polish"
      formal: string,        // left column copy
      personal: string,      // right column copy
    }
  ],
  signature: { name, location, date? },
}
```

Validate with Zod. The copy in `cv-tone.html` is final; do not paraphrase.

#### 2. Layout

`app/(site)/tone/page.tsx` as a Server Component. Sections:

- Page header with breadcrumb-style mono kicker and Fraunces title
- Intro paragraphs (centered, max-width readable column)
- Voice toggle (designed component, see below)
- The 14 tenets in a 2-column grid with vertical hairline divider
- Signature

Use the `SectionHeader` primitive for the section heading above the manifesto.

#### 3. Voice toggle component

`components/tone/VoiceToggle.tsx` — Client Component (`"use client"`). Two states:

- "Both voices" (default)
- "My voice only"

Custom-designed segmented control matching the site's visual language. When the
state changes, the formal column collapses or expands smoothly. Honor
`prefers-reduced-motion`.

#### 4. Tenet component

`components/tone/Tenet.tsx` — Server Component, renders a single tenet:

```
01 / 14 ────────────── kicker
TITLE OF THE TENET
─────────────────────────────────
[formal voice]    │    [personal voice]
```

The vertical hairline between the two voices is a CSS-grid border.

When the voice toggle is on "my voice only", the formal column hides and the
personal column expands to full width with a smooth transition.

#### 5. Initial reveal animation

On page load (motion-gated), the two voices animate apart from the centerline.
Use CSS keyframes triggered by an `is-revealed` class added by IntersectionObserver.
Reduced motion: skip animation, show final state immediately.

#### 6. Sliders work here too

The Phase 1 slider deck must be present on `/tone` and retheme this page
identically to how it themes `/`. Verify all 16 corners on `/tone`.

### Part B — AI infrastructure scaffold

The infrastructure is built now so Phase 3 can move fast. None of it is exercised
by user-facing features in Phase 2.

#### 7. Anthropic client

`lib/anthropic.ts` — wraps the official SDK. Single `getAnthropicClient()`
factory. Configured from `ANTHROPIC_API_KEY` env var. Throws on missing key.

#### 8. KV cache utility

`lib/kv-cache.ts` — thin wrapper over `@vercel/kv` with typed get/set:

```ts
export async function cacheGet<T>(key: string): Promise<T | null>
export async function cacheSet<T>(key: string, value: T): Promise<void>
export function makeCacheKey(parts: { /* ... */ }): string
  // Returns sha256(JSON.stringify(parts))
```

No TTL. Cache invalidation comes from including prompt version in the key parts.

#### 9. Cost log

`lib/cost-log.ts` — append-only log of every Anthropic call.

```ts
type CostEntry = {
  id: string;
  endpoint: string;          // "/api/jd-parse" etc.
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  promptVersion: string;
  ts: number;
};

export async function logCost(entry: Omit<CostEntry, 'id' | 'ts'>): Promise<void>
export async function getMonthSpend(): Promise<number>
```

Storage: Vercel KV with timestamped keys (`cost:YYYY-MM:NANOID`) for append-only
behavior. `getMonthSpend()` lists keys for current month and sums.

#### 10. Pricing constants

`lib/pricing.ts` — current Anthropic pricing as constants. Update via ADR
when pricing changes. Include input/output per-million-token rates for the
specific model used.

#### 11. Cost ceiling middleware

`lib/check-cost-ceiling.ts` — helper that AI route handlers call before making API
requests:

```ts
export async function checkCostCeiling(): Promise<
  { ok: true } | { ok: false; current: number; limit: number }
>
```

Reads `ANTHROPIC_MONTHLY_LIMIT_USD` env var (default $20 in dev). When at limit,
route handlers return 429 with cached or fallback response.

#### 12. Smoke endpoint

`app/api/_smoke/route.ts` — a hidden Route Handler (not linked anywhere) that
exercises the full path: cost ceiling check → Anthropic call → cost log → KV
cache. Returns "OK" or the failure mode. Useful for verifying the infrastructure
works before Phase 3 starts.

This endpoint stays in the repo permanently as a smoke test for AI infrastructure.

## Out of scope

- Live AI calls from any user-facing feature (Phase 3 is the first)
- Pessimistic / Honest / Absurd live tone toggle (replaced by the manifesto —
  see "Note on the reshape" below)
- Persisting voice-toggle state across sessions

## ADRs to write this phase

- **ADR-0007: Tone as a manifesto, not a live toggle.** Document the reshape:
  what the original plan was, why the design exploration produced something
  better, what we gained (honesty, no API cost, simpler UX) and lost (the
  spectacle of live AI rewriting).
- **ADR-0008: Server-side AI calls only.** Why no direct browser calls.
- **ADR-0009: Cache key includes prompt version.** Why no TTLs and why caches
  invalidate on prompt revision.
- **ADR-0010: Cost ceiling in middleware.** Why a per-endpoint check rather than
  a global rate limiter; how 429 fallbacks preserve UX.

## Decisions to flag to Oliver

- Confirm the 14 tenets in `cv-tone.html` are final. Read them once more before
  porting. If anything wants editing, do it now while it's still in the design
  references; once ported to `tone.json` it becomes harder to keep in sync.
- Confirm the monthly cost ceiling for production. Recommend $20–50.
- The infrastructure being built without being used feels wasteful. It isn't —
  it just front-loads the work so Phase 3 can be about the matcher prompt and
  not plumbing. Trust the sequencing.

## Note on the reshape

An earlier version of this spec had Phase 2 deliver a Pessimistic / Honest /
Absurd toggle that called the API to rewrite CV bullets live. The design
exploration in claude.ai produced something different and arguably better:
the manifesto page in two voices, both pre-written by Oliver.

The change is good for several reasons:
- Honesty: Oliver writes both voices himself, no model-generated content
  about Oliver claiming to be Oliver
- Cost: zero API spend on this page
- Substance: a values manifesto says more than a tone toggle would
- Simplicity: no caching, no prompt versioning, no satire badge

What we lose: the spectacle of "watch the AI rewrite my CV in real time."
That was a cute demo but probably the weaker idea. The manifesto stands alone.

The AI infrastructure originally built to serve the toggle is still built in
this phase — it just gets first use in Phase 3.
