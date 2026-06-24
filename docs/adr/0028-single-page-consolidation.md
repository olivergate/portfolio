# 0028 — Single-page consolidation; routes redirect to anchored sections

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Oliver Kaikane Gate

## Context

Phases 0–4 shipped four routes intended as five "rhetorical modes":

- `/` — CV with style sliders
- `/tone` — Voice & values manifesto
- `/jd` — JD adapter
- `/lab` — Things I'm building with LLMs (featured retro demo + linkout cards)
- `/game` — Phase 5–6 placeholder

In practice, the four built routes read more like four sections of one
document than four separate pages: every route renders Oliver's name, the
same nav, the same footer; visitors who arrive on `/` and want to see the
rest must traverse a top nav back to the multi-page model rather than just
keep scrolling. The slider deck — the most distinctive UI on `/` — only
mounted on `/`, so the rest of the experience felt visually disconnected
from the CV's main themer.

Two related needs surfaced together:

1. The visitor-mode pages (Tone, JD, Lab) all benefit from being read in
   sequence after the CV; splitting them into routes means picking which
   one to navigate to instead of scrolling continuously.
2. The slider deck retunes the whole visual identity. If Tone/JD/Lab
   live on different routes, the deck doesn't reach them — the visitor
   experiences a re-themed CV, then loses that theme when they navigate
   to the next page.

## Decision

Collapse the three visitor-facing routes (`/tone`, `/jd`, `/lab`) into
anchored sections of `/`. The single-page document order is:

1. `#cv` — Header, About, Experience, Education, Skills, Projects, Avocations
2. `#jd` — JD adapter (after Avocations / Outside work; relocated per ADR-0029)
3. `#tone` — Voice & values manifesto
4. `#lab` — Things I'm building with LLMs

> **Amended 2026-05-04:** the enumeration above was updated in place per
> ADR-0012 §editable-in-place (current-state enumerations). The original
> draft listed JD last ("at the end of the CV"); ADR-0029 relocated the
> JD adapter to sit between the CV and the manifesto, and at HEAD the
> four sections render as siblings (`<section id="cv">`, `<section
> id="jd">`, `<section id="tone">`, `<section id="lab">`) rather than
> JD living inside the CV section.

Implementation:

- `next.config.ts` adds **308 permanent redirects** for `/jd`, `/tone`,
  `/lab` → `/#jd`, `/#tone`, `/#lab`. Inbound links and crawler caches
  follow the canonical URL.
- New section components: `components/cv/ToneSection.tsx`,
  `components/lab/LabSection.tsx`, `components/jd/JDSection.tsx`. Each
  renders the body of its previous route (minus the duplicate page-level
  `<header>` showing the name; the CV header at `#cv` already serves that).
- `app/(site)/page.tsx` mounts all four `<section id="…">` blocks in order.
- `app/(site)/jd/`, `app/(site)/tone/`, `app/(site)/lab/` directories
  deleted.

  > **Amended 2026-06-24:** these standalone `page.tsx` files were
  > accidentally reintroduced after this ADR (the `/lab` page alongside
  > ADR-0040, and `/jd`/`/tone` with it) while the 308 redirects above
  > stayed in place — leaving them unreachable dead code shadowed by the
  > redirects. They have been re-removed to restore the decided state. The
  > live surfaces are the `#jd`/`#tone`/`#lab` sections on `/`
  > (`JDSection`/`ToneSection`/`LabSection`); `app/sitemap.ts` no longer
  > lists the redirect-source paths.
- New nav: `components/layout/ScrollSpyNav.tsx` (client). A minimal mono
  strip, sticky to top, four labels separated by `·`. The active label
  underlines using an `IntersectionObserver` with a middle-band rootMargin;
  click → `scrollIntoView({ behavior: smooth })` and `history.replaceState`
  to keep the URL in sync without a router round-trip. Reduced motion
  swaps to instant scroll.

`/game` is **not** consolidated. It remains its own route — the Phase 5–6
prompt-safety game is interactive enough to warrant its own URL and won't
benefit from being part of the scroll narrative.

## Consequences

**Wins:**
- Single continuous narrative: visitor reads CV → JD → manifesto → lab
  with no navigation, just scrolling. The rhetorical mode shifts are now
  marked by section headers, not URL changes.
- The slider deck reaches every section. Re-theming the CV themes the
  whole document.
- Per-route AI cost ceilings (ADR-0010) are unchanged — endpoints still
  exist (`/api/jd-parse`, `/api/jd-match`, `/api/retro`) and rate
  ceilings continue to apply per endpoint.
- Inbound links to `/jd`, `/tone`, `/lab` keep working via 308.

**Costs:**
- Per-section `<title>` and `<meta description>` are gone — the page
  metadata in `app/layout.tsx` is now the only one. For a personal CV this
  is acceptable; the loss is per-section deep-link discoverability.
- All section content client- or server-renders on every visit, so the
  page is heavier than any single previous route. Mitigation: section
  components remain Server Components where they were before; only the
  pre-existing client islands (`<JDAdapter />`, `<RetroDemo />`,
  `<VoiceToggle />`) hydrate. None of them auto-fire AI calls — JD
  matching needs the "Score this JD" click; the retro demo needs its
  own button.
- Casual visitors will scroll past the JD adapter without intending to
  use it. This raises the *exposure surface* for the JD endpoints
  without changing the *cost model* — ADR-0010's ceilings absorb any
  uptick.

**Deliberately not done:**
- No client-side router for the section anchors — the browser-native
  fragment + smooth scroll is enough.
- No `/game` consolidation.
- No re-introduction of per-section `<title>` via the History API on
  scroll — keeps the URL stable except when the user actively clicks a
  nav label.

## Alternatives considered

- **Keep separate routes, add a back/next nav at the bottom of each.**
  Closer to the original Phase plan. Rejected — solves the navigation
  problem but not the slider-deck-reach problem; the deck still wouldn't
  apply to the other pages.
- **Put the deck into the layout so it mounts on every route.** Would
  apply tokens across pages but not solve the "feels like one document"
  goal; visitor still navigates explicitly between pages.
- **Collapse all five (including `/game`).** Rejected — the game is an
  interactive playable, not narrative; it works better as a focused
  surface than as a section.

## References

- Phase plan: `docs/specs/README.md` (the per-phase CV / Tone / JD / Lab
  / Game split)
- Per-route cost ceiling: ADR-0010
- Reveal-on-scroll mechanism: pre-existing `RevealObserver`; the
  `.cv-surface` class on `<main>` continues to scope it across all
  consolidated sections.
