# 0026 — Rethemer FAB supersedes the design-locked slider deck

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Oliver Kaikane Gate

## Context

ADR-0006 design-locked the slider deck — a dark, instrument-panel-styled
control rendered at the top-left of `/`, ported verbatim from
`design-references/source/cv-deck.jsx`. The deck carried the rhetorical
metaphor of the site (sliders retune the CV) and was the most-designed
object in the build.

Two things changed the calculus:

1. **Single-page consolidation (ADR-0028).** Tone, Lab, and JD are now
   sections of `/`, not separate routes. The deck used to occupy a
   permanent sticky aside on `/`; with the consolidation, the aside has
   to share visual airtime with three more sections. Keeping a 380px
   instrument-panel pinned to the left edge for the entire scroll is too
   loud for a document the visitor is meant to read end-to-end.
2. **The deck no longer carries the headline.** On the original `/`, the
   deck was the first thing a visitor saw alongside the name + tagline.
   On the consolidated page the visitor scrolls through narrative
   content; the deck pinned next to it competed for attention rather
   than reinforcing the headline.

The user's brief: *"Move the Rethemer to a FAB. And make the style much
more minimal. Not a control panel. Think doing a crossword and the letters
are the sliders. Keep the state identifier."*

## Decision

Replace the design-locked slider deck with a floating action button (FAB)
that opens four crossword-cell sliders.

- **Closed FAB** — a small pill bottom-right showing the current preset
  name (the "state identifier" from `lib/preset-name.ts` —
  `BALANCED`, `KINETIC`, `BRUTALIST`, etc.) plus a chevron.
- **Open FAB** — a tight horizontal strip of four square cells:
  `[D] [P] [H] [M]` for Density / Polish / Hierarchy / Motion. Each cell
  is a vertical slider: drag up to increase, accent-tinted bottom-up
  fill matches the deck's per-axis colors (lime / coral / sky / amber).
  The cell letter sits on top of the fill. A fifth cell (`↺`) resets.
  ESC and outside click close.
- **All viewport widths** use the same FAB. The previous mobile-sheet
  carve-out (open the deck as a bottom sheet under 1024px) is gone —
  the FAB is small enough to work at any width.

Implementation:

- New: `components/controls/RethemeFab.tsx`,
  `components/controls/CellSlider.tsx`.
- Deleted: `components/controls/SliderDeck.tsx`,
  `components/controls/Slider.tsx`,
  `components/controls/MobileSheet.tsx`,
  `lib/use-media-query.ts`.
- `DeckProvider` simplified — no portal, no `useMediaQuery`, no
  pathname-conditioned bail beyond `/`. Mounts `<RethemeFab />` once.
- `SiteShell` collapsed to a single centered column (the two-column
  grid existed only to host the deck-slot aside).
- `styles/globals.css` lost ~360 lines of `.deck-*`, `.slider-*`,
  `.mobile-sheet-*`, `.site-shell` rules; gained ~120 lines of
  `.fab-*` rules.

State plumbing is unchanged: `StyleContext`, `useLocalStorageState`,
`StyleApplier`, `getPresetName` all carry over verbatim. The four slider
axes still drive the same ~50 derived CSS custom properties via
`stateToTokens`. Persisting the slider state in localStorage (ADR-0020)
is unchanged. Reset semantics (snap all four to defaults) is unchanged.

## Consequences

**Wins:**
- The site's first impression on `/` is now Oliver's name and the
  tagline, not an instrument panel. The rethemer is discoverable but
  unobtrusive.
- Layout is identical at every viewport width. No mobile/desktop
  branching, no portal, no sticky-aside sizing concerns.
- Simpler code: one `<RethemeFab />` mount; ~600 fewer lines across
  components + CSS.
- Crossword metaphor reinforces what the sliders are (axes in a
  parameterized space) without needing labels for each.

**Costs:**
- The verbatim port from `design-references/source/cv-deck.jsx` is no
  longer the implementation. Anyone reading ADR-0006 will see it
  superseded here; the prototype remains historical reference.
- The dim-others-while-dragging interaction (`.deck-active` parent
  class on the original deck) is gone. The cells don't visually
  cross-talk; each is its own focus surface. This is the intended
  trade — the FAB's whole point is being quieter.
- The "STATE BALANCED" / "CV / RETHEME" / footer chrome are removed.
  The preset name remains — it's the only diagnostic the closed FAB
  shows, which strengthens its role as the "state identifier" the user
  asked to preserve.
- One axis label per cell (D/P/H/M letter) instead of full axis
  names — relies on the screen-reader `aria-label` for accessibility
  and on the user remembering the four-axis system from the rest of
  the site (or hovering for browser tooltips).

**Deliberately not done:**
- No reintroduction of per-slider tick marks, value readouts, or
  extreme labels (`SPARSE` ↔ `DENSE`). The cell + letter + accent
  fill is the entire visual language.
- No brushed-metal thumb. The cell *is* the thumb.
- No animation choreography around opening (just a panel mount). Keep
  motion budget for the CV body itself.

## Alternatives considered

- **Keep the deck design-locked, just hide it in a sheet on `/`.** Same
  loudness once opened, plus an extra step. Doesn't solve the
  visual-airtime problem.
- **Move the deck to the footer.** Out of sight on a long page; visitors
  who want to retune would have to scroll to the bottom. Bad ergonomics.
- **Remove the rethemer entirely.** The sliders are the rhetorical
  device — removing them removes the site's signature. Rejected.
- **A single combined cell (one cell with four axes selectable).**
  Considered — too clever; the user's metaphor was specifically *four
  letters as four sliders*, which the four-cell strip lands on.

## References

- Supersedes ADR-0006 (slider deck is design-locked).
- Related: ADR-0028 (single-page consolidation — the catalyst).
- Preset-name function: `lib/preset-name.ts`.
- Per-axis accent palette is preserved verbatim from the original deck.
- `design-references/source/cv-deck.jsx` — historical reference, no
  longer the implementation target.
