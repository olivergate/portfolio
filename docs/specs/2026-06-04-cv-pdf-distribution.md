# CV PDF distribution + recruiter/AI legibility

**Status:** ACTIVE (2026-06-15) — Oliver reversed the 2026-06-04 pause: going live +
building the PDF now. `olivergate.com` + `www` added to the Vercel `portfolio`
project; awaiting GoDaddy DNS (A `@`/`www` → 76.76.21.21) + Deployment-Protection
toggle to make it resolve. PDF spike (Phase 1) starting in parallel. Research
complete, decisions taken.
**Date:** 2026-06-04 (research); 2026-06-15 (build started)
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
5. **Phone: PDF only, hidden on the public site** (2026-06-15). `cv.json` keeps the
   phone as the single source; the public CV page (and any future JSON-LD/`/cv.md`)
   must omit it, the print/PDF route includes it. Privacy: a crawlable phone is a
   scraper magnet; the hand-delivered PDF is not.

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

### Phase 1 — Spike — ✅ DONE (2026-06-15). Plan A confirmed.

Built `app/cv/print/page.tsx` (a route group OUTSIDE `(site)`, so no
Nav/Footer/FAB/rethemer/scrollspy — inherits only the root layout), reusing the
existing CV server components pinned to `DEFAULT_STYLE`; `styles/cv-print.css` +
`scripts/generate-cv-pdf.ts` (Playwright `chromium.launch()` → `page.pdf({format:
'A4', printBackground:true, preferCSSPageSize:true})`). Generated
`public/oliver-gate-cv.pdf`, extracted with `pdftotext -layout` (installed poppler).

**Results:**
- **Text layer: excellent.** Every load-bearing element extracts as selectable text
  in perfect reading order — name, "Valencia, Spain", email, phone, all three links,
  the funnel line, both role titles + dates, full skills, projects, avocations.
  Confirms `page.pdf()` is the right mechanism; **no need for `@react-pdf/renderer`**
  (Plan B) or a second rendering model.
- **Fidelity vs length is the real tension, and it's solved by tokens.** A faithful
  render at the site's native screen spacing was **8 pages**. Because the components
  are token-driven (inline styles read `var(--size-h1)`, `var(--gap-section)`, …) and
  inline styles outrank class rules, the fix is to merge a compact print scale into
  the inline token object (`PRINT_SCALE` in the page). That + dropping the blanket
  `section { break-inside: avoid }` → **3 pages**, with fidelity to the site's
  Fraunces/Inter typography intact.
- **The remaining page-3 overflow is one block: the Projects section** (5 full cards,
  each with a web-only "READ MORE →"). Everything else — header, both roles,
  education, full skills — fits in 2 pages.

**Decision: Plan A.** Reuses every CV component (single source of truth), keeps the
site's typography, excellent ATS text layer. Plan B (`@react-pdf/renderer`) is
rejected — its React-19/Next-16 crash risk and second layout model buy nothing now
that page.pdf is proven.

**To land the ≤2-page norm (build phase), pick one — Oliver's call:**
- Compact print-only Projects treatment (title — stack — one-line blurb, drop "READ
  MORE →" which is meaningless in a PDF). Keeps all 5; ~⅓ page. *Recommended.*
- Trim the PDF to the top 3–4 projects (content decision).
- Further token tightening (diminishing returns; risks cramping).

### Phase 2 — Build — ✅ DONE (2026-06-16, ADR-0037)

(ADR ended up **0037**, not the spec-assumed 0035/0036 — both were already taken.)

- ✅ **Links in content**: optional `links {website, linkedin, github}` added to
  `lib/schemas.ts` header + `content/cv.json` (real URLs: olivergate.com, the
  LinkedIn vanity-pending URL, github.com/olivergate). `content:validate` green.
- ✅ **PDF pipeline**: `app/cv/print/page.tsx` (outside `(site)`, `DEFAULT_STYLE`,
  `PRINT_SCALE` token overrides + `.section-header` reclaim) → `bun run cv:pdf`
  (`next build` + self-bootstrapping `scripts/generate-cv-pdf.ts`) →
  `public/oliver-gate-cv.pdf`. **2 pages**, 247 KB, committed static asset.
  `components/cv/ProjectsPrint.tsx` = compact print-only projects (kept all 5, each
  with its `olivergate.com/projects/<slug>` funnel URL).
- ✅ **Download button**: `Header variant="web"` shows "Download PDF ↓"; `variant=
  "print"` shows the phone instead. Privacy split implemented — phone PDF-only,
  hidden on the crawlable site; `/cv/print` is `noindex` + robots-`Disallow`.
- ✅ **Funnel copy**: bare URLs + "paste your role at olivergate.com/jd…" line at the
  top of the PDF body. Verified extractable via `pdftotext`.
- ✅ **Quick wins**: `app/robots.ts` (welcomes GPTBot/OAI-SearchBot/ChatGPT-User/
  ClaudeBot/PerplexityBot/Google-Extended/Applebot-Extended; disallows `/api/` +
  `/cv/print`), `app/sitemap.ts` (public routes + project pages; blog excluded per
  its `noindex` constraint), OG/Twitter metadata in `app/layout.tsx`.
- ✅ **ADR-0037** written — print route as a deliberate ATS-plain new surface;
  rejected deceptive tactics recorded.
- ⏳ **CI parse-safety gate** — a `pdftotext` assert (key terms in order + ≤2 pages)
  was run manually and passes; wiring it into CI is the one carried-over follow-up
  (poppler-in-CI vs a JS extractor — see ADR-0037 staleness note).

Checks at completion: `next build` ✓, `typecheck` ✓, `biome` ✓, 110 unit tests ✓.

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
- [x] LinkedIn: vanity URL claimed → `https://www.linkedin.com/in/olivergate/`
      (2026-06-16). Spain-resident, so HSM sponsorship is genuinely required; the
      header availability line states it (relocation broadened to Amsterdam + The
      Hague).
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
