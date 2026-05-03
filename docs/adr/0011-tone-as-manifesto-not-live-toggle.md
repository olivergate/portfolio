# 0011 — `/tone` ships as a manifesto; the live AI toggle is a separate surface

- **Status:** Accepted
- **Date:** 2026-05-03
- **Deciders:** Oliver Kaikane Gate

## Context

The original Phase 2 spec called for a Pessimistic / Honest / Absurd tone
toggle on the main CV: clicking a button would swap the bullets between three
voices, with the rewriting performed live by the Anthropic API. The spec also
called for a "satire mode" sticky banner when Absurd was active. The design
reference at `design-references/source/cv-tone.html` is built around exactly
this — three pre-written voices in `cv-data` with a segmented control to swap
them. The README in `design-references/` even describes a tone-toggle CV.

A subsequent design exploration in claude.ai produced a different artefact:
not a toggle on the CV, but a separate page at `/tone` containing a manifesto
of fourteen numbered tenets, each presented in two voices side-by-side
(formal vs. personal). Both voices pre-written by the author. No live AI.

The Phase 2 spec was reshaped to reflect the manifesto. The original
`cv-tone.html` design reference still exists but no longer matches what
`/tone` is intended to be.

(Spec drift caught during Phase 2 planning: the spec told the implementer to
"port the copy verbatim from `cv-tone.html`," but the file in question
contains the old toggle, not the manifesto. Captured in `docs/TODO.md`.
This ADR settles the direction; a future design refresh should regenerate
the screenshot at `02-cv-tone.png` and rewrite that section of
`design-references/README.md`.)

## Decision

**`/tone` ships as a manifesto: 14 numbered tenets, each rendered in two
pre-written voices side-by-side, with a single global toggle to collapse to
"my voice only." No API call, no live rewriting, no satire banner on this
page. The original 3-voice live toggle (Pessimistic / Honest / Absurd over
the CV bullets) is preserved as a separate follow-up surface — likely on
`/` or as a small additional page — to ship in Phase 2.5. The two
artefacts are complementary: the manifesto is what Oliver believes; the
live toggle is what AI can do with the same source material.**

Mechanically:

- Content lives in `content/tone.json`, validated by `ToneSchema` in
  `lib/schemas.ts`. Editable as a normal content edit; no code or rebuild
  required in dev.
- The page is a Server Component (`app/(site)/tone/page.tsx`). Only
  `components/tone/VoiceToggle.tsx` is a Client Component.
- The voice toggle is plain `useState` + sessionStorage; persistence across
  tabs / sessions is explicitly out of scope.
- The page wears the same `.cv-surface` class as `/`, so the Phase 1 slider
  deck rethemes it identically — verified by the corner test
  (`tests/e2e/corners.spec.ts`) running across all 16 slider corners on both
  `/` and `/tone`, and by the axe a11y test running across both routes at
  five representative slider positions.
- The two voices animate apart from the centerline on initial reveal,
  motion-gated via the existing `[data-reveal]` + `cv-surface[data-kinetic]`
  contract from Phase 1.

The 14 tenets ported into `content/tone.json` are an Oliver-edits-later
draft, sourced from `content/cv.json` + the existing tone copy + the
project's working pattern (ADRs, retrospective workflow). Marked as
"approved-as-placeholder" in
`design-references/source/cv-tone-tenets-draft.md`. The schema is stable;
the text is editable.

## Consequences

**Wins**

- **Honesty.** Both voices are written by the author. No AI-generated copy
  about Oliver claiming to be Oliver.
- **Cost.** Zero API spend on this page. The cost ceiling, KV cache, and
  cost log built in Phase 2 (ADRs 0008–0010) all sit waiting for Phase 3.
- **Substance.** Fourteen positions on craft, leadership, and how the work
  feels to do says more about a candidate than three rewrites of the same
  bullets in different registers. The tenets are designed to invite
  conversation, not just admiration.
- **Simplicity.** No prompt versioning for `/tone`, no satire badge, no
  cache invalidation. The page is mostly static content + one toggle.
- **Reuse.** The Phase 1 slider system applies unmodified — `/tone` got
  16-corner overflow + 5-position a11y coverage essentially for free, by
  parameterizing the existing test suite over `[/, /tone]`.

**Costs**

- We lose the spectacle of "watch the AI rewrite my CV in real time." That
  was a cute demo and would have been the most-shareable bit of the
  Phase 2 surface. The manifesto is more substantive but less viral.
- The original design reference `cv-tone.html` and the screenshot
  `screenshots/02-cv-tone.png` no longer match what shipped. Documented
  in `docs/TODO.md`; recommended fix is a fresh design exploration to
  produce a new reference + screenshot that match the manifesto.
- The fourteen tenets are placeholder copy at ship time. Edits are cheap
  (a content edit on `tone.json`), but the page reads as the author's
  voice manifesto immediately — anything off-voice is visible.

**Deliberately not done**

- No "run AI tone-shift over the CV" feature anywhere on the site. The
  AI surface area starts in Phase 3 (the JD matcher) and is bounded
  there.
- No state persistence beyond a single tab's `sessionStorage` for the
  voice toggle. Reading the manifesto isn't a stateful experience worth
  preserving across visits.
- No second-axis toggle (e.g. "show formal only"). The asymmetric framing
  — "show both" or "show personal only" — reflects that the personal
  voice is the more interesting one, and the formal voice exists to give
  it contrast.

## Alternatives considered

- **Ship the original 3-voice live AI toggle as the only Phase 2 deliverable.**
  Rejected — the honesty and cost arguments above outweighed the spectacle
  *for `/tone`*. The toggle on its own would have been a demo of "look,
  AI"; the manifesto is a demo of "look, someone with a voice."
- **Ship both in Phase 2: manifesto on `/tone`, live toggle on `/`.**
  Considered. Final position is "yes, but in two stages": manifesto first
  (this commit), live toggle second (Phase 2.5 follow-up). Splitting the
  work keeps the Phase 2 commit focused on one surface and lets the live
  toggle go through its own design + implementation cycle without delaying
  the rest.
- **Pre-write the three voices but ship them client-side without API.**
  Considered. Effectively the same as the manifesto in terms of "no AI
  touches the CV at runtime," but with a less interesting framing. Likely
  preserves a fast no-API fallback for the Phase 2.5 live toggle when the
  cost ceiling is hit.

## References

- `app/(site)/tone/page.tsx` — Server Component, the page itself
- `components/tone/Tenet.tsx` — Server Component for one tenet
- `components/tone/VoiceToggle.tsx` — Client Component for the toggle
- `content/tone.json` — the 14 tenets + intro + signature
- `lib/schemas.ts` — `ToneSchema` Zod validation
- `tests/e2e/corners.spec.ts` — 16-corner overflow on / and /tone
- `tests/e2e/a11y.spec.ts` — axe at 5 representative positions on / and /tone
- `design-references/source/cv-tone-tenets-draft.md` — the source draft of
  the manifesto, marked approved-as-placeholder
- `docs/TODO.md` § "Documentation drift" — captures the
  `design-references/README.md` and `02-cv-tone.png` mismatch
- `docs/specs/phase-2.md` § "Note on the reshape" — the original framing
  of this decision; this ADR is the formal record
- `docs/adr/0001-stack.md` — Server Components by default
- ADRs 0008–0010 — the AI infrastructure built in Phase 2 but not used here
