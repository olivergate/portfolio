# Phase 1 — UX style sliders

> Read this whole file. Read the design references for this phase (below).
> Plan in plan mode. Execute. One phase per session.

## Goal

The slider deck from the design becomes a Client Component on `/`. Four
sliders (density, polish, hierarchy, motion) retheme the entire CV in real time
by writing CSS variables. State persists to URL hash. The site stays accessible
at every slider position.

## Design references

Required reading before coding:

- `design-references/screenshots/01-cv-main.png` (visual target)
- `design-references/source/cv-deck.jsx` (the slider component — port this)
- `design-references/source/cv-app.jsx` (state management + URL hash sync)
- `design-references/source/cv-content.jsx` (how CV components consume tokens)
- `design-references/README.md` section "1. cv.html — Main CV"

The design has settled the following — do not relitigate:

- **Slider deck visual.** Floating panel in top-left, dark gradient background,
  custom-drawn track + thumb (native input invisible, layered above the visual).
  Brushed-metal feel on the thumb. Each slider has label, current-value indicator,
  tick scale. Moving one slider dims the others.
- **The slider deck does NOT retheme with the sliders.** It's hardcoded dark.
  Do not apply token-driven styling to the deck.
- **Slider semantics:**
  - **Density** — increases bullet caps per role, reduces spacing, narrows columns
  - **Polish** — brutalist (1px hairlines, sharp corners, hard edges, no shadows)
    → refined (tinted card backgrounds, subtle shadows, slightly rounded corners)
  - **Hierarchy** — flat (uniform weights, low contrast) → dramatic (huge H1,
    italic accents, type-scale jumps)
  - **Motion** — static (instant) → kinetic (reveal-on-scroll, card hover lift,
    type letter-spacing settle)
- **State persists to URL hash** for sharing configurations.
- **Print stylesheet hides the deck.**
- **Reveal-on-scroll uses IntersectionObserver** with `[data-reveal]` attr,
  applying `is-revealed` class. Only active when motion slider > 0.4.

## Success criteria

1. Each slider, moved alone, visibly transforms the CV — not just one element
2. All 16 corner combinations (each slider min or max) render without broken
   layout. Specifically verify brutalist+dramatic+dense+kinetic and
   refined+flat+sparse+static.
3. Slider state syncs to URL hash; the URL is shareable and reproduces the look
4. `prefers-reduced-motion` overrides the Motion slider regardless of position
5. The CV remains readable at WCAG AA contrast at every position
6. Mobile: slider deck collapses to a bottom sheet, full functionality preserved
7. Slider movement does not cause React re-renders on CV content — only
   CSS variables on `document.documentElement.style`
8. Print stylesheet hides the deck (`@media print { .deck { display: none } }`)
9. Playwright screenshot tests cover all 16 corners
10. Visual match to `screenshots/01-cv-main.png` at default state

## Tasks

### 1. Port the slider deck component

Take `design-references/source/cv-deck.jsx`, port to a Client Component in
`components/controls/SliderDeck.tsx` (`"use client"`). Imported into the
home page Server Component as a child island.

Key elements to preserve:
- Dark gradient panel background (hardcoded, not token-driven)
- Custom track + thumb visual (native `<input type=range>` is invisible, layered
  above the visual for keyboard/touch handling)
- Per-slider label, current value indicator, tick scale
- "Moving one dims the others" interaction
- Asymmetric 2-column layout: sticky left column 380px max for the deck,
  right column for content. Collapses to single column < 1024px.
- Mobile: bottom sheet with handle, opens from a small floating button

Do not restyle. The deck is a designed object.

### 2. State management + URL hash sync

State management lives in a small Client Component tree rooted at the
slider deck. Use either React Context or `nuqs` for cross-component access
to slider state. URL hash format: `#d=0.7&p=0.3&h=0.5&m=0.2` — short keys
to keep URL readable.

A "share this view" button copies the current URL to clipboard with a toast
acknowledgment.

A "reset to defaults" button restores all four to 0.5.

### 3. Token mapping function

In `lib/style-tokens.ts`, implement `stateToTokens(state)`. This is the heart
of the design system. The function maps `StyleState` (4 numbers, 0..1) to a
record of CSS variable names → values.

Reference `design-references/source/cv-app.jsx` for the exact mapping logic.
Port its interpolation behavior. If the design uses linear interpolation for
some tokens and stepped/threshold for others, preserve that.

### 4. StyleApplier component

`components/controls/StyleApplier.tsx` — a tiny Client Component (`"use client"`)
that subscribes to slider state and writes `stateToTokens(state)` to
`document.documentElement.style` on every change.

This is the only component that re-renders on slider movement. CV content reads
from CSS variables — no React re-renders required for retheming.

URL hash sync: use `nuqs` (or a small custom hook) to keep the four slider
values in `window.location.hash`. Hash format: `#d=0.7&p=0.3&h=0.5&m=0.2`.

### 5. Component responsiveness to tokens

Audit Phase 0 components. Ensure each meaningfully responds to at least one slider:

- `Header`: hierarchy (name size), polish (font-display vs font-body for tagline),
  density (padding)
- `About`: density (line-height, gap), polish (subtle treatment of italic asides)
- `Experience`: density (bullet caps per role — fewer bullets at sparse, more at
  dense; this is a key feature), motion (reveal stagger), hierarchy (role title
  size), polish (border styling on cards)
- `Skills`: density (chip gap, possibly switching from chips to inline list at
  refined polish), polish (chip styling), hierarchy (heading size)
- `Projects`: motion (card hover lift only when motion is active)

The bullet-caps behavior is from the design — verify against `cv-content.jsx`.

### 6. Reveal-on-scroll

Single `RevealOnScroll` wrapper component (small island) that uses
IntersectionObserver. Applies `is-revealed` class when in viewport. CSS handles
the actual animation, gated on motion token value via media query / CSS var.

When `prefers-reduced-motion: reduce` matches, force `--motion-base` to `0ms`
regardless of slider position.

### 7. Edge case handling

- At density=1 + hierarchy=1: H1 must not overflow on mobile. Cap with `clamp()`.
- At polish=0 (brutalist): body text must still pass WCAG AA contrast.
- At motion=1: total reveal time capped at ~600ms regardless of element count
  (don't compound staggers).
- Slider deck remains legible at every position because it's hardcoded dark.

### 8. Tests

- `tests/style-tokens.test.ts`: unit-test `stateToTokens` at corners and midpoint
- `tests/e2e/corners.spec.ts`: Playwright visiting each of 16 corners via URL
  hash, taking screenshots, asserting no horizontal overflow
- `tests/e2e/a11y.spec.ts`: `@axe-core/playwright` at corners, expect zero
  violations

### 9. Print stylesheet

Add `@media print { .deck { display: none; } }` (and similar for any other
controls on the page). The CV should print cleanly.

### 10. ADRs to write this phase

- **ADR-0004: URL hash for slider state.** Why hash over query params
  (no server roundtrip, faster, no SSR concerns), why URL at all (shareability).
- **ADR-0005: CSS custom properties as the styling layer.** Performance argument
  (no React re-renders on slider move) and the simplicity of one source of truth.
  Tradeoff: less type safety on the styles.
- **ADR-0006: Slider deck is design-locked.** Why we ported the design's deck
  visual verbatim instead of re-exploring. The artifact-as-source-of-truth argument.

## Out of scope

- A fifth meta-slider (familiar/experimental) — tempting but adds combinatorial
  complexity
- Saving custom presets locally — URL is the persistence mechanism
- Animating the transition between slider positions — they snap

## Decisions to flag to Oliver

- The bullet-caps-per-role behavior is interesting. Confirm: at density 0, how
  many bullets are visible per role? The design source has the answer; verify
  it ports correctly.
- Should the slider deck be visible by default on first load, or hidden behind a
  toggle? The design has it visible (sticky left column). Confirm.
