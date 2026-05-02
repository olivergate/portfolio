# 0006 — The slider deck is design-locked

- **Status:** Accepted
- **Date:** 2026-05-02
- **Deciders:** Oliver Kaikane Gate

## Context

The slider deck (the dark, instrument-panel-styled control on `/`) is the most
designed object on the site. It carries the metaphor — sliders are the rhetorical
device the whole CV pivots around — and it stays visually hard-coded as everything
around it changes.

The design phase shipped a working HTML/JSX prototype for the deck:
`design-references/source/cv-deck.jsx`. It includes:

- A custom-drawn track + thumb (the native `<input type=range>` is invisible,
  layered above the visual for accessibility/keyboard handling).
- Brushed-metal thumb gradient with notch and accent stripe.
- "Moving one slider dims the others" interaction (`.deck-active` parent class).
- Fixed dark gradient background, hardcoded chartreuse / coral / sky / amber
  accents per slider.
- Diagnostic readout (`STATE BALANCED`, `CV / RETHEME`, `oliver.kg2 · instrument v1`).

When porting to Next.js, an obvious temptation is to "improve" this — swap the
custom thumb for a CSS-only one, drop the per-slider accents, simplify the layout.
That would be a mistake. This ADR says so out loud, so a future contributor (or
future-Oliver) doesn't quietly soften the deck without realising.

## Decision

**Port the deck verbatim.** Visual properties — gradient, thumb construction,
accent palette, dim-others interaction, header/footer chrome, button styles —
are not up for relitigation in Phase 1.

Implementation choices that *are* fair game (because they're framework concerns,
not design concerns):

- File split (one component per file vs one big file).
- Splitting the inline styles between CSS classes and `style={{}}` props.
- Using React state where the prototype used DOM querying.
- The mobile-sheet wrapper (the prototype just stacked; the spec asks for a sheet).
- Substituting Inter for Space Grotesk (`--font-grotesk`). The prototype loaded
  Space Grotesk for the brutalist display family. Adding a fourth Google Font for a
  slider deck nameplate is over-budget; Inter is a credible visual fallback. Worth
  reconsidering in a later phase if the difference is jarring.

## Consequences

**Wins**

- The headline visual lands on day one. Hiring managers see what was designed,
  not what an LLM thought was a good "interpretation."
- Decision speed: anyone porting a value sees "verbatim" and stops second-guessing.
- The screenshot at `design-references/screenshots/01-cv-main.png` is a reliable
  acceptance criterion.

**Costs**

- Code is more verbose than a "from scratch" version would be. The Slider
  component runs ~140 lines mostly to draw the thumb and ticks.
- Accessibility audit had to be done as a layer over the visual, not built in.
  (We landed on: the visible thumb is decorative, the keyboard/touch surface is
  the invisible `<input type=range>` overlay. axe is happy.)
- Substituting Inter for Space Grotesk is one place we *did* deviate.
  Documented above so it's reversible.

## Alternatives considered

- **Re-explore the slider deck.** Rejected — would burn an entire session on a
  problem the design phase already solved. The site has six more pages to ship.
- **Use a UI library's Slider** (Radix, ARK, etc.). Rejected — the visual
  vocabulary of the deck is the whole point. Every off-the-shelf slider would have
  to be theme-restyled to match, costing the same code as the verbatim port and
  giving us less control.
- **Drop the dim-others interaction.** Considered briefly — it's "nice but not
  essential" — kept it because the design has it and the implementation cost
  (one parent class, two CSS rules) is trivial.

## References

- `design-references/source/cv-deck.jsx` — the prototype being ported.
- `design-references/screenshots/01-cv-main.png` — the visual target.
- `components/controls/SliderDeck.tsx`, `Slider.tsx` — the port.
- `docs/specs/phase-1.md` § "Port the slider deck component"
- CLAUDE.md § "Design references" — "Treat the design as authoritative."
