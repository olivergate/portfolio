# CV PDF distribution + recruiter/AI legibility

**Status:** PAUSED — Oliver decided (2026-06-04) not to take the site public yet;
all distribution work waits on that. Research complete, decisions taken, build not
started. The PDF spike (Phase 1) is local-only and could run any time; *distributing*
a PDF that points at olivergate.com cannot happen until the domain is connected.
**Date:** 2026-06-04
**Origin:** multi-agent research workflow (31 agents, 6 web dimensions + repo scout,
22 load-bearing claims adversarially fact-checked, ~half corrected). This doc is the
durable digest; raw findings lived in an ephemeral task artifact.

## Goal

Give recruiters the PDF they expect while driving them to the site for the full
picture, and make both artifacts parse cleanly under 2026-era ATS + LLM screening —
without ever crossing the honesty guardrails.

## Decisions taken (Oliver, 2026-06-04)

1. **Spike before choosing the PDF mechanism.** Build a minimal `/cv/print` route,
   snapshot with Playwright `page.pdf()`, run `pdftotext` — verify reading order,
   contact survival, and 2-page fit against the real `cv.json` before committing to
   print-route-rendered (Plan A) vs `@react-pdf/renderer` plain artifact (Plan B).
2. **Scope: PDF + funnel + quick wins.** Links in `cv.json`, `app/robots.ts`,
   `app/sitemap.ts`, OG metadata. Defer JSON-LD, `/cv.md`, llms.txt to a later
   ADR'd session.
3. **No photo on the PDF.** Remote/international norm wins over the Spain convention;
   headshot stays on LinkedIn.
4. **Headline title: "Senior Full Stack Developer"** — exactly consistent with the
   role history in `cv.json`; frontend/AI focus carried by the summary line, not the
   title (parsed-profile internal consistency matters to ATS/LLM screeners).

## Verified findings the plan rests on

Fact-checked; corrections from the adversarial pass folded in.

**ATS / AI parsing (2026):**
- Clean text extraction still gates everything. The 2024–26 LLM screening layers
  (Greenhouse AI, Ashby AI, Textkernel LLM parser) read the *already-parsed text*,
  not the original pixels.
- Single-column, no tables/sidebars, contact info in the document *body* (never the
  PDF header/footer region) is still substantively true in 2026 — not stale folklore.
- All major ATS keep both the original PDF and a parsed profile; recruiters
  search/screen the parsed layer first, then open the original. (The "Greenhouse
  shows recruiters the raw PDF, Workday doesn't" split is a matter of degree, not a
  clean fork — don't over-weight per-vendor rendering claims.)
- Screening is hybrid: literal keyword/Boolean filtering is near-universal at the
  sort stage, with LLM fit-scoring layered on top at larger orgs. Explicit technology
  naming *and* specific meaning both matter. Skills in a dedicated SKILLS block weigh
  more than the same term buried in prose.
- "75% of CVs auto-rejected by ATS" is traceably debunked vendor folklore (2012
  Preptel pitch; vendor folded 2013). Formatting auto-rejection is rare; links almost
  always reach a human. The real filter is the ~7-second human scan.
- Generic AI phrasing ("spearheaded", "leveraged") is now a downgrade signal; the
  existing human-voice rewrite of `cv.json` is an asset. Keep it.
- White-text injection / keyword stuffing: ~96% detected, near-universally rejected
  when caught. The honesty guardrails are also the tactically correct play.

**Funnel:**
- Always print the bare plain-text URL alongside any clickable link; never rely on
  anchor-text-only hyperlinks (stripped by ATS reformatting, useless on printouts).
- Links go in the top-of-body contact block (and repeat the site URL in a projects
  section) — never only in the literal PDF header/footer region.
- No QR code on the digital PDF (link is already clickable; pro-QR stats are
  untraceable folklore). Revisit only for printed copies at in-person events.
- Hook line advertises the one thing paper can't do:
  *"This PDF is the static snapshot. Paste your role at olivergate.com/jd and the
  live site scores itself against it — honestly, gaps included."*
- Tracking: path/UTM refs per channel (`?ref=pdf`, `?ref=linkedin`), read server-side
  in our own infra. No published recruiter click-through data exists — instrument and
  measure ourselves.

**Site legibility:**
- GPTBot / ClaudeBot / PerplexityBot / OAI-SearchBot do **not** execute JavaScript;
  only Googlebot(Gemini) and Applebot render JS. The site is RSC-first, so the full
  CV already ships in raw HTML — **the AI-legibility battle is mostly already won.
  The job is to protect that invariant** (CV content components stay Server
  Components; verify name/employers/stack appear in raw HTML of the deployed root).
- llms.txt is mostly theater for a person/CV site (server-log studies: AI answer-bots
  almost never fetch it). Skip for now; brand/completeness move at best.
- JSON-LD Person/ProfilePage is consumed at indexing time by Google AI Overviews and
  Bing/Copilot only (on-record); it is honest infrastructure, **not** a citation
  multiplier (Ahrefs controlled study: no uplift). Deferred, ship later with that
  framing.

## Plan

### Phase 1 — Spike (~1h, do first)

Minimal `app/(site)/cv/print/page.tsx`: single-column, pinned default theme, no
FAB/rethemer/scrollspy, contact block at top of body. Playwright `page.pdf({format:
'A4', printBackground: true, preferCSSPageSize: true})` against it. Then:

- `pdftotext -layout` → name, "Valencia", email, site URL, React/TypeScript/Next.js
  survive **in reading order**
- Does the full `cv.json` (roles + bullets + 4 skill categories + projects +
  education) fit 2 pages single-column? If not, content-cut decisions go to Oliver —
  honesty guardrails apply to what gets dropped.
- Eyeball fidelity → pick Plan A (print route, site typography) vs Plan B
  (`@react-pdf/renderer`, deliberately plain). Known react-pdf caveats if B: TTF/WOFF
  only (no WOFF2/variable fonts), run in a standalone Bun build script, never in the
  Next runtime (React-19/Next-16 crash issues #2966/#2994/#3285), pin the version.

### Phase 2 — Build (own session, ADR-0035)

- **Links in content** (prerequisite for everything): extend `lib/schemas.ts` header
  with `links {website, linkedin, github?, jdMatcher}` (validated URLs), populate
  `content/cv.json`, `bun run content:validate`. ⚠ Blocked on Oliver providing real
  URLs; omit GitHub from PDF/sameAs if it's sparse — a weak GitHub linked from a
  senior CV undercuts the pitch.
- **PDF pipeline** per spike outcome, build-time generation →
  `public/oliver-gate-cv.pdf`. Decide committed-vs-build-generated during the spike
  (staleness guard either way: CI assert extracted PDF text matches current cv.json).
- **Download button**: `<a download>` in `components/cv/Header.tsx` (+ footer).
- **Funnel copy** in the PDF: hook line top-of-body, bare URLs everywhere.
- **CI parse-safety gate**: pdftotext assert (name/Valencia/email/URL/stack in
  reading order) + page-count ≤ 2. Operationalizes the honesty guardrail and the ATS
  requirement in one check.
- **Quick wins**: `app/robots.ts` (allow GPTBot, OAI-SearchBot, ChatGPT-User,
  ClaudeBot, PerplexityBot, Google-Extended, Applebot; keep blog `index:false`),
  `app/sitemap.ts` (all routes), OG/Twitter metadata in `app/layout.tsx`
  (`type:'profile'`; custom 1200×630 `opengraph-image.tsx` can follow later).
- **ADR-0035**: the PDF is a deliberately ATS-plain *new surface*, not a render of
  the locked site design; record the deceptive tactics considered and rejected
  (hidden text, keyword stuffing, injection) — the rejection is part of the public
  build story.

### Phase 3 — Deferred (separate session, own ADR)

JSON-LD Person/ProfilePage/WebSite from `cv.json`; `/cv.md` route — **needs a new
contact-bearing formatter**: `lib/cv-evidence.ts::formatCVForPrompt()` drops
email/phone/location and feeds the JD-matcher prompt, so don't alias it (likely a
separate `lib/cv-markdown.ts`); RSC-invariant guard test; OG image; llms.txt (maybe
never).

## Open items (Oliver)

- [x] GitHub: `https://github.com/olivergate` (2026-06-04). Assessed: borderline —
      include in `cv.json` links, but PDF/sameAs inclusion is gated on profile
      curation: fix display name ("Don Oliver Gate" → match CV), bio + blog field →
      olivergate.com, pin `portfolio`+`clipfix`, add profile README. Optional
      upgrade: make TeacherHub and/or retro-claude public. Old practice repos stay.
- [x] LinkedIn: `https://www.linkedin.com/in/oliver-gate-28953b182/` (2026-06-04).
- [x] olivergate.com check (2026-06-04): **FAILED — the site is not publicly
      reachable anywhere.** olivergate.com serves a GoDaddy "Próximo lanzamiento"
      placeholder (domain never connected to Vercel; `vercel domains ls` → 0
      domains). The Vercel production deployment returns 401 (Deployment
      Protection on). **New Phase 0 prerequisite before any PDF/funnel work:**
      (a) add olivergate.com to the Vercel project + update DNS at GoDaddy,
      (b) disable Deployment Protection for production, (c) Oliver's go/no-go on
      the site being public at its current phase.
- [ ] If 2-page fit fails: what gets cut.

## Known traps (from the completeness critic)

- `formatCVForPrompt()` is *not* a free `/cv.md` — see Phase 3.
- Headline vs role-history title inconsistency is an ATS red flag — resolved by
  decision 4 (use "Senior Full Stack Developer" everywhere).
- Headless Chromium `--print-to-pdf` can silently drop resources/truncate — the CI
  text gate catches missing text, not layout truncation; visual spot-check the first
  generation.
- `page.pdf()` needs a running Next server at build time — mirror the
  `playwright.config.ts` port-3100 webServer pattern; this is the main CI-fragility
  cost of Plan A.
