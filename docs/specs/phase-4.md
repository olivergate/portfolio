# Phase 4 — Lab + Claude Code retro demo

> Read this whole file. Read the design references. Plan, then execute.

## Goal

`/lab` showcases what Oliver is building with LLMs. A featured Claude Code
retrospective demo (live, working) plus three secondary project cards. The
retro demo is the strongest signal in the whole site that Oliver ships agentic
systems.

## Design references

Required reading:

- `design-references/screenshots/04-cv-lab.png` (visual target)
- `design-references/source/cv-lab.html` (the page — port to Next.js)
- `design-references/README.md` section "4. cv-lab.html — Building with LLMs"

The design has settled:

- **Page header.** "Things I'm building *with LLMs*" with italic rust accent on
  "with LLMs". Mono breadcrumb above. Brief framing paragraph.
- **Featured demo: Claude Code retrospective generator.**
  - Live badge with pulsing dot
  - Sample-session pills above the input
  - Dark **terminal-styled** transcript editor (uses `--terminal` and
    `--terminal-amber` from the design tokens)
  - Designed loading state: 4-step pipeline with stage indicators, sweep bars,
    blinking caret
  - Richly typeset retrospective output with sectioned blocks, mono kickers,
    Fraunces titles
  - "What went well" / "What slowed things down" as bullets
  - Learnings as a warm tinted card with rust accent border and `L-01/L-02/L-03` tags
  - Suggested additions as a code+description grid
  - Closing honesty caption with an accent dot
- **Three secondary cards in a row.** Each has a colored gradient with a glyph:
  - Language: golden→rust gradient with あ glyph
  - Habit: sage→deep green gradient with ◐
  - Movement: peach→rust gradient with ↗
  - Each with tech tag pills, blurb, mono "→" CTA
  - Hover: card lifts and border darkens

## Success criteria

1. `/lab` matches `screenshots/04-cv-lab.png` visually — page header, featured
   demo container, three secondary cards
2. Featured demo accepts pasted/selected transcript, calls Anthropic, returns
   structured retrospective
3. Loading state is the designed 4-step pipeline (not a stock spinner)
4. Retrospective output is well-typeset matching the design
5. Three secondary cards render with gradients, glyphs, tech pills, hover state
6. Demo is rate-limited (10/hour/IP)
7. Demo handles Anthropic failures gracefully — falls back to a canned response,
   not an error toast
8. Sliders from Phase 1 retheme this page (dogfood)

## Tasks

### 1. Page shell

`app/(site)/lab/page.tsx` — Server Component. Page header with mono breadcrumb,
italic accent on "with LLMs", framing paragraph (port copy from `cv-lab.html`).
Renders the three secondary cards as Server Components and the featured demo as
a Client Component island.

### 2. Project content

`content/projects.json` — schema:

```ts
{
  featured: {
    slug: "claude-code-retro";
    title: string;
    blurb: string;
    techPills: string[];
    samples: [{ id, label, transcript }];  // hardcoded demo inputs
  };
  secondary: [
    {
      slug: "language" | "habit" | "movement";
      title: string;
      blurb: string;
      techPills: string[];
      glyph: "あ" | "◐" | "↗";
      gradient: { from: string; to: string };
      ctaUrl?: string;
    }
  ];
}
```

### 3. Featured demo: Claude Code retrospective

`components/lab/RetroDemo.tsx` — Client Component (`"use client"`).

UI flow:

1. Title block with "live" badge (pulsing dot). Style the badge per design.
2. Sample-session pills above the input. Click to populate the transcript editor.
3. Terminal-styled transcript editor — dark background (`--terminal`), amber
   accents (`--terminal-amber`), JetBrains Mono. Textarea with custom styling.
4. "Run retro" button — designed.
5. On click: 4-step pipeline loading state appears (stage indicators, sweep bars,
   blinking caret). Port the design verbatim.
6. Retrospective output renders with stagger animation:
   - "What went well" section (mono kicker + Fraunces title + bullet list)
   - "What slowed things down" section (same treatment)
   - Learnings catalog (warm tinted card, rust accent border, `L-01`/`L-02`/`L-03` tags)
   - Suggested additions (code + description grid)
   - Closing honesty caption with accent dot

### 4. Retro demo backend

`app/api/retro/route.ts` — Route Handler. POST.

Request: `{ transcript: string }` (cap 8k chars).

Response: structured retro matching the UI sections above.

- Validate input with Zod
- Rate limit: 10/hour/IP via Vercel KV (token bucket)
- Cost ceiling check
- Call Anthropic with the retro prompt template (this is Oliver's actual prompt
  from his real Claude Code workflow — port from `cv-lab.html` if it's there,
  otherwise placeholder until Oliver supplies it)
- Use Anthropic tool use to enforce structured output
- Cost log
- Cache by `sha256(transcript + retroPromptVersion)` — TTL 24h since this is a
  demo, not a permanent record

Prompt template at `docs/prompts/retro-v1.md`.

### 5. Graceful fallback

The design source notes: "optionally calls `window.claude.complete()` if available
— gracefully falls back to a canned response otherwise."

For Next.js, the equivalent: if the API call fails (rate limit, API error, cost
ceiling), the demo shows one of 3 canned responses keyed to the sample IDs.
The canned response renders identically to a real one.

A small caption explains: "API call failed — showing a sample retrospective."

### 6. Three secondary cards

`components/lab/ProjectCard.tsx` — Server Component, receives a project entry
from `projects.json`. Renders:
- Gradient background (CSS linear-gradient using configured `from` / `to`)
- Glyph in large Fraunces (or appropriate Unicode-supporting face)
- Title in Fraunces 500
- Blurb in Inter
- Tech pills (small mono labels)
- Mono `→` CTA, animated on hover

Hover state: `transform: translateY(-3px)` and border-color shift, motion-gated.

If linking out, use `<Link>` from `next/link` with `target="_blank"` and
`rel="noopener noreferrer"` for external URLs.

### 7. Real-API disclaimer

A small caption near the demo output: "this is a real Anthropic API call."
Style as a quiet caption, not a bold disclaimer.

### 8. Mobile linkouts

The design treats Habit and Movement (mobile apps) as link-out cards. The
Language card may also link to a writeup. Confirm CTAs with Oliver before
shipping; placeholder URLs are fine until then.

### 9. Tests

- Unit test the retro route handler with mock Anthropic
- Test rate limit hits (returns 429)
- Test cost-ceiling fallback
- Test fallback-to-canned-response path
- E2E: select a sample, click run retro, verify output appears

### 10. ADRs to write this phase

- **ADR-0016: Demo isolation.** Each demo is its own route handler + component
  (rate limiting, blast radius, easy to add more later).
- **ADR-0017: No real-world side effects from demos.** Why none of the demos
  send email, write to user accounts, etc.
- **ADR-0018: Mobile projects link out, not embed.** Honest framing tradeoff.
- **ADR-0019: Graceful fallback for retro demo.** Why canned responses are
  shown on failure rather than error states (UX argument).

## Out of scope

- A "build your own demo" plugin system
- User accounts / saved demo runs
- Demo analytics dashboards
- Embedding mobile screens in iframes

## Decisions to flag to Oliver

- The retro prompt must come from Oliver's actual Claude Code workflow.
  Provide the prompt before this phase starts. Without it, the demo is a
  generic "summarize this transcript" tool — it loses the agentic-systems
  signal entirely.
- Confirm sample transcripts (3-5 per the design): plausible, varied, not
  exposing real codebases. Suggested categories already in design:
  refactoring auth flow, debugging deploy issue, building feature from spec.
- Confirm CTAs and external URLs for the three secondary cards.
