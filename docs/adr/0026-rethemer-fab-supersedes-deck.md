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
more minimal. Not a control panel."* On the open-panel design specifically:
*"follow the page style, just 3 lines, labels for the extremes."* That
brief — three quiet horizontal lines per axis with extreme labels at the
ends — is what shipped, and is the reason the open panel is line-sliders
rather than the earlier crossword-cell exploration.

## Decision

> **Amended 2026-05-04:** Decision section synced to the shipped
> implementation. An earlier draft of this ADR described a four-cell
> "crossword" variant (square cells, vertical fills, single-letter
> labels) that never reached HEAD. The choice itself — replacing the
> design-locked deck with a FAB — is unchanged; only the description of
> the open panel is corrected here. Supersession of ADR-0006 stands.

Replace the design-locked slider deck with a floating action button (FAB)
that opens a stacked column of four horizontal line-sliders, one per axis.

- **Closed FAB** — a small pill bottom-right reading
  `STYLE · <preset> ▾`. The preset comes from `lib/preset-name.ts`
  (`BALANCED`, `KINETIC`, `BRUTALIST`, etc.) and is the "state identifier"
  the user asked to preserve.
- **Open panel** — a card anchored above the toggle holding four
  `LineSlider` rows in fixed order: `DENSITY`, `POLISH`, `HIERARCHY`,
  `MOTION`. Each row is three visual lines, matching the user's "just
  3 lines" brief:
  1. Head row: full axis name on the left (e.g. `DENSITY`) plus a
     two-decimal value readout on the right (e.g. `0.42`).
  2. A thin 3px track. A native `<input type="range">` sits invisibly
     over the track at full width (with vertical padding for hit area)
     so pointer / touch / keyboard input is browser-native — no custom
     drag handlers. The fill is an accent-tinted left-to-right gradient
     from `0` to the current value, matching the deck's per-axis colors
     (lime `#d4ff3a` / coral `#ff7a59` / sky `#7ad7ff` / amber `#ffd166`).
  3. Extreme labels at the ends: `← sparse` / `dense →`,
     `← brutalist` / `refined →`, `← flat` / `dramatic →`,
     `← static` / `kinetic →`.
- **Footer row** — a top-bordered strip below the four sliders with
  `↺ RESET` on the left (snaps all four to defaults) and an
  `About these sliders →` link on the right that points at
  `FOUR_SLIDERS_POST_HREF` from `lib/blog-links.ts` (currently
  `/blog/four-sliders`). The link gives the rethemer a place to explain
  itself without bloating the panel itself.
- **Dismissal** — ESC and outside-click close the panel.
- **All viewport widths** use the same FAB. The previous mobile-sheet
  carve-out (open the deck as a bottom sheet under 1024px) is gone —
  the panel is small enough (`clamp(300px, 92vw, 360px)`) to work at any
  width. Print CSS hides the FAB entirely.

Implementation:

- New: `components/controls/RethemeFab.tsx`,
  `components/controls/LineSlider.tsx`,
  `lib/blog-links.ts` (the constant pointing at the explainer post).
- Deleted: `components/controls/SliderDeck.tsx`,
  `components/controls/Slider.tsx`,
  `components/controls/MobileSheet.tsx`,
  `lib/use-media-query.ts`.
- `DeckProvider` simplified — no portal, no `useMediaQuery`, no
  pathname-conditioned bail beyond `/`. Mounts `<RethemeFab />` once.
- `SiteShell` collapsed to a single centered column (the two-column
  grid existed only to host the deck-slot aside).
- `styles/globals.css` lost ~360 lines of `.deck-*`, `.slider-*`,
  `.mobile-sheet-*`, `.site-shell` rules; gained ~170 lines of
  `.fab-*` rules (toggle pill, panel, the three-line slider row, footer).

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
- Simpler code: one `<RethemeFab />` mount; ~550 fewer lines across
  components + CSS.
- The "just 3 lines" rhythm (name+value / track / extremes) reads as
  page-style typography rather than instrumentation, which is what the
  user asked for.

**Costs:**
- The verbatim port from `design-references/source/cv-deck.jsx` is no
  longer the implementation. Anyone reading ADR-0006 will see it
  superseded here; the prototype remains historical reference.
- The dim-others-while-dragging interaction (`.deck-active` parent
  class on the original deck) is gone. The four slider rows don't
  visually cross-talk; each is its own focus surface. This is the
  intended trade — the FAB's whole point is being quieter.
- The "STATE BALANCED" / "CV / RETHEME" / footer chrome are removed.
  The preset name remains in the closed-pill label
  (`STYLE · <preset> ▾`), strengthening its role as the "state
  identifier" the user asked to preserve.
- The open panel is now visible only on demand (one click on the
  closed pill). Casual scrollers no longer see slider state at all
  unless they open the FAB; the closed pill carries just the preset
  name as the running diagnostic.

**Deliberately not done:**
- No reintroduction of per-slider tick marks. Value readouts (two
  decimals) and extreme labels (`sparse` ↔ `dense`, etc.) are kept
  because the user's brief explicitly asked for the labels; tick marks
  add instrumentation we deliberately moved away from.
- No brushed-metal thumb. The native range input sits invisibly over
  the track; the visible "thumb" is just the leading edge of the
  accent fill.
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
  Considered — too clever; the user's brief asked for one slider per
  axis, which the four stacked line-sliders deliver directly.
- **Four square cells with vertical fills and single-letter labels
  (`[D] [P] [H] [M]`).** An earlier exploration of the "crossword"
  framing. Rejected once the user's brief landed on "follow the page
  style, just 3 lines, labels for the extremes" — single-letter cells
  read as instrumentation, not page typography.

## References

- Supersedes ADR-0006 (slider deck is design-locked).
- Related: ADR-0028 (single-page consolidation — the catalyst).
- Shipped implementation: `components/controls/RethemeFab.tsx`,
  `components/controls/LineSlider.tsx`, `.fab-*` rules in
  `styles/globals.css`.
- Preset-name function: `lib/preset-name.ts`.
- Explainer post link: `lib/blog-links.ts:FOUR_SLIDERS_POST_HREF`
  (currently `/blog/four-sliders` — placeholder; see `docs/TODO.md`).
- Per-axis accent palette is preserved verbatim from the original deck.
- `design-references/source/cv-deck.jsx` — historical reference, no
  longer the implementation target.
