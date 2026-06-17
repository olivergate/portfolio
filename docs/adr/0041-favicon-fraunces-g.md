# 0041 — Favicon: cream Fraunces italic "G" on a rust tile

- **Status:** Accepted
- **Date:** 2026-06-17
- **Deciders:** Oliver Kaikane Gate

## Context

The site shipped with the stock Next.js `app/favicon.ico` — the framework logo,
not a brand mark. The design references never specified a favicon. The brand has
a clear, ownable visual language to draw on: Fraunces (the display serif, used
for italic accent words), the warm cream `#faf7f2` / near-black `#1c1915` /
terracotta-rust `#a04a26` palette, and the surname "Gate" → initial **G**.

A favicon's hard constraint is the 16px tab size: one bold element, high
contrast, legible against both light and dark browser chrome.

## Decision

A cream (`#faf7f2`) Fraunces **italic uppercase "G"** centred on a **rust
(`#a04a26`) rounded square**.

- Letterform echoes the site's signature italic-accent treatment; "G" (surname)
  is more ownable than a generic "O".
- Rendered in the *real* Fraunces (the site's loaded font, optical sizing on),
  exported to raster — not an SVG `<text>` (which would fall back to a generic
  serif in the favicon's font-less render context) and not an outlined path
  (the served font is woff2 + variable + italic, impractical to outline
  reliably).

Assets (Next.js App Router file-based metadata, no code wiring):

- `app/icon.png` — 512×512, rounded (transparent corners).
- `app/apple-icon.png` — 180×180, full-bleed square (iOS applies its own mask).
- `app/favicon.ico` — multi-size 48/32/16, replacing the stock default.

Generated from a high-res browser render via a one-off `sharp` script (resize +
rounded-rect `dest-in` mask; the `.ico` hand-packed as PNG-embedded entries).

## Consequences

- The tab now carries a brand mark in the site's own type and palette.
- Legibility holds at 16px because cream-on-rust is high-contrast; see the
  rejected alternative below.
- The generator was a one-off (it needs the browser to render Fraunces), so it
  is not committed — regenerating means re-rendering the master. The committed
  artifacts are the three image files.
- `retro-claude` aside, this is the first place the brand "G" appears as a mark
  rather than set type; if a fuller logo is ever needed, this is the seed.

## Alternatives considered

- **Rust "G" on ink tile** (the first pick in brainstorming). Rejected after
  rendering: rust `#a04a26` on ink `#1c1915` is only ~2:1 contrast, and
  Fraunces' thin strokes thin further when scaled down — the 16px tile read as
  mush. Cream-on-rust keeps the rust identity (the whole tile is rust) while
  staying crisp small.
- **Cream "G" on ink tile.** Legible, but quieter — the rust (the brand's
  signature accent) is absent from the mark.
- **Lowercase italic "g".** More characterful but busier; its descender loop
  muddies at 16px.
- **SVG favicon with `<text>` or an embedded font.** Rejected — no reliable
  Fraunces render at favicon scale without a large embedded font or an outlined
  path; raster from the real font is simpler and exact.

## References

- `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`
- `lib/fonts.ts` (Fraunces, italic + opsz), `styles/tokens.css` (palette)
