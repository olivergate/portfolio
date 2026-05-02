# Phase 3 — JD adapter

> Read this whole file. Read the design references. Plan, then execute.
>
> This is the most complex phase. Budget extra time for prompt iteration.

## Goal

`/jd` lets a visitor paste a job description and see how Oliver's CV scores
against it: chip grid of requirements colour-coded as hits / stretches / misses,
a stretch slider that retunes generosity, a bullet-reorder switch, and tone-aware
gap explanations. The matcher must be honest — Hits should be defensible,
Misses should be openly flagged.

## Design references

Required reading:

- `design-references/screenshots/03-cv-jd.png` (visual target)
- `design-references/source/cv-jd.html` (the page — port to Next.js)
- `design-references/README.md` section "3. cv-jd.html — JD adapter"

The design has settled:

- **Three pre-written sample JDs as pills above the input:**
  - Sustainability (12 chips, fully fleshed)
  - AI startup (10 chips, includes a Claude Code hit and MCP/evals misses)
  - Fintech (10 chips)
- **Color coding:** Hit = sage green, Stretch = warm amber, Miss = warm grey.
- **Click behavior:**
  - Click a Hit → scrolls to and pulses the supporting CV bullet with `--accent-soft`
  - Click a Stretch → tooltip expands to show what's adjacent and what's missing
  - Click a Miss → expands inline candid framing in Fraunces italic
- **Stretch slider:** distinct from the cv.html sliders — short, recessed, with
  `⊢ ⊨ ⊣` quick-snap buttons (strict / balanced / generous).
- **Editorial summary:** "Reading the JD as written, this CV lands 7 hits, 4 stretches,
  and 1 honest gap." NEVER a percentage. The phrasing is locked in.
- **Bullet-reorder switch** above the experience section. WAAPI FLIP animations
  float Hit-cited bullets to top, then Stretches, then uncited.
- **Hover panel** renders as fixed-position floating tooltip (not clipped by siblings).
- **Reduced motion** swaps animated reorder for instant.

The three sample JDs and their hardcoded chip results are in `cv-jd.html`. Port
that data — these are the demo cases.

## Architecture

Two-stage AI pipeline, server-side via Route Handlers:

1. **JD parser** (`/api/jd-parse`) — JD text → structured requirements list
2. **Evidence matcher** (`/api/jd-match`) — CV + requirements + stretch threshold
   → scored matches

Both results cached by content hash. The matcher prompt is conservative-biased.
Gap framing on Misses uses the AI infrastructure from Phase 2.

## Success criteria

1. The three sample JDs produce results visually matching `screenshots/03-cv-jd.png`
2. Pasting a custom JD produces a scored chip grid in under 5 seconds
3. The pipeline is honest: pressure-tested on 5 real JDs (varied: senior IC,
   tech lead, AI eng, generalist) and Oliver would defend every Hit and every Miss
4. Each chip shows reasoning on hover/tap, citing the supporting bullet for Hits
5. Clicking a Hit scrolls to and pulses the supporting bullet
6. Clicking a Miss expands inline candid framing
7. Stretch slider lets the viewer tune generosity; chips re-color smoothly
8. Bullets reorder via FLIP when the toggle is on; "restore original" reverses
9. Editorial summary line uses the locked phrasing
10. Visual match to `screenshots/03-cv-jd.png` for typography, chip styling,
    layout, hover/tooltip treatment

## Tasks

### 1. JD parser endpoint

`app/api/jd-parse/route.ts` — POST handler.

Request: `{ jdText: string }` (cap length at ~10k chars).

Response:
```ts
{
  requirements: Array<{
    id: string;             // stable hash within this JD
    text: string;           // verbatim or slightly normalized
    category: "hard" | "soft" | "nice";
    weight: number;         // 0..1, importance signaled by JD
  }>;
  jdHash: string;
}
```

Use Anthropic tool use to enforce schema. Cache by
`sha256(jdText + parserPromptVersion)` in KV.

Prompt requirements:
- Aggressively dedupe semantically similar requirements ("React" + "React.js" → one)
- Distinguish hard / soft / nice-to-have
- Skip generic boilerplate ("good communication", "team player") unless emphasized
- 5–15 requirements is the target. More than 20 is noise.

Prompt template lives at `docs/prompts/jd-parser-v1.md`.

### 2. Evidence matcher endpoint

`app/api/jd-match/route.ts` — POST handler.

Request:
```ts
{
  jdHash: string;
  requirements: ParsedRequirement[];
  stretchThreshold: number;  // 0..1, lower = stricter
}
```

Response:
```ts
{
  matches: Array<{
    requirementId: string;
    status: "hit" | "stretch" | "miss";
    evidenceBulletId?: string;
    evidenceRoleId?: string;
    reasoning: string;
  }>;
}
```

Single batched Anthropic call, full CV + all requirements. Tool use for structured output.

**Conservative-bias prompt principles:**
- A Hit requires concrete supporting evidence — must name the bullet ID
- A Stretch is "adjacent skill or partial match"
- A Miss is "no evidence in the CV" — say so plainly
- The `stretchThreshold` shifts the Hit/Stretch boundary, not the Stretch/Miss boundary
- Include 4–6 worked examples in the prompt: clear Hit, clear Stretch, clear Miss,
  borderline cases at different thresholds

Prompt template at `docs/prompts/jd-matcher-v1.md`. This is the deliverable that
gets the most iteration.

Cache by `sha256(cvHash + jdHash + stretchThreshold + matcherPromptVersion)`.

### 3. Pre-baked sample JDs

Take the three sample JDs and their hardcoded results from `cv-jd.html` and
store as `content/sample-jds.json`. These are demo cases — when a sample is
selected, the chip grid renders from this static data instantly (no API call).

Real pasted JDs go through the parser/matcher pipeline.

### 4. JD input area

- Three sample-JD pills above the textarea (Sustainability, AI startup, Fintech).
  Click to populate textarea + render hardcoded results.
- Textarea with character counter.
- "Score this JD" button (designed, not stock).
- Stretch slider next to the button — short, recessed, `⊢ ⊨ ⊣` quick-snap buttons.

### 5. Chip grid

`components/jd/ChipGrid.tsx` — Client Component (`"use client"`).

Each chip:
- Color-coded by status (sage / amber / grey)
- Requirement text (truncated if long)
- Click-to-action depending on status:
  - Hit: scroll-to + pulse the bullet (use `scrollIntoView` + a brief
    `--accent-soft` background animation)
  - Stretch: expand a fixed-position floating tooltip with adjacency reasoning
  - Miss: expand inline candid framing in Fraunces italic

Stagger animation on initial render (60–80ms between chips). Gated on motion preference.

Floating tooltip is `position: fixed` to avoid clipping by siblings — a real bug
in the design that's been solved.

### 6. Editorial summary

Below the chip grid: a single line in body type:

> Reading the JD as written, this CV lands **7 hits**, **4 stretches**, and **1 honest gap**.

The numbers are computed; the phrasing is locked. NEVER a percentage. NEVER a
score out of 10. Treat as editorial copy.

Below that, a small honesty statement (smaller, muted):

> Conservative matching — when uncertain, defaults to stretch over hit.

### 7. Stretch slider behavior

When the stretch slider moves:
- For real JDs: refetches `/api/jd-match` with new threshold (debounced 400ms)
- For sample JDs: snaps chip statuses to one of three pre-computed levels in the
  sample data (strict / balanced / generous)

Animate chip status changes with a brief color transition.

### 8. Bullet reorder

`components/jd/ReorderToggle.tsx` — Client Component. When on:
- Within each role, bullets reorder so Hit-supporting bullets float to top,
  then Stretches, then uncited
- WAAPI FLIP animation for the reorder
- "Restore original" toggle reverses
- Default off — original CV order is the truth
- Reduced motion: instant swap, no animation

### 9. Tone-aware gap framing

Click on a Miss → inline expansion shows a candid framing in Fraunces italic.

Use `/api/rewrite` (Phase 2 infrastructure, first real use here) to generate the
framing text. Cached per (bulletId, missContext, framingVersion).

For the artifact-locked sample JDs, the framings are pre-written in
`sample-jds.json`. For pasted JDs, generated on demand.

### 10. Pressure testing

Before shipping publicly:
- Collect 5 real JDs (different from the 3 sample JDs): senior frontend, senior
  fullstack, AI engineer, staff/principal, startup generalist
- Run each through the pipeline
- For every Hit, verify the cited bullet actually supports it
- For every Miss, verify there's truly nothing in the CV that should have matched
- Iterate the matcher prompt until Oliver would defend every result

Document results in `docs/test-runs/jd-pressure-tests.md`. This is part of the
phase output, not optional.

### 11. Honesty guardrails (recap)

- Matcher must always cite the supporting bullet ID for Hits — if it can't,
  return Stretch
- Gap explanations never invent adjacent experience
- Reorder is opt-in (defaults to original)
- No percentage, ever
- Editorial summary phrasing is locked

### 12. Tests

- Unit tests on schema validation for both endpoints
- Integration test with mock Anthropic walking the full pipeline on a fixed JD
- E2E: paste sample JD → see chips → click a Hit → verify scroll-to-bullet
- Snapshot test of worked-example matcher outputs (catches drift)

### 13. ADRs to write this phase

- **ADR-0011: Two-stage parse-then-match pipeline.** Why not one combined call.
- **ADR-0012: Conservative-bias matcher prompt.** Why we err toward Stretch and
  Miss. The trust argument.
- **ADR-0013: Stretch slider semantics.** What it adjusts (Hit/Stretch boundary
  only, not the floor for Miss).
- **ADR-0014: No top-line match percentage.** Why a percentage is dishonest at
  this scale of evidence; the editorial summary as the alternative.
- **ADR-0015: Bullet reorder is opt-in.** Original order is the truth; reorder
  is a viewing aid.

## Out of scope

- Multi-JD comparison
- Saving JDs to compare later
- Tracking which JDs visitors paste (privacy + consent)
- Auto-generated cover letters

## Decisions to flag to Oliver

- Provide 5 real JDs for pressure testing. This phase cannot ship honestly without
  them. Without these, the prompt can't be properly tuned.
- Confirm default stretch threshold: `0.5` (balanced). The design uses `⊢ ⊨ ⊣`
  with `⊨` (balanced) as default. Confirm that maps to 0.5.
- Read the sample JD chip results in `cv-jd.html` once more — these are the
  demo experience. If any chip status feels wrong, fix it before porting.
