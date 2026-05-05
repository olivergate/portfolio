# 0030 — Remove the live CV tone toggle

- **Status:** Accepted
- **Date:** 2026-05-05
- **Deciders:** Oliver Kaikane Gate

## Context

ADR-0013 shipped a 3-voice toggle (Honest / Pessimistic / Absurd) above the
Experience section on `/`. The toggle swapped pre-written variants of every
role summary and bullet via React Context (`ToneProvider`, `ToneToggle`,
`TonedText`), and an `Absurd`-only `SatireBanner` made the satire reading
explicit. The supporting copy was carried in `cv.json` under a `TonedText`
schema with three string keys per bullet.

After the May 2026 review pass, two costs of the toggle had become
visible:

- **Maintenance.** Every fact-edit on the CV had to touch three voices.
  The same review pass that produced this ADR included rewrites of the
  OpenSC monitoring bullet, the "sole engineer" framing, and the
  "7+ tenants → 7 tenants" correction — each of which had to be applied
  three times for content that almost no reader sees twice.
- **Attention.** The CV page now carries three competing interactive
  surfaces: the four-axis style sliders, the JD adapter, and the tone
  toggle. The sliders and the JD adapter each answer a question the
  reader has ("what should this CV look like?", "would Oliver fit this
  role?"). The tone toggle answers a question the author had ("what if
  a CV had voices?"), and the JD adapter already does the honesty work
  with more engineering substance behind it (per ADR-0016, "honest
  gaps" framing without inventing matches).

Critical reread of ADR-0013's "wins" against the shipped reality:

- *Honesty.* The toggle's honesty signal is now better delivered by the
  JD adapter's conservative-bias matcher and explicit "honest gap"
  framing.
- *Cost.* Was zero ongoing API spend; the toggle is also zero API spend
  to remove.
- *Editable copy.* The toggle's three-voice content imposed 3× edit
  cost on every CV change — the opposite of cheap to maintain.
- *Phase 3 cleaner.* Phase 3 has shipped. The justification is spent.

## Decision

**The live CV tone toggle is removed. The CV ships single-voice (the
`honest` text). The `TonedText` schema is collapsed to a plain
`z.string()` for `summary` and `bullet.text`. `ToneToggle`,
`ToneProvider`, `tone-context`, `TonedText`, and `SatireBanner` are
deleted. Section numbering on `/` is renumbered down to close the gap
left by the removed `03 / Tone` section.**

The `/tone` manifesto stays unchanged. The manifesto's
`formal` / `personal` voice split is a different decision (it serves a
page that *is* about voice) and continues to earn its keep — see
ADR-0011.

## Consequences

**Wins**

- **Single source of truth for every CV claim.** A fact-edit is one
  edit again.
- **One fewer interactive surface competing for attention** with the
  style sliders and the JD adapter on `/`.
- **No more satire-banner edge case.** The Absurd voice required a
  sticky banner because it could be misread as the real CV — a feature
  whose primary risk was "someone might think this is what I actually
  claim." That risk is gone.
- **Smaller content schema.** `TonedText` removed; `Bullet.text` and
  `Role.summary` are plain strings. The Zod schema and the `CV` type
  shrink correspondingly.

**Costs**

- **Loss of the writing exhibit.** The Pessimistic and Absurd voices
  were well-written and demonstrated range. They are removed from `/`.
  If a future surface wants to showcase voice as a portfolio of
  writing rather than a CV mode, that would be a new feature with its
  own ADR.
- **The `/tone` manifesto now carries the entire "voice" claim on the
  site.** That's load-bearing in a way it wasn't when the CV toggle
  also reinforced the message. The manifesto is up to it; the wider
  point about voice across the site is now narrower in surface.
- **No live API rewriting of CV bullets, anywhere on the site, ever.**
  This is unchanged from ADR-0013 — the position about the CV itself
  still stands. The toggle removal is not a step toward live rewriting
  later.

**Deliberately not done**

- The `/tone` manifesto and its `VoiceToggle` (formal/personal) are
  retained. Different decision, different ADR (0011).
- The pre-written Pessimistic and Absurd copy is removed from
  `cv.json` rather than archived. It exists in git history if needed.
- No "writing samples" section is added on `/lab` or elsewhere as a
  consolation. If that surface is wanted, it should be designed
  intentionally, not bolted on as a graveyard for retired copy.

## Alternatives considered

- **Keep the toggle, add a justifying blog post.** Considered.
  Writing a blog post to *justify* a feature is a leading indicator
  that the feature isn't justifying itself. Rejected.
- **Demote the toggle to a sub-setting inside the Style FAB.**
  Considered. Preserves the feature without committing to it.
  Doesn't address the maintenance cost, just hides it. Rejected as
  the cowardly-keep.
- **Keep the content as a one-time "voices" exhibit, drop the live
  switcher.** Considered. Salvages the writing without the
  per-bullet maintenance tax. Rejected for now — see "deliberately
  not done" — because it would be a new surface bolted on rather
  than designed; if wanted, it should be its own decision.

## References

- ADR-0011 — manifesto-vs-toggle split (the manifesto half stands; the
  toggle half is what this ADR retires)
- ADR-0013 — pre-written tone toggle (this ADR supersedes it)
- ADR-0016 — JD matcher conservative bias (carries the honesty
  signal that the tone toggle was redundantly carrying)
- ADR-0018 — no top-line match percentage (sibling honesty constraint
  for the JD adapter)
- `docs/specs/phase-2.5.md` — the phase spec under which the toggle
  shipped; superseded by this ADR
- `lib/schemas.ts` — `TonedText` removed; `summary` and `bullet.text`
  collapsed to plain `z.string()`
- `content/cv.json` — collapsed every `{honest, pessimistic, absurd}`
  object to its `honest` value (2 role summaries + 12 bullets)
- Removed files (recoverable from git): `components/cv/ToneToggle.tsx`,
  `components/cv/ToneProvider.tsx`, `components/cv/tone-context.ts`,
  `components/cv/TonedText.tsx`, `components/cv/SatireBanner.tsx`,
  `tests/e2e/satire-banner.spec.ts`
