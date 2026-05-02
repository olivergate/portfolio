# Phase 7 — Polish, /decisions, /build, launch

> Read this whole file. Plan, then execute.

## Goal

Take the site from "works" to "you'd send the link to a hiring manager you
actually want to work for." Performance, accessibility, the two meta pages
(`/decisions` and `/build`), launch readiness.

## Design references

- All five existing screenshots in `design-references/screenshots/` — final
  visual acceptance criteria for the corresponding pages
- `design-references/README.md` — the full design system (referenced for
  consistency on the new meta pages)

**Note: `/decisions` and `/build` were not included in the design exploration.**
This phase produces those two pages without a high-fidelity reference. They
should follow the established design system — same fonts, palette, section-header
pattern, hairline rules. They're typography-led pages; treat them as editorial
rather than interactive.

## Success criteria

1. Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO at default
   slider settings on `/`
2. Accessibility audit passes WCAG AA at every corner of the slider matrix
3. `/decisions` renders the ADR log from filesystem
4. `/build` is fully populated with real numbers, narrative, reflections — in
   Oliver's voice
5. Shareable match cards work for `/jd` (paste a JD, click "share", get a
   forwardable image)
6. Analytics in place; basic events flowing
7. Domain wired up; HTTPS; OG cards preview correctly

## Tasks

### 1. /decisions — ADR log

`app/(site)/decisions/page.tsx` and `app/(site)/decisions/[slug]/page.tsx`.
Both are Server Components (no client interactivity needed).

- Lists ADRs newest first
- Each entry shows: number, title, status badge, date, tags (parsed from
  frontmatter via `gray-matter`)
- Index uses `SectionHeader` for the page header
- Each entry rendered via `react-markdown` with `remark-gfm` and `rehype-pretty-code`
  for syntax highlighting (Shiki under the hood)
- Use `generateStaticParams` on the slug route so all ADRs are statically generated
  at build time
- Use `generateMetadata` for per-ADR titles and descriptions
- Treat ADRs as editorial — typeset like blog posts, not technical docs

### 2. /build — process story

`app/(site)/build/page.tsx`. Server Component, statically generated.

Sections:

- **What this is** — one paragraph
- **The premise** — why a CV needs sliders, in conversational prose
- **Stack** — Next.js, Tailwind, Anthropic API. Link to relevant ADRs.
- **Process** — phased build, completion dates from `docs/specs/README.md`
- **Built with Claude Code** — narrative on the workflow: CLAUDE.md, slash
  commands, ADRs as memory, plan-mode-then-execute pattern
- **Stats panel** — populated from real data:
  - Commits + % AI-authored (parse git for `Co-Authored-By: Claude` trailer)
  - Total Anthropic API spend across phases
  - Time per phase (start → completion from specs README)
  - Number of ADRs and a small chart of when they landed
- **Reflections** — what worked, what didn't, what surprised you. Written by
  Oliver. This is the most important section on the page.
- **The CV exists in another tab** — link back to `/`

`/build` itself respects all four sliders. Dogfood.

Layout: editorial, follows established design system. Use `SectionHeader` for
each section. Stats panel is a designed grid — not a dashboard, not flashy.

### 3. Stats data sources

`lib/build-stats.ts`:
- `getCommitStats()` — runs at build time (`unstable_cache` or just in the page
  RSC), parses `git log` for total commits and AI-authored commits via
  `Co-Authored-By: Claude` trailer
- `getAdrStats()` — counts ADRs in `docs/adr/`, returns dates from frontmatter
- `getCostStats()` — sums `lib/cost-log.ts` totals, grouped by phase via
  timestamp ranges from `docs/specs/README.md`

All `/build` numbers come from these. No hardcoded values.

### 4. Performance pass

- Audit Lighthouse on `/`
- `next/font` already optimizes fonts; verify subsetting is happening
- `dynamic` imports for below-the-fold client islands where it helps
- Bundle analyze with `@next/bundle-analyzer`; cut unjustified weight
- Verify Server Components are doing their job: any unnecessary `"use client"`
  boundaries should be lifted
- Lighthouse CI in GitHub Actions; fail PR if performance score drops > 2 points
- Verify `revalidate` and ISR settings are appropriate per route (static is
  fine for everything except the API routes)

### 5. Accessibility pass

- `@axe-core/playwright` at all 16 corner combinations on `/`; fix violations
- Focus order + visible focus rings at every polish setting (brutalist must
  show focus clearly)
- Screen reader labels on every slider, every interactive element
- Keyboard navigation for entire page including bottom-sheet on mobile
- `prefers-reduced-motion` audit across all five pages
- Color contrast at every polish + page combination; verify all five pages

### 6. Shareable match cards (/jd)

`app/api/og/match/route.ts` — uses `next/og` (ImageResponse) for OG generation.

Generates from query params: JD title (truncated), score summary, top 3 hits,
top 1 honest gap. Uses Fraunces and Inter at midpoint slider state. Cream
background. Burnt rust accent.

"Share match" button on `/jd` UI: copies URL with OG meta tags so social
previews work correctly. The shareable URL is something like
`/jd/share/[hash]` which renders a static page with the right OG meta and
redirects to `/jd?prefill=[hash]` after a moment.

### 7. Analytics

- Plausible (privacy-friendly, no cookie banner needed) — install via the
  official Next.js integration or simple script tag
- Events: slider changes (count only, no values), tone toggle changes, JD
  pastes (count), demo runs (per demo), game completions (per level), ADR
  page views (which ADRs interest visitors)
- `/build` shows analytics summary if Plausible public stats are enabled

### 8. SEO

- `generateMetadata` on every page with title, description, OG image,
  Twitter card
- `app/robots.ts` allowing indexing
- `app/sitemap.ts` generated covering `/`, `/tone`, `/jd`, `/lab`, `/game`,
  `/decisions`, `/decisions/[slug]`, `/build`
- Structured data (JSON-LD) on `/`: Person schema, WebSite schema, links to
  socials — render via a `<script type="application/ld+json">` in the page
- Validate with Rich Results Test before launch

### 9. Domain + HTTPS

- Wire chosen domain to Vercel
- Verify HTTPS, decide www → apex (or reverse)
- Set canonical URLs via metadata

### 10. Error pages

- `app/not-found.tsx` — friendly 404, nav back to `/` and `/lab`
- `app/error.tsx` — friendly 500 with reset action
- Sentry or equivalent for error reporting (optional)

### 11. Launch checklist

Before publishing the URL anywhere:

- [ ] Lighthouse ≥ 95 on `/`
- [ ] All 16 slider corners screenshot-tested and visually reviewed
- [ ] Visual diff of each page against `design-references/screenshots/` —
      flag any deviations and either fix or document in ADR
- [ ] All ADRs read once more for typos
- [ ] CV content reviewed once more for accuracy
- [ ] JD adapter pressure-tested on 5 fresh JDs (different from Phase 3's set)
- [ ] All 5 game levels playable with no broken states
- [ ] Cost ceiling confirmed at appropriate value
- [ ] Privacy: no PII logged, analytics provider verified
- [ ] All AI keys in env vars only, none in code
- [ ] Domain HTTPS, OG cards previewed in Twitter/LinkedIn validators
- [ ] Mobile end-to-end test on a real phone
- [ ] Reduced-motion test on a real device
- [ ] Send link to one friend for honest feedback before going wider

### 12. ADRs to write this phase

- **ADR-0026: Plausible for analytics.** Privacy framing, what we don't track.
- **ADR-0027: Build stats from real git data.** Why parsed at build, not
  hardcoded — integrity argument.
- **ADR-0028: Reflections written by Oliver.** Closing the loop.
- **ADR-0029: /decisions and /build designed without a reference artifact.**
  Documenting the deliberate choice to design these in code following the
  established design system, rather than going back to claude.ai.

## Out of scope

- Blog system
- Newsletter signup
- Live chat
- Screen reader testing beyond NVDA/VoiceOver

## Decisions to flag to Oliver

- Choose a domain — recommend memorable, not tied to a specific job search
- Confirm Plausible vs alternatives (Fathom, self-hosted Umami)
- Decide whether `/build` shows real cost numbers publicly. Recommend yes —
  signals operational maturity.
- Write the reflections section yourself. This is the closing argument of
  the whole site. Don't outsource it.
