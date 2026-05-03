# TODO — deferred decisions and follow-up work

Lightweight catch-all for things that would otherwise live in your head or
get lost between sessions. Promote items into ADRs, GitHub issues, or
phase specs once they harden.

## Decisions deferred

- **Anthropic monthly cost ceiling** — `ANTHROPIC_MONTHLY_LIMIT_USD`. Phase 2
  ships with the dev default ($20) wired in `lib/check-cost-ceiling.ts`. Pick
  a production value before Phase 3 ships (Phase 3 is the first phase that
  actually calls the API). Suggested range: $20–50.
  - Surfaced: 2026-05-03, Phase 2 planning
  - Owner: Oliver

## Phase 2.5 — follow-up work before Phase 2 is marked Done

- **3-voice live tone toggle (Pessimistic / Honest / Absurd) on `/`** —
  the original Phase 2 spec deliverable that got reshaped out by the
  manifesto direction. Now reinstated as a separate surface. Manifesto
  on `/tone` stays. The live toggle re-themes the CV bullets via Anthropic
  rewrites cached aggressively (cache key includes prompt version per
  ADR-0009), with a Honest fallback when the cost ceiling is hit. Satire
  banner returns when Absurd is active. Will use the AI infrastructure
  scaffolded in Phase 2 (this is the first place it gets exercised; Phase 3
  JD matcher follows). See ADR-0011 (updated) for the rationale split.
  - Surfaced: 2026-05-03, end of Phase 2
  - Owner: Oliver to confirm scope; agent to scaffold once approved
  - Blocks: marking Phase 2 as Done in `docs/specs/README.md`

- **Manifesto content (14 tenets) for `/tone`** — shipped as Oliver-edits-later
  placeholder. Edit `content/tone.json` directly when ready; no rebuild
  needed in dev, no schema migration as long as the shape stays the same.
  Source draft: `design-references/source/cv-tone-tenets-draft.md`.
  - Surfaced: 2026-05-03, Phase 2 ship
  - Owner: Oliver, ad-hoc

## Documentation drift

- **`design-references/README.md` "2. cv-tone.html — Tone manifesto" section
  is wrong** — describes a 14-tenet manifesto with formal/personal voices
  that doesn't exist in `cv-tone.html`. The file actually contains the
  3-voice (honest/pessimistic/absurd) toggle on standard CV content. Once
  the manifesto direction is settled (see above), rewrite this section to
  match what's actually there OR generate a new design reference that
  matches the description.
  - Surfaced: 2026-05-03, Phase 2 planning
  - Owner: Oliver

- **`design-references/screenshots/02-cv-tone.png` is the main CV page**, not
  a tone manifesto. Looks like it was captured against the wrong file or
  never regenerated post-reshape. Replace once Phase 2 ships.
  - Surfaced: 2026-05-03, Phase 2 planning

## Known benign warnings

- **Hydration mismatch warning on every route** — the inline bootstrap
  script (Phase 1, `lib/bootstrap-script.ts`) writes the CSS-token style
  attribute on `<html>` *before* React hydrates, so shared URLs render
  with the right theme without flash. React's hydration check sees the
  pre-set inline `style` attribute and warns:
  `"A tree hydrated but some attributes of the server rendered HTML
  didn't match the client properties."`
  This is benign by design — the bootstrap winning is the whole point —
  but it shows up as a console error in dev. Two paths if it ever
  matters: (a) suppress with `suppressHydrationWarning` on `<html>`,
  (b) move the bootstrap to write to a different surface (e.g. a CSS
  custom-property registry script that React doesn't audit). Neither is
  worth doing today; the parity test (`tests/bootstrap-parity.test.ts`)
  already locks the contract.
  - Surfaced: 2026-05-03, end of Phase 2

## Spec drift (Phase 2)

- **`docs/specs/phase-2.md` § 12 references `app/api/_smoke/route.ts`** — the
  underscore prefix makes a folder *private* in Next.js (excluded from
  routing), so the route would never register. Implemented at `app/api/smoke/`
  instead. Spec text left as-is (captured intent); the running implementation
  is the source of truth.
- **`docs/specs/phase-2.md` § "ADRs to write" labels the tone-reshape ADR as
  0007.** That number was taken in Phase 1 by `0007-muted-color-wcag-aa-deviation.md`.
  Tone-reshape ADR will be `0011` when the manifesto direction is settled.
  Infra ADRs landed as 0008, 0009, 0010 per the spec.

## Closed (kept for context)

- ~~Vercel auto-deploy on push wired but unverified~~ — confirmed working
  on push of `a5d1128` (Phase 1). Closed 2026-05-03.
