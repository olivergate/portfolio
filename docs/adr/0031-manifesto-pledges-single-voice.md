# 0031 — Manifesto rewritten as six pledges, single-voice

- **Status:** Accepted
- **Date:** 2026-05-06
- **Deciders:** Oliver Kaikane Gate

## Context

The `/tone` manifesto and its in-page render on `/` shipped at Phase 2 as
**fourteen tenets in two voices side-by-side** — a formal column and a
personal column, controlled by a `VoiceToggle` that collapsed the formal
column into "my voice only." The format was justified by ADR-0011
(manifesto, not live API rewriting) and ADR-0013 (pre-written voices).

After ADR-0030 removed the live CV tone toggle and shipped the CV
single-voice, the manifesto became the only surface on the site still
running two voices side-by-side. Two issues then surfaced:

- **Tenets are observations; the page wants to make commitments.** The
  fourteen tenets were largely descriptive ("I've spent stretches as the
  only engineer on the system…", "philosophy taught me to be obnoxious
  about definitions"). Useful colour, but the page's job in the site's
  rhetoric is to take a position — closer to a manifesto than a memoir.
- **Two voices don't earn their keep on commitments.** The two-voice
  format suited self-observations because it let the formal claim and
  the personal anecdote sit beside each other. Pledges land harder when
  declarative: a principle stated once is sharper than the same
  principle stated twice in different registers.

ADR-0030 explicitly retained the manifesto's two-voice format on the
basis that "it serves a page that *is* about voice." That justification
held when the manifesto was carrying the site's voice claim alone *and*
the CV had a live toggle reinforcing it. With the CV single-voice, the
manifesto's two-voice format started to look like a vestige rather than
a feature.

## Decision

**The `/tone` manifesto is rewritten as six numbered pledges in a
single voice. The fourteen tenets, the formal/personal split, and the
`VoiceToggle` are all removed.** The six pledges are:

1. Culture is king
2. Framing is first
3. Documentation and clear decisions
4. Right-aligned development
5. Honesty over polish
6. No absolutism in technological choices

Each pledge is 2–3 sentences, written as a principle statement
(e.g. "Culture is king" rather than "I will foster culture"). Numbering
follows the existing `01 / 06`-style label. The page title stays
"Voice & values"; the section header stays "TN-01 / Manifesto"; the
intro and signature carry over with minor edits ("fourteen positions"
→ "six positions"). Both surfaces — `/tone` and the embedded
`ToneSection` on `/` — are updated together.

Schema, component, and CSS surface area is renamed to match: the Zod
`Tenet` shape becomes `Pledge` (single `text` field), the `ToneSchema`
field becomes `pledges`, `Tenet.tsx` is replaced by `Pledge.tsx`, the
two-column grid CSS (`.tone-grid`, `.tone-divider`, `.tone-voice`,
`.tone-voice-toggle`, the `data-voice` collapse selectors) is removed,
and the reveal animation is simplified to a single block fade-up.

## Consequences

**Wins**

- **Shorter, sharper page.** Six pledges read in roughly half the time
  of fourteen tenets, and each one carries a position the site can be
  judged against.
- **Single source of truth per principle.** A pledge edit is one edit,
  not two parallel rewrites. No risk of the formal and personal voices
  drifting in meaning.
- **One fewer interactive surface.** The `VoiceToggle` joined the live
  CV toggle (ADR-0030) in the category of "interactive surface that
  answered an author's question, not a reader's." Removed.
- **Smaller CSS and component surface.** ~120 lines of two-column
  layout / voice-collapse CSS deleted. The reveal animation collapses
  to a simpler `translateY` fade.
- **Manifesto ethos now matches the CV.** Both are single-voice; the
  site's voice claim is consistent across surfaces.

**Costs**

- **Loss of the formal/personal contrast as a writing exhibit.** The
  two-voice tenets were a small portfolio of voice in their own right
  — the formal column showed the recruiter-facing register, the
  personal column showed the way I actually talk. That demonstration
  is gone. The pledges are written in a single, more-personal-than-
  formal register; the recruiter-facing register no longer has its own
  exhibit on the site.
- **Some tenets are dropped wholesale, not folded in.** Seven of the
  fourteen tenets (e.g. "End-to-end before division of labour", "Take
  the existential bug seriously", "Sit with the ambiguity longer than
  feels comfortable", "The domain is the design", "Test the contract,
  not the implementation", "Take the pro-bono job seriously", "The
  non-engineering hours are part of the job") have no direct successor
  pledge. The principles still apply to the work; they just don't get
  page-space anymore. Acceptable: a manifesto with fourteen positions
  isn't a manifesto, it's a list.
- **The pledges currently lean on on-site evidence rather than
  off-site stories.** Pledges 3, 5, and 6 cite ADRs and JD-matcher
  behaviour from this site. Pledges 1 and 4 are principle-only — no
  proof point yet. The intent is to add concrete examples in a follow-
  up edit pass; the page ships without them rather than waiting.

**Deliberately not done**

- **No live API rewriting of pledges.** ADR-0011's position holds: the
  manifesto is pre-written content, not an LLM playground. This ADR
  changes the count and the voice format, not the no-live-AI rule.
- **No archive page for the retired tenets.** They exist in git
  history. A "previous tenets" page would be a graveyard surface
  bolted on rather than designed (same reasoning as ADR-0030's
  rejection of a writing-samples consolation page).
- **No renaming of the page title or URL.** "Voice & values" still
  fits; pledges *are* values. The `/tone` route stays the same so the
  redirect from ADR-0028 (single-page consolidation) keeps working.

## Alternatives considered

- **Keep fourteen tenets, switch to single-voice.** Considered.
  Solves the two-voice maintenance cost without rewriting content,
  but the page would still read as fourteen self-observations rather
  than a position. Rejected — the count was the bigger problem than
  the voice.
- **Keep the two-voice format, rewrite as six pledges.** Considered.
  Pledges in two voices read as a principle restated immediately
  beside itself, which is dilution. Rejected — the same content twice
  weakens the claim.
- **Keep both formats: pledges on `/tone`, retain a "tenets archive"
  elsewhere.** Considered. Adds a surface that nobody asked for, and
  the previous tenets aren't strong enough to deserve a permanent
  exhibit; the strong ones become pledges, the rest go. Rejected as
  the cowardly-keep.
- **Four pledges, not six.** The user's first draft was four (Culture,
  Framing, Documentation, RAD). Two more were added during drafting:
  *Honesty over polish* (because the JD-matcher's conservative bias
  and the cost-ledger ADR depend on it being a stated principle, not
  just an engineering quirk) and *No absolutism in technological
  choices* (because it pairs naturally with Framing-is-First and
  matches the existing ADR practice of documenting deviations).
  Rejected staying at four — losing the honesty thread would have
  left the rest of the site looking like over-engineering with no
  thesis behind it.

## References

- ADR-0011 — `/tone` is a manifesto, not a live AI toggle (still
  Accepted; the no-live-AI half stands)
- ADR-0013 — Superseded by 0030; predecessor of the two-voice CV
  toggle, indirectly part of the same design lineage
- ADR-0028 — single-page consolidation; `/tone` redirects to
  `/#tone-manifesto` and this ADR keeps that anchor working
- ADR-0030 — removed the live CV tone toggle; this ADR completes the
  single-voice direction by extending it to the manifesto
- `content/tone.json` — rewritten: `tenets` → `pledges`, formal +
  personal fields → single `text`, intro updated
- `lib/schemas.ts` — `Tenet` → `Pledge`, `ToneSchema.tenets` →
  `pledges`, `ToneTenet` type → `TonePledge`
- Removed files (recoverable from git):
  `components/tone/Tenet.tsx`, `components/tone/VoiceToggle.tsx`
- New file: `components/tone/Pledge.tsx`
- `styles/globals.css` — two-column grid / voice-collapse CSS removed
  (~120 lines), simplified reveal animation
