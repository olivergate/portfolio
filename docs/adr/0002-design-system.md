# 0002 — Design system locked from the claude.ai handoff

- **Status:** Accepted
- **Date:** 2026-05-02
- **Deciders:** Oliver Kaikane Gate

## Context

The site's visual design was fully explored before any production code was
written, in a separate claude.ai session. That exploration produced a complete
design system: palette, typography, type scale, motion tokens, the
section-header rhythm device, and HTML/JSX prototypes for all five pages with
final copy. The artifacts live under `design-references/`.

The design exploration is high-fidelity. Colors, typography, copy, spacing,
and interactions are all settled. The screenshots in
`design-references/screenshots/` are visual acceptance criteria.

Without an explicit policy, two failure modes are likely:

1. **Drift.** Per-phase decisions slowly walk away from the locked design,
   each individually defensible, none caught.
2. **Relitigation.** Each phase reopens decisions the design has already
   answered — palette, fonts, the kicker pattern, etc. — burning time on
   already-resolved questions.

## Decision

The contents of `design-references/` are **authoritative** for visual design.
That includes:

- The palette and its specific hex values
- The three-font system: Fraunces (display), Inter (body), JetBrains Mono
  (kickers, terminal)
- The section-header pattern: mono numeric kicker | Fraunces 500 title |
  optional mono meta | hairline rule below, with `letter-spacing: 0.22em` on
  every kicker
- The type scale defined in `design-references/design-tokens.css`
- The "no drop shadows, no gradients, no rounded-card-with-coloured-left-border"
  prohibition

Implementation rules:

1. The CSS in `styles/tokens.css` is a verbatim port of
   `design-references/design-tokens.css`. Updates flow source → port, never
   backwards.
2. Components consume tokens via CSS custom properties. They do not hardcode
   colors, fonts, or spacing.
3. A phase isn't done until the running site visually matches
   `design-references/screenshots/*.png` for that page.
4. Any deliberate deviation requires a new ADR explaining why and what
   replaces the deviation.
5. The design references are NOT to be copied verbatim into production code.
   They depend on Babel-in-the-browser, Tailwind CDN, and inline JSX. Port
   to the project's idiom (Server Components, design-token CSS variables,
   Tailwind v4 utilities where helpful).

## Consequences

**Wins**

- Per-phase scope is smaller. We don't redesign; we recreate.
- Visual coherence across pages by construction — every page uses the same
  tokens and the same kicker pattern.
- Reviews focus on fidelity, not taste.

**Costs**

- Less freedom to make local visual tweaks during implementation. If the
  screenshot says hairline 1px, we don't subtly upgrade to 1.5px.
- Token changes need to flow through the design references first, then
  port. That's one extra step — but the alternative is drift.

## Alternatives considered

- **Treat the design references as suggestions.** Rejected — see "drift"
  above. The point of doing an exhaustive design exploration before code is
  that it's then locked.
- **Port the prototypes directly without translation.** Rejected — the
  prototypes use Babel-in-browser, Tailwind CDN, and inline JSX. Production
  code shouldn't.
- **Re-derive a design system from scratch in the codebase.** Rejected
  outright — the design exploration is the work product; throwing it away
  to satisfy a "real codebase" purity itch is wasteful.

## References

- `design-references/README.md`
- `design-references/design-tokens.css`
- `design-references/screenshots/01-cv-main.png` (Phase 0 acceptance image)
- `design-references/source/cv-content.jsx` (CV component reference)
- ADR-0001 — stack rationale, including the choice to port HTML prototypes
  to Next.js Server Components
