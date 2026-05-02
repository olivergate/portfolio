# Phase 0 — Foundations

> Read this whole file. Then read the design reference section below. Then plan
> in plan mode (Shift+Tab twice), get the plan approved, then execute.

## Goal

Stand up the Next.js project with the design tokens, fonts, and the section-header
pattern in place. Render the CV at `/` as a Server Component matching the design.
Stub the other four routes. Set up CI and Vercel deploys. No interactivity yet.

## Design references

Before coding, read:

- `design-references/README.md` (full design system summary)
- `design-references/design-tokens.css` (port directly into the project)
- `design-references/screenshots/01-cv-main.png` (the visual target for `/`)
- `design-references/source/cv.html`, `cv-app.jsx`, `cv-content.jsx`, `cv-data.jsx`
  (reference for CV structure — port to Next.js, don't copy)

The design has settled the following — do not relitigate:

- **Palette.** Cream `#faf7f2`, near-black `#1c1915`, muted `#7a746c`, rule
  `#c4b9a8`, accent burnt rust `#a04a26`, terminal `#0f0e0b`, terminal amber `#ffb84d`.
- **Fonts.** Fraunces (display, often italic), Inter (body, UI), JetBrains Mono
  (kickers, terminal). Loaded via `next/font/google`.
- **Section-header pattern.** Every section uses: mono numeric kicker (e.g. `01`)
  on the left, Fraunces title in the centre, optional mono meta on the right,
  hairline rule below. UPPERCASE letter-spacing `0.22em` on all kickers.
- **Type scale.** H1 `clamp(2.4rem, 6vw, 4.2rem)` Fraunces 500 with one italic
  word in accent color. H2 `clamp(1.5rem, 3vw, 2rem)`. Body Inter 400 with
  `text-wrap: pretty` and `max-width: 62ch–70ch`.
- **No drop shadows, no gradients, no rounded-card-with-coloured-left-border tropes.**

## Success criteria

1. `pnpm install && pnpm dev` runs, `/` renders the CV from real content
2. The home page visually matches `screenshots/01-cv-main.png` at the static
   (no-interactivity) layer — fonts, colors, spacing, section-header pattern,
   typography all correct
3. `pnpm build` succeeds with zero type errors and zero Biome warnings
4. `pnpm test` passes
5. `pnpm content:validate` passes against `content/cv.json`
6. The four other routes (`/tone`, `/jd`, `/lab`, `/game`) render placeholder
   pages that themselves use the section-header pattern correctly
7. A reviewer can read ADR-0001, ADR-0002, ADR-0003 and understand why the stack
   and design system were chosen
8. CI runs typecheck + lint + test + content validation on every PR
9. Vercel preview deploys work

## Tasks

### 1. Project bootstrap

- Initialize a Next.js 15 project with App Router, TypeScript, Tailwind. No ESLint
  (we're using Biome). Use `pnpm` as package manager.
- Set TypeScript strict + `noUncheckedIndexedAccess: true` in `tsconfig.json`.
- Add Biome with sensible default config covering `.ts`, `.tsx`, `.json`, `.md`.
- Configure `package.json` `scripts` block matching the commands listed in `CLAUDE.md`.
- `next.config.js`: minimal config, no special experimental flags unless required.

### 2. File structure

```
.claude/
  commands/
    adr.md
    spec.md
    phase-done.md
app/
  (site)/
    layout.tsx                    # Shared shell: nav, footer, fonts, tokens
    page.tsx                      # /  — Server Component, renders CV from content
    tone/page.tsx                 # /tone — Phase 0 stub
    jd/page.tsx                   # /jd — Phase 0 stub
    lab/page.tsx                  # /lab — Phase 0 stub
    game/page.tsx                 # /game — Phase 0 stub
  layout.tsx                      # Root layout: <html>, fonts, metadata
  not-found.tsx
components/
  cv/
    SectionHeader.tsx             # The kicker/title/meta/rule primitive — KEY component
    Header.tsx                    # Name, tagline, contact
    About.tsx
    Experience.tsx
    Projects.tsx
    Skills.tsx
    Education.tsx
  layout/
    Nav.tsx
    Footer.tsx
  ui/
    .gitkeep                      # Primitives land here as needed
content/
  cv.json
  projects.json
design-references/                # Already populated from claude.ai handoff
docs/
  adr/
    0000-template.md
    0001-stack.md                 # Write this phase
    0002-design-system.md         # Write this phase
    0003-adr-format.md            # Write this phase
  specs/
    README.md
    phase-0.md ... phase-7.md
lib/
  fonts.ts                        # next/font/google declarations
  schemas.ts                      # Zod schemas
  content.ts                      # Content loaders
  style-tokens.ts                 # StyleState type + DEFAULT_STYLE (sliders Phase 1)
source/
  oliver_cv_draft.md              # Source-of-truth markdown for human edits
scripts/
  validate-content.ts
styles/
  tokens.css                      # Ported from design-references/design-tokens.css
  globals.css                     # Tailwind layers, CSS reset, token import
tests/
  smoke.test.ts
```

### 3. Design tokens

- Copy `design-references/design-tokens.css` to `styles/tokens.css` verbatim.
- `globals.css` imports `tokens.css` and Tailwind layers.
- Configure `tailwind.config.ts` to expose the design tokens as Tailwind values
  where useful (e.g. `colors.fg`, `colors.accent`, `fontFamily.display`).
- Tokens are imported once in the root `app/layout.tsx`.

### 4. Fonts via next/font

`lib/fonts.ts`:

```ts
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});
```

In `app/layout.tsx`, attach all three `.variable` to `<html className>`. The CSS
variables in `tokens.css` reference `var(--font-display)` etc. — so the design
tokens see the fonts seamlessly.

### 5. SectionHeader primitive

This is the visual signature of the site. Build it carefully as a Server Component:

```tsx
// components/cv/SectionHeader.tsx
type Props = {
  number: string;     // "01", "JD-04", etc.
  title: string;
  meta?: string;
};

export function SectionHeader({ number, title, meta }: Props) {
  return (
    <header className="section-header">
      <span className="kicker">{number}</span>
      <h2>{title}</h2>
      {meta && <span className="meta">{meta}</span>}
    </header>
  );
}
```

CSS in `globals.css` (layer):
- Layout: CSS grid `auto | 1fr | auto`, hairline rule below
- Kicker: UPPERCASE, JetBrains Mono, tracking 0.22em, color `var(--muted)`
- Title: Fraunces 500
- Meta: same treatment as kicker, right-aligned

Every section on every page uses this primitive. Get it right; 70% of the look
follows from this.

### 6. Content layer

Translate `source/oliver_cv_draft.md` into `content/cv.json`. Schema design:

```ts
{
  header: { name, tagline, location, contact: { email, phone } },
  about: { paragraphs: string[] },
  experienceOverview: string,
  roles: [
    {
      id: "opensc",                 // stable slug — never change after assignment
      title, company, start, end, summary,
      bullets: [{ id: "opensc-1", text: "..." }, ...],
      technologies: string[]
    }
  ],
  education: [...],
  skills: { primary, ai, frontend, backend, infra, leadership },
  projects: [...],
  avocations: string[]
}
```

Stable bullet IDs are critical — Phases 3+ reference them. Use slugs, never indices.

Define Zod schemas in `lib/schemas.ts`. Export inferred TypeScript types.
`lib/content.ts` reads JSON and parses through schemas — fail loudly on
mismatch. `scripts/validate-content.ts` does the same and exits non-zero on failure.

### 7. CV rendering

Build the CV as Server Components reading from `lib/content.ts`. One component
per major section. Each uses `SectionHeader`. The home page composes them in order.

Match `screenshots/01-cv-main.png` for typography, spacing, hairline rules, italic
accents in headings (one italic word per heading in accent color), bullet markers,
and overall composition.

The slider deck is **not** built in this phase — leave space for it in the layout
(asymmetric 2-column grid: sticky left column 380px max for the deck, right column
for content; collapses to single column < 1024px). The left column is empty in
Phase 0.

The page should be 100% Server Component in this phase — no `"use client"`
boundaries anywhere. That comes in Phase 1 with the slider deck.

### 8. Style token scaffolding (no slider wiring yet)

In `lib/style-tokens.ts`:

```ts
export type StyleState = {
  density: number;     // 0..1
  polish: number;      // 0..1
  hierarchy: number;   // 0..1
  motion: number;      // 0..1
};

export const DEFAULT_STYLE: StyleState = {
  density: 0.5, polish: 0.5, hierarchy: 0.5, motion: 0.5,
};

// stateToTokens(state) is implemented in Phase 1 — see design-references/source/cv-app.jsx
```

Components must read from CSS custom properties (the ones already in `tokens.css`).
This is what makes Phase 1 a small step.

### 9. Placeholder routes

`/tone`, `/jd`, `/lab`, `/game` each render a one-paragraph "coming in Phase N"
placeholder. Use the shared layout and `SectionHeader` so they look like part of
the site even while empty. Don't pretend they're done.

### 10. Slash commands

`.claude/commands/`:

- `adr.md`: scaffolds new ADR. Reads highest existing ADR number, increments, creates
  file from `0000-template.md` with slugified title.
- `spec.md`: opens `docs/specs/phase-N.md` and frames the session.
- `phase-done.md`: runs `pnpm typecheck && pnpm lint && pnpm test && pnpm build`,
  reports failures, drafts a commit message, prompts to update `docs/specs/README.md`.

### 11. CI + Vercel

- `.github/workflows/ci.yml`: PR + main pushes. Steps: pnpm install, typecheck,
  lint, content:validate, test, build. Cache `~/.pnpm-store` and `.next/cache`.
- Connect repo to Vercel, accept Next.js defaults, verify preview deploys.
- Set `ANTHROPIC_API_KEY` env var (unused this phase but ready for Phase 2).

### 12. ADRs to write this phase

- **ADR-0001: Next.js as the framework.** The design handoff recommended Astro for
  its lighter MPA model on mostly-static pages. We chose Next.js anyway. Document
  the rationale honestly — likely some combination of (a) familiarity / shipping
  speed, (b) coherence with other Next.js work, (c) preference for server actions
  / route handler ergonomics for the Phase 3+ AI surface. Acknowledge the tradeoffs:
  a heavier client bundle on pages that don't strictly need interactivity, and
  paying SSR cost where SSG would have sufficed. Mitigate via aggressive Server
  Components and small `"use client"` boundaries.
- **ADR-0002: Design system locked from claude.ai exploration.** Why we treat the
  design references as authoritative. The artifact-to-production workflow.
- **ADR-0003: ADR format and the public /decisions page.** Why we use ADRs on a
  personal project, why Nygard format, why public.

### 13. README

Top-level `README.md`: what the project is, quickstart, where to read more,
live URL once deployed.

## Out of scope for this phase

- Slider UI or wiring tokens to state (Phase 1)
- Any AI calls or Route Handlers (Phase 2+)
- JD parsing, hit/miss matching (Phase 3)
- Project demos with live backends (Phase 4)
- Game shell or levels (Phase 5–6)
- Analytics, OG images, polish (Phase 7)
- The `/decisions` and `/build` pages (Phase 7)

## Decisions to flag to Oliver

- Confirm pnpm vs npm/yarn preference. Spec assumes pnpm.
- Confirm preferred Next.js version (latest stable 15.x assumed).
- Confirm domain choice — needed for Vercel setup but not blocking dev work.
